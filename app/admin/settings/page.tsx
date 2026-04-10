"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

export default function AdminSettingsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, loading, router]);
  const [activeSection, setActiveSection] = useState("general");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(8192);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const { settings } = await response.json();
        if (settings.maintenanceMode) setMaintenanceMode(settings.maintenanceMode === "true");
        if (settings.registrationOpen) setRegistrationOpen(settings.registrationOpen === "true");
        if (settings.aiModel) setAiModel(settings.aiModel);
        if (settings.temperature) setTemperature(parseFloat(settings.temperature));
        if (settings.maxTokens) setMaxTokens(parseInt(settings.maxTokens));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const sections = [
    { id: "general", label: "General", icon: "settings" },
    { id: "ai-engine", label: "AI Engine", icon: "auto_awesome" },
    { id: "api-keys", label: "API Keys", icon: "key" },
    { id: "nodes", label: "Node Status", icon: "hub" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "email", label: "Email & Notifications", icon: "mail" },
  ];

  const apiKeys = [
    { name: "Supabase Anon Key", status: "active", lastUsed: "2 min ago", masked: "eyJhbG...XXXXX" },
    { name: "Supabase Service Role", status: "active", lastUsed: "5 min ago", masked: "eyJhbG...YYYYY" },
    { name: "Gemini API Key", status: "active", lastUsed: "12 min ago", masked: "AIzaSy...ZZZZZ" },
    { name: "GitHub OAuth", status: "active", lastUsed: "1h ago", masked: "gho_...AAAAA" },
    { name: "Google OAuth", status: "inactive", lastUsed: "3d ago", masked: "GOCSPX...BBBBB" },
  ];

  const nodes = [
    { name: "API Gateway", status: "online", uptime: "99.98%", latency: "12ms", region: "US-East" },
    { name: "Database Primary", status: "online", uptime: "99.99%", latency: "3ms", region: "US-East" },
    { name: "Database Replica", status: "online", uptime: "99.97%", latency: "8ms", region: "EU-West" },
    { name: "AI Inference", status: "online", uptime: "99.94%", latency: "145ms", region: "US-Central" },
    { name: "CDN Edge", status: "online", uptime: "100%", latency: "2ms", region: "Global" },
    { name: "Queue Worker", status: "degraded", uptime: "98.2%", latency: "340ms", region: "US-East" },
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            maintenanceMode: String(maintenanceMode),
            registrationOpen: String(registrationOpen),
            aiModel,
            temperature: String(temperature),
            maxTokens: String(maxTokens),
          },
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      setSaveMessage("Settings saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Failed to save settings");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="settings" />
      <AdminTopNav activePage="settings" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              System <span className="text-primary italic">Settings</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Configure platform behavior, AI engine, and infrastructure.</p>
          </div>
          <div className="flex items-center gap-4">
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes("saved") ? "text-green-400" : "text-error"}`}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-linear-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg text-xs font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Nav */}
          <div className="lg:col-span-1">
            <nav className="glass-panel rounded-xl p-3 space-y-1 sticky top-24">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    activeSection === s.id
                      ? "bg-primary text-on-primary font-bold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeSection === "general" && (
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold font-headline">General Platform Settings</h3>

                {/* Platform Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="AiBlog — Synthetic Editorial"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Platform URL */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Platform URL</label>
                  <input
                    type="url"
                    defaultValue="https://aiblog.synthetix.dev"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Maintenance Mode</p>
                      <p className="text-xs text-on-surface-variant">Takes the platform offline for all non-admin users.</p>
                    </div>
                    <button
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? "bg-red-500" : "bg-surface-container-highest"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${maintenanceMode ? "left-6.5" : "left-0.5"}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Open Registration</p>
                      <p className="text-xs text-on-surface-variant">Allow new users to sign up.</p>
                    </div>
                    <button
                      onClick={() => setRegistrationOpen(!registrationOpen)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${registrationOpen ? "bg-green-500" : "bg-surface-container-highest"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${registrationOpen ? "left-6.5" : "left-0.5"}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Engine Config */}
            {activeSection === "ai-engine" && (
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold font-headline">AI Engine Configuration</h3>

                {/* Model Picker */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Active Model</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  </select>
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Temperature</label>
                    <span className="text-sm font-bold text-primary">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-on-surface-variant">Precise</span>
                    <span className="text-[10px] text-on-surface-variant">Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Max Tokens</label>
                    <span className="text-sm font-bold text-primary">{maxTokens.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1024"
                    max="32768"
                    step="1024"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                </div>

                {/* Safety Settings */}
                <div className="p-4 rounded-lg bg-surface-container-low">
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Safety Filters</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Harassment", "Hate Speech", "Sexual Content", "Dangerous Content"].map((f) => (
                      <div key={f} className="flex items-center justify-between p-3 rounded bg-surface-container">
                        <span className="text-xs">{f}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400">BLOCK</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeSection === "api-keys" && (
              <div className="glass-panel rounded-xl overflow-hidden">
                <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="text-lg font-bold font-headline">API Keys & Integrations</h3>
                  <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-sm mr-1 align-middle">add</span>
                    Add Key
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/10">
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Service</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Key</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Last Used</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key.name} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{key.name}</td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-surface-container-highest px-2 py-1 rounded font-mono text-on-surface-variant">{key.masked}</code>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              key.status === "active" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}>{key.status}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-on-surface-variant">{key.lastUsed}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="p-1.5 rounded bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                              <button className="p-1.5 rounded bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Node Status */}
            {activeSection === "nodes" && (
              <div className="glass-panel rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold font-headline">Node Status</h3>
                  <span className="text-xs text-on-surface-variant">Last checked: 30s ago</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nodes.map((node) => (
                    <div key={node.name} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10 hover:border-outline-variant/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${node.status === "online" ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`}></div>
                          <span className="text-sm font-bold">{node.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          node.status === "online" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                        }`}>{node.status}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-on-surface-variant">Uptime</p>
                          <p className="text-xs font-bold">{node.uptime}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant">Latency</p>
                          <p className="text-xs font-bold">{node.latency}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant">Region</p>
                          <p className="text-xs font-bold">{node.region}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold font-headline">Security Settings</h3>

                <div className="space-y-4">
                  {[
                    { label: "Require Email Verification", desc: "Users must verify email before posting.", enabled: true },
                    { label: "Two-Factor Authentication", desc: "Enforce 2FA for admin accounts.", enabled: false },
                    { label: "Rate Limiting", desc: "Limit API requests to 100/min per user.", enabled: true },
                    { label: "Content Encryption", desc: "Encrypt post content at rest.", enabled: true },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low">
                      <div>
                        <p className="text-sm font-bold">{setting.label}</p>
                        <p className="text-xs text-on-surface-variant">{setting.desc}</p>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${setting.enabled ? "bg-green-500" : "bg-surface-container-highest"}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${setting.enabled ? "left-6.5" : "left-0.5"}`}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-surface-container-low">
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Session Timeout</p>
                  <select className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>24 hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email & Notifications */}
            {activeSection === "email" && (
              <div className="glass-panel rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold font-headline">Email & Notification Settings</h3>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">SMTP Provider</label>
                  <select className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50">
                    <option>Supabase (Built-in)</option>
                    <option>SendGrid</option>
                    <option>Resend</option>
                    <option>Custom SMTP</option>
                  </select>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                  {[
                    { label: "Welcome Email", desc: "Send on new user registration", enabled: true },
                    { label: "Weekly Digest", desc: "Platform activity summary", enabled: true },
                    { label: "AI Report Notifications", desc: "Notify when AI reports complete", enabled: false },
                    { label: "Moderation Alerts", desc: "Alert admins on flagged content", enabled: true },
                  ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low">
                      <div>
                        <p className="text-sm font-bold">{n.label}</p>
                        <p className="text-xs text-on-surface-variant">{n.desc}</p>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${n.enabled ? "bg-green-500" : "bg-surface-container-highest"}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${n.enabled ? "left-6.5" : "left-0.5"}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
