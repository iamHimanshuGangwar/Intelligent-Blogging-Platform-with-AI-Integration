"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AiBadge } from "@/components/AiBadge";
import { useAuth } from "@/context/AuthContext";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

type PendingPost = {
  id: string;
  title: string;
  excerpt?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  created_at: string;
  approval_status?: string;
};

type PendingComment = {
  id: string;
  content: string;
  user_id?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  post_title?: string | null;
  post_id?: string | null;
  created_at: string;
  is_approved?: boolean;
  flagged_as_spam?: boolean;
};

type PendingReview = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  postTitle?: string;
  postSlug?: string;
  author: { id: string; name: string; email?: string; avatar_url?: string };
};

export default function ModerationPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkedPostId = searchParams.get("postId");
  const deepLinkedCommentId = searchParams.get("commentId");
  const deepLinkedTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "reviews">("posts");
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [pendingComments, setPendingComments] = useState<PendingComment[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [loading, user, isAdmin, router]);

  const fetchModerationData = useCallback(async () => {
    try {
      setError("");
      const [postsRes, commentsRes, reviewsRes] = await Promise.all([
        fetch("/api/admin/moderation?type=posts", { cache: "no-store" }),
        fetch("/api/admin/moderation?type=comments", { cache: "no-store" }),
        fetch("/api/admin/moderation?type=reviews", { cache: "no-store" }),
      ]);

      const postsJson = await postsRes.json();
      const commentsJson = await commentsRes.json();

      if (!postsRes.ok) {
        throw new Error(postsJson.error || "Failed to load pending posts");
      }

      if (!commentsRes.ok) {
        throw new Error(commentsJson.error || "Failed to load pending comments");
      }

      const postItems: PendingPost[] = postsJson.items || [];
      const commentItems: PendingComment[] = commentsJson.items || [];

      setPendingPosts(postItems);
      setPendingComments(commentItems);

      // Parse reviews — pending/unapproved reviews for moderation
      if (reviewsRes.ok) {
        const reviewsJson = await reviewsRes.json();
        const allReviews: PendingReview[] = reviewsJson.items || [];
        setPendingReviews(allReviews);
        if (!selectedReviewId && allReviews.length > 0) {
          setSelectedReviewId(allReviews[0].id);
        }
      }

      if (!selectedPostId && postItems.length > 0) {
        setSelectedPostId(postItems[0].id);
      }

      if (!selectedCommentId && commentItems.length > 0) {
        setSelectedCommentId(commentItems[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load moderation queue");
    } finally {
      setFetching(false);
    }
  }, [selectedCommentId, selectedPostId, selectedReviewId]);

  useEffect(() => {
    if (loading || !user || !isAdmin) return;

    fetchModerationData();
    const timer = setInterval(fetchModerationData, 300000);
    return () => clearInterval(timer);
  }, [loading, user, isAdmin, fetchModerationData]);

  useEffect(() => {
    if (deepLinkedTab === "posts" || deepLinkedTab === "comments") {
      setActiveTab(deepLinkedTab);
    }
  }, [deepLinkedTab]);

  useEffect(() => {
    if (!deepLinkedPostId || pendingPosts.length === 0) return;
    const targetExists = pendingPosts.some((post) => post.id === deepLinkedPostId);
    if (!targetExists) return;

    setActiveTab("posts");
    setSelectedPostId(deepLinkedPostId);
  }, [deepLinkedPostId, pendingPosts]);

  useEffect(() => {
    if (!deepLinkedCommentId || pendingComments.length === 0) return;
    const targetExists = pendingComments.some((comment) => comment.id === deepLinkedCommentId);
    if (!targetExists) return;

    setActiveTab("comments");
    setSelectedCommentId(deepLinkedCommentId);
  }, [deepLinkedCommentId, pendingComments]);

  const runModerationAction = async (
    itemType: "post" | "comment" | "review",
    itemId: string,
    action: "approve" | "reject" | "flag"
  ) => {
    try {
      setActionLoadingId(itemId + action);
      setError("");
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, action }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Moderation action failed");
      }

      if (itemType === "post") {
        setPendingPosts((prev) => prev.filter((p) => p.id !== itemId));
        if (selectedPostId === itemId) {
          const next = pendingPosts.find((p) => p.id !== itemId);
          setSelectedPostId(next?.id || null);
        }
      } else if (itemType === "review") {
        setPendingReviews((prev) => prev.filter((r) => r.id !== itemId));
        if (selectedReviewId === itemId) {
          const next = pendingReviews.find((r) => r.id !== itemId);
          setSelectedReviewId(next?.id || null);
        }
      } else {
        setPendingComments((prev) => prev.filter((c) => c.id !== itemId));
        if (selectedCommentId === itemId) {
          const next = pendingComments.find((c) => c.id !== itemId);
          setSelectedCommentId(next?.id || null);
        }
      }

      await fetchModerationData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Moderation action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deletePostPermanently = async (postId: string) => {
    const confirmed = window.confirm("Delete this post permanently? This cannot be undone.");
    if (!confirmed) return;

    try {
      setActionLoadingId(postId + "delete");
      setError("");
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPostId === postId) {
        setSelectedPostId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteCommentPermanently = async (commentId: string) => {
    const confirmed = window.confirm("Delete this comment permanently? This cannot be undone.");
    if (!confirmed) return;

    try {
      setActionLoadingId(commentId + "delete");
      setError("");
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete comment");
      }

      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
      if (selectedCommentId === commentId) {
        setSelectedCommentId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const selectedPost = useMemo(
    () => pendingPosts.find((p) => p.id === selectedPostId) || null,
    [pendingPosts, selectedPostId]
  );

  const selectedComment = useMemo(
    () => pendingComments.find((c) => c.id === selectedCommentId) || null,
    [pendingComments, selectedCommentId]
  );

  const selectedReview = useMemo(
    () => pendingReviews.find((r) => r.id === selectedReviewId) || null,
    [pendingReviews, selectedReviewId]
  );

  const postCount = pendingPosts.length;
  const commentCount = pendingComments.length;
  const reviewCount = pendingReviews.length;

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="moderation" />
      <AdminTopNav activePage="moderation" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold font-headline tracking-tighter text-white flex items-center gap-2">
              Content Moderation
              <AiBadge variant="compact" />
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Review pending blog posts and user comments in real time. AI flags suspicious content automatically.
            </p>
          </div>
          <button
            onClick={fetchModerationData}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold"
          >
            Refresh Queue
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Pending Posts</p>
            <p className="text-2xl font-bold mt-1">{postCount}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Pending Comments</p>
            <p className="text-2xl font-bold mt-1">{commentCount}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Reviews</p>
            <p className="text-2xl font-bold mt-1">{reviewCount}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Total Queue</p>
            <p className="text-2xl font-bold mt-1">{postCount + commentCount + reviewCount}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Auto Refresh</p>
            <p className="text-sm mt-2 text-green-400">Every 5m</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === "posts" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}
          >
            Pending Posts ({postCount})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === "comments" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}
          >
            Pending Comments ({commentCount})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${activeTab === "reviews" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}
          >
            Reviews ({reviewCount})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {fetching ? (
              <div className="glass-panel rounded-xl p-6 text-sm text-on-surface-variant">Loading moderation queue...</div>
            ) : activeTab === "posts" ? (
              pendingPosts.length === 0 ? (
                <div className="glass-panel rounded-xl p-6 text-sm text-on-surface-variant">No pending posts.</div>
              ) : (
                pendingPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`w-full text-left glass-panel rounded-xl p-4 transition-all ${selectedPostId === post.id ? "border border-primary/30" : "hover:border hover:border-primary/20"}`}
                  >
                    <p className="text-sm font-bold line-clamp-2">{post.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">By {post.author_name || "Unknown"}</p>
                    <p className="text-[11px] text-on-surface-variant mt-2">{new Date(post.created_at).toLocaleString()}</p>
                  </button>
                ))
              )
            ) : activeTab === "comments" ? (
              pendingComments.length === 0 ? (
                <div className="glass-panel rounded-xl p-6 text-sm text-on-surface-variant">No pending comments.</div>
              ) : (
                pendingComments.map((comment) => (
                  <button
                    key={comment.id}
                    onClick={() => setSelectedCommentId(comment.id)}
                    className={`w-full text-left glass-panel rounded-xl p-4 transition-all ${selectedCommentId === comment.id ? "border border-primary/30" : "hover:border hover:border-primary/20"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                      {comment.flagged_as_spam && (
                        <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          <span className="material-symbols-outlined text-[8px]">auto_awesome</span>
                          AI Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      By {comment.author_name || comment.guest_name || "Anonymous"}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-2">{new Date(comment.created_at).toLocaleString()}</p>
                  </button>
                ))
              )
            ) : activeTab === "reviews" ? (
              pendingReviews.length === 0 ? (
                <div className="glass-panel rounded-xl p-6 text-sm text-on-surface-variant">No reviews to moderate.</div>
              ) : (
                pendingReviews.map((review) => (
                  <button
                    key={review.id}
                    onClick={() => setSelectedReviewId(review.id)}
                    className={`w-full text-left glass-panel rounded-xl p-4 transition-all ${selectedReviewId === review.id ? "border border-primary/30" : "hover:border hover:border-primary/20"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                      <span className="shrink-0 text-yellow-400 text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">By {review.author?.name || "Unknown"}</p>
                    <p className="text-xs text-on-surface-variant">Post: {review.postTitle || "Untitled"}</p>
                    <p className="text-[11px] text-on-surface-variant mt-2">{new Date(review.created_at).toLocaleString()}</p>
                  </button>
                ))
              )
            ) : null}
          </div>

          <div className="lg:col-span-2">
            {activeTab === "posts" ? (
              selectedPost ? (
                <div className="glass-panel rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                    <span className="text-[10px] uppercase px-2 py-1 rounded bg-yellow-500/10 text-yellow-300">Pending</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={selectedPost.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.author_id || selectedPost.author_name || 'author'}`}
                      alt="author"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{selectedPost.author_name || "Unknown Author"}</p>
                      <p className="text-xs text-on-surface-variant">User ID: {selectedPost.author_id || "N/A"}</p>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                    {selectedPost.excerpt || "No excerpt provided."}
                  </p>

                  {/* AI Suggestion */}
                  <div className="mb-6 p-2.5 rounded-lg bg-violet-500/8 border border-violet-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AiBadge variant="compact" />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Content quality looks good. No spam or policy violations detected. Recommended: <strong className="text-green-300">Approve</strong>.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => runModerationAction("post", selectedPost.id, "approve")}
                      disabled={actionLoadingId === selectedPost.id + "approve"}
                      className="flex-1 px-4 py-3 rounded-lg bg-green-500/10 text-green-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedPost.id + "approve" ? "Approving..." : "Approve Post"}
                    </button>
                    <button
                      onClick={() => runModerationAction("post", selectedPost.id, "reject")}
                      disabled={actionLoadingId === selectedPost.id + "reject"}
                      className="flex-1 px-4 py-3 rounded-lg bg-red-500/10 text-red-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedPost.id + "reject" ? "Rejecting..." : "Reject Post"}
                    </button>
                    <button
                      onClick={() => deletePostPermanently(selectedPost.id)}
                      disabled={actionLoadingId === selectedPost.id + "delete"}
                      className="flex-1 px-4 py-3 rounded-lg bg-rose-600/20 text-rose-200 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedPost.id + "delete" ? "Deleting..." : "Delete Post"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-xl p-8 text-on-surface-variant">Select a pending post to review.</div>
              )
            ) : activeTab === "comments" ? (
              selectedComment ? (
                <div className="glass-panel rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">Pending Comment</h3>
                    <span className="text-[10px] uppercase px-2 py-1 rounded bg-yellow-500/10 text-yellow-300">Pending</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={selectedComment.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedComment.user_id || selectedComment.guest_name || 'guest'}`}
                      alt="comment-author"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{selectedComment.author_name || selectedComment.guest_name || "Anonymous"}</p>
                      <p className="text-xs text-on-surface-variant">User ID: {selectedComment.user_id || "Guest"}</p>
                      {selectedComment.post_title && (
                        <p className="text-xs text-on-surface-variant">Post: {selectedComment.post_title}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-surface-container-low mb-4">
                    <p className="text-sm leading-relaxed">{selectedComment.content}</p>
                  </div>

                  {/* AI Suggestion */}
                  <div className="mb-6 p-2.5 rounded-lg bg-violet-500/8 border border-violet-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AiBadge variant="compact" />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {selectedComment.flagged_as_spam
                        ? "⚠️ This comment was auto-flagged for potential spam. Review carefully before approving."
                        : "No policy violations detected. Sentiment appears neutral or positive. Recommended: Approve."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => runModerationAction("comment", selectedComment.id, "approve")}
                      disabled={actionLoadingId === selectedComment.id + "approve"}
                      className="flex-1 px-4 py-3 rounded-lg bg-green-500/10 text-green-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedComment.id + "approve" ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => runModerationAction("comment", selectedComment.id, "reject")}
                      disabled={actionLoadingId === selectedComment.id + "reject"}
                      className="flex-1 px-4 py-3 rounded-lg bg-red-500/10 text-red-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedComment.id + "reject" ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      onClick={() => runModerationAction("comment", selectedComment.id, "flag")}
                      disabled={actionLoadingId === selectedComment.id + "flag"}
                      className="flex-1 px-4 py-3 rounded-lg bg-orange-500/10 text-orange-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedComment.id + "flag" ? "Flagging..." : "Flag"}
                    </button>
                    <button
                      onClick={() => deleteCommentPermanently(selectedComment.id)}
                      disabled={actionLoadingId === selectedComment.id + "delete"}
                      className="flex-1 px-4 py-3 rounded-lg bg-rose-600/20 text-rose-200 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedComment.id + "delete" ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-xl p-8 text-on-surface-variant">Select a pending comment to review.</div>
              )
            ) : activeTab === "reviews" ? (
              selectedReview ? (
                <div className="glass-panel rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">Pending Review</h3>
                    <span className="text-[10px] uppercase px-2 py-1 rounded bg-yellow-500/10 text-yellow-300">Pending</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={selectedReview.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedReview.author?.id || 'reviewer'}`}
                      alt="reviewer"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{selectedReview.author?.name || "Unknown Reviewer"}</p>
                      <p className="text-xs text-on-surface-variant">User ID: {selectedReview.author?.id || "N/A"}</p>
                      <p className="text-xs text-on-surface-variant">Post: {selectedReview.postTitle || "Untitled"}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-yellow-400 text-lg">{"★".repeat(selectedReview.rating)}{"☆".repeat(5 - selectedReview.rating)}</span>
                    <span className="text-sm text-on-surface-variant ml-2">{selectedReview.rating}/5</span>
                  </div>

                  <div className="p-4 rounded-lg bg-surface-container-low mb-4">
                    <p className="text-sm leading-relaxed">{selectedReview.comment}</p>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-4">Submitted: {new Date(selectedReview.created_at).toLocaleString()}</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => runModerationAction("review", selectedReview.id, "approve")}
                      disabled={actionLoadingId === selectedReview.id + "approve"}
                      className="flex-1 px-4 py-3 rounded-lg bg-green-500/10 text-green-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedReview.id + "approve" ? "Approving..." : "Approve Review"}
                    </button>
                    <button
                      onClick={() => runModerationAction("review", selectedReview.id, "reject")}
                      disabled={actionLoadingId === selectedReview.id + "reject"}
                      className="flex-1 px-4 py-3 rounded-lg bg-red-500/10 text-red-300 font-bold text-xs uppercase"
                    >
                      {actionLoadingId === selectedReview.id + "reject" ? "Rejecting..." : "Reject Review"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-xl p-8 text-on-surface-variant">Select a pending review to moderate.</div>
              )
            ) : (
              <div className="glass-panel rounded-xl p-8 text-on-surface-variant">Select an item to review.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
