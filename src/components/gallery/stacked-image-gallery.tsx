'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Categories from './Categories'
import Image from 'next/image'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const projects = [
  { id: 1, image: 'https://davidduchemin.com/WP/wp-content/uploads/2017/11/cjasonbradley_170902_26266.jpg', title: 'Project 1' },
  { id: 2, image: 'https://images.squarespace-cdn.com/content/v1/64098fbbd21dd971ed1f5028/1e9a6237-86b7-45e9-b7fb-ad4504c4d77e/0112-AJ-4640.jpg', title: 'Project 2' },
  { id: 3, image: 'https://www.jesvenues.com/images/services/corporate-photography/corporate-event-photography-in-hyderabad-1.jpg', title: 'Project 3' },
  { id: 4, image: 'https://bangalorephotographers.in/blog/wp-content/uploads/2023/01/Baby-photoshoot-near-me-scaled.jpg', title: 'Project 4' },
  { id: 5, image: 'https://hikeup.com/wp-content/uploads/2022/01/product-photography.png', title: 'Project 5' },
]

const StackedImageGallery: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const panelsRef = useRef<HTMLDivElement[]>([])
  
    useEffect(() => {
      const container = containerRef.current
      const panels = panelsRef.current
  
      if (!container || panels.length === 0) return
  
      // Set initial styles
      gsap.set(panels, {
        yPercent: (i) => i * 100,
        scale: 0.8,
        opacity: 0,
      })
  
      // Create scroll animations
      panels.forEach((panel, i) => {
        gsap.to(panel, {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'top 20%',
            scrub: 0.5,
            toggleActions: 'play none none reverse',
          },
        })
  
        if (i > 0) {
          gsap.to(panels[i - 1], {
            scale: 0.8,
            opacity: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'top 20%',
              scrub: 0.5,
            },
          })
        }
      })
  
      // Cleanup
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }, [])
  
    return (
      <div className="bg-white min-h-screen">
        <Categories />
        <div 
          ref={containerRef}
          className="relative w-full"
          style={{ height: `${projects.length * 100}vh` }}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              //@ts-ignore
              ref={(el) => el && (panelsRef.current[i] = el)}
              className="fixed top-0 left-0 w-full h-screen flex items-center justify-center transform-gpu"
            >
              <div className="relative aspect-[4/3] w-[80vw] h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={500}
                  height={900}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <h2 className="text-white text-2xl font-bold">{project.title}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default StackedImageGallery
  
  