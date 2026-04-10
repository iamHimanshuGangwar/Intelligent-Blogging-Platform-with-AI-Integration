import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Eye, Bookmark } from "lucide-react";
import { useState } from "react";

export interface CommunityPost {
  id: string;
  title: string;
  brief: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagementRate: number;
  };
  userEngagement?: {
    liked: boolean;
    bookmarked: boolean;
  };
}

interface CommunityFeedProps {
  posts: CommunityPost[];
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export function CommunityFeed({
  posts,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: CommunityFeedProps) {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">No posts yet. Be the first to share!</p>
        </Card>
      ) : (
        posts.map((post) => <CommunityPostCard key={post.id} post={post} onLike={onLike} onComment={onComment} onShare={onShare} onBookmark={onBookmark} />)
      )}
    </div>
  );
}

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export function CommunityPostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: CommunityPostCardProps) {
  const [liked, setLiked] = useState(post.userEngagement?.liked || false);
  const [likeCount, setLikeCount] = useState(post.engagement.likes);
  const [bookmarked, setBookmarked] = useState(post.userEngagement?.bookmarked || false);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.(post.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}m ago`;
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blue-500/30 transition-all overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
              <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{post.authorName}</p>
              <p className="text-xs text-zinc-400">{formatDate(post.publishedAt)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="text-zinc-400 hover:text-yellow-400"
          >
            <Bookmark
              className="w-4 h-4"
              fill={bookmarked ? "currentColor" : "none"}
            />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-zinc-300 mb-3 line-clamp-3">
            {post.brief}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 p-3 bg-zinc-800/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.engagement.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5" />
            <span>{likeCount.toLocaleString()} likes</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.engagement.comments.toLocaleString()} comments</span>
          </div>
          <div className="text-blue-400 font-semibold">
            {post.engagement.engagementRate.toFixed(1)}% eng.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 ${
              liked
                ? "text-red-400 hover:text-red-500"
                : "text-zinc-400 hover:text-red-400"
            }`}
          >
            <Heart
              className="w-4 h-4 mr-2"
              fill={liked ? "currentColor" : "none"}
            />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="flex-1 text-zinc-400 hover:text-blue-400"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(post.id)}
            className="flex-1 text-zinc-400 hover:text-green-400"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}
