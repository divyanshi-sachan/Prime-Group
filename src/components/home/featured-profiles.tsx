'use client'

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";
import profilesData from "@/data/profiles.json";

export default function FeaturedProfiles() {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Get first 4 profiles from JSON
  const featuredProfiles = profilesData.profiles.slice(0, 4);
  
  // Profile images mapping (same as ProfileCard)
  const profileImages = [
    "/profiles/image.png",
    "/profiles/image1.png",
    "/profiles/image3.png",
    "/profiles/image4.png",
    "/profiles/boy.jpg",
    "/profiles/boy2.jpg",
    "/profiles/boy3.jpg",
    "/profiles/boy5.jpg",
  ];
  
  // Transform profiles to match component structure
  const currentYear = new Date().getFullYear();
  const profiles = featuredProfiles.map((profile) => {
    const imageIndex = parseInt(profile.id.replace('P', '')) - 1;
    return {
      id: profile.id,
      name: profile.name,
      age: currentYear - profile.birth_year,
      location: `${profile.residential_address.city}, ${profile.residential_address.state}`,
      profession: profile.occupation.job_profile,
      education: `${profile.education.qualification} - ${profile.education.specialization}`,
      image: profileImages[imageIndex] || profileImages[0]
    };
  });

  return (
    <section className="relative pt-0 pb-20 px-4 sm:px-6 lg:px-8 shadow-lg" style={{ backgroundColor: 'var(--pure-white)' }}>
      {/* Mandala - Left corner */}
      <div className="absolute top-2 left-4 sm:top-4 sm:left-6 md:top-6 md:left-12 lg:top-8 lg:left-16 z-10 pointer-events-none" style={{ width: 'fit-content', height: 'fit-content' }}>
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56">
          <Image
            src="/img/mandala1.png"
            alt="Mandala"
            fill
            className="object-contain"
            style={{ 
              animation: 'spin 20s linear infinite'
            }}
          />
        </div>
      </div>
      
      {/* Mandala - Right corner */}
      <div className="absolute top-2 right-4 sm:top-4 sm:right-6 md:top-6 md:right-12 lg:top-8 lg:right-16 z-10 pointer-events-none" style={{ width: 'fit-content', height: 'fit-content' }}>
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56">
          <Image
            src="/img/mandala1.png"
            alt="Mandala"
            fill
            className="object-contain"
            style={{ 
              animation: 'spin 20s linear infinite'
            }}
          />
        </div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          {/* Badge Container - Centered */}
          <div className="flex justify-center mb-4 pt-4">
            {/* Badge centered */}
            <div className="inline-block px-6 py-2 rounded-full" style={{ backgroundColor: 'var(--primary-blue)' }}>
              <span className="text-sm font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
                Featured Profiles
              </span>
            </div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair-display font-bold mb-4 text-center text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            Find Your Perfect Match
          </h2>
          <p className="text-lg sm:text-xl font-montserrat max-w-2xl mx-auto text-center" style={{ color: 'var(--primary-blue)' }}>
            Discover our handpicked profiles of accomplished individuals looking for their life partner
          </p>
        </motion.div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              style={{ border: `2px solid var(--accent-gold)` }}
            >
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(profile.id)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: isFavorite(profile.id) ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorite(profile.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>

              {/* Profile Image */}
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Age Badge */}
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, var(--accent-gold) 0%, rgba(217, 170, 72, 0.8) 100%)' }}>
                  <span className="text-sm font-montserrat font-semibold text-black">{profile.age} Years</span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6" style={{ backgroundColor: 'var(--pure-white)' }}>
                <h3 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
                  {profile.name}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-blue)' }} />
                    <span className="text-sm font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                      {profile.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-blue)' }} />
                    <span className="text-sm font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                      {profile.profession}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-blue)' }} />
                    <span className="text-sm font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                      {profile.education}
                    </span>
                  </div>
                </div>

                {/* View Profile Button */}
                <Link href={`/discover/${profile.id}`}>
                  <button className="w-full mt-6 py-3 rounded-lg font-montserrat font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-white" style={{ backgroundColor: 'var(--primary-blue)' }}>
                    View Profile
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/discover">
            <button className="px-8 py-4 rounded-lg font-montserrat font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-2" style={{ 
              borderColor: 'var(--primary-blue)',
              color: 'var(--primary-blue)',
              backgroundColor: 'transparent'
            }}>
              View All Profiles
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

