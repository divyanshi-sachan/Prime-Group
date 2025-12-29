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
import { Menu } from 'lucide-react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
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
            <Link href="/" className="flex items-center" onClick={handleLinkClick}>
              <span className="text-xl font-bold">Prime Group</span>
            </Link>
            <Separator className="my-2" />
            <Link href="/" className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Home
            </Link>
            <Link href="/discover" className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
                Discover
                  </Link>
            <Link href="/faqs" className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              FAQ'S
            </Link>
            <Link href="/blog" className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Blogs
            </Link>
            <Link href="/contact-us" className="block py-2 text-lg font-semibold" onClick={handleLinkClick}>
              Contact Us
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
