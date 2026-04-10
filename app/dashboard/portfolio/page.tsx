"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { subscribeLikeUpdates } from "@/lib/like-sync";

type PortfolioData = {
  profile: { id: string; name?: string; bio?: string; website?: string; avatar_url?: string } | null;
  metrics: {
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  milestones: { id: string; label: string; achieved: boolean }[];
  topPosts: { id: string; title: string; slug?: string; views?: number; likes_count?: number }[];
};

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) throw new Error('Failed to load portfolio');
        const payload = await response.json();
        setData(payload);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeLikeUpdates((payload) => {
      setData((current) => {
        if (!current) return current;

        let delta = 0;
        const nextTopPosts = current.topPosts.map((post) => {
          if (post.id !== payload.postId) return post;

          const prevLikes = post.likes_count || 0;
          const nextLikes = payload.likesCount;
          delta += nextLikes - prevLikes;

          return {
            ...post,
            likes_count: nextLikes,
          };
        });

        return {
          ...current,
          topPosts: nextTopPosts,
          metrics: {
            ...current.metrics,
            totalLikes: Math.max(0, current.metrics.totalLikes + delta),
          },
        };
      });
    });

    return unsubscribe;
  }, []);

  return (
    <div className="px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Creator Portfolio</h1>
                <p className="text-sm text-on-surface-variant mt-2">
                  Showcase your body of work, milestones, and impact.
                </p>
              </div>
              <Button
                onClick={() => window.print()}
                className="rounded-full bg-primary text-on-primary hover:bg-primary/90"
              >
                Export Snapshot
              </Button>
            </header>

            {loading ? (
              <Card className="bg-surface-container border-outline-variant/15 rounded-2xl">
                <CardContent className="py-10 text-on-surface-variant">Loading portfolio...</CardContent>
              </Card>
            ) : !data ? (
              <Card className="bg-surface-container border-outline-variant/15 rounded-2xl">
                <CardContent className="py-10 text-on-surface-variant">Portfolio data unavailable.</CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="glass-card rounded-2xl">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-on-surface">{data.profile?.name || 'Your Portfolio'}</h2>
                    <p className="text-sm text-on-surface-variant mt-2">{data.profile?.bio || 'Add a profile bio to strengthen your public portfolio.'}</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Metric label="Posts" value={data.metrics.totalPosts} />
                      <Metric label="Published" value={data.metrics.publishedPosts} />
                      <Metric label="Views" value={data.metrics.totalViews} />
                      <Metric label="Likes" value={data.metrics.totalLikes} />
                      <Metric label="Comments" value={data.metrics.totalComments} />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 glass-card rounded-2xl">
                    <CardHeader>
                      <h3 className="font-bold text-on-surface">Top Performing Posts</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {data.topPosts.length === 0 ? (
                        <p className="text-sm text-on-surface-variant">Publish posts to populate your portfolio highlights.</p>
                      ) : (
                        data.topPosts.map((post) => (
                          <a
                            key={post.id}
                            href={`/blog/${post.slug || post.id}`}
                            className="block rounded-xl border border-white/10 bg-white/2 hover:bg-white/6 p-3 transition-colors"
                          >
                            <p className="font-semibold text-sm text-on-surface line-clamp-1">{post.title}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{post.views || 0} views • {post.likes_count || 0} likes</p>
                          </a>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass-card rounded-2xl">
                    <CardHeader>
                      <h3 className="font-bold text-on-surface">Milestones</h3>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {data.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2 px-3 py-2">
                          <span className="text-xs text-on-surface">{milestone.label}</span>
                          <Badge className={milestone.achieved ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20' : 'bg-white/5 text-on-surface-variant border-white/10'}>
                            {milestone.achieved ? 'Achieved' : 'In Progress'}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-3">
      <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="text-2xl font-extrabold text-on-surface mt-1">{value.toLocaleString()}</p>
    </div>
  );
}
