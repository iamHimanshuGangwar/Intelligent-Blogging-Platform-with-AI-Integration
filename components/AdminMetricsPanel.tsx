import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Users, Heart, MessageCircle, Share2, Eye } from "lucide-react";

interface AdminMetricsProps {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollows: number;
  averageEngagementRate: number;
  topTrendingTopics: Array<{ topic: string; mentions: number; engagementScore: number }>;
  topFollowedUsers: Array<{ name: string; followers: number; email: string }>;
}

export function AdminMetricsPanel({ 
  totalViews,
  totalLikes,
  totalComments,
  totalShares,
  totalFollows,
  averageEngagementRate,
  topTrendingTopics,
  topFollowedUsers 
}: AdminMetricsProps) {
  const engagementCards = [
    {
      label: "Blog Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      change: "+12%"
    },
    {
      label: "Likes",
      value: totalLikes.toLocaleString(),
      icon: Heart,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      change: "+8%"
    },
    {
      label: "Comments",
      value: totalComments.toLocaleString(),
      icon: MessageCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      change: "+15%"
    },
    {
      label: "Shares",
      value: totalShares.toLocaleString(),
      icon: Share2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      change: "+5%"
    },
    {
      label: "New Follows",
      value: totalFollows.toLocaleString(),
      icon: Users,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      change: "+20%"
    },
    {
      label: "Avg Engagement",
      value: `${averageEngagementRate.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      change: "Strong"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Engagement Metrics */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engagementCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                      {card.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      {topTrendingTopics.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trending Topics</h3>
            <div className="space-y-3">
              {topTrendingTopics.slice(0, 5).map((topic, idx) => (
                <div key={topic.topic} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-sm font-bold text-zinc-400 w-6">#{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{topic.topic}</p>
                      <p className="text-xs text-zinc-500">{topic.mentions} mentions</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {topic.engagementScore.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Followed Users */}
      {topFollowedUsers.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Followed Users</h3>
            <div className="space-y-3">
              {topFollowedUsers.slice(0, 5).map((user) => (
                <div key={user.email} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{user.followers.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">followers</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
