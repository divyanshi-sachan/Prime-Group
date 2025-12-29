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
     title: "Brand Shoot",
     description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
     images: [
       "https://assets.entrepreneur.com/content/3x2/2000/1665079203-Personal-branding-photography-by-Rosie-Parsons---Stella-Grow-Magazine-16.jpg?format=pjeg&auto=webp&crop=1:1",
       "https://atelieroostamsterdam.nl/wp-content/uploads/2022/11/AtelierOost_0079.jpg",
       "https://i.pinimg.com/236x/ea/59/78/ea5978c46fc2d25522b2ea31a2aff0b6.jpg",
     ],
     link: "/packages/business/package?routeAttachment=Brand Shoot"
    },
    {
        tag: "Full experience",
        title: "Croporate Profile And Headshot",
        description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
        images: [
          "https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-600nw-1714666150.jpg",
          "https://i.pinimg.com/736x/3f/e9/fe/3fe9fe7f0573b76d84f1bc313e43c98d.jpg",
          "https://www.whiteroomstudio.com.sg/wordpress/wp-content/uploads/2021/10/professional-headshots-singapore-32-white-room-studio.jpeg",
        ],
        link: "/packages/business/package?routeAttachment=Croporate Profile And Headshot"
       },
  {
    tag: "Full experience",
    title: "Political Profile And Headshot",
    description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
    images: [
      "https://media.istockphoto.com/id/1355106725/photo/indian-politician-greeting-by-doing-namaste-concept-of-welcome-gesture-showing-on-yellow.jpg?s=612x612&w=0&k=20&c=1SqJxKXfbl0hKZtC1KgZ35Nwzq7PUuAMS2CYtQJmnGU=",
      "https://media.istockphoto.com/id/1357134978/photo/confident-senior-politician-looking-at-camera-by-crossing-arms-on-yellow-background-concept.jpg?s=612x612&w=0&k=20&c=JyGhneun1wIOfUKD8KXQqHR40-_CVcaohwf2eBdj5eY=",
      "https://www.shutterstock.com/image-photo/former-indian-minister-giving-fake-600nw-2094036532.jpg",
    ],
    link: "/packages/business/package?routeAttachment=Political Profile And Headshot"
  },
  {
    tag: "Only relax",
    title: "Portfolio",
    description: "Enjoy the beautiful scenery, fresh air and tranquility without having to do a thing. Take a walk along the scenic trails, relax with a book or just enjoy the quiet",
    images: [
      "https://www.bringitonline.in/uploads/2/2/4/5/22456530/modelling-portfolio-photography-54_orig.jpg",
      "https://www.a-rrajani.com/wp-content/uploads/2021/10/13-14.jpg.webp",
      "https://images.pexels.com/photos/2772099/pexels-photo-2772099.jpeg",
    ],
    link: "/packages/business/package?routeAttachment=Portfolio"
  },
]

export default function BusinessCards() {
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
    <div className="py-24 px-4 bg-gradient-to-b from-white to-gray-50" id="business-packages">
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
  
  