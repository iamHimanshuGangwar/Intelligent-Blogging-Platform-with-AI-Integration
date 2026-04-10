"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

const DOCS: DocSection[] = [
  {
    id: "overview",
    title: "Platform Overview",
    icon: "dashboard",
    content: [
      "AiBlog is an AI-powered editorial and blogging platform built with Next.js, Supabase, and Clerk authentication.",
      "The platform supports user registration via OTP and OAuth (Google, GitHub), blog post creation with AI-assisted themes, community engagement, career tracking, and a comprehensive admin panel.",
      "Tech Stack: Next.js 15 (App Router), React 19, Supabase (PostgreSQL + Auth), Clerk (OAuth), Tailwind CSS, Google Gemini AI, ImageKit (media storage).",
    ],
  },
  {
    id: "auth",
    title: "Authentication System",
    icon: "lock",
    content: [
      "Three authentication methods are supported:",
      "1. Clerk OAuth — Google and GitHub sign-in. Creates automatic profiles in the profiles table via server-side sync.",
      "2. OTP Login — Email-based one-time password. Sessions stored in otp_sessions table with 8-hour expiry.",
      "3. Admin Cookie — Environment-variable-based credentials (ADMIN_EMAIL, ADMIN_PASSWORD). HMAC-signed session cookie. Admin sessions can only access /admin routes.",
      "Middleware: The clerkMiddleware in middleware.ts handles all route protection. Public routes (/, /auth, /blog, /community, etc.) are always accessible. Protected routes (/dashboard, /editor, /admin) require valid sessions.",
    ],
  },
  {
    id: "posts",
    title: "Blog CMS",
    icon: "article",
    content: [
      "Posts are stored in the posts table with fields: title, content, slug, excerpt, status, approval_status, author_id, blog_theme, topic, category, ai_generated, cover_image_url.",
      "Status Workflow: draft → published (requires approval_status = approved or null to show publicly).",
      "New posts created by users have approval_status = 'pending'. Admin must approve via the Moderation panel before they appear on the community page.",
      "Admin CMS (admin/posts): Admins can view all posts, update status, edit titles/excerpts/topics, and delete posts. Setting status to 'published' auto-sets approval_status to 'approved'.",
      "Blog Themes: Posts can use custom visual themes (e.g., Neon, Midnight Ocean, Solar Flare). Themes are stored in blog_themes table and applied client-side.",
    ],
  },
  {
    id: "moderation",
    title: "Content Moderation",
    icon: "fact_check",
    content: [
      "The Moderation panel shows pending posts and flagged comments.",
      "Actions: Approve (sets approval_status to approved, status to published), Reject (marks as rejected), Flag (marks for further review), Delete (permanent removal).",
      "Comments: Can be approved, rejected, flagged as spam, or deleted. Guest comments require manual review.",
      "AI flags content automatically based on spam patterns (shown as 'AI Flagged' badge in the queue).",
    ],
  },
  {
    id: "users",
    title: "User Management",
    icon: "group",
    content: [
      "User profiles are stored in the profiles table: id, email, name, avatar_url, role, bio, website, social_links.",
      "Roles: 'user' (default), 'admin' (full platform access).",
      "User Audit page shows all registered users with their roles, post counts, and activity levels.",
      "Admin can view user activity history via the activity_log table.",
    ],
  },
  {
    id: "career-paths",
    title: "Career Path Config",
    icon: "alt_route",
    content: [
      "Career tracks are stored in career_tracks table: name, description, icon, creator_count, growth_rate, is_active.",
      "Each track has progression levels with tiers, badges, perks, and AI threshold metrics.",
      "AI Suggestions: The platform suggests new career paths based on platform trends (Ethical AI Reviewer, Sustainability Auditor, Prompt Architect, etc.).",
      "Admin can initialize new tracks from AI suggestions or create custom tracks.",
    ],
  },
  {
    id: "analytics",
    title: "Platform Analytics",
    icon: "analytics",
    content: [
      "Analytics are collected from the activity_log table and aggregated via the /api/admin/analytics endpoint.",
      "Metrics tracked: page views, post views, user signups, likes, comments, shares.",
      "Dashboard shows real-time stats with charts for daily/weekly/monthly trends.",
      "Cache headers: Analytics endpoints use 60s stale-while-revalidate cache for performance.",
    ],
  },
  {
    id: "themes",
    title: "Theme Library",
    icon: "palette",
    content: [
      "Blog themes are defined in lib/blog-themes.ts and lib/blog-theme-templates.ts.",
      "Each theme specifies: background colors/gradients, text colors, heading styles, accent colors, prose classes, and card styles.",
      "Admin can manage themes via the Theme Library panel. Theme gallery on the landing page showcases available themes.",
      "Users select themes when creating/editing posts in the editor.",
    ],
  },
  {
    id: "support",
    title: "User Support",
    icon: "support_agent",
    content: [
      "Support tickets are managed via the Support panel in the admin dashboard.",
      "Ticket fields: subject, message, status (open/in-progress/resolved/closed), priority (low/medium/high/urgent).",
      "Admin can reply to tickets, mark as resolved, or close them.",
      "Tickets are stored in the support_tickets table (when available) or fallback to mock data.",
    ],
  },
  {
    id: "api",
    title: "API Reference",
    icon: "api",
    content: [
      "All API routes are under /api/ and use Next.js Route Handlers (app/api/).",
      "Public endpoints: GET /api/posts, GET /api/public/stats, GET /api/innovation/news, GET /api/forum/topics, GET /api/community/reviews.",
      "Auth-required: POST /api/posts, POST/DELETE /api/likes, POST /api/comments, GET /api/recommendations.",
      "Admin endpoints: /api/admin/* (moderation, posts, users, settings, analytics, career-tracks, support-tickets).",
      "Authentication: Clerk userId for OAuth, otp_session_token cookie for OTP, admin_session_token for admin.",
    ],
  },
  {
    id: "database",
    title: "Database Schema",
    icon: "storage",
    content: [
      "Database: Supabase PostgreSQL. Tables:",
      "• profiles — User profiles (synced from Clerk/OTP auth)",
      "• posts — Blog posts with status, approval, themes",
      "• comments — Post comments (user + guest)",
      "• post_likes / likes — Like tracking with unique user-post constraints",
      "• otp_sessions — OTP login sessions",
      "• activity_log — User and admin activity tracking",
      "• career_tracks — Career path definitions",
      "• blog_themes — Custom blog themes",
      "• notifications — User notifications",
      "• newsletter_subscribers — Email subscriptions",
      "• community_reviews — Community feedback/reviews",
      "• follows / user_follows — User follow relationships",
      "• support_tickets — User support tickets",
      "Migrations are in supabase/migrations/. Run via: node scripts/apply-migration.js",
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    icon: "cloud_upload",
    content: [
      "The application is designed for deployment on Vercel with Supabase as the backend.",
      "Required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET.",
      "Optional: GEMINI_API_KEY (AI features), IMAGEKIT_* (image uploads), SMTP settings (email/newsletter).",
      "Build: npm run build. The app uses ISR for static pages and dynamic rendering for protected routes.",
    ],
  },
];

export default function AdminDocsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/admin/login"); return; }
    if (user && !isAdmin) { router.push("/dashboard"); }
  }, [user, isAdmin, loading, router]);

  const filteredDocs = searchQuery.trim()
    ? DOCS.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : DOCS;

  const activeDoc = DOCS.find((d) => d.id === activeSection);

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="docs" />
      <AdminTopNav activePage="docs" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-white mb-1">
            Platform <span className="text-primary italic">Documentation</span>
          </h2>
          <p className="text-on-surface-variant text-sm">Comprehensive guide to the AiBlog admin platform and its features.</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full max-w-md px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Nav */}
          <div className="lg:col-span-1">
            <nav className="glass-panel rounded-xl p-3 space-y-1 sticky top-24 max-h-[75vh] overflow-y-auto">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setActiveSection(doc.id); setSearchQuery(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    activeSection === doc.id
                      ? "bg-primary text-on-primary font-bold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{doc.icon}</span>
                  {doc.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {searchQuery.trim() ? (
              <div className="space-y-6">
                {filteredDocs.length === 0 ? (
                  <div className="glass-panel rounded-xl p-8 text-center text-on-surface-variant">
                    No documentation matches your search.
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <div key={doc.id} className="glass-panel rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary">{doc.icon}</span>
                        <h3 className="text-lg font-bold font-headline">{doc.title}</h3>
                      </div>
                      <div className="space-y-3">
                        {doc.content.map((paragraph, i) => (
                          <p key={i} className="text-sm text-on-surface-variant leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeDoc ? (
              <div className="glass-panel rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{activeDoc.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline">{activeDoc.title}</h3>
                </div>
                <div className="space-y-4">
                  {activeDoc.content.map((paragraph, i) => (
                    <p key={i} className="text-sm text-on-surface-variant leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
