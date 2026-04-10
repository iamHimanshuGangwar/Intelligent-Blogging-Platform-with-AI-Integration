"use client";

import Link from "next/link";

interface AdminSideNavProps {
  activePage?: string;
}

export default function AdminSideNav({ activePage = "overview" }: AdminSideNavProps) {
  const navItems = [
    { id: "overview", label: "System Overview", icon: "dashboard", href: "/admin" },
    { id: "posts", label: "Blog CMS", icon: "article", href: "/admin/posts" },
    { id: "themes", label: "Theme Library", icon: "palette", href: "/admin/themes" },
    { id: "users", label: "User Management", icon: "group", href: "/admin/users" },
    { id: "moderation", label: "Content Moderation", icon: "fact_check", href: "/admin/moderation" },
    { id: "career-paths", label: "Career Path Config", icon: "alt_route", href: "/admin/career-paths" },
    { id: "resumes", label: "User Resumes", icon: "description", href: "/admin/resumes" },
    { id: "analytics", label: "Platform Analytics", icon: "analytics", href: "/admin/analytics" },
    { id: "support", label: "User Support", icon: "support_agent", href: "/admin/support" },
    { id: "docs", label: "Documentation", icon: "description", href: "/admin/docs" },
    { id: "settings", label: "System Settings", icon: "settings_suggest", href: "/admin/settings" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-[#0e0e0e] border-r border-white/5 flex-col font-body text-sm tracking-wide z-40 hidden md:flex">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-black text-white font-headline">Platform Control</h2>
        <p className="text-[10px] text-zinc-500 tracking-widest uppercase">V2.4.0 Stable</p>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              activePage === item.id
                ? "text-blue-400 border-r-2 border-blue-500 bg-blue-500/5 translate-x-1 font-medium"
                : "text-zinc-400 hover:bg-[#131313] hover:text-white hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
