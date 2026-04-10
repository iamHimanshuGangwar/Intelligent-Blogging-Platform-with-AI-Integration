"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/NavBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

const SideNavBar = dynamic(() => import("@/components/SideNavBar"), { ssr: false });
const FollowButton = dynamic(() => import("@/components/FollowButton"), { ssr: false });
import { Heart, Share2 } from "lucide-react";
import { AiBadge } from "@/components/AiBadge";
import { getUserAccentColor } from "@/lib/utils";
import { emitLikeUpdate, subscribeLikeUpdates } from "@/lib/like-sync";
import { getThemeById } from "@/lib/blog-themes";

interface ApiPost {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  views: number;
  likes_count: number;
  comments_count?: number;
  liked_by_current_user?: boolean;
  created_at: string;
  ai_generated: boolean;
  topic?: string;
  category?: string;
  blog_theme?: string;
  author_id?: string;
  user_id?: string;
  cover_image_url?: string;
  profiles?: { id: string; name: string; avatar_url: string };
}

interface SidebarJob {
  id: string;
  title: string;
  company: string;
  location: string;
  applyUrl: string;
}

interface RecommendationPost {
  id: string;
  title: string;
  slug?: string;
  topic?: string;
  reason: string;
  score: number;
}

interface CommunityReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  postTitle?: string;
  postSlug?: string;
  author: {
    id?: string;
    name: string;
    avatar_url?: string;
  };
}

export default function CommunityPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<CommunityLoadingSkeleton />}>
        <CommunityContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function CommunityLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="hidden lg:block w-64" />
        <main className="flex-1 pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto w-full">
          <Skeleton className="h-12 w-72 mb-2 bg-surface-container" />
          <Skeleton className="h-5 w-96 mb-8 bg-surface-container" />
          <Skeleton className="h-10 w-full mb-8 bg-surface-container" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl bg-surface-container" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function CommunityContent() {
  const { user, isAuthenticated } = useAuth();
  const [apiPosts, setApiPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [sidebarJobs, setSidebarJobs] = useState<SidebarJob[]>([]);
  const [openCommentBoxes, setOpenCommentBoxes] = useState<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentSubmittingPostId, setCommentSubmittingPostId] = useState<string | null>(null);
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<RecommendationPost[]>([]);
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [reviewsUnavailable, setReviewsUnavailable] = useState(false);
  const [reviewPostSlug, setReviewPostSlug] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch) setSearchQuery(urlSearch);

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20", published: "true" });
        if (urlSearch) params.set("search", urlSearch);
        const response = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const posts = data.posts || data || [];
          setApiPosts(posts);

          const likedFromServer = new Set<string>();
          for (const post of posts) {
            if (post.liked_by_current_user) likedFromServer.add(post.id);
          }
          setLikedPosts(likedFromServer);
        }
      } catch (err) {
        console.error("Failed to fetch community posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [searchParams]);

  useEffect(() => {
    const fetchSidebarJobs = async () => {
      try {
        const response = await fetch("/api/jobs?limit=3&query=software developer");
        if (response.ok) {
          const data = await response.json();
          setSidebarJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Failed to fetch sidebar jobs:", error);
      }
    };

    fetchSidebarJobs();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations?limit=5');
        if (!response.ok) return;
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      }
    };

    fetchRecommendations();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/community/reviews?limit=6');
        if (!response.ok) return;
        const data = await response.json();
        setReviews(data.reviews || []);
        setReviewsUnavailable(Boolean(data.unavailable));
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeLikeUpdates((payload) => {
      setApiPosts((current) =>
        current.map((post) => {
          if (post.id !== payload.postId) return post;
          return {
            ...post,
            likes_count: payload.likesCount,
            liked_by_current_user: payload.likedByCurrentUser,
          };
        })
      );

      setLikedPosts((currentLiked) => {
        const next = new Set(currentLiked);
        if (payload.likedByCurrentUser) {
          next.add(payload.postId);
        } else {
          next.delete(payload.postId);
        }
        return next;
      });
    });

    return unsubscribe;
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    router.push(`/community?${params.toString()}`);
  };

  const sortedPosts = [...apiPosts].sort((a, b) => {
    if (sortBy === "liked") {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    if (sortBy === "viewed") {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const trendingTopics = ["AI Writing", "Career Growth", "Tech Trends", "Productivity", "Design"];

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user?.id) {
      router.push("/auth");
      return;
    }

    const wasLiked = likedPosts.has(postId);
    const currentCount = apiPosts.find((post) => post.id === postId)?.likes_count || 0;
    const optimisticCount = Math.max(0, currentCount + (wasLiked ? -1 : 1));
    const optimisticLiked = new Set(likedPosts);

    if (wasLiked) {
      optimisticLiked.delete(postId);
    } else {
      optimisticLiked.add(postId);
    }

    setLikedPosts(optimisticLiked);
    setApiPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const delta = wasLiked ? -1 : 1;
        return {
          ...post,
          likes_count: Math.max(0, (post.likes_count || 0) + delta),
          liked_by_current_user: !wasLiked,
        };
      })
    );

    emitLikeUpdate({
      postId,
      likesCount: optimisticCount,
      likedByCurrentUser: !wasLiked,
      source: "community",
    });

    try {
      const response = await fetch(`/api/likes?post_id=${postId}`, {
        method: wasLiked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const payload = await response.json();
      const confirmedLiked = Boolean(payload.likedByCurrentUser ?? !wasLiked);
      const confirmedCount = typeof payload.likesCount === "number" ? payload.likesCount : undefined;

      setLikedPosts((currentLiked) => {
        const next = new Set(currentLiked);
        if (confirmedLiked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });

      setApiPosts((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            likes_count: confirmedCount ?? post.likes_count,
            liked_by_current_user: confirmedLiked,
          };
        })
      );

      emitLikeUpdate({
        postId,
        likesCount: confirmedCount ?? optimisticCount,
        likedByCurrentUser: confirmedLiked,
        source: "community",
      });
    } catch (error) {
      console.error("Failed to like post:", error);
      setLikedPosts((currentLiked) => {
        const rollback = new Set(currentLiked);
        if (wasLiked) {
          rollback.add(postId);
        } else {
          rollback.delete(postId);
        }
        return rollback;
      });

      setApiPosts((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          const rollbackDelta = wasLiked ? 1 : -1;
          return {
            ...post,
            likes_count: Math.max(0, (post.likes_count || 0) + rollbackDelta),
            liked_by_current_user: wasLiked,
          };
        })
      );

      emitLikeUpdate({
        postId,
        likesCount: currentCount,
        likedByCurrentUser: wasLiked,
        source: "community",
      });
    }
  };

  const handleShare = async (e: React.MouseEvent, post: ApiPost) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareText = `Check out "${post.title}" on AiBlog`;
    const shareUrl = `${window.location.origin}/blog/${post.slug || post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const options = [
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
        { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
        { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}` },
        { name: 'Email', url: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(post.excerpt + '\n\n' + shareUrl)}` },
      ];
      
      // Show simple share menu (you can replace with a proper modal)
      const platform = prompt(`Share on:\n${options.map((o, i) => `${i + 1}. ${o.name}`).join('\n')}`);
      if (platform && options[parseInt(platform) - 1]) {
        window.open(options[parseInt(platform) - 1].url, '_blank');
      }
    }

    // Call API to track share
    try {
      await fetch(`/api/blog/${post.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'direct' })
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const toggleCommentComposer = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setOpenCommentBoxes((current) => {
      const next = new Set(current);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const submitInlineComment = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const content = (commentDrafts[postId] || "").trim();

    if (!content) {
      setCommentErrors((current) => ({ ...current, [postId]: "Comment cannot be empty." }));
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    setCommentSubmittingPostId(postId);
    setCommentErrors((current) => ({ ...current, [postId]: "" }));

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to post comment");
      }

      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      setApiPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        )
      );
      setOpenCommentBoxes((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    } catch (error) {
      setCommentErrors((current) => ({
        ...current,
        [postId]: error instanceof Error ? error.message : "Failed to post comment",
      }));
    } finally {
      setCommentSubmittingPostId(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!reviewPostSlug.trim()) {
      setReviewError('Select a post to review.');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Write a short review before submitting.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const response = await fetch('/api/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postSlug: reviewPostSlug,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to submit review');
      }

      setReviewSuccess('Review submitted. Thanks for sharing your feedback.');
      setReviewComment('');
      const refresh = await fetch('/api/community/reviews?limit=6');
      if (refresh.ok) {
        const data = await refresh.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <SideNavBar activePage="community" />

        <main className="flex-1 lg:ml-64 pt-24 pb-20 px-4 sm:px-8 gradient-mesh">
          <div className="max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-br from-emerald-950/60 via-teal-950/40 to-surface-container p-6 sm:p-8 mb-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_45%)]" />
                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter text-white">
                    Community<span className="bg-linear-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent"> Feed</span>
                  </h1>
                  <p className="text-emerald-100/75 mt-2 text-sm max-w-lg">
                    Discover insights, share knowledge, and connect with creators building the future.
                  </p>
                </div>
                <Link href="/editor">
                  <Button className="bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm px-6 gap-2 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/25 hover:scale-[1.02] transition-all">
                    <span className="material-symbols-outlined text-base">edit_note</span>
                    Write a Post
                  </Button>
                </Link>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative group mb-6">
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden focus-within:border-primary/40 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant pl-4 text-lg">search</span>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts by title, topic, category, or keyword..."
                    className="flex-1 border-0 bg-transparent text-sm py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="mr-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-semibold text-xs px-4 transition-all"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {searchQuery && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  <span>Results for &ldquo;{searchQuery}&rdquo;</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSearchQuery(""); router.push("/community"); }}
                    className="text-primary text-xs h-auto p-0 hover:bg-transparent hover:underline"
                  >
                    Clear
                  </Button>
                </div>
              )}

              {/* Sort Tabs */}
              <Tabs value={sortBy} onValueChange={setSortBy}>
                <TabsList className="bg-surface-container border border-outline-variant/10 rounded-full p-1 h-auto">
                  <TabsTrigger value="latest" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-on-surface-variant hover:text-on-surface transition-all">
                    <span className="material-symbols-outlined text-sm mr-1.5">schedule</span>
                    Latest
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-on-surface-variant hover:text-on-surface transition-all">
                    <span className="material-symbols-outlined text-sm mr-1.5">favorite</span>
                    Most Liked
                  </TabsTrigger>
                  <TabsTrigger value="viewed" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-on-surface-variant hover:text-on-surface transition-all">
                    <span className="material-symbols-outlined text-sm mr-1.5">visibility</span>
                    Most Viewed
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Card className="mt-6 glass-card rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface">Community Reviews</h2>
                      <p className="text-xs text-on-surface-variant mt-1">Share feedback on published posts and help creators improve.</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{reviews.length} recent</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {!reviewsUnavailable && (
                    <form onSubmit={handleReviewSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-[11px] text-on-surface-variant mb-1 block">Post</label>
                        <select
                          value={reviewPostSlug}
                          onChange={(e) => setReviewPostSlug(e.target.value)}
                          className="w-full h-10 rounded-md border border-outline-variant/20 bg-background px-3 text-sm text-on-surface"
                        >
                          <option value="">Select a post</option>
                          {sortedPosts.filter((post) => Boolean(post.slug)).slice(0, 20).map((post) => (
                            <option key={post.id} value={post.slug || ''}>
                              {post.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-on-surface-variant mb-1 block">Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full h-10 rounded-md border border-outline-variant/20 bg-background px-3 text-sm text-on-surface"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" disabled={reviewSubmitting} className="w-full">
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                      <div className="md:col-span-4">
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you learn from this post?"
                          className="min-h-20 text-sm"
                        />
                      </div>
                    </form>
                  )}

                  {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
                  {reviewSuccess && <p className="text-xs text-emerald-400">{reviewSuccess}</p>}
                  {reviewsUnavailable && (
                    <p className="text-xs text-on-surface-variant">Reviews are not configured yet for this environment.</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reviews.slice(0, 4).map((review) => (
                      <Card key={review.id} className="glass-card">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={review.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author?.name || 'reviewer'}`} />
                                <AvatarFallback>{(review.author?.name || 'R').charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-semibold text-on-surface">{review.author?.name || 'Community Member'}</p>
                                <p className="text-[11px] text-on-surface-variant">{new Date(review.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-300">{'★'.repeat(Math.max(1, Math.min(5, review.rating || 1)))}</Badge>
                          </div>
                          <p className="text-sm text-on-surface-variant line-clamp-3">{review.comment}</p>
                          {review.postSlug && (
                            <Link href={`/blog/${review.postSlug}`} className="text-[11px] text-primary hover:underline">Read post: {review.postTitle || 'View'}</Link>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {reviews.length === 0 && !reviewsUnavailable && (
                      <p className="text-sm text-on-surface-variant">No reviews yet. Be the first to add one.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Posts Column */}
              <div className="lg:col-span-2 space-y-5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="glass-card rounded-2xl overflow-hidden">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full bg-surface-container-high" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-24 bg-surface-container-high" />
                            <Skeleton className="h-3 w-16 bg-surface-container-high" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-3">
                        <Skeleton className="h-5 w-4/5 mb-2 bg-surface-container-high" />
                        <Skeleton className="h-4 w-full mb-1 bg-surface-container-high" />
                        <Skeleton className="h-4 w-2/3 bg-surface-container-high" />
                      </CardContent>
                      <CardFooter className="px-5 pb-5">
                        <Skeleton className="h-40 w-full rounded-xl bg-surface-container-high" />
                      </CardFooter>
                    </Card>
                  ))
                ) : sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => {
                    const accentColor = getUserAccentColor(post.author_id || post.id);
                    const blogTheme = getThemeById(post.blog_theme || "default");
                    return (
                    <Link key={post.id} href={`/blog/${post.slug || post.id}`} className="block group">
                      <Card className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300" style={{"--card-accent": accentColor} as React.CSSProperties}>
                        {/* Per-user accent top stripe */}
                        <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-t-2xl" style={{background: `linear-gradient(90deg, ${accentColor}88, ${accentColor}22)`}} />
                        {/* Author Header */}
                        <CardHeader className="p-5 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9" style={{boxShadow: `0 0 0 2px ${accentColor}44`}}>
                                <AvatarImage
                                  src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles?.name || post.author_id}`}
                                  alt={post.profiles?.name || "Author"}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {(post.profiles?.name || "A").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-on-surface">
                                  {post.profiles?.name || "Anonymous"}
                                </p>
                                <p className="text-[11px] text-on-surface-variant">
                                  {new Date(post.created_at).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric"
                                  })}
                                </p>
                              </div>
                            </div>
                            {post.author_id && post.author_id !== user?.id && (
                              <FollowButton userId={post.author_id} size="sm" className="h-8" showStatusBadge />
                            )}
                            <div className="flex gap-1.5">
                              {post.ai_generated && (
                                <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] font-bold">
                                  <span className="material-symbols-outlined text-[12px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                  AI
                                </Badge>
                              )}
                              {post.topic && (
                                <Badge variant="outline" className="text-[10px] border-outline-variant/30 text-on-surface-variant">
                                  {post.topic}
                                </Badge>
                              )}
                              {post.category && (
                                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                  {post.category}
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-[10px] ${blogTheme.accentClass} border-current/30`}>
                                {blogTheme.previewImage} {blogTheme.name}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        {/* Content */}
                        <CardContent className="px-5 pb-3">
                          <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </CardContent>

                        {/* Cover Image */}
                        {post.cover_image_url && (
                          <div className="px-5 pb-3">
                            <div className="rounded-xl overflow-hidden">
                              <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                width={800}
                                height={192}
                                className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer Stats */}
                        <CardFooter className="px-5 py-4 border-t border-outline-variant/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleLike(e, post.id)}
                              className={`flex items-center gap-1.5 text-xs transition-colors rounded-lg px-2.5 py-1.5 ${
                                likedPosts.has(post.id)
                                  ? "text-red-500 bg-red-500/10"
                                  : "text-on-surface-variant hover:text-red-500 hover:bg-red-500/5"
                              }`}
                              title="Like this post"
                            >
                              <Heart
                                size={16}
                                className={likedPosts.has(post.id) ? "fill-red-500" : ""}
                              />
                              <span>{post.likes_count}</span>
                            </button>
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant px-2.5 py-1.5">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>{post.views}</span>
                            </div>
                            <button
                              onClick={(e) => toggleCommentComposer(e, post.id)}
                              className="flex items-center gap-1.5 text-xs text-on-surface-variant px-2.5 py-1.5 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                              title="Comment on this post"
                            >
                              <span className="material-symbols-outlined text-[16px]">forum</span>
                              <span>{post.comments_count || 0}</span>
                            </button>
                          </div>
                          <button
                            onClick={(e) => handleShare(e, post)}
                            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors rounded-lg px-2.5 py-1.5 hover:bg-primary/5"
                            title="Share this post"
                          >
                            <Share2 size={16} />
                            <span className="hidden sm:inline">Share</span>
                          </button>
                        </CardFooter>

                        {openCommentBoxes.has(post.id) && (
                          <div
                            className="px-5 pb-4 border-t border-outline-variant/10 bg-surface-container-low/40"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <div className="pt-3 space-y-2">
                              <Textarea
                                value={commentDrafts[post.id] || ""}
                                onChange={(e) =>
                                  setCommentDrafts((current) => ({
                                    ...current,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                placeholder={isAuthenticated ? "Add your comment..." : "Sign in to comment"}
                                className="min-h-20 text-sm"
                                disabled={!isAuthenticated || commentSubmittingPostId === post.id}
                              />
                              <div className="flex items-center justify-between">
                                <button
                                  className="text-xs text-on-surface-variant hover:text-on-surface"
                                  onClick={(e) => toggleCommentComposer(e, post.id)}
                                >
                                  Cancel
                                </button>
                                <Button
                                  size="sm"
                                  onClick={(e) => submitInlineComment(e, post.id)}
                                  disabled={!isAuthenticated || commentSubmittingPostId === post.id}
                                >
                                  {commentSubmittingPostId === post.id ? "Posting..." : "Post Comment"}
                                </Button>
                              </div>
                              {commentErrors[post.id] && (
                                <p className="text-[11px] text-red-400">{commentErrors[post.id]}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    </Link>
                    );
                  })
                ) : (
                  <Card className="glass-card rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">forum</span>
                      </div>
                      <p className="text-on-surface-variant font-medium mb-2">No posts yet</p>
                      <p className="text-on-surface-variant/60 text-sm mb-6">Start sharing your insights with the community!</p>
                      <Link href="/editor">
                        <Button className="rounded-full bg-primary text-on-primary font-semibold text-sm px-6 gap-2">
                          <span className="material-symbols-outlined text-base">edit_note</span>
                          Create Your First Post
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6 hidden lg:block">
                <Card className="glass-card-blue rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      <h3 className="font-headline text-sm font-bold text-on-surface">Recommended For You</h3>
                      <AiBadge variant="compact" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2.5">
                    {recommendations.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">Like and comment on posts to get personalized picks.</p>
                    ) : (
                      recommendations.map((post) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug || post.id}`}
                          className="block rounded-lg border border-white/10 bg-white/2 hover:bg-white/8 hover:border-primary/25 transition-all px-3 py-2"
                        >
                          <p className="text-sm font-semibold text-on-surface line-clamp-1">{post.title}</p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-1">{post.reason}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{post.topic || 'General'}</Badge>
                            <span className="text-[10px] text-on-surface-variant">Score {post.score}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                      <h3 className="font-headline text-sm font-bold text-on-surface">Trending Topics</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="cursor-pointer border-outline-variant/20 text-on-surface-variant hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all text-xs py-1"
                          onClick={() => {
                            setSearchQuery(topic);
                            const params = new URLSearchParams({ search: topic });
                            router.push(`/community?${params.toString()}`);
                          }}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Pulse Insight */}
                <Card className="glass-card-purple rounded-2xl overflow-hidden relative group">
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-secondary/10 blur-3xl group-hover:bg-secondary/20 transition-all duration-500" />
                  <CardHeader className="pb-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">AI Pulse</span>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pb-5">
                    <p className="text-sm text-on-surface leading-relaxed mb-4">
                      Creators publishing 3+ AI-assisted articles saw a <span className="text-secondary font-bold">45% increase</span> in profile views.
                    </p>
                    <div className="h-1.5 w-full bg-outline-variant/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-linear-to-r from-secondary to-tertiary rounded-full" />
                    </div>
                  </CardContent>
                </Card>

                {/* Community Stats */}
                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-2">
                    <h3 className="font-headline text-sm font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">groups</span>
                      Community
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant">Total Posts</span>
                      <span className="text-sm font-bold text-on-surface">{apiPosts.length}</span>
                    </div>
                    <Separator className="bg-outline-variant/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant">AI Generated</span>
                      <span className="text-sm font-bold text-secondary">{apiPosts.filter(p => p.ai_generated).length}</span>
                    </div>
                    <Separator className="bg-outline-variant/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant">Total Views</span>
                      <span className="text-sm font-bold text-on-surface">{apiPosts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade Card */}
                <Card className="glass-card rounded-2xl">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
                    </div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mb-1">Jobs Snapshot</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">
                      Discover active openings directly from your community workspace.
                    </p>
                    <div className="space-y-2 text-left mb-4">
                      {sidebarJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="rounded-lg border border-outline-variant/10 p-2.5 hover:border-secondary/30 transition-colors">
                          <p className="text-xs font-semibold text-on-surface line-clamp-1">{job.title}</p>
                          <p className="text-[10px] text-on-surface-variant line-clamp-1">{job.company}</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="text-[10px] text-on-surface-variant line-clamp-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">location_on</span>
                              {job.location}
                            </p>
                            {job.applyUrl && job.applyUrl !== '#' ? (
                              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-secondary hover:text-secondary/80 transition-colors">
                                Apply Now
                              </a>
                            ) : (
                              <Link href="/jobs" className="text-[10px] font-bold text-secondary hover:text-secondary/80 transition-colors">
                                Apply Now
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link href="/jobs" className="block">
                      <Button className="w-full rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 transition-all text-xs font-bold">
                        View All Jobs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="glass-card-blue rounded-2xl">
                  <CardContent className="p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                    </div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mb-1">Resume Builder</h4>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">
                      Build your AI-assisted resume for full stack, frontend, backend, AI/ML, design, and more.
                    </p>
                    <Link href="/dashboard/resume" className="block">
                      <Button className="w-full rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-all text-xs font-bold">
                        Build Resume
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
