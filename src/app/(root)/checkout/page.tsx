"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CheckoutHero from "@/components/checkout/checkout-hero";
import { createClient } from "@/lib/supabase/client";
import { IndianRupee, Loader2, Coins, Sparkles, Zap, Crown, Lock } from "lucide-react";

// Payment method is fetched from API (set in Admin → Settings)

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_inr: number;
  credits: number | null;
}

const planIcons: Record<string, React.ElementType> = {
  starter: Zap,
  popular: Sparkles,
  "premium-pack": Crown,
};

function CheckoutContent() {

  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan");
  const planIdParam = searchParams.get("plan_id");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi_qr">("razorpay");
  const [upiOrder, setUpiOrder] = useState<{
    orderId: string;
    upiUrl: string;
    qrDataUrl: string | null;
    amount: number;
    credits: number;
    merchantName: string;
  } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvePlan = useCallback(async () => {
    const supabase = createClient();
    if (planIdParam) {
      const { data } = await supabase
        .from("plans")
        .select("id, name, slug, description, price_inr, credits")
        .eq("id", planIdParam)
        .eq("is_active", true)
        .single();
      return { selected: data as Plan | null, all: [] as Plan[] };
    }
    if (planSlug) {
      const { data } = await supabase
        .from("plans")
        .select("id, name, slug, description, price_inr, credits")
        .eq("slug", planSlug)
        .eq("is_active", true)
        .single();
      return { selected: data as Plan | null, all: [] as Plan[] };
    }
    // No specific plan — load all active plans
    const { data } = await supabase
      .from("plans")
      .select("id, name, slug, description, price_inr, credits")
      .eq("is_active", true)
      .gt("price_inr", 0)
      .order("display_order", { ascending: true });
    return { selected: null, all: (data ?? []) as Plan[] };
  }, [planIdParam, planSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) {
          window.location.href = `/sign-in?next=${encodeURIComponent("/checkout" + (planSlug ? `?plan=${planSlug}` : planIdParam ? `?plan_id=${planIdParam}` : ""))}`;
          return;
        }
        const [result, methodRes] = await Promise.all([
          resolvePlan(),
          fetch("/api/settings/payment-method").then((r) => r.json()),
        ]);
        if (!cancelled && methodRes?.method) setPaymentMethod(methodRes.method === "upi_qr" ? "upi_qr" : "razorpay");
        if (!cancelled) {
          if (result.selected) {
            setPlan(result.selected);
          } else if (result.all.length > 0) {
            setAllPlans(result.all);
            // Don't auto-select; let user choose
          } else {
            setError("No credit packs available.");
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load plans.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvePlan, planSlug, planIdParam]);

  const startRazorpay = useCallback(
    async (order: {
      razorpayOrderId: string;
      key: string;
      amount: number;
      currency: string;
      paymentId: string;
      credits: number;
    }) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      await new Promise<void>((res, rej) => {
        script.onload = () => res();
        script.onerror = () => rej(new Error("Razorpay script failed"));
      });

      const Razorpay = (window as unknown as { Razorpay: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, h: () => void) => void } }).Razorpay;
      if (!Razorpay) {
        setError("Razorpay not available.");
        return;
      }

      const options = {
        key: order.key,
        amount: order.amount * 100,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Prime Group",
        description: `${order.credits} credits`,
        handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          setPayLoading(true);
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              }),
            });
            const data = await verifyRes.json();
            if (verifyRes.ok && data.success) {
              window.location.href = "/checkout/success";
            } else {
              setError(data.error || "Verification failed.");
            }
          } catch {
            setError("Verification failed.");
          } finally {
            setPayLoading(false);
          }
        },
      };
      const rzp = new Razorpay(options);
      rzp.on("payment.failed", () => setError("Payment failed or was cancelled."));
      rzp.open();
    },
    []
  );

  const handlePay = useCallback(async (selectedPlan?: Plan) => {
    const targetPlan = selectedPlan || plan;
    if (!targetPlan) return;
    setPayLoading(true);
    setError(null);
    setUpiOrder(null);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: targetPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create order");
        return;
      }
      if (data.method === "razorpay" || paymentMethod === "razorpay") {
        await startRazorpay({
          razorpayOrderId: data.razorpayOrderId,
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          paymentId: data.paymentId,
          credits: data.credits ?? 0,
        });
      } else if (data.method === "upi_qr" || paymentMethod === "upi_qr") {
        setUpiOrder({
          orderId: data.orderId,
          upiUrl: data.upiUrl,
          qrDataUrl: data.qrDataUrl ?? null,
          amount: data.amount,
          credits: data.credits ?? 0,
          merchantName: data.merchantName ?? "Prime Group",
        });
      } else {
        setError("Unknown payment method");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setPayLoading(false);
    }
  }, [plan, startRazorpay, paymentMethod]);

  // Poll for UPI payment status
  useEffect(() => {
    if (!upiOrder) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?orderId=${encodeURIComponent(upiOrder.orderId)}`);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          window.location.href = "/checkout/success";
        }
      } catch {
        // ignore
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [upiOrder]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
        <CheckoutHero subtitle="Loading credit packs…" />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#003366]" aria-hidden />
          <p className="font-general text-sm text-[#003366]/60">Please wait</p>
        </div>
      </div>
    );
  }

  if (error && !plan && allPlans.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
        <CheckoutHero />
        <div className="container max-w-lg mx-auto px-4 py-12">
          <div
            className="rounded-[2rem] border-2 p-8 text-center shadow-lg"
            style={{ borderColor: "rgba(226, 194, 133, 0.4)", backgroundColor: "var(--pure-white)" }}
          >
            <p className="font-general text-red-600 mb-6">{error}</p>
            <Button asChild className="rounded-2xl h-12 px-8 bg-gold-gradient text-[#001a33] font-bold border-none hover:scale-[1.02] transition-transform">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Multi-plan selection view (no plan pre-selected)
  if (!plan && allPlans.length > 0 && !upiOrder) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
        <CheckoutHero subtitle="Pick the pack that fits how many profiles you want to connect with." />
        <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="container max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {allPlans.map((p) => {
                const Icon = planIcons[p.slug] || Coins;
                const isPopular = p.slug === "popular";
                return (
                  <div
                    key={p.id}
                    className={`relative rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-7 md:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      isPopular ? "ring-2 ring-[#E2C285]/70 shadow-[0_20px_50px_rgba(226,194,133,0.2)]" : "shadow-[0_12px_40px_rgba(0,51,102,0.08)] hover:shadow-[0_16px_48px_rgba(0,51,102,0.12)]"
                    }`}
                    style={{
                      border: isPopular ? "2px solid rgba(226, 194, 133, 0.55)" : "2px solid rgba(226, 194, 133, 0.22)",
                      backgroundColor: "var(--pure-white)",
                    }}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-5 py-1.5 rounded-full text-[10px] font-black font-general uppercase tracking-[0.2em] text-[#001a33] bg-gold-gradient shadow-lg">
                          Best value
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#003366] shrink-0">
                        <Icon className="w-6 h-6 text-[#E2C285]" />
                      </div>
                      <h3 className="text-xl font-playfair-display font-black text-[#003366] tracking-tight">{p.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <Coins className="w-6 h-6 text-[#E2C285] shrink-0" />
                      <span className="text-2xl sm:text-3xl font-general font-black text-[#003366] tabular-nums">{(p.credits ?? 0).toLocaleString()}</span>
                      <span className="text-sm font-general font-medium text-[#003366]/65">credits</span>
                    </div>

                    <p className="font-general text-xl sm:text-2xl font-bold text-[#003366] mb-1 tabular-nums">₹{p.price_inr.toLocaleString()}</p>

                    {p.description && (
                      <p className="text-sm font-general text-[#003366]/70 mb-6 flex-1 leading-relaxed">{p.description}</p>
                    )}

                    <Button
                      className={`w-full h-14 py-6 font-bold rounded-2xl border-none transition-all duration-300 hover:scale-[1.02] font-general text-sm uppercase tracking-widest ${
                        isPopular
                          ? "bg-gold-gradient text-[#001a33] shadow-[0_0_24px_rgba(226,194,133,0.35)]"
                          : "bg-[#003366] text-white hover:bg-[#00264d]"
                      }`}
                      onClick={() => handlePay(p)}
                      disabled={payLoading}
                    >
                      {payLoading ? (
                        <span className="inline-flex items-center gap-2 normal-case tracking-normal">
                          <Loader2 className="w-5 h-5 animate-spin" /> Processing…
                        </span>
                      ) : (
                        `Buy ${(p.credits ?? 0).toLocaleString()} credits`
                      )}
                    </Button>

                    <p className="text-center text-xs font-general mt-3 text-[#003366]/45">
                      ₹{((p.credits ?? 1) > 0 ? (p.price_inr / (p.credits ?? 1)).toFixed(2) : "0")} per credit
                    </p>
                  </div>
                );
              })}
            </div>

            {error && <p className="font-general text-sm text-red-600 text-center mt-8">{error}</p>}

            <p className="text-center mt-10">
              <Link href="/" className="font-general text-sm font-medium text-[#003366]/70 hover:text-[#E2C285] transition-colors underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
      <CheckoutHero
        subtitle={
          upiOrder
            ? "Complete your UPI payment. We’ll add credits when payment is confirmed."
            : "Review your pack and pay securely. Credits appear in your account right after a successful payment."
        }
      />

      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container max-w-lg mx-auto">
          {!upiOrder ? (
            <div
              className="rounded-[2rem] border-2 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,51,102,0.1)] mb-8"
              style={{ borderColor: "rgba(226, 194, 133, 0.4)", backgroundColor: "var(--pure-white)" }}
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-[#003366] flex items-center justify-center shrink-0">
                  <Coins className="h-7 w-7 text-[#E2C285]" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#003366]/45 font-general mb-1">
                    Your pack
                  </p>
                  <h2 className="font-playfair-display text-xl sm:text-2xl md:text-3xl font-black text-[#003366] tracking-tight">
                    {plan?.name ?? "Plan"}
                  </h2>
                </div>
              </div>

              {plan?.description && (
                <p className="font-general text-sm text-[#003366]/75 leading-relaxed mb-8">{plan.description}</p>
              )}

              <div className="rounded-2xl bg-[#003366]/[0.04] border border-[#003366]/10 p-6 mb-8">
                <div className="flex flex-wrap items-end gap-2 gap-y-1">
                  <IndianRupee className="w-7 h-7 text-[#E2C285] mb-1" aria-hidden />
                  <span className="text-2xl sm:text-3xl md:text-4xl font-general font-black text-[#003366] tabular-nums">
                    {plan?.price_inr?.toLocaleString() ?? 0}
                  </span>
                  <span className="text-lg font-general font-semibold text-[#003366]/55 pb-1">INR</span>
                </div>
                <p className="font-general text-lg font-bold text-[#003366] mt-3">
                  {(plan?.credits ?? 0).toLocaleString()} credits
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-general text-[#003366]/55">
                  <Lock className="w-4 h-4 text-[#E2C285]/80 shrink-0" aria-hidden />
                  Payment via {paymentMethod === "upi_qr" ? "UPI (QR)" : "Razorpay"} — encrypted checkout
                </div>
              </div>

              {error && <p className="font-general text-sm text-red-600 mb-4">{error}</p>}

              <Button
                className="w-full h-14 rounded-2xl bg-gold-gradient text-[#001a33] font-bold text-base shadow-[0_0_28px_rgba(226,194,133,0.35)] hover:shadow-[0_0_40px_rgba(226,194,133,0.45)] hover:scale-[1.02] transition-all border-none font-general"
                onClick={() => handlePay()}
                disabled={payLoading}
              >
                {payLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing…
                  </span>
                ) : (
                  "Pay now"
                )}
              </Button>
            </div>
          ) : (
            <div
              className="rounded-[2rem] border-2 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,51,102,0.1)] mb-8"
              style={{ borderColor: "rgba(226, 194, 133, 0.4)", backgroundColor: "var(--pure-white)" }}
            >
              <h2 className="font-playfair-display text-2xl font-black text-[#003366] mb-2">Pay with UPI</h2>
              <p className="font-general text-sm text-[#003366]/70 mb-6">
                Amount <strong className="text-[#003366]">₹{upiOrder.amount.toLocaleString()}</strong>
                {" · "}
                <strong className="text-[#003366]">{upiOrder.credits}</strong> credits
              </p>
              {upiOrder.qrDataUrl ? (
                <div className="flex justify-center p-5 bg-white rounded-2xl border-2 border-[#E2C285]/25 mb-6">
                  <img src={upiOrder.qrDataUrl} alt="UPI QR code to complete payment" width={280} height={280} className="rounded-lg" />
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#003366]/[0.04] border border-[#003366]/10 font-general text-sm break-all mb-6">
                  <p className="font-semibold text-[#003366] mb-2">Open in your UPI app</p>
                  <a href={upiOrder.upiUrl} className="text-[#003366] underline decoration-[#E2C285] underline-offset-2 hover:text-[#E2C285]">
                    {upiOrder.upiUrl}
                  </a>
                </div>
              )}
              <p className="font-general text-xs text-[#003366]/55 mb-6 leading-relaxed">
                After you pay, we verify and add credits. This page refreshes when done—or check your balance in a few minutes.
              </p>
              <p className="flex items-center justify-center gap-2 font-general text-sm text-[#003366]/75 mb-4" role="status" aria-live="polite">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#E2C285]" aria-hidden />
                Checking payment status every few seconds…
              </p>
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl border-2 border-[#003366]/20 text-[#003366] font-semibold hover:bg-[#003366]/5"
                onClick={() => setUpiOrder(null)}
              >
                Cancel
              </Button>
            </div>
          )}

          <p className="text-center">
            <Link
              href="/"
              className="font-general text-sm font-medium text-[#003366]/65 hover:text-[#E2C285] transition-colors underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }}>
          <div className="h-40 bg-[#003366] animate-pulse" />
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#003366]" aria-hidden />
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
