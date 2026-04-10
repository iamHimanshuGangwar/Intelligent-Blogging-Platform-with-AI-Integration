"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type DraftPost = { id: string; title: string; status: string; created_at: string };

type Collaborator = {
  id: string;
  user_id: string;
  permission: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  profiles?: { id: string; name?: string; email?: string };
};

type IncomingInvite = {
  id: string;
  post_id: string;
  permission: 'editor' | 'viewer';
  posts?: { title?: string; slug?: string };
  inviter?: { id: string; name?: string; email?: string };
};

export default function CollaborationPage() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [activePostId, setActivePostId] = useState<string>("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [permission, setPermission] = useState<'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(true);
  const [inviteMessage, setInviteMessage] = useState("");
  const [incomingInvites, setIncomingInvites] = useState<IncomingInvite[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const loadDrafts = async () => {
      try {
        const response = await fetch(`/api/posts?status=draft&limit=50&userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to load drafts');
        const payload = await response.json();
        const posts = payload.posts || [];
        setDrafts(posts);
        if (posts[0]?.id) setActivePostId(posts[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDrafts();
  }, [user?.id]);

  useEffect(() => {
    if (!activePostId) return;
    const loadCollaborators = async () => {
      try {
        const response = await fetch(`/api/posts/${activePostId}/collaborators`);
        if (!response.ok) {
          setCollaborators([]);
          return;
        }
        const payload = await response.json();
        setCollaborators(payload.collaborators || []);
      } catch {
        setCollaborators([]);
      }
    };

    loadCollaborators();
  }, [activePostId]);

  useEffect(() => {
    const loadInvites = async () => {
      try {
        const response = await fetch('/api/collaboration/invites');
        if (!response.ok) return;
        const payload = await response.json();
        setIncomingInvites(payload.invites || []);
      } catch {
        setIncomingInvites([]);
      }
    };

    loadInvites();
  }, []);

  const respondToInvite = async (postId: string, action: 'accept' | 'reject') => {
    const response = await fetch('/api/collaboration/invites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action }),
    });

    if (!response.ok) {
      setInviteMessage('Failed to update invitation.');
      return;
    }

    setIncomingInvites((current) => current.filter((invite) => invite.post_id !== postId));
  };

  const sendInvite = async () => {
    if (!activePostId || !inviteEmail.trim()) return;
    setInviteMessage('');
    const response = await fetch(`/api/posts/${activePostId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), permission }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setInviteMessage(data.error || 'Failed to send invite. Ensure the email belongs to a registered user.');
      return;
    }

    setInviteEmail('');
    setInviteMessage('Invite sent successfully.');
    const payload = await fetch(`/api/posts/${activePostId}/collaborators`).then((r) => r.json());
    setCollaborators(payload.collaborators || []);
  };

  return (
    <div className="px-4 sm:px-8 gradient-mesh">
      <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Collaborative Drafts</h1>
              <p className="text-sm text-on-surface-variant mt-2">Invite co-authors, assign permissions, and build drafts together.</p>
            </header>

            {loading ? (
              <Card className="bg-surface-container border-outline-variant/15 rounded-2xl">
                <CardContent className="py-10 text-on-surface-variant">Loading collaboration workspace...</CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="glass-card rounded-2xl">
                  <CardHeader>
                    <h2 className="font-bold text-on-surface">Incoming Invitations</h2>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {incomingInvites.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">No pending invites right now.</p>
                    ) : (
                      incomingInvites.map((invite) => (
                        <div key={invite.id} className="rounded-lg border border-white/10 bg-white/2 px-3 py-3 flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{invite.posts?.title || 'Untitled draft'}</p>
                            <p className="text-[11px] text-on-surface-variant">
                              Invited by {invite.inviter?.name || invite.inviter?.email || 'Creator'} as {invite.permission}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => respondToInvite(invite.post_id, 'reject')}>
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => respondToInvite(invite.post_id, 'accept')}>
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-card rounded-2xl">
                  <CardHeader>
                    <h2 className="font-bold text-on-surface">Your Drafts</h2>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {drafts.length === 0 ? (
                      <div className="text-sm text-on-surface-variant">
                        No drafts available. <Link href="/editor" className="text-primary">Create one</Link>.
                      </div>
                    ) : (
                      drafts.map((draft) => (
                        <button
                          key={draft.id}
                          onClick={() => setActivePostId(draft.id)}
                          className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                            activePostId === draft.id
                              ? 'border-primary/40 bg-primary/10'
                              : 'border-white/10 bg-white/2 hover:bg-white/6'
                          }`}
                        >
                          <p className="text-sm font-semibold text-on-surface line-clamp-1">{draft.title}</p>
                          <p className="text-[11px] text-on-surface-variant mt-1">{new Date(draft.created_at).toLocaleDateString()}</p>
                        </button>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 glass-card rounded-2xl">
                  <CardHeader>
                    <h2 className="font-bold text-on-surface">Invite Collaborators</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teammate@email.com"
                        className="md:col-span-2"
                      />
                      <select
                        value={permission}
                        onChange={(e) => setPermission(e.target.value === 'viewer' ? 'viewer' : 'editor')}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <Button onClick={sendInvite} disabled={!activePostId || !inviteEmail.trim()}>
                        Send Invite
                      </Button>
                    </div>
                    {inviteMessage && (
                      <p className={`text-xs px-3 py-2 border ${inviteMessage.includes('success') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>{inviteMessage}</p>
                    )}

                    <div className="space-y-2">
                      {collaborators.length === 0 ? (
                        <p className="text-sm text-on-surface-variant">No collaborators yet for this draft.</p>
                      ) : (
                        collaborators.map((c) => (
                          <div key={c.id} className="rounded-lg border border-white/10 bg-white/2 px-3 py-2 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-on-surface">{c.profiles?.name || c.profiles?.email || c.user_id}</p>
                              <p className="text-[11px] text-on-surface-variant">{c.permission} permission</p>
                            </div>
                            <Badge className={
                              c.status === 'accepted'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20'
                                : c.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-400/20'
                                : 'bg-white/5 text-on-surface-variant border-white/10'
                            }>
                              {c.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
