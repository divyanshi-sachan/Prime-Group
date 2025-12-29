'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from "next/image"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: string[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (isHovering) return

    const intervalId = setInterval(nextImage, 3000)
    return () => clearInterval(intervalId)
  }, [isHovering, nextImage])

  useEffect(() => {
    if (sliderRef.current) {
      const scrollAmount = currentIndex * (sliderRef.current.scrollWidth / images.length)
      sliderRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [currentIndex, images.length])

  const slideLeft = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }

  const slideRight = () => {
    setCurrentIndex((prevIndex) => Math.min(images.length - 1, prevIndex + 1))
  }

  return (
    <div className="space-y-4">
      <div 
        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Image
          src={images[currentIndex]}
          alt={`Product Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative">
        <div 
          ref={sliderRef}
          className="flex space-x-4 overflow-x-hidden scroll-smooth p-2"
        >
          {images.map((image, index) => (
            <button
              key={index}
              className={`relative flex-shrink-0 w-1/4 aspect-square overflow-hidden rounded-lg border bg-gray-100 ${
                index === currentIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
        {images.length > 4 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
              onClick={slideLeft}
              disabled={currentIndex === 0}
              aria-label="Previous thumbnails"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full"
              onClick={slideRight}
              disabled={currentIndex === images.length - 1}
              aria-label="Next thumbnails"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

