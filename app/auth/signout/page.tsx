"use client";

/**
 * /auth/signout — Sign-out landing page.
 *
 * Calls the unified /api/auth/signout route (plain HTTP, no Server Actions).
 * Works for Clerk users, OTP users, and admin users.
 */

import { useEffect } from "react";

export default function SignOutPage() {
  useEffect(() => {
    localStorage.removeItem("admin_session_start");

    fetch("/api/auth/signout", { method: "POST", credentials: "include" })
      .finally(() => {
        window.location.replace("/");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm">Signing out…</p>
      </div>
    </div>
  );
}

