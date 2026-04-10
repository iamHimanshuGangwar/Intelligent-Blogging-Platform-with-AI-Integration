"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { emitLikeUpdate, subscribeLikeUpdates } from "@/lib/like-sync";

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  onLikeChange?: (count: number, liked: boolean) => void;
  className?: string;
}

export default function LikeButton({
  postId,
  initialLikeCount = 0,
  onLikeChange,
  className = "",
}: LikeButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user has liked this post
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes?post_id=${postId}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(!!data.likedByCurrentUser);
          if (typeof data.count === "number") {
            setLikeCount(data.count);
          }
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [postId, isAuthenticated]);

  useEffect(() => {
    const unsubscribe = subscribeLikeUpdates((payload) => {
      if (payload.postId !== postId) return;
      setLikeCount(payload.likesCount);
      setIsLiked(payload.likedByCurrentUser);
      onLikeChange?.(payload.likesCount, payload.likedByCurrentUser);
    });

    return unsubscribe;
  }, [postId, onLikeChange]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;
    const optimisticLiked = !previousLiked;
    const optimisticCount = Math.max(0, previousCount + (optimisticLiked ? 1 : -1));

    setIsLiked(optimisticLiked);
    setLikeCount(optimisticCount);
    onLikeChange?.(optimisticCount, optimisticLiked);
    emitLikeUpdate({
      postId,
      likesCount: optimisticCount,
      likedByCurrentUser: optimisticLiked,
      source: "like-button",
    });

    setLoading(true);
    try {
      if (previousLiked) {
        // Unlike
        const response = await fetch(`/api/likes?post_id=${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const payload = await response.json();
          const finalCount = payload.count ?? Math.max(0, previousCount - 1);
          setIsLiked(false);
          setLikeCount(finalCount);
          onLikeChange?.(finalCount, false);
          emitLikeUpdate({
            postId,
            likesCount: finalCount,
            likedByCurrentUser: false,
            source: "like-button",
          });
        } else {
          throw new Error("Failed to unlike");
        }
      } else {
        // Like
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });

        if (response.ok) {
          const payload = await response.json();
          const finalCount = payload.count ?? previousCount + 1;
          setIsLiked(true);
          setLikeCount(finalCount);
          onLikeChange?.(finalCount, true);
          emitLikeUpdate({
            postId,
            likesCount: finalCount,
            likedByCurrentUser: true,
            source: "like-button",
          });
        } else {
          throw new Error("Failed to like");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      onLikeChange?.(previousCount, previousLiked);
      emitLikeUpdate({
        postId,
        likesCount: previousCount,
        likedByCurrentUser: previousLiked,
        source: "like-button",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeClick}
        disabled={loading}
        className={`gap-2 text-on-surface-variant hover:text-red-500 h-auto py-1 px-2 ${className} ${
          isLiked ? "text-red-500" : ""
        }`}
      >
        <span
          className={`material-symbols-outlined text-lg transition-all ${
            isLiked ? "fill-current scale-110" : ""
          }`}
          style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
        >
          favorite
        </span>
        <span className="text-xs font-semibold">{likeCount}</span>
      </Button>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="relative bg-surface-container border border-outline-variant/20 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                <span
                  className="material-symbols-outlined text-red-500 text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </div>

              <h3 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
                Like this post?
              </h3>

              <p className="text-sm text-on-surface-variant mb-8">
                Sign in to like posts, follow creators, and engage with the community.
              </p>

              <Button
                onClick={() => {
                  setShowLoginPrompt(false);
                  router.push("/auth");
                }}
                className="w-full h-auto py-3 bg-primary text-on-primary hover:bg-primary/90 font-bold rounded-xl text-sm"
              >
                <span className="material-symbols-outlined mr-2">login</span>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
