"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, CreditCard, Loader2 } from "lucide-react";

import type { ContactLeadershipMember } from "@/lib/contact-leadership";
import { ContactLeadershipSettings } from "@/components/admin/contact-leadership-settings";

type PaymentMethodValue = "razorpay" | "upi_qr";

export default function AdminSettingsPage() {
  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("razorpay");
  const [leadership, setLeadership] = useState<ContactLeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.payment_method) {
          setPaymentMethod(data.payment_method === "upi_qr" ? "upi_qr" : "razorpay");
        }
        if (res.ok && Array.isArray(data.contact_leadership)) {
          setLeadership(data.contact_leadership);
        }
      } catch {
        // keep default
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSavePayment = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
          <Settings className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
          Settings
        </h1>
        <p className="font-general text-sm mt-1 text-gray-600">
          Admin panel configuration.
        </p>
      </div>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="font-playfair-display flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <CreditCard className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            Payment method
          </CardTitle>
          <p className="font-general text-sm text-gray-600">
            Choose how users pay on checkout. Razorpay opens the gateway; UPI QR shows a scan-to-pay code.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 font-general">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="font-general">Active payment method</Label>
                <select
                  className="w-full max-w-xs rounded-lg border px-3 py-2 font-general text-sm"
                  style={{ borderColor: "rgba(212, 175, 55, 0.4)" }}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodValue)}
                >
                  <option value="razorpay">Razorpay (gateway)</option>
                  <option value="upi_qr">Dynamic UPI QR code</option>
                </select>
              </div>
              <Button
                className="rounded-xl font-general"
                style={{ backgroundColor: "var(--primary-blue)" }}
                onClick={handleSavePayment}
                loading={saving}
              >
                {saving ? "Saving…" : "Save payment method"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ContactLeadershipSettings leadership={leadership} onChange={setLeadership} loading={loading} />

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="font-general text-sm text-gray-600">
          <p>Other settings (e.g. site name, approval workflow, email templates) can be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
