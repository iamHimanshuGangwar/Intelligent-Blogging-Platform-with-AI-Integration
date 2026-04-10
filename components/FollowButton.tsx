"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showStatusBadge?: boolean;
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  onFollowChange,
  className = "",
  variant = "outline",
  size = "default",
  showStatusBadge = true,
}: FollowButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if current user is following this user
  useEffect(() => {
    if (!isAuthenticated || !user?.id || user.id === userId) return;

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follows?user_id=${userId}&type=check`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(!!data.isFollowing);
          setIsPending(!!data.isPending);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [userId, isAuthenticated, user?.id]);

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (user?.id === userId) {
      return; // Can't follow yourself
    }

    setLoading(true);
    setActionError("");
    try {
      if (isFollowing) {
        // Unfollow
        let response = await fetch(`/api/follows?following_id=${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          response = await fetch(`/api/follows/${userId}`, { method: "DELETE" });
        }

        if (response.ok) {
          setIsFollowing(false);
          setIsPending(false);
          onFollowChange?.(false);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to unfollow");
        }
      } else {
        // Follow request
        let response = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingUserId: userId }),
        });

        if (!response.ok) {
          response = await fetch(`/api/follows/${userId}`, { method: "POST" });
        }

        if (response.ok) {
          const data = await response.json();
          const pending = data?.status === "pending";
          setIsFollowing(true);
          setIsPending(pending);
          onFollowChange?.(true);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to follow");
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setActionError(error instanceof Error ? error.message : "Failed to update follow");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setShowLoginPrompt(true)}
          variant={variant}
          size={size}
          disabled={loading}
          className={className}
        >
          <span className="material-symbols-outlined mr-1">person_add</span>
          Follow
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
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    person_add
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
                  Follow creators
                </h3>

                <p className="text-sm text-on-surface-variant mb-8">
                  Sign in to follow your favorite creators, like posts, and stay updated.
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

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleFollowClick}
          disabled={loading || user?.id === userId}
          variant={isFollowing ? "default" : variant}
          size={size}
          className={`${className} ${
            isFollowing
              ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
              : ""
          }`}
        >
          <span className="material-symbols-outlined mr-1">
            {isFollowing ? (isPending ? "schedule" : "person_check") : "person_add"}
          </span>
          {loading ? "..." : isFollowing ? (isPending ? "Requested" : "Following") : "Follow"}
        </Button>

        {showStatusBadge && isFollowing && !loading && (
          <Badge variant="outline" className="text-[10px] h-6 border-primary/30 text-primary bg-primary/5">
            {isPending ? "Requested" : "Joined"}
          </Badge>
        )}
      </div>

      {actionError && (
        <span className="text-[11px] text-red-400">{actionError}</span>
      )}
    </div>
  );
}
