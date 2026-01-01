"use client"

import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Calendar, Ruler, Users, Home, Heart, Phone } from "lucide-react"
import profilesData from "@/data/profiles.json"
import { useState, useEffect } from "react"

export default function ProfileDetailPage() {
  const params = useParams()
  const id = params?.id as string
  // Find profile from profiles.json (featured profiles are now from same source)
  const profile = profilesData.profiles.find((p) => p.id === id)
  const [showBackButton, setShowBackButton] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      // Only hide on mobile (window width < 640px) and when scrolled down
      if (window.innerWidth < 640) {
        setShowBackButton(window.scrollY < 100)
      } else {
        setShowBackButton(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!profile) {
    notFound()
  }

  const currentYear = new Date().getFullYear()
  const age = currentYear - profile.birth_year
  const location = `${profile.residential_address.city}, ${profile.residential_address.state}`

  // Use placeholder images
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
  const imageIndex = Number.parseInt(profile.id.replace("P", "")) - 1
  const profileImage = profileImages[imageIndex] || profileImages[0]

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--pure-white)" }}>
      {/* Back Button - Fixed in top left corner, only visible at top on mobile */}
      <div
        className={`fixed top-20 left-4 sm:left-10 z-50 transition-opacity duration-300 sm:opacity-100 ${
          showBackButton ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link href="/discover">
          <Button
            variant="outline"
            className="shadow-lg backdrop-blur-sm bg-white/90 border-0 hover:shadow-xl transition-shadow duration-300"
            style={{
              color: "var(--primary-blue)",
              boxShadow: "0 4px 20px rgba(25, 80, 150, 0.15)",
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Profiles</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-5 sm:px-10 lg:px-16 pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div
                  className="relative h-96 rounded-2xl overflow-hidden mb-8 transition-shadow duration-300 hover:shadow-2xl"
                  style={{
                    boxShadow: "0 20px 40px rgba(25, 80, 150, 0.12), 0 1px 3px rgba(212, 175, 55, 0.1)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <Image src={profileImage || "/placeholder.svg"} alt={profile.name} fill className="object-cover" />
                </div>

                <div
                  className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                  style={{
                    boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                    border: "1px solid rgba(212, 175, 55, 0.15)",
                  }}
                >
                  <h1
                    className="text-4xl font-playfair-display font-bold mb-2"
                    style={{ color: "var(--primary-blue)" }}
                  >
                    {profile.name}
                  </h1>
                  <div className="w-12 h-1 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                      <span className="font-montserrat text-sm" style={{ color: "var(--primary-blue)" }}>
                        {age} Years
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: "var(--primary-blue)" }} />
                      <span className="font-montserrat text-sm" style={{ color: "var(--primary-blue)" }}>
                        {location}
                      </span>
                    </div>
                  </div>

                  {profile.contact.whatsapp && (
                    <a href={`https://wa.me/${profile.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <Button
                        className="w-full text-white hover:shadow-lg transition-all duration-300 rounded-lg font-montserrat font-semibold"
                        style={{ backgroundColor: "var(--accent-gold)" }}
                        size="lg"
                      >
                        <Phone className="mr-2 h-5 w-5" />
                        Contact via WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Education */}
              <div
                className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                }}
              >
                <h2
                  className="text-2xl font-playfair-display font-bold mb-1 flex items-center gap-3"
                  style={{ color: "var(--primary-blue)" }}
                >
                  <GraduationCap className="h-6 w-6" />
                  Education
                </h2>
                <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>
                <div className="space-y-3 font-montserrat text-sm" style={{ color: "var(--primary-blue)" }}>
                  <div>
                    <p className="font-semibold mb-1">Qualification</p>
                    <p className="opacity-80">{profile.education.qualification}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Specialization</p>
                    <p className="opacity-80">{profile.education.specialization}</p>
                  </div>
                </div>
              </div>

              {/* Occupation */}
              <div
                className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                }}
              >
                <h2
                  className="text-2xl font-playfair-display font-bold mb-1 flex items-center gap-3"
                  style={{ color: "var(--primary-blue)" }}
                >
                  <Briefcase className="h-6 w-6" />
                  Occupation
                </h2>
                <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>
                <div className="space-y-3 font-montserrat text-sm" style={{ color: "var(--primary-blue)" }}>
                  <div>
                    <p className="font-semibold mb-1">Job Profile</p>
                    <p className="opacity-80">{profile.occupation.job_profile}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Organization</p>
                    <p className="opacity-80">{profile.occupation.organization}</p>
                  </div>
                  {profile.occupation.salary_package && (
                    <div>
                      <p className="font-semibold mb-1">Salary Package</p>
                      <p className="opacity-80">{profile.occupation.salary_package}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div
                className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                }}
              >
                <h2
                  className="text-2xl font-playfair-display font-bold mb-1 flex items-center gap-3"
                  style={{ color: "var(--primary-blue)" }}
                >
                  <Ruler className="h-6 w-6" />
                  Personal Details
                </h2>
                <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>
                <div className="space-y-3 font-montserrat text-sm" style={{ color: "var(--primary-blue)" }}>
                  <div>
                    <p className="font-semibold mb-1">Date of Birth</p>
                    <p className="opacity-80">
                      {new Date(profile.personal_details.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Birthplace</p>
                    <p className="opacity-80">{profile.personal_details.birthplace}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Height</p>
                    <p className="opacity-80">{profile.personal_details.height}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Complexion</p>
                    <p className="opacity-80">{profile.personal_details.complexion}</p>
                  </div>
                </div>
              </div>

              {/* Family Details */}
              <div
                className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                }}
              >
                <h2
                  className="text-2xl font-playfair-display font-bold mb-1 flex items-center gap-3"
                  style={{ color: "var(--primary-blue)" }}
                >
                  <Users className="h-6 w-6" />
                  Family Details
                </h2>
                <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>
                <div className="space-y-4 font-montserrat text-sm" style={{ color: "var(--primary-blue)" }}>
                  <div>
                    <p className="font-semibold mb-1">Father</p>
                    <p className="opacity-80">
                      {profile.family_details.father.name} • {profile.family_details.father.profession}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Mother</p>
                    <p className="opacity-80">
                      {profile.family_details.mother.name} • {profile.family_details.mother.profession}
                    </p>
                  </div>
                  {profile.family_details.siblings && profile.family_details.siblings.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Siblings</p>
                      <ul className="space-y-1 ml-4">
                        {profile.family_details.siblings.map((sibling, index) => (
                          <li key={index} className="opacity-80">
                            • {sibling.name} ({sibling.relation}) • {sibling.profession || "N/A"}
                            {sibling.marital_status && ` • ${sibling.marital_status}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile.gotra && profile.gotra.length > 0 && (
                    <div>
                      <p className="font-semibold mb-1">Gotra</p>
                      <p className="opacity-80">{profile.gotra.join(", ")}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold mb-1">Family Base</p>
                    <p className="opacity-80">{profile.family_base}</p>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div
                className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                }}
              >
                <h2
                  className="text-2xl font-playfair-display font-bold mb-1 flex items-center gap-3"
                  style={{ color: "var(--primary-blue)" }}
                >
                  <Home className="h-6 w-6" />
                  Residential Address
                </h2>
                <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>
                <div className="font-montserrat text-sm space-y-2" style={{ color: "var(--primary-blue)" }}>
                  <p className="opacity-80">
                    {profile.residential_address.city}, {profile.residential_address.state}
                  </p>
                  <p className="opacity-80">{profile.residential_address.country}</p>
                </div>
              </div>

              {/* Preferences */}
              {profile.preferences && (
                <div
                  className="bg-white rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl"
                  style={{
                    boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08), 0 1px 3px rgba(212, 175, 55, 0.08)",
                    border: "1px solid rgba(212, 175, 55, 0.15)",
                  }}
                >
                  <h2
                    className="text-2xl font-playfair-display font-bold mb-1 flex items-center gap-3"
                    style={{ color: "var(--primary-blue)" }}
                  >
                    <Heart className="h-6 w-6" />
                    Preferences
                  </h2>
                  <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: "var(--accent-gold)" }}></div>
                  <p className="font-montserrat text-sm opacity-80" style={{ color: "var(--primary-blue)" }}>
                    {profile.preferences}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
