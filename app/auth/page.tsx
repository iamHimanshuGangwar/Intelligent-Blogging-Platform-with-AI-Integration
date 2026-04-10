"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const nextParam = searchParams.get("next");
  const [showLogin, setShowLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"clerk" | "otp">("clerk");
  // "login" = existing user email+password, "signup" = new user OTP flow
  const [otpSection, setOtpSection] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState<"email" | "verify" | "setPassword">("email");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "confirm">("request");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpName, setOtpName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const nextPath = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setShowLogin(mode !== "signup");
  }, [mode]);

  const completeAuthRedirect = () => {
    if (typeof window !== "undefined") {
      window.location.href = nextPath || "/";
      return;
    }
    router.push(nextPath || "/");
    router.refresh();
  };

  const switchOtpSection = (section: "login" | "signup") => {
    setOtpSection(section);
    setSignupStep("email");
    setShowForgotPassword(false);
    setResetStep("request");
    setOtpEmail("");
    setOtpName("");
    setOtpCode("");
    setPassword("");
    setConfirmPassword("");
    setResetToken("");
    setDevOtp(null);
    setDevResetToken(null);
    setOtpError("");
  };

  const sendOtp = async () => {
    if (!otpName.trim()) { setOtpError("Name is required"); return; }
    if (!otpEmail) { setOtpError("Email is required"); return; }

    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: otpEmail, name: otpName }),
      });

      const data = await response.json();
      if (!response.ok && !data.otp) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setDevOtp(data.otp || null);
      setSignupStep("verify");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpEmail || !otpCode) {
      setOtpError("Email and OTP code are required");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: otpEmail, code: otpCode, name: otpName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      // During sign-up flow, always let users set/update password after OTP verification.
      // This avoids dead-ends when passwordConfigured is already true for reused profiles.
      setSignupStep("setPassword");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const setOtpPassword = async () => {
    if (!password || !confirmPassword) {
      setOtpError("Both password fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setOtpError("Passwords do not match.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/auth/otp/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to set password");
      }

      completeAuthRedirect();
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setOtpLoading(false);
    }
  };

  const loginWithPassword = async () => {
    if (!otpEmail || !password) {
      setOtpError("Email and password are required");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/auth/otp/password/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: otpEmail, password: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Password login failed");
      }

      completeAuthRedirect();
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Password login failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const requestPasswordReset = async () => {
    if (!otpEmail) {
      setOtpError("Email is required");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/auth/otp/password/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to request reset");
      }

      setDevResetToken(data.resetToken || null);
      setResetStep("confirm");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Failed to request reset");
    } finally {
      setOtpLoading(false);
    }
  };

  const confirmPasswordReset = async () => {
    if (!resetToken || !password || !confirmPassword) {
      setOtpError("Reset token, password, and confirmation are required");
      return;
    }

    if (password !== confirmPassword) {
      setOtpError("Passwords do not match");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/auth/otp/password/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Password reset failed");
      }

      setShowForgotPassword(false);
      setResetStep("request");
      setResetToken("");
      setDevResetToken(null);
      setConfirmPassword("");
      setOtpError("Password reset successful. You can now login with your new password.");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Password reset failed");
    } finally {
      setOtpLoading(false);
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
          <Link href="/" className="text-2xl font-extrabold font-headline tracking-tighter bg-linear-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
            AiBlog
          </Link>
          <h2 className="mt-8 text-4xl font-extrabold font-headline tracking-tighter leading-[1.1]">
            Where AI Meets
            <br />
            <span className="text-gradient">Editorial Excellence</span>
          </h2>
          <p className="mt-4 text-on-surface-variant leading-relaxed">
            Join 120K+ creators leveraging generative intelligence to build professional authority and transform their careers.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: "auto_awesome", label: "AI Content Generation" },
              { icon: "timeline", label: "Career Progression" },
              { icon: "groups", label: "Community Network" },
              { icon: "analytics", label: "Deep Insights" },
            ].map((f) => (
              <Card key={f.label} className="bg-surface-container-low/50 border-outline-variant/10">
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="material-symbols-outlined text-primary text-lg">{f.icon}</span>
                  <span className="text-xs font-semibold text-on-surface-variant">{f.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Clerk Sign In / Sign Up toggle */}
          <div className="flex gap-2 mb-3">
            <Button
              onClick={() => setAuthMethod("clerk")}
              variant={authMethod === "clerk" ? "default" : "outline"}
              className="rounded-full px-5"
              size="sm"
            >
              Google / Clerk
            </Button>
            <Button
              onClick={() => setAuthMethod("otp")}
              variant={authMethod === "otp" ? "default" : "outline"}
              className="rounded-full px-5"
              size="sm"
            >
              Email Login
            </Button>
          </div>

          {authMethod === "clerk" && (
            <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setShowLogin(true)}
              variant={showLogin ? "default" : "outline"}
              className={`rounded-full px-6 ${showLogin ? "shadow-lg shadow-primary/20" : ""}`}
              size="sm"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setShowLogin(false)}
              variant={!showLogin ? "default" : "outline"}
              className={`rounded-full px-6 ${!showLogin ? "shadow-lg shadow-primary/20" : ""}`}
              size="sm"
            >
              Sign Up
            </Button>
            </div>
          )}

          {authMethod === "clerk" && showLogin ? (
            mounted ? (
              <SignIn
                appearance={{
                  baseTheme: dark,
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none",
                    card: "bg-surface-container-low border border-outline-variant/20 shadow-none",
                  },
                }}
                routing="hash"
                forceRedirectUrl={nextPath}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <Skeleton className="h-8 w-48" />
              </div>
            )
          ) : authMethod === "clerk" ? (
            mounted ? (
              <SignUp
                appearance={{
                  baseTheme: dark,
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none",
                    card: "bg-surface-container-low border border-outline-variant/20 shadow-none",
                  },
                }}
                routing="hash"
                forceRedirectUrl={nextPath}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <Skeleton className="h-8 w-48" />
              </div>
            )
          ) : (
            <Card className="w-full bg-surface-container-low border-outline-variant/20">
              <CardContent className="p-6 space-y-4">

                {/* Header */}
                <div className="text-center">
                  <h3 className="text-lg font-bold">
                    {otpSection === "signup" ? "Create Account" : "Login"}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {otpSection === "signup"
                      ? "Sign up with name, email and OTP verification"
                      : "Sign in with your email and password"}
                  </p>
                </div>

                {/* Login / Create Account tabs */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={otpSection === "login" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => switchOtpSection("login")}
                  >
                    Login
                  </Button>
                  <Button
                    type="button"
                    variant={otpSection === "signup" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => switchOtpSection("signup")}
                  >
                    Create Account
                  </Button>
                </div>

                {/* Error */}
                {otpError && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {otpError}
                  </div>
                )}

                {/* ── SIGNUP FLOW ── */}
                {otpSection === "signup" && (
                  <div className="space-y-3">
                    {signupStep === "email" && (
                      <>
                        <Input
                          type="text"
                          value={otpName}
                          onChange={(e) => setOtpName(e.target.value)}
                          placeholder="Your full name"
                        />
                        <Input
                          type="email"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="Enter your email"
                        />
                        <Button onClick={sendOtp} disabled={otpLoading} className="w-full">
                          {otpLoading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                        <p className="text-center text-xs text-on-surface-variant">
                          Already have an account?{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => switchOtpSection("login")}
                          >
                            Login here
                          </button>
                        </p>
                      </>
                    )}

                    {signupStep === "verify" && (
                      <>
                        <p className="text-xs text-on-surface-variant text-center">
                          OTP sent to <span className="text-on-surface font-medium">{otpEmail}</span>
                        </p>
                        <Input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP from your email"
                          maxLength={6}
                        />
                        {devOtp && (
                          <p className="text-[11px] text-yellow-300">Dev OTP: {devOtp}</p>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={verifyOtp} disabled={otpLoading} className="flex-1">
                            {otpLoading ? "Verifying..." : "Verify OTP"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setSignupStep("email"); setOtpCode(""); setDevOtp(null); setOtpError(""); }}
                            disabled={otpLoading}
                          >
                            ← Back
                          </Button>
                        </div>
                      </>
                    )}

                    {signupStep === "setPassword" && (
                      <>
                        <p className="text-xs text-on-surface-variant text-center">
                          OTP verified! Set a password to complete your account.
                        </p>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                        />
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                        />
                        <Button onClick={setOtpPassword} disabled={otpLoading} className="w-full">
                          {otpLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* ── LOGIN FLOW ── */}
                {otpSection === "login" && !showForgotPassword && (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <Button onClick={loginWithPassword} disabled={otpLoading} className="w-full">
                      {otpLoading ? "Signing in..." : "Login"}
                    </Button>
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => { setShowForgotPassword(true); setOtpError(""); }}
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        className="text-on-surface-variant hover:text-primary hover:underline"
                        onClick={() => switchOtpSection("signup")}
                      >
                        Create account
                      </button>
                    </div>
                  </div>
                )}

                {/* ── FORGOT PASSWORD FLOW ── */}
                {otpSection === "login" && showForgotPassword && (
                  <div className="space-y-3">
                    <p className="text-xs text-on-surface-variant text-center">
                      {resetStep === "request"
                        ? "Enter your email to receive a password reset token."
                        : "Enter the reset token from your email and your new password."}
                    </p>

                    {resetStep === "request" && (
                      <>
                        <Input
                          type="email"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="Enter your email"
                        />
                        <Button onClick={requestPasswordReset} disabled={otpLoading} className="w-full">
                          {otpLoading ? "Sending..." : "Send Reset Token"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => { setShowForgotPassword(false); setOtpError(""); }}
                        >
                          ← Back to Login
                        </Button>
                      </>
                    )}

                    {resetStep === "confirm" && (
                      <>
                        <Input
                          type="text"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          placeholder="Enter reset token from email"
                        />
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="New password"
                        />
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        {devResetToken && (
                          <p className="text-[11px] text-emerald-300">Dev reset token: {devResetToken}</p>
                        )}
                        <Button onClick={confirmPasswordReset} disabled={otpLoading} className="w-full">
                          {otpLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => { setResetStep("request"); setOtpError(""); }}
                        >
                          ← Back
                        </Button>
                      </>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center text-sm text-on-surface-variant">
            <p>Admin?{" "}
            <Link href="/admin/login" className="text-primary hover:underline font-semibold">
              Access Admin Portal
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
