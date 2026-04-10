"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationsDropdown = dynamic(
  () => import("@/components/NotificationsDropdown").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null }
);
const LanguageSwitcher = dynamic(
  () => import("@/components/LanguageSwitcher").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null }
);
const ThemeToggle = dynamic(
  () => import("@/components/ThemeToggle").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null }
);

const PRIMARY_LINKS = [
  { href: "/", label: "About", icon: "info" },
  { href: "/blog-themes", label: "Themes", icon: "palette" },
  { href: "/innovation", label: "Innovation", icon: "rocket_launch" },
];

const EXPLORE_LINKS = [
  { href: "/community", label: "Community", icon: "groups" },
  { href: "/forum", label: "Forum", icon: "forum" },
  { href: "/careers", label: "Careers", icon: "work" },
];

export default function Navbar() {
  const router = useRouter();
  const { isAdmin, isAdminOnly, isAuthenticated, profile, user, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // Prevent hydration mismatch: don't render auth-dependent content until after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Debounced hover handlers to prevent dropdown jittering
  const exploreTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const profileTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openExplore = useCallback(() => { clearTimeout(exploreTimer.current); setExploreOpen(true); }, []);
  const closeExplore = useCallback(() => { exploreTimer.current = setTimeout(() => setExploreOpen(false), 350); }, []);
  const openProfile = useCallback(() => { clearTimeout(profileTimer.current); setProfileOpen(true); }, []);
  const closeProfile = useCallback(() => { profileTimer.current = setTimeout(() => setProfileOpen(false), 350); }, []);

  useEffect(() => {
    // Warm up common routes so page transitions feel instant.
    router.prefetch("/");
    router.prefetch("/community");
    router.prefetch("/dashboard");
    router.prefetch("/forum");
    router.prefetch("/careers");
  }, [router]);

  // OTP session user is represented by profile without an active Clerk user object.
  const isOtpUser = mounted && isAuthenticated && !!profile && !clerkUser;
  const isClerkUser = mounted && isAuthenticated && !!clerkUser;

  const displayName =
    (isClerkUser ? clerkUser?.fullName || clerkUser?.firstName : profile?.name) ||
    user?.name ||
    "User";
  const displayEmail =
    (isClerkUser ? clerkUser?.primaryEmailAddress?.emailAddress : profile?.email) ||
    user?.email ||
    "";
  const avatarUrl =
    (isClerkUser ? clerkUser?.imageUrl : profile?.avatar_url) ||
    undefined;

  return (
    <>
      <header className="fixed top-0 w-full z-50 font-headline glass-nav transition-colors">
        <nav className="flex justify-between items-center px-6 lg:px-12 h-16 w-full max-w-350 mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter text-on-surface hover:opacity-90 transition-opacity">
              AiBlog
            </Link>
            <div className="hidden md:flex gap-1 text-sm items-center">
              {PRIMARY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-on-surface-variant hover:text-primary transition-all font-medium rounded-lg px-3 py-1.5 hover:bg-primary/5 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              <div onMouseEnter={openExplore} onMouseLeave={closeExplore}>
                <DropdownMenu open={exploreOpen} onOpenChange={setExploreOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-on-surface-variant hover:text-primary transition-all font-medium rounded-lg px-3 py-1.5 hover:bg-primary/5 flex items-center gap-1.5 h-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">explore</span>
                      Explore
                      <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={4} className="w-56" onMouseEnter={openExplore} onMouseLeave={closeExplore}>
                    <div className="absolute -top-4 left-0 right-0 h-4" />
                    {EXPLORE_LINKS.map((item) => (
                      <DropdownMenuItem asChild key={item.href}>
                        <Link href={item.href} className="cursor-pointer flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {mounted && isAuthenticated && !isAdminOnly && (
                <Link
                  href="/dashboard"
                  className="text-on-surface-variant hover:text-primary transition-all font-medium rounded-lg px-3 py-1.5 hover:bg-primary/5 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {mounted && isAuthenticated ? (
              <>
                {!isAdminOnly && <NotificationsDropdown />}
                
                {isAdmin && (
                  <Link href="/admin" className="hidden sm:block text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                    Admin
                  </Link>
                )}
                
                {/* Show OTP User Profile or Clerk Profile */}
                {(isOtpUser || isClerkUser || isAdminOnly) && (
                  <div onMouseEnter={openProfile} onMouseLeave={closeProfile}>
                    <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-9 px-1.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-primary/5 flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-full overflow-hidden">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt={displayName}
                                width={28}
                                height={28}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {displayName?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <span className="hidden lg:block text-sm max-w-35 truncate text-on-surface">{displayName}</span>
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={4} className="w-56" onMouseEnter={openProfile} onMouseLeave={closeProfile}>
                        <div className="absolute -top-4 left-0 right-0 h-4" />
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                          <p className="text-xs text-on-surface-variant truncate">{displayEmail}</p>
                          {isAdmin && (
                            <p className="text-xs text-blue-400 font-semibold mt-1">Admin</p>
                          )}
                        </div>
                        <DropdownMenuSeparator />
                        {!isAdminOnly && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/dna" className="cursor-pointer flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                                Writer DNA
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/achievements" className="cursor-pointer flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                                XP &amp; Badges
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/settings" className="cursor-pointer">Settings</Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">Admin Panel</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            void signOut();
                          }}
                          className="text-red-400 cursor-pointer"
                        >
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                
                {!isAdminOnly && (
                  <Button asChild className="px-5 bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                    <Link href="/editor">Create Post</Link>
                  </Button>
                )}
              </>
            ) : mounted ? (
              <>
                <Button asChild variant="ghost" className="hidden sm:block text-sm font-semibold text-on-surface-variant hover:text-on-surface">
                  <Link href="/auth">Login</Link>
                </Button>
                <Button asChild className="px-5 bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                  <Link href="/auth?next=%2Fpricing">Get Started</Link>
                </Button>
              </>
            ) : (
              // Pre-hydration placeholder — matches server HTML exactly
              <Button asChild className="px-5 bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                <Link href="/auth?next=%2Fpricing">Get Started</Link>
              </Button>
            )}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden text-on-surface-variant" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="material-symbols-outlined">menu</span>
            </Button>
          </div>
        </nav>
        {menuOpen && (
          <div className="md:hidden glass-card border-t border-white/5 px-6 py-4 space-y-2">
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-on-surface-variant hover:text-on-surface rounded-lg px-2 py-2 hover:bg-primary/5 transition-colors flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div className="pt-1 pb-1">
              <p className="px-2 py-1 text-xs uppercase tracking-wide text-on-surface-variant/60">Explore</p>
              {EXPLORE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-on-surface-variant hover:text-on-surface rounded-lg px-2 py-2 hover:bg-primary/5 transition-colors flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {isAuthenticated && mounted && (
              <Link
                href="/dashboard"
                className="text-sm text-on-surface-variant hover:text-on-surface rounded-lg px-2 py-2 hover:bg-primary/5 transition-colors flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Dashboard
              </Link>
            )}

            {!isAuthenticated && mounted && (
              <Link href="/auth" className="block text-sm text-primary font-semibold px-2 py-2" onClick={() => setMenuOpen(false)}>Login / Sign Up</Link>
            )}

            <div className="px-2 pt-1 flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            {isAuthenticated && mounted && isAdmin && (
              <Link href="/admin" className="block text-sm text-on-surface-variant hover:text-on-surface rounded-lg px-2 py-2 hover:bg-primary/5" onClick={() => setMenuOpen(false)}>Admin</Link>
            )}

            {isAuthenticated && (
              <>
                <Separator className="my-2" />
                <div className="pt-2">
                  <Button 
                    onClick={() => { void signOut(); }}
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Login Popup Modal */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginPopup(false)}>
          <div className="relative bg-surface-container border border-outline-variant/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => setShowLoginPopup(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </Button>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              </div>
              <h3 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Sign in to continue</h3>
              <p className="text-sm text-on-surface-variant mb-8">Join thousands of creators. Sign in with Google to access the full platform.</p>
              <Button asChild className="w-full h-auto py-3.5 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-100 shadow-lg">
              <Link
                href="/auth"
                className="flex items-center justify-center gap-3"
                onClick={() => setShowLoginPopup(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Link>
              </Button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-surface-container px-3 text-on-surface-variant">or</span></div>
              </div>
              <Button asChild variant="outline" className="w-full h-auto py-3.5 bg-surface-container-high border-outline-variant/20 text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container-highest">
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2"
                onClick={() => setShowLoginPopup(false)}
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                Sign in with Email / OTP
              </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}