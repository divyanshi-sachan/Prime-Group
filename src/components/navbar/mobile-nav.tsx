'use client'

import Link from "next/link";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Menu, User, Settings, LogOut, Heart, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useAuth } from "@/components/hooks/useAuth";
import { useCredits } from "@/context/credits-context";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut } = useAuth();
  const { credits } = useCredits();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2 md:hidden hover:opacity-80" style={{ color: 'var(--pure-white)' }}>
            <Menu className="h-5 w-5" style={{ color: 'var(--pure-white)' }} />
            <span className="sr-only">Prime Group menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="hidden">
            <SheetTitle className=" hidden"></SheetTitle>
            <SheetDescription className="hidden"></SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col gap-4">
            <Link href="/" prefetch className="flex items-center" onClick={handleLinkClick}>
              <span className="font-harvey-serif text-xl sm:text-2xl font-semibold tracking-[0.12em] uppercase">
                Prime Group
              </span>
            </Link>
            <Separator className="my-2" />
            <Link href="/" prefetch className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Home
            </Link>
            <Link href="/discover" prefetch className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Discover
            </Link>
            <Link href="/faqs" prefetch className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              FAQ&apos;S
            </Link>
            <Link href="/blog" prefetch className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Blogs
            </Link>
            <Link href="/contact-us" prefetch className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Contact Us
            </Link>
            <Separator className="my-2" />
            {user ? (
              <>
                {/* Credits balance */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-base font-semibold">{credits} credits</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={handleLinkClick}
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--primary-blue)' }}
                  >
                    Buy Credits
                  </Link>
                </div>
                <Separator className="my-2" />
                <Link href="/favorites" className="flex items-center gap-2 py-2 text-lg font-semibold" onClick={handleLinkClick}>
                  <Heart className="h-5 w-5" /> Wishlist
                </Link>
                <Link href="/profile" className="flex items-center gap-2 py-2 text-lg font-semibold" onClick={handleLinkClick}>
                  <User className="h-5 w-5" /> Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-2 py-2 text-lg font-semibold" onClick={handleLinkClick}>
                  <Settings className="h-5 w-5" /> Settings
                </Link>
                <Button
                  variant="outline"
                  loading={signingOut}
                  className="justify-start gap-2 text-red-600 border-red-200"
                  onClick={() => void handleSignOut()}
                >
                  {signingOut ? "Signing out…" : (
                    <>
                      <LogOut className="h-5 w-5" aria-hidden /> Sign out
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Link href="/sign-in" className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
                Sign in
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
