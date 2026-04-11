"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Mail, Phone, User } from "lucide-react";

import type { ContactLeadershipMember } from "@/lib/contact-leadership";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

function telHref(phone: string): string | undefined {
  const t = phone.replace(/[\s-]/g, "").trim();
  if (!t) return undefined;
  return t.startsWith("+") ? `tel:${t}` : `tel:${t}`;
}

function LeadershipCard({ member }: { member: ContactLeadershipMember }) {
  const tel = telHref(member.phone);
  const hasPhoto = member.photo_url.trim() !== "";

  return (
    <div
      className="mx-auto flex h-full max-w-sm flex-col rounded-3xl border bg-white p-6 text-center shadow-sm"
      style={{ borderColor: "rgba(226, 194, 133, 0.45)" }}
    >
      <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 shadow-inner" style={{ borderColor: "var(--accent-gold)" }}>
        {hasPhoto ? (
          <Image
            src={member.photo_url}
            alt={member.name}
            fill
            className="object-cover"
            sizes="144px"
            unoptimized
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: "rgba(0, 51, 102, 0.06)" }}
            aria-hidden
          >
            <User className="h-16 w-16 opacity-35" style={{ color: "var(--primary-blue)" }} />
          </div>
        )}
      </div>
      <h3 className="font-playfair-display mt-5 text-xl font-bold" style={{ color: "var(--primary-blue)" }}>
        {member.name}
      </h3>
      {member.designation ? (
        <p className="font-general mt-1 text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>
          {member.designation}
        </p>
      ) : null}
      <div className="mt-4 space-y-2 font-general text-sm" style={{ color: "var(--primary-blue)", opacity: 0.88 }}>
        {member.phone ? (
          <p className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            {tel ? (
              <a href={tel} className="font-medium hover:underline" style={{ color: "var(--primary-blue)" }}>
                {member.phone}
              </a>
            ) : (
              <span>{member.phone}</span>
            )}
          </p>
        ) : null}
        {member.email ? (
          <p className="flex items-center justify-center gap-2 break-all">
            <Mail className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <a
              href={`mailto:${member.email}`}
              className="font-medium hover:underline"
              style={{ color: "var(--accent-gold)" }}
            >
              {member.email}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ContactLeadershipCarousel() {
  const [members, setMembers] = React.useState<ContactLeadershipMember[] | null>(null);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/contact-leadership", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && Array.isArray(data.members)) {
          setMembers(data.members);
        } else if (!cancelled) {
          setMembers([]);
        }
      } catch {
        if (!cancelled) setMembers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (members === null) {
    return (
      <section className="border-t py-14 lg:py-18" style={{ borderColor: "rgba(226, 194, 133, 0.35)", backgroundColor: "rgba(0, 51, 102, 0.02)" }} aria-hidden>
        <div className="container mx-auto max-w-6xl px-4 text-center font-general text-sm text-gray-500">Loading…</div>
      </section>
    );
  }

  if (members.length === 0) {
    return null;
  }

  const loop = members.length > 1;
  const plugins = loop
    ? [Autoplay({ delay: 5200, stopOnInteraction: true, stopOnMouseEnter: true })]
    : [];

  return (
    <section
      className="border-t py-14 lg:py-20"
      style={{ borderColor: "rgba(226, 194, 133, 0.35)", backgroundColor: "rgba(0, 51, 102, 0.02)" }}
      aria-labelledby="contact-leadership-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-general text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: "var(--accent-gold)" }}>
            Our team
          </p>
          <h2
            id="contact-leadership-heading"
            className="font-playfair-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--primary-blue)" }}
          >
            Meet our leadership
          </h2>
          <p className="font-general mt-3 text-sm leading-relaxed sm:text-base" style={{ color: "var(--primary-blue)", opacity: 0.78 }}>
            Connect directly with our business heads for partnership, media, or escalations.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl px-2 sm:px-12">
          <Carousel
            opts={{ align: "start", loop }}
            plugins={plugins}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {members.map((member) => (
                <CarouselItem
                  key={member.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <LeadershipCard member={member} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {members.length > 1 ? (
              <>
                <CarouselPrevious
                  className="absolute left-0 top-[42%] z-10 h-9 w-9 -translate-y-1/2 border-2 bg-white/90 shadow-sm sm:left-1"
                  style={{ borderColor: "var(--accent-gold)", color: "var(--primary-blue)" }}
                />
                <CarouselNext
                  className="absolute right-0 top-[42%] z-10 h-9 w-9 -translate-y-1/2 border-2 bg-white/90 shadow-sm sm:right-1"
                  style={{ borderColor: "var(--accent-gold)", color: "var(--primary-blue)" }}
                />
              </>
            ) : null}
          </Carousel>
          {members.length > 1 ? (
            <div className="mt-8 flex justify-center gap-2">
              {members.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === current ? "w-8" : "w-2 opacity-40"
                  )}
                  style={{
                    backgroundColor: i === current ? "var(--accent-gold)" : "var(--primary-blue)",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === current}
                  onClick={() => api?.scrollTo(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
