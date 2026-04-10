"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  postId: string;
  postTitle: string;
  postSlug?: string;
  className?: string;
}

export default function ShareButton({
  postId,
  postTitle,
  postSlug,
  className = "",
}: ShareButtonProps) {
  const [showCopyToast, setShowCopyToast] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const postUrl = `${baseUrl}/blog/${postSlug || postId}`;
  const encodedUrl = encodeURIComponent(postUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleTwitterShare = () => {
    const text = `Check out: "${postTitle}"`;
    const encodedText = encodeURIComponent(text);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedInUrl, "_blank", "width=550,height=420");
  };

  const handleEmailShare = () => {
    const subject = `Check out this article: ${postTitle}`;
    const body = `I thought you'd like this article:\n\n${postTitle}\n\n${postUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 text-on-surface-variant hover:text-primary h-auto py-1 px-2 ${className}`}
          >
            <span className="material-symbols-outlined text-lg">share</span>
            <span className="text-xs font-semibold hidden sm:inline">Share</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-on-surface">
            Share this post
          </div>
          <DropdownMenuSeparator />

          {/* Copy Link */}
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            <span className="material-symbols-outlined text-base mr-3">
              link
            </span>
            <div>
              <div>Copy Link</div>
              <div className="text-xs text-on-surface-variant">
                Copy to clipboard
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Twitter */}
          <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
            <span className="material-symbols-outlined text-base mr-3">
              favorite
            </span>
            <div>
              <div>Twitter</div>
              <div className="text-xs text-on-surface-variant">
                Share on Twitter
              </div>
            </div>
          </DropdownMenuItem>

          {/* LinkedIn */}
          <DropdownMenuItem onClick={handleLinkedInShare} className="cursor-pointer">
            <span className="material-symbols-outlined text-base mr-3">
              work
            </span>
            <div>
              <div>LinkedIn</div>
              <div className="text-xs text-on-surface-variant">
                Share on LinkedIn
              </div>
            </div>
          </DropdownMenuItem>

          {/* Email */}
          <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
            <span className="material-symbols-outlined text-base mr-3">
              mail
            </span>
            <div>
              <div>Email</div>
              <div className="text-xs text-on-surface-variant">
                Share via Email
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Copy Toast notification */}
      {showCopyToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span className="text-sm font-semibold">Link copied!</span>
        </div>
      )}
    </>
  );
}
