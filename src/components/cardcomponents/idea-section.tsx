

"use client"

import { motion } from "framer-motion"
import { Expand } from "lucide-react"

export function IdeasSection({ categoryTitle }: { categoryTitle: string }) {
  const placeholderImages = [
    "/placeholder.svg?height=300&width=300&text=Photo 1",
    "/placeholder.svg?height=300&width=300&text=Photo 2",
    "/placeholder.svg?height=300&width=300&text=Photo 3",
    "/placeholder.svg?height=300&width=300&text=Photo 4",
    "/placeholder.svg?height=300&width=300&text=Photo 5",
    "/placeholder.svg?height=300&width=300&text=Photo 6",
    "/placeholder.svg?height=300&width=300&text=Photo 7",
    "/placeholder.svg?height=300&width=300&text=Photo 8",
  ]

  return (
    <section id="ideas" className="space-y-8">
      <div className="text-center">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4 
          bg-black
            text-transparent bg-clip-text"
        >
          Ideas For {categoryTitle}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Inspiring moments captured with creativity and passion. Explore our curated collection.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {placeholderImages.map((img, index) => (
          <motion.div
            key={index}
            className="relative group overflow-hidden rounded-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={img || "/placeholder.svg"}
              alt={`Photoshoot inspiration ${index + 1}`}
              className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 
                flex items-center justify-center transition-all duration-300"
            >
              <Expand
                className="text-white opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 w-10 h-10 md:w-12 md:h-12"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

