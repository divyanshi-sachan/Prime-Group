"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"

interface ProfileData {
  id: string
  name: string
  birth_year: number
  education: {
    qualification: string
    specialization: string
  }
  occupation: {
    job_profile: string
    organization: string
    salary_package: string | null
  }
  personal_details: {
    dob: string
    birthplace: string
    height: string
    complexion: string
  }
  residential_address: {
    city: string
    state: string
    country: string
  }
}

interface ProfileCardProps {
  data: ProfileData
  index: number
}

export default function ProfileCard({ data, index }: ProfileCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const currentYear = new Date().getFullYear()
  const age = currentYear - data.birth_year
  const location = `${data.residential_address.city}, ${data.residential_address.state}`
  const favorite = isFavorite(data.id)

  const profileImages = [
    "/profiles/image.png",
    "/profiles/image1.png",
    "/profiles/image3.png",
    "/profiles/image4.png",
    "/profiles/boy.jpg",
    "/profiles/boy2.jpg",
    "/profiles/boy3.jpg",
    "/profiles/boy5.jpg",
  ]
  const imageIndex = Number.parseInt(data.id.replace("P", "")) - 1
  const profileImage = profileImages[imageIndex] || profileImages[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-3"
      style={{
        border: `1px solid rgba(217, 170, 72, 0.2)`,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 12px 40px rgba(217, 170, 72, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.12), 0 20px 60px rgba(217, 170, 72, 0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08), 0 12px 40px rgba(217, 170, 72, 0.1)"
      }}
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(data.id)
        }}
        className="absolute top-5 right-5 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-115"
        style={{
          backgroundColor: favorite ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
      </button>

      <Link href={`/discover/${data.id}`}>
        {/* Profile Image */}
        <div className="relative h-80 overflow-hidden cursor-pointer">
          <Image
            src={profileImage || "/placeholder.svg"}
            alt={data.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

          {/* Age Badge */}
          <div
            className="absolute bottom-5 left-5 px-4 py-2 rounded-full backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, var(--accent-gold) 0%, rgba(217, 170, 72, 0.8) 100%)",
              boxShadow: "0 4px 12px rgba(217, 170, 72, 0.3)",
            }}
          >
            <span className="text-sm font-montserrat font-semibold text-black tracking-wide">{age} Years</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-7" style={{ backgroundColor: "var(--pure-white)" }}>
          <h3 className="text-2xl font-playfair-display font-bold mb-1 text-gray-900 leading-tight">{data.name}</h3>
          <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: "var(--accent-gold)" }} />

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 group/item">
              <MapPin
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{ color: "var(--primary-blue)" }}
              />
              <span className="text-sm font-montserrat text-gray-700 group-hover/item:text-gray-900 transition-colors">
                {location}
              </span>
            </div>

            <div className="flex items-start gap-3 group/item">
              <Briefcase
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{ color: "var(--primary-blue)" }}
              />
              <span className="text-sm font-montserrat text-gray-700 group-hover/item:text-gray-900 transition-colors">
                {data.occupation.job_profile}
              </span>
            </div>

            <div className="flex items-start gap-3 group/item">
              <GraduationCap
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{ color: "var(--primary-blue)" }}
              />
              <span className="text-sm font-montserrat text-gray-700 group-hover/item:text-gray-900 transition-colors">
                {data.education.qualification} - {data.education.specialization}
              </span>
            </div>
          </div>

          {/* View Profile Button */}
          <div
            className="w-full mt-7 py-3 rounded-xl font-montserrat font-semibold transition-all duration-300 hover:shadow-lg text-white text-center cursor-pointer tracking-wide"
            style={{
              backgroundColor: "rgba(30, 90, 160, 0.85)",
              boxShadow: "0 2px 8px rgba(30, 90, 160, 0.25)",
            }}
          >
            View Profile
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
