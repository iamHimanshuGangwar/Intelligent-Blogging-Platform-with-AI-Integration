"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminTopNavProps {
  activePage?: string;
}

export default function AdminTopNav({ activePage = "overview" }: AdminTopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activityCount, setActivityCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    activity_type: string;
    user?: { name?: string | null } | null;
    created_at: string;
    metadata?: { title?: string | null } | null;
  }>>([]);
  const [pendingPosts, setPendingPosts] = useState<Array<{
    id: string;
    title: string;
    author_id?: string | null;
    author_name?: string | null;
    author_avatar?: string | null;
    created_at: string;
  }>>([]);
  const [pendingComments, setPendingComments] = useState<Array<{
    id: string;
    content: string;
    user_id?: string | null;
    author_name?: string | null;
    author_avatar?: string | null;
    created_at: string;
  }>>([]);
  const { logout } = useAuth();
  const router = useRouter();

  const fetchAdminActivity = async () => {
    try {
      const [activityRes, postModerationRes, commentModerationRes] = await Promise.all([
        fetch("/api/admin/activity?limit=10", {
          cache: "no-store",
        }),
        fetch("/api/admin/moderation?type=posts", {
          cache: "no-store",
        }),
        fetch("/api/admin/moderation?type=comments", {
          cache: "no-store",
        }),
      ]);

      if (!activityRes.ok) return;
      const data = await activityRes.json();
      const activities = data.activities || [];
      setRecentActivity(activities);

      const postItems = postModerationRes.ok ? ((await postModerationRes.json()).items || []) : [];
      const commentItems = commentModerationRes.ok ? ((await commentModerationRes.json()).items || []) : [];

      setPendingPosts(postItems);
      setPendingComments(commentItems);
      setActivityCount(activities.length + postItems.length + commentItems.length);
    } catch (error) {
      console.error("Failed to load admin notifications:", error);
    }
  };

  useEffect(() => {
    fetchAdminActivity();
    const timer = setInterval(fetchAdminActivity, 300000);
    return () => clearInterval(timer);
  }, []);

  const formatActivityLabel = (activityType: string) => {
    return activityType.split("_").join(" ");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      await logout();
      // Clear OTP session cookie if present
      document.cookie = "otp_session_token=; max-age=0; path=/";
      router.push("/admin/login");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0e0e0e]/60 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] h-16 flex justify-between items-center px-8 font-headline tracking-tight">
      <div className="flex items-center gap-8">
        <Link href="/admin" className="text-xl font-bold bg-linear-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
          AiBlog Admin
        </Link>
        <div className="hidden md:flex gap-6 text-sm">
          <Link href="/admin" className={activePage === "overview" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Platform
          </Link>
          <Link href="/admin/posts" className={activePage === "posts" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            CMS
          </Link>
          <Link href="/admin/themes" className={activePage === "themes" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Themes
          </Link>
          <Link href="/admin/analytics" className={activePage === "analytics" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Insights
          </Link>
          <Link href="/admin/users" className={activePage === "users" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Audit
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/editor?from=admin"
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Create Post
        </Link>
        <button
          onClick={handleLogout}
          suppressHydrationWarning
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Logout
        </button>
        <Link href="/admin/analytics" className="text-zinc-500 hover:text-blue-300 transition-colors">
          <span className="material-symbols-outlined cursor-pointer text-[20px]">sensors</span>
        </Link>
        <div
          className="relative"
          onMouseEnter={() => { setShowNotifications(true); setActivityCount(0); }}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <button suppressHydrationWarning className="relative text-zinc-500 hover:text-blue-300 transition-colors">
            <span className="material-symbols-outlined cursor-pointer text-[20px]">notifications</span>
            {activityCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activityCount > 99 ? "99+" : activityCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-[#1a1a1a] border border-outline-variant/20 rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Admin Notifications</span>
                <span className="text-xs text-zinc-400">{activityCount} recent</span>
              </div>
              {pendingPosts.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-yellow-300 border-b border-outline-variant/10">
                    Pending Blog Approvals
                  </div>
                  {pendingPosts.slice(0, 5).map((post) => (
                    <Link
                      key={post.id}
                      href={{ pathname: "/admin/moderation", query: { tab: "posts", postId: post.id } }}
                      onClick={() => setShowNotifications(false)}
                      className="block px-4 py-3 border-b border-outline-variant/10 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id || post.author_name || post.id}`}
                          alt="author"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <p className="text-xs text-zinc-200">
                          <span className="font-semibold">{post.author_name || "Unknown"}</span> submitted a post
                        </p>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{post.title}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">User ID: {post.author_id || "N/A"}</p>
                    </Link>
                  ))}
                </>
              )}
              {pendingComments.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-orange-300 border-b border-outline-variant/10">
                    Pending Comment Reviews
                  </div>
                  {pendingComments.slice(0, 5).map((comment) => (
                    <Link
                      key={comment.id}
                      href={{ pathname: "/admin/moderation", query: { tab: "comments", commentId: comment.id } }}
                      onClick={() => setShowNotifications(false)}
                      className="block px-4 py-3 border-b border-outline-variant/10 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={comment.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id || comment.author_name || comment.id}`}
                          alt="comment-author"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <p className="text-xs text-zinc-200">
                          <span className="font-semibold">{comment.author_name || "User"}</span> posted a comment
                        </p>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{comment.content}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Comment ID: {comment.id}</p>
                    </Link>
                  ))}
                </>
              )}
              {recentActivity.length === 0 && pendingPosts.length === 0 && pendingComments.length === 0 ? (
                <div className="px-4 py-6 text-sm text-zinc-400">No recent activity</div>
              ) : (
                recentActivity.slice(0, 8).map((item) => (
                  <div key={item.id} className="px-4 py-3 border-b border-outline-variant/10 hover:bg-white/5">
                    <p className="text-xs text-zinc-200">
                      <span className="font-semibold">{item.user?.name || "User"}</span>{" "}
                      {formatActivityLabel(item.activity_type)}
                    </p>
                    {item.metadata?.title && (
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{item.metadata.title}</p>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <Link href="/admin/settings" className="text-zinc-500 hover:text-blue-300 transition-colors">
          <span className="material-symbols-outlined cursor-pointer text-[20px]">settings</span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            suppressHydrationWarning
            className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden hover:border-blue-400 transition-colors"
          >
            <Image
              className="w-full h-full object-cover"
              alt="Admin avatar"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              width={32}
              height={32}
            />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-outline-variant/20 rounded-lg shadow-xl z-50">
              <button
                onClick={handleLogout}
                suppressHydrationWarning
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
