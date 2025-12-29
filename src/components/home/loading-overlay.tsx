'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function LoadingOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
   //@ts-ignore
  useEffect(() => {
    const tl = gsap.timeline()

    // Animate the progress bar
    tl.to(progressRef.current, {
      width: '100%',
      duration: 2.0,
      ease: "power2.inOut"
    })
    // Fade out the loading text
    .to(textRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    }, "-=0.3")
    // Slide out the overlay
    .to(overlayRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "power2.inOut"
    })

    return () => tl.kill()
  }, [])

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
    >
      <div ref={textRef} className="mb-8 text-2xl font-light tracking-wider">
        MEMOWRIES
      </div>
      <div className="w-48 h-[2px] bg-gray-100 relative overflow-hidden">
        <div 
          ref={progressRef}
          className="absolute left-0 top-0 h-full w-0 bg-black"
        />
      </div>
    </div>
  )
}

