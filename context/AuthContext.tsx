"use client";

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  session: any;
  loading: boolean;
  role: string;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("user");
  const isAuthRoute = pathname?.startsWith("/auth") || pathname === "/admin/login";

  // Guard: prevent Clerk's late isLoaded flip from overwriting an already-resolved
  // admin/OTP session. Once cookie-based auth succeeds, ignore subsequent effect runs.
  const resolvedRef = useRef(false);

  // ── Clerk path: sync Clerk user → Supabase profile ──────────────────────
  const syncUserToSupabase = useCallback(async () => {
    if (!clerkUser) {
      setLoading(false);
      return;
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
    const email = clerkUser.primaryEmailAddress?.emailAddress || "";
    const userRole = email.toLowerCase() === adminEmail.toLowerCase() ? "admin" : "user";

    const fallbackProfile: Profile = {
      id: clerkUser.id,
      email,
      name: clerkUser.fullName || clerkUser.firstName || "User",
      avatar_url: clerkUser.imageUrl || undefined,
      role: userRole,
    };

    try {
      const res = await fetch("/api/user/profile/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clerkUser.id,
          email,
          name: clerkUser.fullName || clerkUser.firstName || "User",
          avatar_url: clerkUser.imageUrl || null,
          role: userRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setRole(data.profile.role || "user");
          resolvedRef.current = true;
          setLoading(false);
          return;
        }
      }

      setProfile(fallbackProfile);
      setRole(userRole);
    } catch {
      setProfile(fallbackProfile);
      setRole(userRole);
    }
    resolvedRef.current = true;
    setLoading(false);
  }, [clerkUser]);

  // ── Cookie path: try OTP session first, then admin cookie ───────────────
  const loadCookieSession = useCallback(async () => {
    // otp_session_token is httpOnly — use the non-httpOnly companion flag
    const hasOtpCookie = document.cookie.includes("otp_session=");
    // admin_session_token is httpOnly — use the non-httpOnly companion flag
    const hasAdminCookie = document.cookie.includes("admin_session_active=");

    if (!hasOtpCookie && !hasAdminCookie) {
      setLoading(false);
      return false;
    }

    // 1. OTP session
    if (hasOtpCookie) try {
      const res = await fetch("/api/auth/otp/session", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const { user } = data;

        const otpProfile: Profile = {
          id: user.id,
          email: user.email,
          name: user.name || user.email?.split("@")[0] || "User",
          avatar_url: user.avatar_url,
          role: user.role || "user",
        };

        setProfile(otpProfile);
        setRole(otpProfile.role);
        resolvedRef.current = true;
        setLoading(false);
        return true;
      }
    } catch {
      // Expected 401 when OTP session is invalid
    }

    // 2. Admin cookie session (HMAC-verified, works on ANY page — not just /admin routes)
    if (hasAdminCookie) try {
      const adminProbe = await fetch("/api/admin/me", {
        method: "GET",
        credentials: "include",
      });

      if (adminProbe.ok) {
        const data = await adminProbe.json();
        const adminProfile: Profile = {
          id: data.admin?.id || "admin-session",
          email: data.admin?.email || (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com"),
          name: data.admin?.name || "Administrator",
          role: "admin",
        };
        setProfile(adminProfile);
        setRole("admin");
        resolvedRef.current = true;
        setLoading(false);
        return true;
      }
    } catch {
      // Expected 401 when admin session cookie is invalid
    }

    setLoading(false);
    return false;
  }, []); // No dependencies — works the same on every route

  // ── Lifecycle: determine which auth path to take ────────────────────────
  useEffect(() => {
    // If a cookie-based session was already resolved, don't let subsequent
    // Clerk state changes (isLoaded flipping) overwrite it.
    if (resolvedRef.current) return;

    // 1. Clerk user is signed in → sync to Supabase
    if (isLoaded && isSignedIn && clerkUser) {
      syncUserToSupabase();
      return;
    }

    // 2. On auth entry pages, don't probe sessions (avoids 401 noise)
    if (isAuthRoute) {
      setLoading(false);
      return;
    }

    // 3. Check for admin/OTP cookie sessions immediately — don't wait for Clerk
    const hasAdminCookie = document.cookie.includes("admin_session_active=");
    const hasOtpCookie = document.cookie.includes("otp_session=");

    if (hasAdminCookie || hasOtpCookie) {
      loadCookieSession().catch(() => setLoading(false));
      return;
    }

    // 4. No cookies and Clerk hasn't loaded yet — wait for Clerk
    if (!isLoaded) return;

    // 5. Clerk loaded but user is not signed in and no cookies — anonymous visitor
    setLoading(false);
  }, [isLoaded, isSignedIn, clerkUser, syncUserToSupabase, loadCookieSession, isAuthRoute]);

  const isAuthenticated = !!isSignedIn || !!profile;
  const isAdminOnly = !isSignedIn && !!profile && profile.id === "admin-session" && role === "admin";

  const signOut = async () => {
    setProfile(null);
    setRole("user");
    resolvedRef.current = false;

    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    } catch {
      // Non-fatal
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_session_start");
    }

    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: clerkUser
          ? {
              id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              name: clerkUser.fullName || clerkUser.firstName,
            }
          : profile
          ? { id: profile.id, email: profile.email, name: profile.name }
          : null,
        profile,
        session: isSignedIn ? { user: clerkUser } : profile ? { user: profile } : null,
        loading,
        role,
        signOut,
        logout: signOut,
        isAuthenticated,
        isAdmin: role === "admin",
        isAdminOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
