"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface SideNavBarProps {
  activePage?: string;
}

const NAV_SECTIONS = [
  {
    label: "Create",
    items: [
      { id: "editor", label: "Write Post", icon: "edit_note", href: "/editor" },
      { id: "resume", label: "Resume Builder", icon: "description", href: "/dashboard/resume" },
    ],
  },
  {
    label: "Discover",
    items: [
      { id: "community", label: "Community", icon: "people", href: "/community" },
      { id: "jobs", label: "Jobs", icon: "work", href: "/jobs" },
      { id: "home", label: "Career Hub", icon: "trending_up", href: "/dashboard/career" },
    ],
  },
  {
    label: "You",
    items: [
      { id: "portfolio", label: "Portfolio", icon: "deployed_code", href: "/dashboard/portfolio" },
      { id: "dna", label: "Writer DNA", icon: "fingerprint", href: "/dashboard/dna" },
      { id: "achievements", label: "XP & Badges", icon: "emoji_events", href: "/dashboard/achievements" },
      { id: "collaboration", label: "Collaboration", icon: "group", href: "/dashboard/collaboration" },
      { id: "settings", label: "Settings", icon: "settings", href: "/dashboard/settings" },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

export default function SideNavBar({ activePage = "home" }: SideNavBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <>
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 glass-sidebar flex-col pt-20 pb-8 z-40 transition-colors">
      {/* User Profile */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "AiBlog"}`}
              alt="User"
            />
            <AvatarFallback className="rounded-lg bg-surface-container-high text-xs">AI</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-headline text-sm font-bold tracking-tight text-on-surface">
              AiBlog Editorial
            </p>
            <p className="font-label text-[10px] text-primary uppercase tracking-widest">
              Career Mode Active
            </p>
          </div>
        </div>
      </div>

      <Separator className="mb-4 bg-black/5 dark:bg-white/5" />

      {/* Navigation with grouped sections */}
      <nav className="flex-1 flex flex-col px-3 overflow-y-auto">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label} className={idx > 0 ? "mt-5" : ""}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activePage === item.id
                      ? "sidebar-active text-primary font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 nav-link-glow"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 mt-auto space-y-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 py-3 h-auto rounded-lg font-bold text-xs uppercase tracking-widest gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </Button>
      </div>
    </aside>

    {/* Mobile bottom tab bar — visible only below lg */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav flex items-center justify-around px-2 py-1 safe-bottom transition-colors">
      {ALL_ITEMS.slice(0, 5).map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors min-w-[3rem] ${
            activePage === item.id
              ? "text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activePage === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">{item.label.split(" ")[0]}</span>
        </Link>
      ))}
    </nav>
    </>
  );
}
