"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/NavBar";
import GhostReaderPanel from "@/components/GhostReaderPanel";

import { useAuth } from "@/context/AuthContext";
import { renderMarkdownBlocks } from "@/lib/markdown";
import { emitLikeUpdate, subscribeLikeUpdates } from "@/lib/like-sync";
import { BlogTheme, getThemeById, getThemeFromAny, isBuiltinTheme } from "@/lib/blog-themes";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  topic?: string;
  blog_theme?: string;
  views: number;
  likes_count: number;
  comments_count: number;
  liked_by_current_user?: boolean;
  ai_generated: boolean;
  created_at: string;
  profiles?: { id: string; name: string; avatar_url?: string };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  profiles?: { id: string; name: string; avatar_url?: string } | null;
}

interface LikerProfile {
  id: string;
  name: string | null;
  avatar_url?: string | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAdmin } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState("");
  const [liked, setLiked] = useState(false);
  const [likers, setLikers] = useState<LikerProfile[]>([]);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<BlogTheme | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    author: { id: string; name: string; avatar_url?: string };
  }>>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setLiked(!!data.liked_by_current_user);
      }
    } catch (err) {
      console.error("Failed to load post:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchComments = useCallback(async () => {
    if (!post?.id) return;
    try {
      const res = await fetch(`/api/comments?postId=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  }, [post?.id]);

  const fetchLikers = useCallback(async () => {
    if (!post?.id) return;
    try {
      const res = await fetch(`/api/likes?post_id=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setLikers(data.likers || []);
        const freshCount = data.count ?? data.likesCount;
        if (freshCount !== undefined) {
          setPost((current) => current ? { ...current, likes_count: freshCount } : current);
          setLiked(Boolean(data.likedByCurrentUser));
        }
      }
    } catch (err) {
      console.error("Failed to load likers:", err);
    }
  }, [post?.id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchLikers();
  }, [fetchLikers]);

  useEffect(() => {
    const unsubscribe = subscribeLikeUpdates((payload) => {
      if (!post || payload.postId !== post.id) return;
      setLiked(payload.likedByCurrentUser);
      setPost((current) => (current ? { ...current, likes_count: payload.likesCount } : current));
    });

    return unsubscribe;
  }, [post]);

  useEffect(() => {
    const themeId = post?.blog_theme;
    if (!themeId) {
      setResolvedTheme(getThemeById("default"));
      return;
    }

    if (isBuiltinTheme(themeId)) {
      setResolvedTheme(getThemeById(themeId));
      return;
    }

    let active = true;
    const loadTheme = async () => {
      try {
        const response = await fetch(`/api/blog-themes/${encodeURIComponent(themeId)}`);
        if (!response.ok) {
          if (active) setResolvedTheme(getThemeById("default"));
          return;
        }
        const data = await response.json();
        if (active) {
          setResolvedTheme(getThemeFromAny(data.theme));
        }
      } catch {
        if (active) setResolvedTheme(getThemeById("default"));
      }
    };

    loadTheme();
    return () => {
      active = false;
    };
  }, [post?.blog_theme]);

  const handleLike = async () => {
    if (!post) return;
    if (!user) {
      alert("Please sign in to like this post");
      return;
    }

    const previousCount = post.likes_count || 0;
    const optimisticLiked = !liked;
    const optimisticCount = Math.max(0, previousCount + (optimisticLiked ? 1 : -1));

    setLiked(optimisticLiked);
    setPost({ ...post, likes_count: optimisticCount });
    emitLikeUpdate({
      postId: post.id,
      likesCount: optimisticCount,
      likedByCurrentUser: optimisticLiked,
      source: "blog",
    });

    try {
      if (liked) {
        // Unlike
        const res = await fetch(`/api/likes?post_id=${post.id}`, { method: "DELETE" });
        if (res.ok) {
          const data = await res.json();
          const finalCount = data.count ?? Math.max(0, previousCount - 1);
          setLiked(false);
          setPost({ ...post, likes_count: finalCount });
          emitLikeUpdate({
            postId: post.id,
            likesCount: finalCount,
            likedByCurrentUser: false,
            source: "blog",
          });
          fetchLikers();
        } else {
          throw new Error("Failed to unlike post");
        }
      } else {
        // Like
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id }),
        });
        if (res.ok) {
          const data = await res.json();
          const finalCount = data.count ?? previousCount + 1;
          setLiked(true);
          setPost({ ...post, likes_count: finalCount });
          emitLikeUpdate({
            postId: post.id,
            likesCount: finalCount,
            likedByCurrentUser: true,
            source: "blog",
          });
          fetchLikers();
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to like post");
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setLiked(liked);
      setPost({ ...post, likes_count: previousCount });
      emitLikeUpdate({
        postId: post.id,
        likesCount: previousCount,
        likedByCurrentUser: liked,
        source: "blog",
      });
      const msg = err instanceof Error ? err.message : "Failed to toggle like";
      if (msg.includes("Unauthorized")) {
        alert("Please sign in to like this post.");
      } else {
        alert(msg);
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    if (!user && (!guestName.trim() || !guestEmail.trim())) return;
    if (!post?.id) {
      alert("Post is still loading. Please wait.");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          content: commentContent,
          guestName: user ? undefined : guestName,
          guestEmail: user ? undefined : guestEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const comment = data?.comment;
        if (comment) {
          setComments([...comments, comment]);
          setPost((prev) => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev);
        }
        setCommentContent("");
        setCommentSuccess("Comment posted!");
        setTimeout(() => setCommentSuccess(""), 3000);
      } else {
        let errorMessage = "Unknown error";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || `Server error (${res.status})`;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorMessage = `Server error (${res.status}): Unable to parse error response`;
        }
        alert(`Failed to post comment: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Comment submission error:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    const confirmed = window.confirm("Delete this comment permanently?");
    if (!confirmed) return;

    try {
      setDeletingCommentId(commentId);
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete comment");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentSuccess("Comment deleted.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const fetchReviews = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/community/reviews?limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (!data.unavailable) {
          const postReviews = (data.reviews || []).filter(
            (r: { postSlug?: string }) => r.postSlug === slug
          );
          setReviews(postReviews);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  }, [slug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !user) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/community/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug: slug,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewComment("");
        setReviewRating(5);
        setReviewSuccess("Review submitted!");
        setTimeout(() => setReviewSuccess(""), 3000);
        fetchReviews();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to submit review");
      }
    } catch {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 px-4 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-primary"></div>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 px-4 text-center">
          <h1 className="text-3xl font-bold font-headline mt-20">Post Not Found</h1>
          <p className="text-on-surface-variant mt-4">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/community" className="mt-6 inline-block text-primary font-semibold hover:underline">
            Browse All Posts
          </Link>
        </main>
      </>
    );
  }

  const theme = resolvedTheme || getThemeById(post.blog_theme || "default");
  const isCustom = theme.source === "custom";
  const p = theme.palette;

  return (
    <>
      <Navbar />
      <main
        className={`min-h-screen ${theme.fontClass} pt-20 pb-16 ${!isCustom ? theme.bgClass : ""}`}
        style={isCustom ? { backgroundColor: p.background, color: p.text } : undefined}
      >
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="w-full h-100 relative overflow-hidden">
            <div className={`absolute inset-0 bg-linear-to-b ${theme.coverOverlayClass} z-10`}></div>
            <Image src={post.cover_image_url} alt={post.title} fill sizes="100vw" className="object-cover" />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-4 sm:px-8">
          {/* Header */}
          <header className={`${post.cover_image_url ? "-mt-24 relative z-20" : "mt-8"}`}>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/community" className={`text-sm transition-colors flex items-center gap-1 ${!isCustom ? theme.linkClass : ""}`} style={isCustom ? { color: p.accent } : undefined}>
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                All Posts
              </Link>
              {post.topic && (
                <>
                  <span className="opacity-30">/</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${!isCustom ? theme.accentClass : ""}`} style={isCustom ? { color: p.accent, background: `${p.accent}1a` } : undefined}>
                    {post.topic}
                  </span>
                </>
              )}
              {post.ai_generated && (
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  AI Generated
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${!isCustom ? theme.accentClass : ""}`} style={isCustom ? { color: p.accent, background: `${p.accent}1a` } : undefined}>
                {theme.name}
              </span>
            </div>

            <h1 className={`text-4xl md:text-5xl font-extrabold font-headline tracking-tighter leading-tight mb-6 ${!isCustom ? theme.headingClass : ""}`} style={isCustom ? { color: p.heading || p.text } : undefined}>
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className={`flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-current/10`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                  {post.profiles?.avatar_url ? (
                    <Image src={post.profiles.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${!isCustom ? theme.textClass : ""}`} style={isCustom ? { color: p.text } : undefined}>
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className={`font-semibold text-sm ${!isCustom ? theme.headingClass : ""}`} style={isCustom ? { color: p.heading || p.text } : undefined}>{post.profiles?.name || "Unknown"}</span>
                  <span className={`block text-xs ${!isCustom ? theme.textClass : ""}`} style={isCustom ? { color: p.mutedText || p.text } : undefined}>{formatDate(post.created_at)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-4 text-xs ${!isCustom ? theme.textClass : ""}`} style={isCustom ? { color: p.mutedText || p.text } : undefined}>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  {post.views} views
                </span>
                <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? "text-red-400" : "hover:text-red-400"}`}>
                  <span className="material-symbols-outlined text-sm" style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                  {post.likes_count} likes
                </button>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">chat_bubble</span>
                  {post.comments_count || comments.length} comments
                </span>
              </div>
              {likers.length > 0 && (
                <p className={`mt-3 text-xs ${!isCustom ? theme.textClass : ""}`} style={isCustom ? { color: p.mutedText || p.text } : undefined}>
                  Liked by {likers.slice(0, 3).map((liker) => liker.name || "User").join(", ")}
                  {likers.length > 3 ? ` and ${likers.length - 3} others` : ""}
                </p>
              )}
            </div>
          </header>

          {/* Themed Content */}
          {user || isAdmin ? (
            <div className={`mt-10 max-w-none leading-relaxed ${!isCustom ? `${theme.proseClass} ${theme.textClass}` : ""}`} style={isCustom ? { color: p.text } : undefined}>
              {renderMarkdownBlocks(post.content, theme)}
            </div>
          ) : (
            <>
              <div className={`mt-10 max-w-none leading-relaxed relative ${!isCustom ? `${theme.proseClass} ${theme.textClass}` : ""}`} style={isCustom ? { color: p.text } : undefined}>
                <div className="line-clamp-[8] overflow-hidden">
                  {renderMarkdownBlocks(post.content, theme)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t to-transparent pointer-events-none" style={isCustom ? { backgroundImage: `linear-gradient(to top, ${p.background}, transparent)` } : undefined}></div>
              </div>
              <div className="mt-8 glass-panel rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-primary mb-4 block">lock</span>
                <h3 className={`text-2xl font-bold font-headline mb-2 ${!isCustom ? theme.headingClass : ""}`} style={isCustom ? { color: p.heading || p.text } : undefined}>Sign in to read the full article</h3>
                <p className={`text-sm mb-6 ${!isCustom ? theme.textClass : ""}`} style={isCustom ? { color: p.mutedText || p.text } : undefined}>
                  Create a free account or sign in to access the complete post, leave comments, and engage with the community.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href={`/auth?next=/blog/${slug}`}
                    className="px-6 py-3 bg-linear-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-lg text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                  >
                    Sign In to Continue Reading
                  </Link>
                  <Link
                    href={`/auth?next=/blog/${slug}`}
                    className="px-6 py-3 border border-outline-variant/20 text-on-surface-variant font-semibold rounded-lg text-sm hover:bg-surface-container-high transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Comments & Reviews — only for authenticated users */}
          {(user || isAdmin) && (
          <>
          <section className="mt-16 pt-10 border-t border-outline-variant/10">
            <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">forum</span>
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <div className="glass-panel rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-sm mb-4">
                {user ? "Leave a comment" : "Leave a comment as a guest"}
              </h3>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your name *"
                      required
                      className="px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                    />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Your email *"
                      required
                      className="px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                    />
                  </div>
                )}
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write your comment..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">
                    {user ? `Commenting as ${user.email}` : "Your email won't be published"}
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || loading || !post?.id}
                    className="px-6 py-2.5 bg-linear-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-lg text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {submittingComment ? "Posting..." : loading || !post?.id ? "Loading..." : "Post Comment"}
                  </button>
                </div>
                {commentSuccess && (
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {commentSuccess}
                  </p>
                )}
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">forum</span>
                  <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="glass-panel rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                        {comment.profiles?.avatar_url ? (
                            <Image src={comment.profiles.avatar_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
                            <span className="material-symbols-outlined text-sm">person</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-on-surface">
                            {comment.profiles?.name || comment.guest_name || "Anonymous"}
                          </span>
                          {comment.guest_name && !comment.user_id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">Guest</span>
                          )}
                          <span className="text-xs text-on-surface-variant">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        {isAdmin && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              {deletingCommentId === comment.id ? "Deleting..." : "Delete comment"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="mt-12 pt-10 border-t border-outline-variant/10">
            <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">rate_review</span>
              Reviews ({reviews.length})
            </h2>

            {/* Review Form */}
            {user ? (
              <div className="glass-panel rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-sm mb-4">Leave a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl transition-colors ${star <= reviewRating ? "text-amber-400" : "text-zinc-600"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this post..."
                    rows={3}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-secondary/50 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">Reviewing as {user.email}</span>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-linear-to-r from-secondary to-tertiary text-white font-bold rounded-lg text-sm hover:scale-[1.02] transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                  {reviewSuccess && (
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {reviewSuccess}
                    </p>
                  )}
                </form>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-6 mb-8 text-center">
                <p className="text-sm text-on-surface-variant">
                  <Link href="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to leave a review
                </p>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">reviews</span>
                  <p className="text-sm">No reviews yet. Be the first to review this post!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="glass-panel rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden shrink-0 flex items-center justify-center text-on-surface-variant text-sm">
                        {review.author?.avatar_url ? (
                          <Image src={review.author.avatar_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-sm">person</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-on-surface">{review.author?.name || "User"}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-xs ${star <= review.rating ? "text-amber-400" : "text-zinc-700"}`}>★</span>
                            ))}
                          </div>
                          <span className="text-xs text-on-surface-variant">{formatDate(review.created_at)}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Ghost Reader AI - only for post author */}
          {user && post.profiles?.id === user.id && (
            <GhostReaderPanel postId={post.id} />
          )}
          </>
          )}
        </article>
      </main>
    </>
  );
}
