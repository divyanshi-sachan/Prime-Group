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
import LoginModal from "./login-modal";
import ScrollProgress from "../ui/scroll-progress";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";


export default function MainNav() {
   const { favoritesCount } = useFavorites();

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
    <div ref={navContainerRef} className="supports-backdrop-blur:bg-background/90 fixed top-0 left-0 right-0 backdrop-blur-xl z-50 lg:px-16 w-full shadow-md rounded-none" style={{ backgroundColor: 'var(--primary-blue)' }}>
      <header className="z-50">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center">
            <MobileNav />
            <Link href="/" className="flex items-center space-x-2">
            <Image
               src="/img/home.png"
               alt="Logo"
               priority
               width={50}
               height={50}
               className="object-contain"
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
                    "group inline-flex text-base font-semibold h-9 w-max bg-transparent items-center justify-center rounded-md px-4 py-2 text-white transition-colors hover:text-gold-gradient"
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
                    "group inline-flex text-base font-semibold h-9 w-max bg-transparent items-center justify-center rounded-md px-4 py-2 text-white transition-colors hover:text-gold-gradient"
                  )}
                >
                  <Link href="/discover" className="font-montserrat font-semibold">
                    Discover
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost" asChild className="font-semibold font-montserrat hover:bg-transparent hover:text-gold-gradient" style={{ color: 'var(--pure-white)' }}>
                    <Link href="/blog">Blogs</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button variant="ghost" asChild className="font-semibold font-montserrat hover:bg-transparent hover:text-gold-gradient" style={{ color: 'var(--pure-white)' }}>
                    <Link href="/faqs">FAQs</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
              <NavigationMenuLink asChild>
                  <Button variant="ghost" asChild className="font-semibold font-montserrat hover:bg-transparent hover:text-gold-gradient" style={{ color: 'var(--pure-white)' }}>
                    <Link href="/contact-us">Contact US</Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-2">
            <Link href="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-transparent group"
                style={{ color: 'var(--pure-white)' }}
              >
                <Heart className="h-6 w-6 group-hover:text-gold-gradient transition-colors" style={{ color: 'var(--pure-white)' }} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold bg-gold-gradient text-black">
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </span>
                )}
                <span className="sr-only">Favorites</span>
              </Button>
            </Link>
            <Link href="/sign-in">
              <LoginModal />
            </Link>
          </div>
        </div>
      </header>
      </div>
    </>
  );
}