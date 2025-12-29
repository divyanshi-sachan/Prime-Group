"use client"
import { useState,useRef,useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"

interface FloatingBarProps {
  sections: {
    id: string
    label: string
  }[]
}

export function FloatingBar({ sections }: FloatingBarProps) {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isSticky, setIsSticky] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }
  useEffect(() => {
    const observeIntersection = () => {
      // Remove existing observer if any
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Create new intersection observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id)
            }
          })
        },
        { 
          root: null, 
          rootMargin: '-50% 0px -50% 0px',
          threshold: 0 
        }
      )

      // Observe all sections
      sections.forEach((section) => {
        const sectionElement = document.getElementById(section.id)
        if (sectionElement && observerRef.current) {
          observerRef.current.observe(sectionElement)
        }
      })

      // Clean up on unmount
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }

    observeIntersection()
  }, [sections])


  // Mobile navigation
  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <div className="grid gap-2 py-4">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              className="justify-start"
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )

  // Don't render sidebar on mobile
  if (!isDesktop) {
    return <MobileNavigation />
  }

  return (
    <div className="hidden md:block">
      <div
      ref={containerRef}
        className="fixed top-[40%] left-10 w-[230px] bg-white rounded-r-lg shadow-md z-50"
        style={{ maxHeight: "calc(100vh - 20px)", overflowY: "auto" }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className={`py-4 px-6 cursor-pointer transition-colors duration-300 hover:bg-gray-100 
              ${activeSection === section.id ? "bg-black text-white rounded-tr-lg" : ""}`}
            onClick={() => scrollToSection(section.id)}
          >
            {section.label}
          </div>
        ))}
      </div>
    </div>
  )
}



