"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import MobileNav from "./mobile-nav";
import { Heart, User, Settings, LogOut, Coins, Loader2 } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";
import { useAuth } from "@/components/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useCredits } from "@/context/credits-context";

const SCROLL_THRESHOLD = 80;
/** Brand navy — matches --primary-blue / hero */
const NAV_BG_OPAQUE = "rgba(0, 51, 102, 0.98)";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/blog", label: "Blogs" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact-us", label: "Contact" },
] as const;

function navHrefIsActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const { favoritesCount } = useFavorites();
  const { credits } = useCredits();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isHome = pathname === "/";
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navLinkClass = (href: string) => {
    const active = navHrefIsActive(pathname, href);
    return cn(
      "relative rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm lg:text-[15px] font-semibold font-general tracking-wide transition-all duration-200",
      active
        ? "bg-gold-gradient text-[#001a33] shadow-[0_2px_14px_rgba(226,194,133,0.35)]"
        : "text-white hover:text-[#E2C285] hover:bg-[#E2C285]/12"
    );
  };

  useEffect(() => {
    if (!user?.id) {
      setProfilePhotoUrl(null);
      return;
    }
    const supabase = createClient();
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (!profile?.id) return;
      const { data: photo } = await supabase
        .from("profile_photos")
        .select("photo_url, thumbnail_url")
        .eq("profile_id", profile.id)
        .eq("is_primary", true)
        .maybeSingle();
      const url = photo?.thumbnail_url || photo?.photo_url || null;
      setProfilePhotoUrl(url);
    })();
  }, [user?.id]);

  const headerTransparent = isHome && !scrolled;

  return (
    <div
      className={cn(
        "w-full border-b transition-all duration-300 z-[60]",
        isHome && "fixed top-0 left-0 right-0",
        !headerTransparent && "shadow-[0_4px_24px_rgba(0,0,0,0.12)]",
        !isHome && "sticky top-0 md:relative md:top-auto"
      )}
      style={{
        backgroundColor: headerTransparent ? "transparent" : NAV_BG_OPAQUE,
        borderColor: headerTransparent ? "transparent" : "rgba(226, 194, 133, 0.32)",
        backdropFilter: headerTransparent ? "none" : "blur(14px)",
      }}
    >
      <header className="z-50 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative flex min-h-[4.25rem] h-[4.5rem] sm:h-[4.75rem] items-center">
          <div className="flex items-center flex-shrink-0 min-w-[180px] sm:min-w-[240px] lg:min-w-[270px] z-10">
            <MobileNav />
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <Image
                src="/img/home.png"
                alt="Prime Group Logo"
                priority
                width={56}
                height={56}
                className="object-contain group-hover:scale-105 transition-transform duration-300 h-12 w-12 sm:h-14 sm:w-14"
              />
              <span className="hidden sm:block font-harvey-serif text-xl sm:text-2xl md:text-[1.85rem] lg:text-[2rem] font-semibold text-gold-gradient group-hover:opacity-90 transition-opacity uppercase tracking-[0.14em] leading-none">
                Prime Group
              </span>
            </Link>
          </div>

          <nav
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 lg:gap-1.5"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} prefetch className={navLinkClass(href)}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto min-w-[180px] sm:min-w-[220px] justify-end z-10">
            {user ? (
              <>
                <Link href="/favorites">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-11 w-11 rounded-full text-white hover:text-[#E2C285] hover:bg-[#E2C285]/12 transition-all duration-200"
                    aria-label="Favorites"
                  >
                    <Heart className="h-5 w-5" />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold px-1 bg-gold-gradient text-[#001a33] shadow-[0_2px_8px_rgba(226,194,133,0.45)]">
                        {favoritesCount > 9 ? "9+" : favoritesCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="rounded-full ring-2 ring-[#E2C285]/40 hover:ring-[#E2C285]/75 focus:outline-none focus-visible:ring-[#E2C285] focus-visible:ring-offset-2 focus-visible:ring-offset-[#003366] transition-all duration-200 p-0.5"
                      aria-label="Account menu"
                    >
                      <Avatar className="h-11 w-11 border border-[#E2C285]/35">
                        <AvatarImage src={profilePhotoUrl ?? undefined} alt="Profile" />
                        <AvatarFallback className="bg-[#E2C285]/18 text-[#E2C285] font-semibold text-sm">
                          {user.email?.charAt(0).toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={12}
                      className="w-56 p-3 rounded-xl font-sans shadow-2xl border border-[#E2C285]/28 !bg-[#003366] text-white [&_a]:text-white [&_a]:no-underline"
                      style={{ backdropFilter: "blur(16px)" }}
                    >
                    <div className="space-y-2">
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#E2C285]/22"
                        style={{ backgroundColor: "rgba(226, 194, 133, 0.12)" }}
                      >
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-[#E2C285]" />
                          <span className="text-sm font-semibold text-white">{credits}</span>
                          <span className="text-xs text-white/65">credits</span>
                        </div>
                        <Link
                          href="/checkout"
                          className="text-xs font-bold px-2.5 py-1 rounded-full bg-gold-gradient text-[#001a33] hover:opacity-90 transition-opacity"
                        >
                          Buy
                        </Link>
                      </div>
                      <div className="my-1 h-px bg-[#E2C285]/18" />
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white hover:text-[#E2C285] hover:bg-white/10 transition-colors duration-200"
                      >
                        <User className="h-4 w-4 shrink-0 text-[#F5D78A]" aria-hidden />
                        My Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white hover:text-[#E2C285] hover:bg-white/10 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4 shrink-0 text-[#F5D78A]" aria-hidden />
                        Settings
                      </Link>
                      <div className="my-2 h-px bg-[#E2C285]/18" />
                      <button
                        type="button"
                        disabled={signingOut}
                        aria-busy={signingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-60"
                        onClick={async () => {
                          setSigningOut(true);
                          try {
                            await signOut();
                          } finally {
                            setSigningOut(false);
                          }
                        }}
                      >
                        {signingOut ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                        ) : (
                          <LogOut className="h-4 w-4" aria-hidden />
                        )}
                        {signingOut ? "Signing out…" : "Sign Out"}
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              !pathname?.startsWith("/sign-in") &&
              !pathname?.startsWith("/sign-up") && (
                <Link href="/sign-in">
                  <Button className="h-11 rounded-full px-7 text-[15px] bg-gold-gradient text-[#001a33] font-semibold shadow-[0_2px_16px_rgba(226,194,133,0.3)] hover:shadow-[0_4px_22px_rgba(226,194,133,0.45)] hover:scale-[1.02] transition-all duration-200 border-none">
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
