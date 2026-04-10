"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    website: "",
    avatar_url: "",
    aiPersona: "professional",
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    twoFactorEnabled: false,
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const PRESET_AVATARS = [
    { id: "avatar-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4", label: "Felix" },
    { id: "avatar-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede", label: "Aneka" },
    { id: "avatar-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight&backgroundColor=d1d4f9", label: "Midnight" },
    { id: "avatar-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Orbit&backgroundColor=ffd5dc", label: "Orbit" },
    { id: "avatar-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sage&backgroundColor=c1f0c1", label: "Sage" },
  ];

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const { profile: profileData } = await response.json();
        if (profileData) {
          setProfile((prev) => ({
            ...prev,
            displayName: profileData.name || "",
            bio: profileData.bio || "",
            website: profileData.website || "",
            avatar_url: profileData.avatar_url || "",
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.displayName,
          bio: profile.bio,
          website: profile.website,
          avatar_url: profile.avatar_url || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");
      setSaveMessage("Changes saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Failed to save changes");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile Identity", icon: "person" },
    { id: "ai", label: "AI Persona Config", icon: "auto_awesome" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "integrations", label: "Integrations", icon: "link" },
  ];

  return (
    <div className="px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
            <header className="mb-10">
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface">
                <span className="text-gradient italic">Settings</span>
              </h1>
              <p className="text-sm text-on-surface-variant mt-2">Manage your profile, preferences, and account security.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Section Nav */}
              <div className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSection === s.id
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="lg:col-span-3 space-y-6">
                {activeSection === "profile" && (
                  <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold font-headline mb-6">Profile Identity</h2>
                    <div className="flex items-center gap-6 mb-4">
                      <Image
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-xl border-2 border-outline-variant/20"
                      />
                      <div>
                        <p className="font-bold">{profile.displayName || user?.email}</p>
                        <p className="text-xs text-on-surface-variant">Creator</p>
                        <button
                          type="button"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          className="mt-2 text-xs text-primary font-bold hover:underline"
                        >
                          {showAvatarPicker ? "Close" : "Change Avatar"}
                        </button>
                      </div>
                    </div>
                    {showAvatarPicker && (
                      <div className="mb-8 p-4 bg-surface-container-low border border-outline-variant/20 rounded-lg">
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Choose an Avatar</p>
                        <div className="flex gap-3 flex-wrap">
                          {PRESET_AVATARS.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => {
                                setProfile({ ...profile, avatar_url: av.url });
                                setShowAvatarPicker(false);
                              }}
                              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                profile.avatar_url === av.url ? "border-primary ring-2 ring-primary/30" : "border-outline-variant/20 hover:border-primary/50"
                              }`}
                            >
                              <Image src={av.url} alt={av.label} width={64} height={64} className="w-full h-full" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">{av.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Display Name</label>
                        <input
                          type="text"
                          value={profile.displayName}
                          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Bio</label>
                        <textarea
                          rows={3}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none"
                          placeholder="Tell the community about yourself..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Website</label>
                        <input
                          type="url"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "ai" && (
                  <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold font-headline mb-6">AI Persona Configuration</h2>
                    <p className="text-sm text-on-surface-variant mb-6">Customize how the AI assistant generates content for you.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["professional", "casual", "academic", "creative"].map((persona) => (
                        <button
                          key={persona}
                          onClick={() => setProfile({ ...profile, aiPersona: persona })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            profile.aiPersona === persona
                              ? "border-primary bg-primary/5"
                              : "border-outline-variant/20 hover:border-outline-variant/40"
                          }`}
                        >
                          <h4 className="font-bold text-sm capitalize">{persona}</h4>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {persona === "professional" && "Formal tone, industry terminology, data-driven"}
                            {persona === "casual" && "Conversational, approachable, storytelling"}
                            {persona === "academic" && "Research-focused, citations, analytical"}
                            {persona === "creative" && "Expressive, metaphorical, innovative"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold font-headline mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      {[
                        { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive updates via email" },
                        { key: "pushNotifications" as const, label: "Push Notifications", desc: "Browser push notifications" },
                        { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Summary of your performance" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                          <div>
                            <p className="font-semibold text-sm">{item.label}</p>
                            <p className="text-xs text-on-surface-variant">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setProfile({ ...profile, [item.key]: !profile[item.key] })}
                            className={`w-11 h-6 rounded-full transition-all relative ${
                              profile[item.key] ? "bg-primary" : "bg-surface-container-highest"
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                              profile[item.key] ? "left-6" : "left-1"
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold font-headline mb-6">Security</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                        <div>
                          <p className="font-semibold text-sm">Two-Factor Authentication</p>
                          <p className="text-xs text-on-surface-variant">Add extra security to your account</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                          Enable
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                        <div>
                          <p className="font-semibold text-sm">Change Password</p>
                          <p className="text-xs text-on-surface-variant">Update your account password</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest transition-all">
                          Update
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/20">
                        <div>
                          <p className="font-semibold text-sm text-error">Sign Out</p>
                          <p className="text-xs text-on-surface-variant">Sign out of your account</p>
                        </div>
                        <button onClick={() => signOut()} className="px-4 py-2 rounded-lg bg-error/10 text-error text-xs font-bold hover:bg-error/20 transition-all">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "integrations" && (
                  <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold font-headline mb-6">Social Integrations</h2>
                    <div className="space-y-4">
                      {[
                        { name: "GitHub", icon: "code", connected: true },
                        { name: "Google", icon: "language", connected: true },
                        { name: "LinkedIn", icon: "work", connected: false },
                        { name: "Twitter / X", icon: "tag", connected: false },
                      ].map((int) => (
                        <div key={int.name} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant">{int.icon}</span>
                            <div>
                              <p className="font-semibold text-sm">{int.name}</p>
                              <p className="text-[10px] text-on-surface-variant">
                                {int.connected ? "Connected" : "Not connected"}
                              </p>
                            </div>
                          </div>
                          <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            int.connected
                              ? "bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}>
                            {int.connected ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4">
                  {saveMessage && (
                    <span className={`text-sm font-medium ${saveMessage.includes("success") ? "text-green-400" : "text-error"}`}>
                      {saveMessage}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg font-bold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
}
