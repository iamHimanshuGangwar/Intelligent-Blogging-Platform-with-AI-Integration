"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  admin_reply?: string;
}

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "1",
    user_id: "u1",
    user_name: "Jayant Kumar",
    user_email: "jayant@example.com",
    subject: "Cannot publish my blog post",
    message: "I wrote a post but when I click publish, it stays in draft. Can you help?",
    status: "open",
    priority: "high",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    user_id: "u2",
    user_name: "BEYOUROWN SELF",
    user_email: "beyourown@example.com",
    subject: "Profile avatar not updating",
    message: "I uploaded a new avatar but the old one still shows everywhere on the platform.",
    status: "in-progress",
    priority: "medium",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    admin_reply: "We're looking into the CDN cache issue. Should be resolved within 24h.",
  },
  {
    id: "3",
    user_id: "u3",
    user_name: "Tech Writer",
    user_email: "tech@example.com",
    subject: "AI theme not applying to post",
    message: "Selected the Neon theme but my post renders with the default theme.",
    status: "resolved",
    priority: "low",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    admin_reply: "Fixed! Please clear your browser cache and reload the post.",
  },
];

export default function AdminSupportPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/admin/login"); return; }
    if (user && !isAdmin) { router.push("/dashboard"); }
  }, [user, isAdmin, loading, router]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support-tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      } else {
        setTickets(MOCK_TICKETS);
      }
    } catch {
      setTickets(MOCK_TICKETS);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, reply: replyText, status: "in-progress" }),
      });
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, admin_reply: replyText, status: "in-progress" as const, updated_at: new Date().toISOString() }
              : t
          )
        );
        setSelectedTicket((prev) =>
          prev ? { ...prev, admin_reply: replyText, status: "in-progress" as const } : prev
        );
        setReplyText("");
      }
    } catch {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, admin_reply: replyText, status: "in-progress" as const, updated_at: new Date().toISOString() }
            : t
        )
      );
      setSelectedTicket((prev) =>
        prev ? { ...prev, admin_reply: replyText, status: "in-progress" as const } : prev
      );
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updated_at: new Date().toISOString() } : t))
    );
    setSelectedTicket((prev) => (prev?.id === ticketId ? { ...prev, status } : prev));
    fetch("/api/admin/support-tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status }),
    }).catch(() => {});
  };

  const filteredTickets = filterStatus === "all" ? tickets : tickets.filter((t) => t.status === filterStatus);

  const statusColor: Record<string, string> = {
    open: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    "in-progress": "bg-amber-500/15 text-amber-300 border-amber-500/30",
    resolved: "bg-green-500/15 text-green-300 border-green-500/30",
    closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };

  const priorityColor: Record<string, string> = {
    low: "text-zinc-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    urgent: "text-red-400",
  };

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="support" />
      <AdminTopNav activePage="support" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-white mb-1">
              User <span className="text-primary italic">Support</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Manage support tickets and respond to user inquiries.</p>
          </div>
          <div className="flex gap-2">
            {["all", "open", "in-progress", "resolved", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${
                  filterStatus === s ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:text-white"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Open</p>
            <p className="text-2xl font-bold mt-1 text-blue-400">{tickets.filter((t) => t.status === "open").length}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">In Progress</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{tickets.filter((t) => t.status === "in-progress").length}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Resolved</p>
            <p className="text-2xl font-bold mt-1 text-green-400">{tickets.filter((t) => t.status === "resolved").length}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Total</p>
            <p className="text-2xl font-bold mt-1">{tickets.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {filteredTickets.length === 0 ? (
              <div className="glass-panel rounded-xl p-6 text-sm text-on-surface-variant">No tickets found.</div>
            ) : (
              filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => { setSelectedTicket(ticket); setReplyText(""); }}
                  className={`w-full text-left glass-panel rounded-xl p-4 transition-all ${
                    selectedTicket?.id === ticket.id ? "border border-primary/30" : "hover:border hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold line-clamp-1">{ticket.subject}</p>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${statusColor[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{ticket.user_name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-semibold ${priorityColor[ticket.priority]}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-zinc-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="glass-panel rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      From: <span className="text-white font-medium">{selectedTicket.user_name}</span>
                      <span className="text-zinc-500 ml-2">{selectedTicket.user_email}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${statusColor[selectedTicket.status]}`}>
                    {selectedTicket.status}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-surface-container-low mb-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">User Message</p>
                  <p className="text-sm leading-relaxed">{selectedTicket.message}</p>
                  <p className="text-[10px] text-zinc-500 mt-3">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>

                {selectedTicket.admin_reply && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                    <p className="text-[10px] text-primary uppercase tracking-wider mb-2">Admin Reply</p>
                    <p className="text-sm leading-relaxed">{selectedTicket.admin_reply}</p>
                    <p className="text-[10px] text-zinc-500 mt-3">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                  </div>
                )}

                <div className="mb-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the user..."
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}
                    className="px-4 py-2.5 bg-green-500/10 text-green-300 rounded-lg text-xs font-bold"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, "closed")}
                    className="px-4 py-2.5 bg-zinc-500/10 text-zinc-400 rounded-lg text-xs font-bold"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-zinc-600 mb-3 block">support_agent</span>
                <p className="text-sm">Select a ticket to view details and respond.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
