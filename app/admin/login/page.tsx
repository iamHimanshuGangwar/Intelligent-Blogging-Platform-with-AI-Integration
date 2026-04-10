"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const publicAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (publicAdminEmail) {
      setEmail(publicAdminEmail);
    }
  }, [publicAdminEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Admin login failed");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_session_start", Date.now().toString());
      }

      const nextPath = searchParams.get("next");
      // Full page reload ensures fresh cookie state and AuthContext re-initialization
      window.location.href = nextPath || "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-secondary/5 items-center justify-center p-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-100 h-100 bg-primary/8 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-75 h-75 bg-secondary/6 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-md">
          <Link
            href="/"
            className="text-2xl font-extrabold font-headline tracking-tighter bg-linear-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent"
          >
            AiBlog
          </Link>
          <h2 className="mt-8 text-4xl font-extrabold font-headline tracking-tighter leading-[1.1]">
            Administrator
            <br />
            <span className="text-gradient">Dashboard Portal</span>
          </h2>
          <p className="mt-4 text-on-surface-variant leading-relaxed">
            Secure access to AiBlog administration panel. Manage users, posts, analytics, and system-wide settings.
          </p>
          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">shield</span>
              <span className="text-sm">Secure admin-only access</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">dashboard</span>
              <span className="text-sm">Full system control</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <span className="text-sm">Real-time analytics</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">person</span>
              <span className="text-sm">User management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Admin Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Admin Login</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Access restricted to administrators only
            </p>
            {publicAdminEmail && (
              <Badge variant="outline" className="mt-4">
                Required Email: {publicAdminEmail}
              </Badge>
            )}
          </div>

          <Card className="w-full bg-surface-container-low border-outline-variant/20">
            <CardContent className="p-8">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={publicAdminEmail || "Enter admin email"}
                    className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 h-12 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                    Admin Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 h-12 rounded-xl"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold">
                  {loading ? "Signing in..." : "Login to Admin Panel"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-on-surface-variant flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">
                lock
              </span>
              <span>
                Access to this page is restricted to administrators only. All login attempts are logged for security purposes.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
