"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import MobileNav from "./mobile-nav";
import SearchBar from "./search";
import LoginModal from "./login-modal";
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import ScrollProgress from "../ui/scroll-progress";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";


export default function MainNav() {

   // State for toggling audio and visual indicator
   const [isAudioPlaying, setIsAudioPlaying] = useState(false);
   const [isIndicatorActive, setIsIndicatorActive] = useState(false);
 
   // Refs for audio and navigation container
   const audioElementRef = useRef(null);
   const navContainerRef = useRef(null);
 
   const { y: currentScrollY } = useWindowScroll();
   const [isNavVisible, setIsNavVisible] = useState(true);
   const [lastScrollY, setLastScrollY] = useState(0);
 
   // Toggle audio and visual indicator
   const toggleAudioIndicator = () => {
     setIsAudioPlaying((prev) => !prev);
     setIsIndicatorActive((prev) => !prev);
   };
 
   // Manage audio playback
 //   useEffect(() => {
 //     if (isAudioPlaying) {
 //       audioElementRef.current.play();
 //     } else {
 //       audioElementRef.current.pause();
 //     }
 //   }, [isAudioPlaying]);
 
   useEffect(() => {
     if (currentScrollY === 0) {
       // Topmost position: show navbar without floating-nav
       setIsNavVisible(true);
       //@ts-ignore
       navContainerRef.current.classList.remove("floating-nav");
     } else {
       // When scrolled, apply floating-nav but keep navbar visible
       setIsNavVisible(true);
       //@ts-ignore
       navContainerRef.current.classList.add("floating-nav");
     }

     setLastScrollY(currentScrollY);
   }, [currentScrollY, lastScrollY]);

   useEffect(() => {
     // Keep navbar always visible and fixed
     gsap.to(navContainerRef.current, {
       y: 0,
       opacity: 1,
       duration: 0.2,
     });
   }, [isNavVisible]);

  return (
    <>
    <ScrollProgress  className="sticky top-0 z-50"/>
    <div ref={navContainerRef} className="supports-backdrop-blur:bg-background/90 fixed top-0 left-0 right-0 backdrop-blur-xl z-50 lg:px-16 w-full border-b-2 shadow-md" style={{ backgroundColor: 'var(--primary-blue)', borderColor: 'var(--accent-gold)' }}>
      <header className="z-50">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <MobileNav />
            <Link href="/" className="flex items-center space-x-2">
            <Image
               src="/img/home.png"
               alt="Logo"
               priority
               width={45}
               height={45}
             />
              <span className="text-xl font-playfair-display font-bold text-gold-gradient">
              Prime Group
              </span>
            </Link>
          </div>
          <NavigationMenu className="hidden md:flex font-montserrat font-semibold">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex text-base font-semibold h-9 w-max bg-transparent items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
                  )}
                >
                  <Link href="/" className="font-montserrat font-semibold">
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex text-base font-semibold h-9 w-max bg-transparent items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
                  )}
                >
                  <Link href="/discover" className="font-montserrat font-semibold">
                    Discover
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost" asChild className="font-semibold font-montserrat hover:opacity-80" style={{ color: 'var(--pure-white)' }}>
                    <Link href="/blog">Blogs</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost" asChild className="font-semibold font-montserrat hover:opacity-80" style={{ color: 'var(--pure-white)' }}>
                    <Link href="/faqs">FAQs</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
              <NavigationMenuLink asChild>
                  <Button variant="ghost" asChild className="font-semibold font-montserrat hover:opacity-80" style={{ color: 'var(--pure-white)' }}>
                    <Link href="/contact-us">Contact US</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center ">
            <SearchBar />
            <SignedOut>
            <Link href="/sign-in">
            <LoginModal />
            </Link>
            </SignedOut>
            <SignedIn>
              <button className="relative mr-2 ml-2">
                <UserButton />
              </button>
            </SignedIn>
          </div>
        </div>
      </header>
      </div>
    </>
  );
}