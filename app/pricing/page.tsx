"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/NavBar";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => {
      open: () => void;
    };
  }
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features?: string[];
}

interface CurrentSubscription {
  plan_id?: string;
  subscription_plans?: SubscriptionPlan | null;
}

function PricingPageContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1); // Default to Professional
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const selectedPlanParam = searchParams.get("plan")?.toLowerCase() || "professional";

  useEffect(() => {
    if (selectedPlanParam.includes("contributor")) {
      setSelectedTier(0);
      return;
    }
    if (selectedPlanParam.includes("leader") || selectedPlanParam.includes("elite")) {
      setSelectedTier(2);
      return;
    }
    setSelectedTier(1);
  }, [selectedPlanParam]);

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        const plansRes = await fetch("/api/subscriptions?plansOnly=true", {
          credentials: "include",
        });

        if (plansRes.ok) {
          const data = await plansRes.json();
          if (isMounted) {
            setPlans(data.plans || []);
          }
        }

        if (isAuthenticated) {
          const currentRes = await fetch("/api/subscriptions", {
            credentials: "include",
          });

          if (currentRes.ok) {
            const data = await currentRes.json();
            if (isMounted) {
              setCurrentSubscription(data.subscription || null);
            }
          }
        } else if (isMounted) {
          setCurrentSubscription(null);
        }
      } catch (error) {
        if (isMounted) {
          setActionError(error instanceof Error ? error.message : "Unable to load plans right now.");
        }
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const tiers = useMemo(() => [
    {
      id: 0,
      planName: "Contributor",
      name: "The Contributor",
      description: "Perfect for starting the digital narrative.",
      price: "₹0",
      annualPrice: "₹0",
      period: "/MO",
      features: [
        "Basic AI assistance",
        "3 posts per month",
        "Community access",
      ],
      cta: "START FREE",
      popular: false,
      successHref: "/editor",
    },
    {
      id: 1,
      planName: "Professional",
      name: "The Professional",
      description: "For serious writers building a lasting brand.",
      price: "₹299",
      annualPrice: "₹999",
      period: "/MO",
      badge: "BEST FOR YOU",
      features: [
        "Advanced AI editing tools",
        "Unlimited monthly posts",
        "Career tracking insights",
        "Real-time analytics dashboard",
      ],
      cta: "GET PRO ACCESS",
      popular: true,
      successHref: "/dashboard",
    },
    {
      id: 2,
      planName: "Elite",
      name: "The Thought Leader",
      description: "The ultimate ecosystem for industry authorities.",
      price: "₹699",
      annualPrice: "₹1,599",
      period: "/MO",
      features: [
        "Priority AI generation queue",
        "Custom SEO strategy engine",
        "1-1 mentor sessions",
        "Full API developer access",
      ],
      cta: "GO ELITE",
      popular: false,
      successHref: "/inner-circle/join",
    },
  ], []);

  const formatINR = (amount: number) =>
    amount === 0 ? '₹0' : `₹${amount.toLocaleString('en-IN')}`;

  const tiersWithPlanIds = useMemo(() => (
    tiers.map((tier) => {
      const matchedPlan = plans.find((plan) => plan.name.toLowerCase() === tier.planName.toLowerCase());
      return {
        ...tier,
        planId: matchedPlan?.id,
        priceNumeric: matchedPlan ? Number(matchedPlan.price_monthly) : 0,
        price: matchedPlan ? formatINR(Number(matchedPlan.price_monthly)) : tier.price,
        annualPrice: matchedPlan ? formatINR(Number(matchedPlan.price_annual)) : tier.annualPrice,
        features: matchedPlan?.features?.length ? matchedPlan.features : tier.features,
      };
    })
  ), [plans, tiers]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlanAction = async (tierId: number) => {
    const tier = tiersWithPlanIds.find((item) => item.id === tierId);

    if (!tier) {
      return;
    }

    setSelectedTier(tierId);
    setActionError("");

    if (!isAuthenticated) {
      const targetPlan = tier.planName.toLowerCase();
      router.push(`/auth?next=${encodeURIComponent(`/pricing?plan=${targetPlan}`)}`);
      return;
    }

    if (tier.planName === "Contributor") {
      router.push(tier.successHref);
      return;
    }

    if (!tier.planId) {
      setActionError("Subscription plans are not available yet. Please run the latest database migrations.");
      return;
    }

    if (currentSubscription?.plan_id === tier.planId) {
      router.push(tier.successHref);
      return;
    }

    try {
      setActionLoading(tierId);

      const isPaidPlan = (tier.priceNumeric ?? 0) > 0;

      let paymentPayload: Record<string, any> = {};
      if (isPaidPlan) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error("Unable to load Razorpay checkout. Please try again.");
        }

        const orderResponse = await fetch("/api/payments/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            planId: tier.planId,
            billingCycle: isAnnual ? "annual" : "monthly",
          }),
        });

        const orderData = await orderResponse.json();
        if (!orderResponse.ok) {
          if (orderResponse.status === 503) {
            throw new Error("Payment gateway is not configured yet. Please contact support.");
          }
          if (orderResponse.status === 404) {
            throw new Error("Subscription plan not found. Please refresh the page and try again.");
          }
          throw new Error(orderData.error || "Failed to create payment order.");
        }

        const paymentResult = await new Promise<{
          orderId: string;
          paymentId: string;
          signature: string;
        }>((resolve, reject) => {
          const RazorpayCtor = window.Razorpay;
          if (!RazorpayCtor) {
            reject(new Error("Razorpay checkout is unavailable."));
            return;
          }

          const razorpay = new RazorpayCtor({
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "AiBlog",
            description: `${tier.planName} plan (${isAnnual ? "Annual" : "Monthly"})`,
            order_id: orderData.order.id,
            prefill: {},
            theme: { color: "#2563eb" },
            handler: (response: any) => {
              resolve({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
            },
            modal: {
              ondismiss: () => reject(new Error("Payment cancelled.")),
            },
          });

          razorpay.open();
        });

        const verifyResponse = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...paymentResult,
            userId: undefined, // resolved server-side from session
            planId: tier.planId,
            amount: orderData.amount,
            currency: 'INR',
          }),
        });

        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok || !verifyData.valid) {
          throw new Error(verifyData.error || "Payment verification failed.");
        }

        paymentPayload = {
          paymentMethod: "razorpay",
          paymentProvider: "razorpay",
          paymentOrderId: paymentResult.orderId,
          paymentTransactionId: paymentResult.paymentId,
        };
      }

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: tier.planId,
          billingCycle: isAnnual ? "annual" : "monthly",
          ...paymentPayload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update subscription.");
      }

      setCurrentSubscription(data);
      router.push(tier.successHref);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update subscription.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 30%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(59,130,246,0.12), transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-32 pb-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-bold mb-3">Pricing Plans</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-headline tracking-tighter mb-5 text-on-surface leading-[0.95]">
            Elevate Your
            <br />
            <span className="bg-linear-to-r from-blue-400 via-violet-400 to-blue-500 bg-clip-text text-transparent">Editorial Authority</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl mx-auto mb-10 text-base">
            AI-powered writing, 100+ themes, career tools, and community — choose the plan that fits your ambitions.
          </p>

          <p className="text-xs text-on-surface-variant/80 mb-4">
            All prices in INR (₹) &mdash; Pay via UPI, Cards, Net Banking & more with Razorpay.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 border border-white/10 bg-surface-container/50 backdrop-blur-sm px-5 py-2.5">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${!isAnnual ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>Monthly</span>
            <button onClick={() => setIsAnnual(!isAnnual)} className={`relative w-12 h-6 transition-colors ${isAnnual ? 'bg-primary' : 'bg-surface-container-high'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isAnnual ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>Annual</span>
            {isAnnual && <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 border border-emerald-500/20">SAVE 25%</span>}
          </div>

          {actionError && (
            <p className="mt-4 mx-auto max-w-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{actionError}</p>
          )}
        </div>
      </section>

      {/* ─── Pricing Cards ─── */}
      <section className="relative mt-0 px-4 sm:px-8 pb-20 pt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          {tiersWithPlanIds.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const isCurrentPlan = currentSubscription?.plan_id === tier.planId;
            const displayPrice = isAnnual ? tier.annualPrice : tier.price;
            const displayPeriod = isAnnual ? "/yr" : tier.period;

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative overflow-hidden transition-all cursor-pointer group border ${
                  isSelected || tier.popular
                    ? 'border-primary/40 bg-[linear-gradient(170deg,rgba(59,130,246,0.08),transparent_60%)] shadow-lg shadow-primary/10'
                    : 'border-white/8 bg-surface-container/30 hover:border-white/15'
                } ${tier.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-[0.2em] text-center py-1.5">{tier.badge}</div>
                )}
                {isSelected && !tier.badge && (
                  <div className="bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] text-center py-1.5">SELECTED</div>
                )}

                <div className="p-7">
                  <h3 className="text-xl font-extrabold font-headline text-on-surface mb-1">{tier.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-6">{tier.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold font-headline text-on-surface">{displayPrice}</span>
                    <span className="text-xs text-on-surface-variant uppercase">{displayPeriod}</span>
                  </div>

                  <Button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); void handlePlanAction(tier.id); }}
                    disabled={actionLoading === tier.id}
                    className={`w-full mb-7 font-bold py-5 text-xs uppercase tracking-[0.15em] transition-all ${
                      isSelected || tier.popular
                        ? 'bg-primary text-on-primary-fixed hover:opacity-90'
                        : 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary-fixed'
                    }`}
                  >
                    {actionLoading === tier.id ? 'Processing...' : isCurrentPlan ? 'Current Plan' : tier.cta}
                  </Button>

                  <div className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-sm text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="text-sm text-on-surface-variant">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Compare Capabilities ─── */}
      <section className="px-4 sm:px-8 py-20 border-t border-white/5 bg-[linear-gradient(180deg,rgba(59,130,246,0.03),transparent_50%)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-bold text-center mb-3">Feature Matrix</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface text-center mb-12">Compare Capabilities</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Feature</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Contributor</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Professional</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Thought Leader</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Monthly Posts", c: "3", p: "Unlimited", l: "Unlimited" },
                  { label: "AI Writing Assistant", c: "Basic", p: "Advanced", l: "Priority Queue" },
                  { label: "Blog Themes", c: "10 Built-in", p: "100+ Templates", l: "100+ + Custom" },
                  { label: "Media Storage", c: "1 GB", p: "5 GB", l: "Enterprise" },
                  { label: "Collaboration", c: false, p: true, l: true },
                  { label: "Career Dashboard", c: false, p: true, l: true },
                  { label: "Analytics", c: "Basic", p: "Full Dashboard", l: "Full + Export" },
                  { label: "SEO Tools", c: false, p: true, l: true },
                  { label: "Portfolio Builder", c: false, p: true, l: true },
                  { label: "Resume Builder", c: false, p: true, l: true },
                  { label: "Inner Circle Access", c: false, p: false, l: true },
                  { label: "API Access", c: false, p: false, l: true },
                  { label: "1-on-1 Mentoring", c: false, p: false, l: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4 text-sm text-on-surface font-medium">{row.label}</td>
                    {[row.c, row.p, row.l].map((val, colIdx) => (
                      <td key={colIdx} className={`py-3 px-4 text-center text-sm ${colIdx === 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {typeof val === 'boolean' ? (
                          val ? <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            : <span className="text-on-surface-variant/30">—</span>
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 sm:px-8 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-bold text-center mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface text-center mb-12">Common Questions</h2>

          <div className="space-y-3">
            {[
              { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade at any time. Changes are reflected immediately in your dashboard and billing adjusts on the next cycle." },
              { q: "Is there a free trial?", a: "New users can explore Professional features for 14 days at no cost. No credit card required." },
              { q: "Do I own my AI-generated content?", a: "Absolutely. All content created on AiBlog is 100% owned by you. We never claim rights to your work." },
              { q: "What happens if I cancel?", a: "Your content stays accessible. You&apos;ll revert to Contributor tier features but can export all your posts and data." },
              { q: "Can teams share a plan?", a: "Team and enterprise plans with shared workspaces are coming soon. Contact us for early access." },
            ].map((item, idx) => (
              <details key={idx} className="group border border-white/8 bg-surface-container/30 p-5 cursor-pointer hover:border-white/15 transition-colors">
                <summary className="font-bold text-on-surface text-sm flex items-center justify-between">
                  {item.q}
                  <span className="material-symbols-outlined text-primary text-base group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04), transparent)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter text-on-surface mb-4">Start Writing Today</h2>
          <p className="text-on-surface-variant mb-8">No credit card required. Instant activation. Upgrade when you&apos;re ready.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={() => void handlePlanAction(selectedTier)}
              className="px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] bg-primary text-on-primary-fixed hover:opacity-90"
            >
              {actionLoading === selectedTier ? 'Processing...' : 'Start Your Free Trial'}
            </Button>
            <Button asChild variant="outline" className="px-8 py-5 text-xs font-bold uppercase tracking-[0.15em] border-white/15 text-on-surface hover:bg-white/5">
              <Link href="/contact">Contact Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PricingPageContent />
    </Suspense>
  );
}
