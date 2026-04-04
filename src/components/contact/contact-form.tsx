"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle2 } from "lucide-react";

const fieldClass =
  "h-12 rounded-2xl border-2 border-[#003366]/12 bg-white font-general text-[#003366] placeholder:text-[#003366]/35 focus-visible:border-[#E2C285]/60 focus-visible:ring-2 focus-visible:ring-[#E2C285]/40 focus-visible:ring-offset-0 transition-shadow";

const labelClass =
  "font-general text-[10px] font-black uppercase tracking-[0.2em] text-[#003366]/50 ml-1";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorText("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: subject || undefined, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorText(data.error || "Something went wrong.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorText("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        id="contact-form"
        className="rounded-[2rem] border-2 p-10 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,51,102,0.08)] scroll-mt-28"
        style={{
          borderColor: "rgba(226, 194, 133, 0.45)",
          backgroundColor: "var(--pure-white)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(226, 194, 133, 0.2)" }}
        >
          <CheckCircle2 className="h-9 w-9 text-[#003366]" strokeWidth={2} aria-hidden />
        </div>
        <p className="text-2xl sm:text-3xl font-playfair-display font-black mb-2 text-gold-gradient" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.06)" }}>
          Message received
        </p>
        <p className="font-general text-base max-w-md mx-auto" style={{ color: "var(--primary-blue)", opacity: 0.88 }}>
          Thank you for reaching out. We&apos;ll get back to you as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <div
      id="contact-form"
      className="rounded-[2rem] border-2 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,51,102,0.07)] scroll-mt-28"
      style={{
        borderColor: "rgba(226, 194, 133, 0.35)",
        backgroundColor: "var(--pure-white)",
      }}
    >
      <div className="mb-8">
        <p className="font-general text-[10px] font-black uppercase tracking-[0.3em] text-[#003366]/45 mb-2">
          Send a message
        </p>
        <h2 className="font-playfair-display text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--primary-blue)" }}>
          Contact form
        </h2>
        <p className="font-general text-sm mt-2 leading-relaxed" style={{ color: "var(--primary-blue)", opacity: 0.75 }}>
          Fields marked * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>
            Name *
          </Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject" className={labelClass}>
            Subject
          </Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={fieldClass}
            placeholder="What is this about?"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message" className={labelClass}>
            Message *
          </Label>
          <Textarea
            id="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClass} min-h-[160px] py-3 resize-y`}
            placeholder="Tell us how we can help..."
          />
        </div>
        {errorText && <p className="text-sm font-general text-red-600">{errorText}</p>}
        <Button
          type="submit"
          loading={status === "loading"}
          className="w-full h-14 rounded-2xl bg-gold-gradient text-[#001a33] font-bold text-base shadow-[0_0_28px_rgba(226,194,133,0.3)] hover:shadow-[0_0_36px_rgba(226,194,133,0.45)] hover:scale-[1.01] transition-all border-none font-general"
        >
          {status === "loading" ? (
            "Sending…"
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              Send message
              <Send className="h-5 w-5" aria-hidden />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
