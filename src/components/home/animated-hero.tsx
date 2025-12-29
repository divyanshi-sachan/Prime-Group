'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SplitText from '@/lib/split-text'

export default function AnimatedHero() {
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
        delay: 2.5 // Adjust this value based on loading animation duration
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
        duration: 1,
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
    <>
      <div ref={containerRef} className="relative min-h-screen bg-white overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 flex items-center">
          <div className="max-w-[90%] w-full pl-12 md:pl-24 lg:pl-32">
            <div className="max-w-3xl">
              <div ref={titleRef} className="text-[5rem] md:text-[7rem] lg:text-[8rem] leading-none font-bold tracking-tighter mb-8">
                <span className="block">DESIGN &</span>
                <span className="block">CREATION</span>
              </div>
              
              <p ref={subtitleRef} className="text-lg md:text-xl text-gray-600 mb-12 max-w-xl">
                We are a diverse group of thinkers and tinkerers,
                strategists, creatives and technology experts.
              </p>

              <div ref={buttonRef} className="space-y-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-black text-black hover:bg-gray-100 transition-colors px-8 py-4 text-lg h-auto"
                >
                  Discover
                </Button>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>Attract</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>Engage</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>Convert</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>Delight</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section with Background, Image, and Side Text */}
        <div 
          ref={rightSectionRef}
          className="relative w-1/3 bg-gray-50 overflow-hidden"
        >
          <Image
            ref={imageRef}
            src="https://davidduchemin.com/WP/wp-content/uploads/2017/11/cjasonbradley_170902_26266.jpg"
            alt="Background"
            width={720}
            height={1080}
            className="object-cover object-center w-full h-full"
          />
          <div 
            ref={sideTextRef}
            className="absolute -left-24 top-1/2 -translate-y-1/2 transform rotate-90 origin-center whitespace-nowrap"
          >
            <span className="text-6xl tracking-widest font-light text-white mix-blend-difference">Side Studios</span>
          </div>
        </div>
      </div>
    </>
  )
}

