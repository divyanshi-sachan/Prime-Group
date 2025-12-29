'use client'

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useState } from "react";

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  profession: string;
  education: string;
  image: string;
}

const profiles: Profile[] = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 28,
    location: "Mumbai, Maharashtra",
    profession: "Software Engineer",
    education: "B.Tech Computer Science",
    image: "/profiles/image.png"
  },
  {
    id: "2",
    name: "Arjun Patel",
    age: 30,
    location: "Ahmedabad, Gujarat",
    profession: "Business Consultant",
    education: "MBA Finance",
    image: "/profiles/image1.png"
  },
  {
    id: "3",
    name: "Kavya Reddy",
    age: 26,
    location: "Hyderabad, Telangana",
    profession: "Doctor",
    education: "MBBS, MD",
    image: "/profiles/image3.png"
  },
  {
    id: "4",
    name: "Rohan Singh",
    age: 32,
    location: "Delhi, NCR",
    profession: "Investment Banker",
    education: "MBA IIM",
    image: "/profiles/image4.png"
  }
];

export default function FeaturedProfiles() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 shadow-lg" style={{ backgroundColor: 'var(--pure-white)' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-6 py-2 rounded-full" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <span className="text-sm font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
              Featured Profiles
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair-display font-bold mb-4 text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            Find Your Perfect Match
          </h2>
          <p className="text-lg sm:text-xl font-montserrat max-w-2xl mx-auto" style={{ color: 'var(--primary-blue)' }}>
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
                  backgroundColor: favorites.has(profile.id) ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <Heart 
                  className={`h-5 w-5 ${favorites.has(profile.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
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
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm" style={{ backgroundColor: 'var(--accent-gold)' }}>
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
                <button className="w-full mt-6 py-3 rounded-lg font-montserrat font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gold-gradient text-black">
                  View Profile
                </button>
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
          <button className="px-8 py-4 rounded-lg font-montserrat font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-2" style={{ 
            borderColor: 'var(--primary-blue)',
            color: 'var(--primary-blue)',
            backgroundColor: 'transparent'
          }}>
            View All Profiles
          </button>
        </motion.div>
      </div>
    </section>
  );
}

