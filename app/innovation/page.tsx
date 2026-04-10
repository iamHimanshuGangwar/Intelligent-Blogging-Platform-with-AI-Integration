"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Radar,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Loader2,
  Brain
} from "lucide-react";

const SOURCE_LABEL: Record<string, string> = {
  arxiv: "arXiv Research",
  github: "GitHub Labs",
  mit: "MIT Tech",
  nature: "Nature",
};

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  publishedAt: string;
  url: string;
  category: string;
  imageUrl?: string;
}

interface ReadableItem extends NewsItem {
  content?: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author_username?: string;
  category?: string;
  created_at: string;
}



interface InnovationFeed {
  updatedAt: string;
  sources: { github: number; arxiv: number };
  items: any[];
}

const toReadableItem = (item: any): ReadableItem => ({
  id: item.id || Math.random().toString(),
  title: item.title || "Untitled",
  summary: item.summary || item.description || "No summary available.",
  sourceName: item.sourceName || "Internal",
  publishedAt: item.publishedAt || item.created_at || new Date().toISOString(),
  url: item.url || "#",
  category: item.category || "General",
  imageUrl: item.imageUrl,
  content: item.content,
});

const formatItemDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
};

function InnovationPageContent() {
  const searchParams = useSearchParams();
  // const [loading, setLoading] = useState(true); // Removed unused
  // const [newsLoading, setNewsLoading] = useState(true); // Removed unused
  const [feed, setFeed] = useState<InnovationFeed | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [worldNews, setWorldNews] = useState<NewsItem[]>([]);
  const [researchNews, setResearchNews] = useState<NewsItem[]>([]);
  const [geopolitics, setGeopolitics] = useState<NewsItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  // const [jobs, setJobs] = useState<Job[]>([]); // Removed unused
  const [activeTab, setActiveTab] = useState<"news" | "research" | "community">("research");
  const [selectedStory, setSelectedStory] = useState<ReadableItem | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  useEffect(() => {
    const loadFeed = async () => {
        try {
          // setLoading(true); // Removed unused
          const res = await fetch("/api/innovation/feed");
          if (res.ok) setFeed(await res.json());
        } catch {}
        // finally { setLoading(false); } // Removed unused
      };

      const loadNews = async () => {
        try {
          // setNewsLoading(true); // Removed unused
          const res = await fetch("/api/innovation/news");
          if (res.ok) {
            const data = await res.json();
            const parsedResearch = data.researchNews || [];
            const parsedWorld = data.worldNews || [];
            setResearchNews(parsedResearch);
            setWorldNews(parsedWorld);
            setGeopolitics(data.geopolitics || []);
            setNews(data.items || [...parsedResearch, ...parsedWorld]);
          }
        } catch {}
        // finally { setNewsLoading(false); } // Removed unused
      };

      const loadSidebars = async () => {
        try {
          const [postsRes] = await Promise.allSettled([
            fetch("/api/posts?limit=6&published=true"),
          ]);
          if (postsRes.status === "fulfilled" && postsRes.value.ok) {
            const d = await postsRes.value.json();
            setPosts(d.posts || d || []);
          }
        } catch {}
      };

      loadFeed();
      loadNews();
      loadSidebars();
    }, []);

    const tickerItems = useMemo(() => {
      const newsHeadlines = news.slice(0, 5).map((n) => `${n.sourceName}: ${n.title}`);
      const researchHeadlines = (feed?.items || []).slice(0, 5).map((i) => `${SOURCE_LABEL[i.source]}: ${i.title}`);
      return [...newsHeadlines, ...researchHeadlines];
    }, [feed?.items, news]);

    const researchItems = useMemo(() => {
      const combined = [...researchNews, ...(feed?.items || [])];
      const seen = new Set<string>();
      return combined.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    }, [feed?.items, researchNews]);

    const handleAISummarize = async () => {
      if (!selectedStory || aiSummaryLoading) return;
      setAiSummaryLoading(true);
      setAiSummary("");
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: `Summarize this research paper or article in clear, accessible language. Provide key findings, methodology, and significance.\n\nTitle: ${selectedStory.title}\nSource: ${selectedStory.sourceName}\nCategory: ${selectedStory.category}\nAbstract/Summary: ${selectedStory.summary}\n${selectedStory.content ? `\nContent: ${selectedStory.content}` : ""}`,
            tone: "professional",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiSummary(data?.content || data?.text || "Unable to generate summary.");
        } else {
          setAiSummary("AI summarization is temporarily unavailable.");
        }
      } catch {
        setAiSummary("Failed to generate AI summary. Please try again.");
      } finally {
        setAiSummaryLoading(false);
      }
    };

    useEffect(() => {
      const tabParam = searchParams.get("tab");
      if (tabParam === "news" || tabParam === "research" || tabParam === "community") {
        setActiveTab(tabParam);
      }
    }, [searchParams]);

    useEffect(() => {
      const storyId = searchParams.get("story");
      if (!storyId) return;

      const tabParam = searchParams.get("tab");
      const pools: ReadableItem[] = [];

      if (!tabParam || tabParam === "research") {
        pools.push(...researchItems.map(toReadableItem));
      }
      if (!tabParam || tabParam === "news") {
        pools.push(...worldNews.map(toReadableItem), ...geopolitics.map(toReadableItem));
      }
      if (!tabParam || tabParam === "community") {
        pools.push(
          ...posts.map((post) => ({
            id: post.id,
            title: post.title,
            summary: post.excerpt || "Community story from AiBlog.",
            sourceName: post.author_username || "Community",
            category: post.category || "Community",
            publishedAt: post.created_at,
            url: `/blog/${post.slug}`,
          }))
        );
      }

      const matchedStory = pools.find((item) => item.id === storyId);
      if (matchedStory) {
        setSelectedStory(matchedStory);
      }
    }, [geopolitics, posts, researchItems, searchParams, worldNews]);

    return (
      <main className="min-h-screen bg-[#0a0915] text-zinc-400 selection:bg-violet-500/30">
        {/* Marquee Ticker */}
        <div className="border-b border-white/5 bg-black/20 py-2 overflow-hidden">
          <div className="flex animate-[marquee_50s_linear_infinite] whitespace-nowrap">
            {tickerItems.map((text, i) => (
              <span key={i} className="mx-8 text-[10px] font-medium tracking-widest text-zinc-500 uppercase flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-violet-500" /> {text}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Content Area */}
            <div className="lg:col-span-8">
              <header className="mb-12">
                <div className="flex items-center gap-2 text-violet-400 mb-2">
                  <Radar className="h-5 w-5 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Live Innovation Stream</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                  The Future <br /><span className="text-violet-500">Unfolding.</span>
                </h1>
              </header>

              {/* Content Tabs */}
              <div className="mb-8 flex gap-1 border-b border-white/5 pb-px">
                {["research", "news", "community"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab ? "border-b-2 border-violet-500 text-white" : "text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Feed Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                {activeTab === "research" && researchItems.map((item) => (
                  <div key={item.id} onClick={() => setSelectedStory(toReadableItem(item))} className="group cursor-pointer rounded-2xl border border-white/5 bg-white/2 p-6 transition-all hover:border-violet-500/30 hover:bg-white/5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">{item.sourceName || SOURCE_LABEL[item.source]}</span>
                      <ArrowRight className="h-4 w-4 -rotate-45 text-zinc-700 transition-all group-hover:rotate-0 group-hover:text-violet-500" />
                    </div>
                    <h3 className="mb-3 line-clamp-2 text-lg font-bold text-white group-hover:text-violet-200">{item.title}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-zinc-500">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/10 to-emerald-600/10 p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" /> Meta Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      <span className="text-xs text-zinc-400">GitHub Labs</span>
                    </div>
                    <span className="text-xs text-violet-400 font-bold">{feed?.sources.github ?? 0} repos</span>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-zinc-700">
                  Updated: {feed?.updatedAt ? new Date(feed.updatedAt).toLocaleTimeString() : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#13112b] p-5">
                <h3 className="text-sm font-bold text-white mb-3">Explore Platform</h3>
                <div className="space-y-1">
                  {[
                    { label: "Write a Post", href: "/editor", color: "text-violet-400" },
                    { label: "Community Feed", href: "/community", color: "text-emerald-400" },
                    { label: "Browse Jobs", href: "/jobs", color: "text-amber-400" },
                    { label: "Dashboard", href: "/dashboard", color: "text-blue-400" },
                    { label: "Inner Circle", href: "/inner-circle", color: "text-pink-400" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${link.color} hover:bg-white/5 transition-colors`}>
                      {link.label} <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* Selection Modal */}
          {selectedStory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#13112b] p-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-violet-300">{selectedStory.sourceName}</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">{selectedStory.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatItemDate(selectedStory.publishedAt)}
                      {selectedStory.category ? ` • ${selectedStory.category}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedStory(null); setAiSummary(""); }}
                    className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>

                {selectedStory.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <img src={selectedStory.imageUrl} alt="" className="h-56 w-full object-cover" />
                  </div>
                )}

                <div className="space-y-4 text-sm leading-7 text-zinc-300">
                  <p>{selectedStory.summary}</p>
                  <p>{selectedStory.content || "Full source text unavailable."}</p>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <button
                    onClick={handleAISummarize}
                    disabled={aiSummaryLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
                  >
                    {aiSummaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                    {aiSummaryLoading ? "Summarizing..." : "AI Summarize"}
                  </button>
                  {aiSummary && (
                    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/8 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2">AI Summary</p>
                      <div className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line">{aiSummary}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </main>
  );
}

export default function InnovationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <InnovationPageContent />
    </Suspense>
  );
}
