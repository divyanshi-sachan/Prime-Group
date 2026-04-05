import { NextResponse } from "next/server";
import { requireUserWithBasicProfile } from "@/lib/api-require-basic-profile";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { paymentConfig, getPaymentMethodFromDb, buildUpiUrl } from "@/lib/payment/config";
import { isPaymentsComingSoon } from "@/lib/payment/payments-coming-soon";
import Razorpay from "razorpay";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (isPaymentsComingSoon()) {
      return NextResponse.json(
        { error: "Payments are not available yet. Please check back soon." },
        { status: 503 }
      );
    }
    const gate = await requireUserWithBasicProfile();
    if (!gate.ok) return gate.response;
    const { user: authUser, supabase } = gate;

    const body = await req.json();
    const planId = body?.plan_id as string | undefined;
    if (!planId) {
      return NextResponse.json({ error: "plan_id required" }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, price_inr, credits")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Invalid or inactive plan" }, { status: 400 });
    }

    const amount = Number(plan.price_inr) || 0;
    const credits = Number(plan.credits) ?? 0;
    if (amount < 0) {
      return NextResponse.json({ error: "Invalid plan amount" }, { status: 400 });
    }

    const paymentMethod = await getPaymentMethodFromDb(createServiceRoleClient());
    const currency = "INR";

    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        user_id: authUser.id,
        plan_id: plan.id,
        amount,
        currency,
        payment_gateway: paymentMethod,
        payment_method: paymentMethod,
        status: "pending",
        credits_added: credits,
      })
      .select("id")
      .single();

    if (insertError || !payment) {
      console.error("Payment insert error:", insertError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    if (paymentMethod === "razorpay") {
      const secret = paymentConfig.razorpay.keySecret;
      if (!secret) {
        return NextResponse.json(
          { error: "Razorpay not configured (RAZORPAY_KEY_SECRET)" },
          { status: 503 }
        );
      }
      const razorpay = new Razorpay({
        key_id: paymentConfig.razorpay.keyId,
        key_secret: secret,
      });
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency,
        receipt: payment.id,
      });

      // Must use service role: RLS allows users to INSERT/SELECT own payments but not UPDATE,
      // so a user-scoped client silently failed to set gateway_transaction_id and verify returned "Order not found".
      const service = createServiceRoleClient();
      const { error: linkError } = await service
        .from("payments")
        .update({ gateway_transaction_id: order.id })
        .eq("id", payment.id);

      if (linkError) {
        console.error("Failed to link Razorpay order to payment row:", linkError);
        return NextResponse.json(
          { error: "Failed to link payment order. Please try again or contact support." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        method: "razorpay",
        razorpayOrderId: order.id,
        key: paymentConfig.razorpay.keyId,
        amount,
        currency,
        paymentId: payment.id,
        credits,
      });
    }

    if (paymentMethod === "upi_qr") {
      const vpa = paymentConfig.upi.vpa;
      const merchantName = paymentConfig.upi.merchantName;
      if (!vpa) {
        return NextResponse.json(
          { error: "UPI not configured (UPI_VPA)" },
          { status: 503 }
        );
      }
      const upiUrl = buildUpiUrl({
        vpa,
        merchantName,
        amount,
        currency,
        orderId: payment.id,
        note: `Credits: ${credits} | Prime Group`,
      });

      let qrDataUrl: string | null = null;
      try {
        qrDataUrl = await QRCode.toDataURL(upiUrl, { width: 280, margin: 2 });
      } catch {
        // optional; client can still use upiUrl with a client-side QR lib
      }

      return NextResponse.json({
        method: "upi_qr",
        orderId: payment.id,
        upiUrl,
        qrDataUrl,
        amount,
        currency,
        credits,
        merchantName,
      });
    }

    return NextResponse.json({ error: "Unknown payment method" }, { status: 503 });
  } catch (e) {
    console.error("create-order error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
