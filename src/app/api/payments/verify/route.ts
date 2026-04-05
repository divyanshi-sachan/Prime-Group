import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { paymentConfig, getPaymentMethodFromDb } from "@/lib/payment/config";
import { isPaymentsComingSoon } from "@/lib/payment/payments-coming-soon";
import crypto from "crypto";
import Razorpay from "razorpay";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

/**
 * Access: **public_hmac** — no user session. Credits are updated only after Razorpay signature
 * verification (shared secret). Do not gate with member auth; see `@/lib/api-route-access`.
 */
export async function POST(req: Request) {
  if (isPaymentsComingSoon()) {
    return NextResponse.json(
      { error: "Payments are not available yet.", success: false },
      { status: 503 }
    );
  }
  const supabase = createServiceRoleClient();
  const method = await getPaymentMethodFromDb(supabase);
  if (method !== "razorpay") {
    return NextResponse.json({ error: "Razorpay verify not applicable" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = body as { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "razorpay_order_id, razorpay_payment_id, razorpay_signature required" },
        { status: 400 }
      );
    }

    const secret = paymentConfig.razorpay.keySecret;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let payment: {
      id: string;
      user_id: string | null;
      credits_added: number | null;
      status: string | null;
    } | null = null;

    const { data: byGateway } = await supabase
      .from("payments")
      .select("id, user_id, credits_added, status")
      .eq("gateway_transaction_id", orderId)
      .maybeSingle();

    if (byGateway) {
      payment = byGateway;
    } else {
      // Legacy / edge case: gateway_transaction_id was never saved (e.g. RLS blocked UPDATE).
      // Razorpay order.receipt is our internal payment row UUID from create-order.
      try {
        const rz = new Razorpay({
          key_id: paymentConfig.razorpay.keyId,
          key_secret: secret,
        });
        const rzOrder = (await rz.orders.fetch(orderId)) as { receipt?: string };
        const receipt = rzOrder.receipt?.trim();
        if (receipt && UUID_RE.test(receipt)) {
          const { data: byReceipt } = await supabase
            .from("payments")
            .select("id, user_id, credits_added, status, gateway_transaction_id")
            .eq("id", receipt)
            .maybeSingle();
          if (byReceipt && byReceipt.status === "pending") {
            payment = byReceipt;
            await supabase
              .from("payments")
              .update({ gateway_transaction_id: orderId })
              .eq("id", byReceipt.id);
          }
        }
      } catch (e) {
        console.error("verify: Razorpay order fetch fallback failed:", e);
      }
    }

    if (!payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (payment.status === "success") {
      return NextResponse.json({ success: true, message: "Already verified" });
    }

    const creditsToAdd = Number(payment.credits_added) || 0;

    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: "success",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("Payment update error:", updatePaymentError);
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }

    if (payment.user_id && creditsToAdd > 0) {
      const { data: userRow } = await supabase
        .from("users")
        .select("credits")
        .eq("id", payment.user_id)
        .single();
      const currentCredits = Number((userRow as { credits?: number } | null)?.credits) || 0;
      await supabase
        .from("users")
        .update({ credits: currentCredits + creditsToAdd, updated_at: new Date().toISOString() })
        .eq("id", payment.user_id);
    }

    return NextResponse.json({
      success: true,
      creditsAdded: creditsToAdd,
    });
  } catch (e) {
    console.error("verify error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
