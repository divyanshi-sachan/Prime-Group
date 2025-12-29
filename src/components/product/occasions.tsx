
'use client'
import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { AutoScrollImage } from "./auto-scroll-image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'

const experiences = [
    {
     tag: "Full experience",
     title: "Wedding Day",
     description: "Capture every magical moment of your special day with our comprehensive wedding photography package",
     images: [
       "https://www.ptaufiqphotography.com/wp-content/uploads/2019/02/Indian-Wedding-Haldi-Sunny%E2%80%99s-World-1-1-1-1024x683.jpg",
       "https://www.ptaufiqphotography.com/wp-content/uploads/2024/06/ptaufiq-indian-wedding-hard-rock-riviera-maya-cancun-mexico-getting-ready.png",
       "https://www.brides.com/thmb/9JaT-qoGtnA6TfKCxe2A-JAhZFY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/12-colorful-amalfi-coast-wedding-couple-portrait-oliver-fly-photography-1123-47ae8a040ac5469790734b3cad79111b.jpg",
     ],
     link: "/packages/occasions/package?routeAttachment=Wedding Day"
    },
    {
        tag: "Full experience",
        title: "Wedding Week",
        description: "Document the entire journey from pre-wedding celebrations to the big day with our comprehensive coverage",
        images: [
          "https://www.manifestmagazine.in/wp-content/uploads/2024/06/The-Big-Day-Main-Crop.png",
          "https://im.idiva.com/luxury/photogallery/2013/Jul/rhit-bal-sonam-kapoor-india-bridal-fashion-week.jpg?w=450&h=338&cc=1",
          "https://awareness-days.co.uk/wp-content/uploads/2022/12/National-Marriage-Week.jpg",
        ],
        link: "/packages/occasions/package?routeAttachment=Wedding Week"
    },
    {
        tag: "Full experience",
        title: "Pre-Wedding",
        description: "Create timeless pre-wedding memories in stunning locations with our expert photography services",
        images: [
          "https://weddingvyapar.com/wp-content/uploads/2024/08/netarhat-min-1140x760.png",
          "https://kamatharjun.b-cdn.net/wp-content/uploads/2023/06/Prewedding-Photoshoot-Priyanka-Prito-21.jpg",
          "https://digiartphotography.com/wp-content/uploads/pre-wedding-couple-photography-with-digiart-photography-manikonda-photoshoot-at-Deccan-Park-9298051870-scaled.jpg",
        ],
        link: "/packages/occasions/package?routeAttachment=Pre Wedding"
    },
    {
        tag: "Only relax",
        title: "Maternity",
        description: "Celebrate this beautiful chapter of your life with elegant and intimate maternity photography",
        images: [
          "https://www.adventisthealth.org/images/bakersfield/bakersfield-maternity.jpg",
          "https://www.andsoidontforget.com.au/wp-content/uploads/sites/12336/2022/09/What-to-wear-for-Maternity-Photos-1-1024x683.jpg",
          "https://photos.smugmug.com/Maternity-Photography/i-zWTpCtH/0/LVgGPSD2hqRwrSkKsv6ngTKxp4m6PkXWcTFMtW3RV/XL/maternity-photography-creative-outdoors-bangalore-3-XL.jpg",
        ],
        link: "/packages/occasions/package?routeAttachment=Maternity"
    },
    {
        tag: "Full experience",
        title: "Baby Shower",
        description: "Preserve the joy and excitement of welcoming your little one with our baby shower photography",
        images: [
          "https://img.freepik.com/free-photo/small-baby-lies-basket-with-plaid_8353-7789.jpg?w=740&t=st=1679475378~exp=1679475978~hmac=0f5591afcfccbdbde0625a52d7a05773b815b402c99755d63772d4c491ae8586",
          "https://cherieswoodcom.b-cdn.net/wp-content/uploads/2023/07/Baby-Shower-Perfetto-scaled-1.webp",
          "https://meghnarathorephotography.com/wp-content/uploads/2023/09/Nishant-22-days-baby-photoshoot-by-best-baby-photographer-in-delhi-gurugram-India-august-2023-1.jpg",
        ],
        link: "/packages/occasions/package?routeAttachment=Baby Shower"
    },
    {
        tag: "Only relax",
        title: "Parties & Events",
        description: "Turn your celebrations into lasting memories with our professional event photography services",
        images: [
          "https://media.licdn.com/dms/image/v2/C4E1BAQG0_xR2MJ8JIg/company-background_10000/company-background_10000/0/1584998692381/themed_parties_cover?e=2147483647&v=beta&t=tfstp63nTvwls7frYicN70ceYWlS8jFIBQR0NQUfFnY",
          "https://www.bettaeventhire.com.au/wp-content/uploads/2020/01/shutterstock_1527035324.jpg",
          "https://media.istockphoto.com/id/1397143960/photo/celebratory-red-wine-toast-between-senior-adult-friends-at-candle-light-social-event-party.jpg?s=612x612&w=0&k=20&c=fNSR-gTQS49WYKJ-ZnOMoUTHjHcUbafyxfyTv_pfKrA=",
        ],
        link: "/packages/occasions/package?routeAttachment=Parties-Events"
    },
]

export default function OccasionsCards() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const cardsPerPage = 3 // Show 3 cards per page on desktop
  
  const filters = ['All', 'Full experience', 'Only relax']
  
  const filteredExperiences = activeFilter === 'All'
    ? experiences
    : experiences.filter(exp => exp.tag === activeFilter)
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredExperiences.length / cardsPerPage)
  
  // Get current page items
  const currentExperiences = filteredExperiences.slice(
    currentPage * cardsPerPage, 
    (currentPage + 1) * cardsPerPage
  )
  
  function handleOnClick(link: string) {
    router.push(link)
  }
  
  // Navigation functions
  function goToNextPage() {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }
  
  function goToPrevPage() {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  // Reset current page when filter changes
  useEffect(() => {
    setCurrentPage(0)
  }, [activeFilter])

  // Simulate image preloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoaded(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="py-24 px-4 bg-gradient-to-b from-white to-gray-50" id='occasion-packages'>
      {/* Header with elegant typography */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <span className="inline-block text-sm font-medium tracking-wider text-rose-600 uppercase mb-3">
          Capture Your Special Moments
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Photography Packages
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tailored photography experiences to preserve your precious moments and create lasting memories
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-10 mb-8">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                activeFilter === filter
                  ? 'bg-black text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:scale-105'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows and cards grid */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-4">
          <Button 
            onClick={goToPrevPage}
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-rose-500 text-rose-600 hover:bg-rose-50"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <span 
                key={index} 
                className={`w-2 h-2 rounded-full ${
                  currentPage === index ? 'bg-rose-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={goToNextPage}
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-rose-500 text-rose-600 hover:bg-rose-50"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto p-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentExperiences.map((experience, index) => (
              <motion.div
                key={experience.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="relative overflow-hidden rounded-3xl border-0 aspect-[4/5] cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleOnClick(experience.link)}
                >
                  <AutoScrollImage 
                    images={experience.images} 
                    alt={experience.title} 
                    isPaused={hoveredCard === index}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 p-8 flex flex-col justify-end">
                    <div className="bg-white/20 text-white text-sm w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                      {experience.tag}
                    </div>
                    <h2 className="text-white text-2xl font-bold mt-4 mb-3">
                      {experience.title}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {experience.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}