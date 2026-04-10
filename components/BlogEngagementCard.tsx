import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Eye, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface BlogEngagementCardProps {
  blogId: string;
  onRefresh?: () => void;
}

interface EngagementStats {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  engagementRate: number;
}

export function BlogEngagementCard({ blogId, onRefresh }: BlogEngagementCardProps) {
  const [stats, setStats] = useState<EngagementStats>({
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/stats`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <p className="text-zinc-400">Loading engagement stats...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 p-6">
        <p className="text-red-400 text-sm">{error}</p>
      </Card>
    );
  }

  const stats_list = [
    {
      label: "Views",
      value: stats.viewsCount,
      icon: Eye,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Likes",
      value: stats.likesCount,
      icon: Heart,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Comments",
      value: stats.commentsCount,
      icon: MessageCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Shares",
      value: stats.sharesCount,
      icon: Share2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Engagement Stats</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              onRefresh?.();
            }}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats_list.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`p-4 rounded-lg ${stat.bgColor} border border-zinc-800`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <p className="text-xs font-semibold text-zinc-400 uppercase">
                    {stat.label}
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Engagement Rate */}
        <div className="p-4 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-zinc-400 mb-1">Engagement Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-white">
              {stats.engagementRate.toFixed(2)}%
            </p>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${Math.min(stats.engagementRate * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Comment section component
 */
interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  date: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  blogId: string;
  comments: Comment[];
  loading?: boolean;
  onAddComment?: (text: string) => void;
}

export function CommentSection({
  blogId,
  comments = [],
  loading = false,
  onAddComment,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText }),
      });

      if (res.ok) {
        setCommentText("");
        onAddComment?.(commentText);
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-6">
          Comments ({comments.length})
        </h3>

        {/* New Comment Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 mb-2"
              />
              <Button
                onClick={handleSubmit}
                disabled={!commentText.trim() || submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-zinc-400 text-sm text-center py-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-4">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-3 p-3 bg-zinc-800/30 rounded-lg">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.avatar} alt={comment.author} />
        <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-white text-sm">{comment.author}</p>
          <p className="text-xs text-zinc-500">{comment.date}</p>
        </div>
        <p className="text-sm text-zinc-300">{comment.content}</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ml-3 pl-3 border-l border-zinc-700 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
