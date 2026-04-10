"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import NavBar from "@/components/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

interface ForumTopic {
  id: string;
  category_id: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  author_avatar?: string;
  is_pinned: boolean;
  is_solved: boolean;
  is_locked: boolean;
  reply_count: number;
  like_count: number;
  view_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  forum_categories?: {
    id: string;
    name: string;
    slug: string;
    gradient: string;
    icon: string;
  };
}

interface ForumReply {
  id: string;
  topic_id: string;
  parent_id?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  is_solution: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TopicPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchTopic = async () => {
      try {
        const [topicRes, repliesRes] = await Promise.all([
          fetch(`/api/forum/topics/${id}`),
          fetch(`/api/forum/topics/${id}/replies`),
        ]);
        if (topicRes.ok) {
          const data = await topicRes.json();
          setTopic(data.topic);
        }
        if (repliesRes.ok) {
          const data = await repliesRes.json();
          setReplies(data.replies || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    fetch(`/api/forum/topics/${id}/like`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setLiked(d?.liked || false))
      .catch(() => {});
  }, [id, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) { router.push("/auth?next=%2Fforum%2Ftopic%2F" + id); return; }
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/forum/topics/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setTopic((t) => t ? { ...t, like_count: t.like_count + (data.liked ? 1 : -1) } : t);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleReply = async () => {
    if (!isAuthenticated) { router.push("/auth?next=%2Fforum%2Ftopic%2F" + id); return; }
    if (!replyContent.trim()) { setReplyError("Reply content is required"); return; }

    setSubmitting(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/forum/topics/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          parent_id: replyingTo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply");
      setReplies((prev) => [...prev, data.reply]);
      setReplyContent("");
      setReplyingTo(null);
      setTopic((t) => t ? { ...t, reply_count: t.reply_count + 1 } : t);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyLike = async (replyId: string) => {
    if (!isAuthenticated) return;
    const res = await fetch(`/api/forum/replies/${replyId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? { ...r, like_count: r.like_count + (data.liked ? 1 : -1) }
            : r
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background gradient-mesh text-on-background">
        <NavBar />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20 space-y-4">
          <div className="h-8 w-2/3 rounded bg-white/4 animate-pulse" />
          <div className="h-40 rounded-xl bg-white/4 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background gradient-mesh text-on-background">
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">forum</span>
          <p className="text-on-surface-variant">Topic not found.</p>
          <Button onClick={() => router.push("/forum")}>Back to Forum</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh text-on-background">
      <NavBar />

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/forum" className="hover:text-primary transition-colors">Forum</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          {topic.forum_categories && (
            <>
              <Link
                href={`/forum/category/${topic.forum_categories.slug}`}
                className="hover:text-primary transition-colors"
              >
                {topic.forum_categories.name}
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </>
          )}
          <span className="line-clamp-1">{topic.title}</span>
        </div>

        {/* Topic Card */}
        <Card className="bg-white/4 border-white/10 mb-6">
          {topic.forum_categories && (
            <div className={`h-1 rounded-t-xl bg-linear-to-r ${topic.forum_categories.gradient}`} />
          )}
          <CardContent className="p-6">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {topic.is_pinned && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                  <span className="material-symbols-outlined text-xs mr-0.5">push_pin</span> Pinned
                </Badge>
              )}
              {topic.is_solved && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <span className="material-symbols-outlined text-xs mr-0.5">check_circle</span> Solved
                </Badge>
              )}
              {topic.is_locked && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                  <span className="material-symbols-outlined text-xs mr-0.5">lock</span> Locked
                </Badge>
              )}
              {topic.forum_categories && (
                <Badge className={`bg-linear-to-r ${topic.forum_categories.gradient} text-white text-xs border-0`}>
                  <span className="material-symbols-outlined text-xs mr-0.5">{topic.forum_categories.icon}</span>
                  {topic.forum_categories.name}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold font-headline mb-4">{topic.title}</h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                {topic.author_avatar ? (
                  <Image src={topic.author_avatar} alt={topic.author_name} width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  topic.author_name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{topic.author_name}</p>
                <p className="text-xs text-on-surface-variant">{timeAgo(topic.created_at)}</p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-sm max-w-none mb-6 text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {topic.content}
            </div>

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {topic.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-on-surface-variant">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions bar */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-on-surface-variant">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 hover:text-red-400 transition-colors ${liked ? "text-red-400" : ""}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {liked ? "favorite" : "favorite_border"}
                </span>
                {topic.like_count} likes
              </button>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
                {topic.reply_count} replies
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">visibility</span>
                {topic.view_count} views
              </span>
              {!topic.is_locked && (
                <button
                  onClick={() => { setReplyingTo(null); replyRef.current?.focus(); }}
                  className="ml-auto flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">reply</span>
                  Reply
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        {replies.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold font-headline mb-4">
              {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
            </h2>
            <div className="space-y-3">
              {replies.map((reply, index) => (
                <Card
                  key={reply.id}
                  className={`bg-white/4 border-white/10 ${reply.is_solution ? "border-green-500/40 bg-green-500/5" : ""}`}
                >
                  <CardContent className="p-4">
                    {reply.is_solution && (
                      <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold mb-3">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Accepted Solution
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/60 to-secondary/60 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {reply.author_avatar ? (
                          <Image src={reply.author_avatar} alt={reply.author_name} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          reply.author_name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">{reply.author_name}</span>
                          <span className="text-[10px] text-on-surface-variant">{timeAgo(reply.created_at)}</span>
                          <span className="text-[10px] text-on-surface-variant ml-auto">#{index + 1}</span>
                        </div>
                        <div className="text-sm text-on-surface-variant whitespace-pre-wrap mb-3">
                          {reply.content}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-on-surface-variant">
                          <button
                            onClick={() => handleReplyLike(reply.id)}
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[10px]">favorite_border</span>
                            {reply.like_count}
                          </button>
                          {!topic.is_locked && (
                            <button
                              onClick={() => {
                                setReplyingTo(reply.id);
                                setReplyContent(`@${reply.author_name} `);
                                replyRef.current?.focus();
                              }}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[10px]">reply</span>
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reply Form */}
        {!topic.is_locked ? (
          <Card className="bg-white/4 border-white/10">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">
                {replyingTo ? "Write a Reply" : "Join the Discussion"}
              </h3>
              {replyingTo && (
                <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3 p-2 rounded bg-white/4 border border-white/10">
                  <span className="material-symbols-outlined text-xs">reply</span>
                  Replying to a comment
                  <button
                    onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                    className="ml-auto hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              )}
              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-on-surface-variant text-sm mb-4">Sign in to join this discussion</p>
                  <Button onClick={() => router.push(`/auth?next=%2Fforum%2Ftopic%2F${id}`)}>
                    Sign In to Reply
                  </Button>
                </div>
              ) : (
                <>
                  {replyError && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs mb-3">
                      {replyError}
                    </div>
                  )}
                  <Textarea
                    ref={replyRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply here... Be respectful and constructive."
                    rows={4}
                    className="bg-white/4 border-white/10 resize-none mb-3"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">{replyContent.length} / 5000</span>
                    <Button
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                      className="bg-primary text-on-primary font-bold"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          Posting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">send</span>
                          Post Reply
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/4 border-white/10">
            <CardContent className="p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">lock</span>
              <p className="text-on-surface-variant text-sm">This topic is locked. No new replies are allowed.</p>
            </CardContent>
          </Card>
        )}
      </main>

    </div>
  );
}
