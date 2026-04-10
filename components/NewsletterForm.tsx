"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subscribeNewsletter } from "@/services/home";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const result = await subscribeNewsletter(email);
      if (result.ok) {
        setStatus("success");
        setMessage(result.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="text-center">
      <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-3">Stay Informed</span>
      <h3 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-3">
        Join Our Newsletter
      </h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-lg mx-auto">
        AI-powered editorial insights, career tips, and platform updates delivered straight to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-lg absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">mail</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-11 pr-5 py-3.5 h-auto rounded-xl bg-surface-container-low border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:ring-primary/50"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-3.5 h-auto bg-linear-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-xl text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      {status === "success" && (
        <p className="mt-4 text-green-400 text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {message}
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-error text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {message}
        </p>
      )}

      <div className="mt-6 flex justify-center gap-6 text-[10px] uppercase tracking-wider text-on-surface-variant">
        <Badge variant="outline" className="border-transparent gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Free forever</Badge>
        <Badge variant="outline" className="border-transparent gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Weekly digest</Badge>
        <Badge variant="outline" className="border-transparent gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Unsubscribe anytime</Badge>
      </div>
    </div>
  );
}
