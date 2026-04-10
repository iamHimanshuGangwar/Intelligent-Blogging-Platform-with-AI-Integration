import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Eye } from "lucide-react";
import { useState } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
  stats?: {
    posts: number;
    views: number;
    likes: number;
    engagement: number;
  };
}

interface ProfileCardProps {
  user: UserProfile;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  showStats?: boolean;
}

export function ProfileCard({ 
  user, 
  onFollow, 
  onUnfollow,
  showStats = true 
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(user.followers);

  const handleFollowClick = async () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(followerCount - 1);
      onUnfollow?.(user.id);
    } else {
      setIsFollowing(true);
      setFollowerCount(followerCount + 1);
      onFollow?.(user.id);
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-blue-500/50 transition-all">
      {/* Header with gradient */}
      <div className="h-24 bg-linear-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 relative">
        <div className="absolute -bottom-6 left-4">
          <Avatar className="h-16 w-16 border-4 border-zinc-900">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 pt-8">
        {/* User Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">{user.name}</h3>
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          {user.bio && (
            <p className="text-sm text-zinc-300 mt-2 line-clamp-2">{user.bio}</p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-zinc-800/30 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{followerCount.toLocaleString()}</p>
            <p className="text-xs text-zinc-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user.following.toLocaleString()}</p>
            <p className="text-xs text-zinc-400">Following</p>
          </div>
          {showStats && user.stats && (
            <>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{user.stats.posts}</p>
                <p className="text-xs text-zinc-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{user.stats.engagement.toFixed(1)}%</p>
                <p className="text-xs text-zinc-400">Engage</p>
              </div>
            </>
          )}
        </div>

        {/* Engagement Stats */}
        {showStats && user.stats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 p-2 bg-zinc-800/20 rounded">
              <Eye className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-zinc-400">Views</p>
                <p className="text-sm font-bold text-white">{(user.stats.views / 1000).toFixed(1)}K</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/20 rounded">
              <Heart className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-xs text-zinc-400">Likes</p>
                <p className="text-sm font-bold text-white">{(user.stats.likes / 100).toFixed(0)}K</p>
              </div>
            </div>
          </div>
        )}

        {/* Follow Button */}
        <Button
          onClick={handleFollowClick}
          className={`w-full transition-all ${
            isFollowing
              ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Follower insights component showing follower growth and demographics
 */
interface FollowerInsightsProps {
  totalFollowers: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  demographics?: {
    students: number;
    professionals: number;
    creators: number;
    other: number;
  };
}

export function FollowerInsights({ 
  totalFollowers, 
  weeklyGrowth, 
  monthlyGrowth,
  demographics
}: FollowerInsightsProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Follower Insights</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">{totalFollowers.toLocaleString()}</p>
            <p className="text-xs text-zinc-400 mt-1">Total Followers</p>
          </div>
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="text-2xl font-bold text-green-400">+{weeklyGrowth}</p>
            <p className="text-xs text-zinc-400 mt-1">This Week</p>
          </div>
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">+{monthlyGrowth}</p>
            <p className="text-xs text-zinc-400 mt-1">This Month</p>
          </div>
        </div>

        {demographics && (
          <div>
            <p className="text-sm font-semibold text-white mb-3">Audience Demographics</p>
            <div className="space-y-2">
              <DemographicBar 
                label="Students" 
                percentage={demographics.students}
                color="bg-blue-500"
              />
              <DemographicBar 
                label="Professionals" 
                percentage={demographics.professionals}
                color="bg-green-500"
              />
              <DemographicBar 
                label="Creators" 
                percentage={demographics.creators}
                color="bg-purple-500"
              />
              <DemographicBar 
                label="Other" 
                percentage={demographics.other}
                color="bg-gray-500"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface DemographicBarProps {
  label: string;
  percentage: number;
  color: string;
}

function DemographicBar({ label, percentage, color }: DemographicBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-xs text-zinc-400">{label}</div>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-10 text-right text-xs font-bold text-white">{percentage}%</div>
    </div>
  );
}
