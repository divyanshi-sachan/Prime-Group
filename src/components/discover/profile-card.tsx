"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Loader2, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"
import type { DiscoverCardData } from "@/lib/discover"

interface ProfileCardProps {
  data: DiscoverCardData
  index: number
}

export default function ProfileCard({ data, index }: ProfileCardProps) {
  const { isFavorite, toggleFavorite, favoriteToggleProfileId } = useFavorites()
  const favorite = isFavorite(data.id)
  const toggleBusy = favoriteToggleProfileId === data.id

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
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void toggleFavorite(data.id)
        }}
        disabled={toggleBusy}
        aria-busy={toggleBusy}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-5 right-5 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-115 disabled:opacity-80 disabled:pointer-events-none"
        style={{
          backgroundColor: favorite ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {toggleBusy ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-600" aria-hidden />
        ) : (
          <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} aria-hidden />
        )}
      </button>

      <Link href={data.ctaHref ?? `/discover/${data.id}`}>
        {/* Profile Image */}
        <div className="relative h-80 overflow-hidden cursor-pointer">
          <Image
            src={data.imageUrl || "/placeholder.svg"}
            alt={data.imageUrl ? data.name : "No image"}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
            <span className="text-[10px] font-general font-black text-black tracking-[0.2em] uppercase">{data.age} Years</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-7" style={{ backgroundColor: "var(--pure-white)" }}>
          <h3 className="text-2xl font-playfair-display font-black mb-1 text-gray-900 leading-tight tracking-tight uppercase">{data.name}</h3>
          <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: "var(--accent-gold)" }} />

          <div className="space-y-3.5 font-general">
            <div className="flex items-start gap-3 group/item">
              <MapPin
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{ color: "var(--primary-blue)" }}
              />
              <span className="text-xs font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors">
                {data.location}
              </span>
            </div>

            <div className="flex items-start gap-3 group/item">
              <Briefcase
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{ color: "var(--primary-blue)" }}
              />
              <span className="text-xs font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors line-clamp-1">
                {data.profession}
              </span>
            </div>

            <div className="flex items-start gap-3 group/item">
              <GraduationCap
                className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{ color: "var(--primary-blue)" }}
              />
              <span className="text-xs font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors line-clamp-1">
                {data.education}
              </span>
            </div>
          </div>

          {/* View Profile Button */}
          <div
            className="w-full mt-7 py-3 rounded-xl font-general font-black text-[10px] uppercase transition-all duration-300 hover:shadow-lg text-white text-center cursor-pointer tracking-[0.3em]"
            style={{
              backgroundColor: "var(--primary-blue)",
              boxShadow: "0 4px 12px rgba(0, 51, 102, 0.2)",
            }}
          >
            View Profile
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
