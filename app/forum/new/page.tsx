"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  slug: string;
}

function NewTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get("category");
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(preselectedCategoryId || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/forum/categories")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Failed to load categories")))
      .then((d) => setCategories(d?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (preselectedCategoryId) setCategoryId(preselectedCategoryId);
  }, [preselectedCategoryId]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/auth?next=%2Fforum%2Fnew");
      return;
    }

    if (!title.trim()) { setError("Title is required"); return; }
    if (!content.trim()) { setError("Content is required"); return; }
    if (!categoryId) { setError("Please select a category"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, title: title.trim(), content: content.trim(), tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create topic");
      router.push(`/forum/topic/${data.topic.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create topic");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background gradient-mesh text-on-background">
        <NavBar />
        <div className="max-w-3xl mx-auto px-6 pt-28 space-y-4">
          <div className="h-8 w-1/2 bg-white/4 rounded animate-pulse" />
          <div className="h-64 bg-white/4 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh text-on-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/forum" className="hover:text-primary transition-colors">Forum</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span>New Discussion</span>
        </div>

        <h1 className="text-3xl font-extrabold font-headline mb-2">Start a Discussion</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Share your question, idea, or insight with the community.
        </p>

        <Card className="bg-white/4 border-white/10">
          <CardContent className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Category selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">
                Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      categoryId === cat.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/4 hover:bg-white/8"
                    }`}
                  >
                    {categoryId === cat.id && (
                      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-linear-to-r ${cat.gradient}`} />
                    )}
                    <div className={`w-7 h-7 rounded-lg bg-linear-to-br ${cat.gradient} flex items-center justify-center mb-1.5`}>
                      <span className="material-symbols-outlined text-white text-sm">{cat.icon}</span>
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{cat.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your question or topic?"
                className="bg-white/4 border-white/10"
                maxLength={200}
              />
              <p className="text-[10px] text-on-surface-variant mt-1 text-right">{title.length}/200</p>
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">
                Content *
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your topic in detail. Provide context, examples, or code snippets..."
                rows={8}
                className="bg-white/4 border-white/10 resize-none"
                maxLength={10000}
              />
              <p className="text-[10px] text-on-surface-variant mt-1 text-right">{content.length}/10000</p>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">
                Tags (optional, max 5)
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag and press Enter"
                  className="bg-white/4 border-white/10"
                  maxLength={30}
                />
                <Button variant="outline" size="sm" onClick={addTag} type="button">Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-white/8 text-on-surface-variant border-white/10 text-xs cursor-pointer hover:bg-red-500/20 hover:text-red-300 transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} <span className="ml-1">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <Button variant="outline" onClick={() => router.push("/forum")}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !content.trim() || !categoryId}
                className={`font-bold ${selectedCategory ? `bg-linear-to-r ${selectedCategory.gradient} text-white border-0` : "bg-primary text-on-primary"}`}
              >
                {submitting ? (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Posting...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">send</span>
                    Post Discussion
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-4 bg-white/2 border-white/6">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Forum Guidelines</p>
            <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
              <li>Be respectful and constructive. Treat everyone with kindness.</li>
              <li>Search before posting to avoid duplicate topics.</li>
              <li>Keep discussions on topic and relevant to the category.</li>
              <li>No spam, self-promotion, or offensive content.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense>
      <NewTopicContent />
    </Suspense>
  );
}
