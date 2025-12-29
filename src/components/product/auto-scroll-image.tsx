'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AutoScrollImageProps {
  images: string[]
  alt: string
  isPaused: boolean
}

export function AutoScrollImage({ images, alt, isPaused }: AutoScrollImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [images.length, isPaused])

  return (
    <>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} ${index + 1}`}
          className={`object-cover transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
        />
      ))}
    </>
  )
}

