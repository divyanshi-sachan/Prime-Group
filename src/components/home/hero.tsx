"use client";

import * as React from "react";
import { useEffect, useRef } from 'react'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';
import HyperText from "../ui/hyper-text";
import gsap from 'gsap';
import SplitText from '@/lib/split-text';
import { createServive } from "@/lib/actions/package.action";
 
const texts = [
  "Hello",
  "Morphing",
  "Text",
  "Animation",
  "React",
  "Component",
  "Smooth",
  "Transition",
  "Engaging",
];

export default function Hero() {

  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const sideTextRef = useRef<HTMLDivElement>(null)
  const rightSectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup - hide elements
      gsap.set([subtitleRef.current, buttonRef.current, sideTextRef.current, imageRef.current], {
        opacity: 0,
        y: 20
      })
      
      gsap.set(rightSectionRef.current, {
        xPercent: 100
      })

      gsap.set(titleRef.current, { opacity: 1 })
      const titleSplit = new SplitText(titleRef.current, { type: "chars" })
      gsap.set(titleSplit.chars, { opacity: 0, y: 20 })

      // Main timeline - delayed to wait for loading animation
      const tl = gsap.timeline({
        delay: 2.0 // Adjust this value based on loading animation duration
      })
      
      // Slide in right section
      tl.to(rightSectionRef.current, {
        xPercent: 0,
        duration: 1.2,
        ease: "power2.out"
      })
      // Fade in image
      .to(imageRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      }, "-=0.8")
      // Animate title letters
      .to(titleSplit.chars, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power4.out"
      }, "-=0.5")
      // Animate subtitle
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.5")
      // Animate button
      .to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.7")
      // Animate side text
      .to(sideTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.7")
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden p-8 ">
    {/* Background Image */}
    <Image
      ref={imageRef}
      src="https://img.freepik.com/premium-photo/person-capturing-photos-aurora-borealis-with-professional-camera_891336-24665.jpg"
      alt="People enjoying outdoors"
      width={1920}
      height={1080}
      className="absolute inset-0 object-cover w-full h-[98%] "
      priority
    />
    
    {/* Content Overlay */}
    <div className="relative z-10 px-4 py-8 md:py-16 lg:py-20 mx-auto max-w-7xl h-full flex flex-col justify-between top-12">
      <div ref={buttonRef} className="flex flex-col items-start gap-6 md:gap-8">
        <h1 ref={subtitleRef} className="max-w-4xl text-4xl md:text-4xl lg:text-6xl font-bold tracking-tight text-white">
        Book Your Shoot, Save Your Mémories Instantly.
        </h1>
        
        <Button 
          className="px-4 py-2 md:px-6 md:py-3 text-base md:text-lg bg-orange-500 hover:bg-orange-600 text-white rounded-full"
          onClick={()=>{createServive()}}
        >
          Explore All Product
        </Button>
      </div>

      {/* Floating Product Card */}
      <Card ref={rightSectionRef} className="self-end mt-8 md:mt-0 md:absolute md:right-8 md:bottom-32 w-full md:w-72 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg">
        <div className="flex items-start gap-4">
          <Image
            ref={imageRef}
            src="https://images.unsplash.com/photo-1657826377012-9f444ed01c89?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FtZXJhJTIwcGhvdG98ZW58MHx8MHx8fDA%3D"
            alt="Water bottle product"
            width={100}
            height={200}
            className="h-[50%] w-[40%] object-contain"
          />
          <div ref={sideTextRef} className="space-y-2">
            <h3 className="font-bold text-lg md:text-xl">SEE THE PRODUCT DETAIL</h3>
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-orange-500 hover:text-orange-600"
            >
              See All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Brand Text */}
      {/* <h2 className="text-right text-6xl top-[150%] sm:text-8xl md:text-9xl lg:text-[14rem] font-black text-white opacity-90 leading-none tracking-tight mt-8 md:mt-0 md:absolute">
        MEMOWRIES
      </h2> */}
      <div ref={subtitleRef} className="absolute top-[135%] md:top-[145%] w-">
      <HyperText
        className="text-center mx-auto text-7xl z-50 sm:text-8xl md:text-8xl lg:text-[14rem] font-black text-white opacity-90 leading-none tracking-tight mt-8 md:mt-0 "
        text="MEMOWRIES"
      />

      {/* <VelocityScroll className=" text-white">MAKE YOUR MEMOWRIES</VelocityScroll> */}
      </div>
    </div>
  </div>
  );
}
