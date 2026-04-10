import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/editor(.*)",
  "/admin(.*)",
  "/api/posts(.*)",
]);

const isAuthEntryRoute = createRouteMatcher([
  "/auth(.*)",
  "/admin/login(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip redirects for API routes and static assets
  if (req.nextUrl.pathname.startsWith("/api") || req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Keep auth entry pages accessible without forced redirects.
  if (isAuthEntryRoute(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    const otpSessionToken = req.cookies.get("otp_session_token")?.value;
    const adminSessionToken = req.cookies.get("admin_session_token")?.value;

    // ── Admin cookie holder ──────────────────────────────────────────────
    if (adminSessionToken) {
      // Admin cookie grants access to admin routes unconditionally
      if (isAdminRoute(req)) {
        return NextResponse.next();
      }
      // Admin cookie also grants access to the editor (create/edit posts)
      if (req.nextUrl.pathname.startsWith("/editor")) {
        return NextResponse.next();
      }
      // For non-admin protected routes (/dashboard, etc.):
      // Check if they also have an OTP or Clerk session — if so, let them through.
      if (otpSessionToken) {
        return NextResponse.next();
      }
      const { userId } = await auth();
      if (userId) {
        return NextResponse.next(); // dual auth: Clerk + admin cookie
      }
      // Admin-only session trying to access /dashboard → redirect to /admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // ── OTP session holder ───────────────────────────────────────────────
    if (otpSessionToken) {
      // OTP grants access to non-admin protected routes
      if (!isAdminRoute(req)) {
        return NextResponse.next();
      }
      // OTP user trying to access /admin — needs role check via DB
      // Fall through to Clerk auth check below
    }

    // ── Clerk-based auth ─────────────────────────────────────────────────
    const { userId } = await auth();

    if (!userId && !otpSessionToken && !adminSessionToken) {
      if (isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      const authUrl = new URL("/auth", req.url);
      authUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(authUrl);
    }

    // Role check for admin routes (Clerk users or OTP users trying /admin/*)
    if (isAdminRoute(req)) {
      let userRole = "user";

      try {
        if (userId) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();
          userRole = profile?.role || "user";
        } else if (otpSessionToken) {
          // OTP user — check role in DB
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { data: session } = await supabase
            .from("otp_sessions")
            .select("user_id")
            .eq("session_token", otpSessionToken)
            .single();
          if (session?.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user_id)
              .single();
            userRole = profile?.role || "user";
          }
        }
      } catch (error) {
        console.error("Profile check failed:", error);
      }

      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
