'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/dist/Draggable'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable)
}

const projects = [
    { id: 1, image: 'https://davidduchemin.com/WP/wp-content/uploads/2017/11/cjasonbradley_170902_26266.jpg', title: 'Project 1' },
    { id: 2, image: 'https://images.squarespace-cdn.com/content/v1/64098fbbd21dd971ed1f5028/1e9a6237-86b7-45e9-b7fb-ad4504c4d77e/0112-AJ-4640.jpg', title: 'Project 2' },
    { id: 3, image: 'https://www.jesvenues.com/images/services/corporate-photography/corporate-event-photography-in-hyderabad-1.jpg', title: 'Project 3' },
    { id: 4, image: 'https://bangalorephotographers.in/blog/wp-content/uploads/2023/01/Baby-photoshoot-near-me-scaled.jpg', title: 'Project 4' },
    { id: 5, image: 'https://hikeup.com/wp-content/uploads/2022/01/product-photography.png', title: 'Project 5' },
  ]
  

const categories = ['ALL', 'GRAPHIC IDENTITY', 'SITE DESIGN', 'AI', 'VIDEO', '3D']

export default function HorizontalGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const panels = panelsRef.current

    if (!container || panels.length === 0) return

    // Initialize panel positions
    gsap.set(panels, {
      xPercent: (i) => i * 100,
      zIndex: (i) => panels.length - i,
    })

    // Update function for dragging
    const updatePanels = () => {
      const x = gsap.getProperty(container, 'x') as number
      const newIndex = Math.round(Math.abs(x) / window.innerWidth)
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
        gsap.to(panels, {
          scale: (i) => (i === newIndex ? 1 : 0.95),
          opacity: (i) => (i === newIndex ? 1 : 0.8),
          duration: 0.3,
        })
      }
    }

    // Create draggable instance
    const draggable = Draggable.create(container, {
      type: 'x',
      inertia: true,
      bounds: { 
        minX: -((panels.length - 1) * window.innerWidth), 
        maxX: 0 
      },
      onDrag: updatePanels,
      onThrowUpdate: updatePanels,
    })[0]

    // Cleanup
    return () => {
      draggable.kill()
    }
  }, [currentIndex])

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Categories */}
      <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 z-50">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors text-sm"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Project Panels */}
      <div 
        ref={containerRef}
        className="h-full w-full"
      >
        {projects.map((project, i) => (
          <div
            key={project.id}
            //@ts-ignore
            ref={(el) => el && (panelsRef.current[i] = el)}
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center transform-gpu"
          >
            <div className="relative w-[80vw] h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

