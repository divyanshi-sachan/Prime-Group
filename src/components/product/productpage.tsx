'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Benefits } from './benefits'
import { Features } from './features'
import { ImageGallery } from './image-gallery'
import { photographyPackages } from '../data/packages'
import { useRouter } from 'next/navigation'

export default function ProductPage() {
    const router = useRouter()
    function handelOnclik(link : string) {
      router.push(link)
    }

  const images = [
    "https://phometo.com/blog/wp-content/uploads/2022/06/006-2-scaled-e1655276649905-1024x683.jpg",
    "https://www.sidphoto.in/wp-content/uploads/2023/06/WhatsApp-Image-2023-06-27-at-1.06.37-PM-2.jpeg",
    "https://cdn.shortpixel.ai/spai/q_lossless+ret_img+to_webp/images.squarespace-cdn.com/content/v1/5e2dc2b1be51be56e41d8e88/3d5d19ea-e062-4b1a-b6c8-6fc14a03c121/IMG_9401.JPG",
    "https://img.weddingbazaar.com/shaadisaga_production/photos/pictures/002/700/676/new_medium/the_wedding_story.jpg?1623613859",
    "https://img.weddingbazaar.com/shaadisaga_production/photos/pictures/002/700/676/new_medium/the_wedding_story.jpg?1623613859",

  ]

  const [currentRoute, setCurrentRoute] = useState<string>("Pre Wedding")
  const [currentPackage, setCurrentPackage] = useState<string>('0')
  //@ts-ignore
  const catagory = photographyPackages[currentRoute]
  //@ts-ignore
  const packages = catagory.packages[currentPackage]

  useEffect(() => {
    const routeAttachment = new URLSearchParams(window.location.search).get("routeAttachment")
    const packageAttachment = new URLSearchParams(window.location.search).get("package")
    if (routeAttachment) {
      setCurrentRoute(routeAttachment)
    }
    if (packageAttachment) {
      setCurrentPackage(packageAttachment)
    }
    if(routeAttachment && packageAttachment){
        console.log(catagory.packages[currentPackage])
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <ImageGallery images={images} />
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-medium">{catagory.title}, {packages.name}</h1>
              <p className="text-sm text-gray-500">Photoshoot</p>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : "fill-gray-200 text-gray-200"}`}
                />
              ))}
              <span className="text-sm text-gray-500">(25 reviews)</span>
            </div>
            <div className="space-y-4">
            {packages.offerPrice && (
              <div className='mt-4 flex items-baseline gap-3'>
              <h2 className="text-2xl font-medium">₹{packages.offerPrice.toLocaleString()}</h2>
              <h2 className="text-xl font-medium line-through text-gray-500">₹{packages.originalPrice.toLocaleString()}</h2>
              </div>
            )}
            {!packages.offerPrice && (
              <h2 className="text-2xl font-medium">₹{packages.originalPrice.toLocaleString()}</h2>
            )}
              <p className="text-gray-600">
              {packages.description}
              </p>
            </div>
            <Benefits />
            <Features features={packages.features}/>
            <div className="space-y-2">
              <Button className="w-full" size="lg"
              onClick={() => handelOnclik(`/checkout?routeAttachment=${currentRoute}&packages=${currentPackage}`)}
              >
                Get Started
              </Button>
              <p className="text-center text-xs text-gray-500">*Contains seasonal</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

