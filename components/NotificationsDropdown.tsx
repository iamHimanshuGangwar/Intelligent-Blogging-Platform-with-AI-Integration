"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  post_id?: string;
  related_post_id?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  related_user?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

function extractRequestId(actionUrl?: string): string | null {
  if (!actionUrl || !actionUrl.startsWith("follow_request:")) return null;
  return actionUrl.split(":")[1] || null;
}

function extractCollabPostId(actionUrl?: string): string | null {
  if (!actionUrl || !actionUrl.startsWith("collab_invite:")) return null;
  return actionUrl.split(":")[1] || null;
}

export default function NotificationsDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lightweight poll for unread count (every 30s) so badge shows without opening dropdown
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchUnreadCount]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifications();
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", notificationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleFollowRequestAction = async (
    notification: Notification,
    decision: "accept" | "reject"
  ) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "follow-request",
          decision,
          notificationId: notification.id,
          requestId: extractRequestId(notification.action_url),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to process follow request");
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                is_read: true,
                title: decision === "accept" ? "Follow request accepted" : "Follow request rejected",
                message:
                  decision === "accept"
                    ? "You accepted this follow request."
                    : "You rejected this follow request.",
              }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error handling follow request action:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.type === "collab_invite") {
      const collabPostId = extractCollabPostId(notification.action_url) || notification.related_post_id;
      if (collabPostId) {
        router.push(`/editor?id=${collabPostId}&collab=1`);
      } else {
        router.push("/dashboard/collaboration");
      }
      setIsOpen(false);
      return;
    }

    const postId = notification.related_post_id || notification.post_id;

    if (postId) {
      router.push(`/blog/${postId}`);
    } else if (notification.type === "follow_request") {
      router.push("/dashboard/notifications");
    } else if (notification.type === "follow") {
      router.push("/dashboard");
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "favorite";
      case "comment":
        return "forum";
      case "follow":
        return "person_add";
      case "follow_request":
        return "person_add_question";
      case "mention":
        return "alternate_email";
      case "job_application":
        return "work";
      case "collab_invite":
        return "group_add";
      default:
        return "notifications";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-500 overflow-y-auto">
        <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-surface-container border-b border-outline-variant/10">
          <h3 className="font-bold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-on-surface-variant text-sm">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mx-auto block mb-2">
              notifications_none
            </span>
            <p className="text-sm text-on-surface-variant">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {notifications.map((notification) => {
              const showFollowActions =
                notification.type === "follow_request" && !notification.is_read;

              return (
                <div
                  key={notification.id}
                  className={`w-full px-4 py-3 hover:bg-surface-container-low/50 transition-colors ${
                    !notification.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full text-left"
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        <span
                          className={`material-symbols-outlined text-base ${
                            !notification.is_read ? "text-primary" : "text-on-surface-variant"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      <div className="grow">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`font-semibold text-sm ${
                              !notification.is_read
                                ? "text-on-surface"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-on-surface-variant/60 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {showFollowActions && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleFollowRequestAction(notification, "accept")}
                      >
                        Accept
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleFollowRequestAction(notification, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator />

        <button
          onClick={() => {
            router.push("/dashboard/notifications");
            setIsOpen(false);
          }}
          className="w-full px-4 py-2 text-center text-xs text-primary font-semibold hover:bg-primary/5 transition-colors"
        >
          View All Notifications
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
