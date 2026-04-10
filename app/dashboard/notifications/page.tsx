"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  action_url?: string;
  related_post_id?: string;
  post_id?: string;
  created_at: string;
}

function extractRequestId(actionUrl?: string): string | null {
  if (!actionUrl || !actionUrl.startsWith("follow_request:")) return null;
  return actionUrl.split(":")[1] || null;
}

function extractCollabPostId(actionUrl?: string): string | null {
  if (!actionUrl || !actionUrl.startsWith("collab_invite:")) return null;
  return actionUrl.split(":")[1] || null;
}

export default function DashboardNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?limit=50");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", notificationId }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark as read");
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const handleFollowRequest = async (
    notification: Notification,
    decision: "accept" | "reject"
  ) => {
    try {
      setProcessingId(notification.id);

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
    } catch (error) {
      console.error("Follow request action failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const openNotificationTarget = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (notification.type === "collab_invite") {
      const collabPostId = extractCollabPostId(notification.action_url) || notification.related_post_id;
      if (collabPostId) {
        router.push(`/editor?id=${collabPostId}&collab=1`);
      } else {
        router.push("/dashboard/collaboration");
      }
      return;
    }

    const postId = notification.related_post_id || notification.post_id;
    if (postId) {
      router.push(`/blog/${postId}`);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-extrabold font-headline text-on-surface">Notifications</h1>
                <p className="text-sm text-on-surface-variant mt-2">
                  Manage updates, follow requests, and engagement activity.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {unreadCount} unread
              </Badge>
            </div>

            <Card className="bg-surface-container border-outline-variant/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Inbox</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-on-surface-variant">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">You are all caught up.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const showFollowActions =
                        notification.type === "follow_request" && !notification.is_read;

                      return (
                        <div
                          key={notification.id}
                          className={`rounded-xl border p-4 transition-colors ${
                            notification.is_read
                              ? "border-outline-variant/10 bg-surface-container-low"
                              : "border-primary/20 bg-primary/5"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openNotificationTarget(notification)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-sm text-on-surface">{notification.title}</h3>
                                {notification.message && (
                                  <p className="text-xs text-on-surface-variant mt-1">{notification.message}</p>
                                )}
                              </div>
                              {!notification.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1" />}
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </button>

                          {showFollowActions && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                disabled={processingId === notification.id}
                                onClick={() => handleFollowRequest(notification, "accept")}
                                className="h-8 text-xs"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === notification.id}
                                onClick={() => handleFollowRequest(notification, "reject")}
                                className="h-8 text-xs"
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
              </CardContent>
            </Card>
      </div>
    </div>
  );
}
