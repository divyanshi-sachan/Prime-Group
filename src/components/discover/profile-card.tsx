'use client'

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useState } from "react";

interface ProfileData {
  id: string;
  name: string;
  birth_year: number;
  education: {
    qualification: string;
    specialization: string;
  };
  occupation: {
    job_profile: string;
    organization: string;
    salary_package: string | null;
  };
  personal_details: {
    dob: string;
    birthplace: string;
    height: string;
    complexion: string;
  };
  residential_address: {
    city: string;
    state: string;
    country: string;
  };
}

interface ProfileCardProps {
  data: ProfileData;
  index: number;
}

export default function ProfileCard({ data, index }: ProfileCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const currentYear = new Date().getFullYear();
  const age = currentYear - data.birth_year;
  const location = `${data.residential_address.city}, ${data.residential_address.state}`;

  // Use placeholder images - you can replace with actual profile images
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
  const imageIndex = parseInt(data.id.replace('P', '')) - 1;
  const profileImage = profileImages[imageIndex] || profileImages[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
      style={{ border: `2px solid var(--accent-gold)` }}
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFavorite(!isFavorite);
        }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
        style={{ 
          backgroundColor: isFavorite ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.8)'
        }}
      >
        <Heart 
          className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
      </button>

      <Link href={`/discover/${data.id}`}>
        {/* Profile Image */}
        <div className="relative h-80 overflow-hidden cursor-pointer">
          <Image
            src={profileImage}
            alt={data.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Age Badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm" style={{ backgroundColor: 'var(--accent-gold)' }}>
            <span className="text-sm font-montserrat font-semibold text-black">{age} Years</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6" style={{ backgroundColor: 'var(--pure-white)' }}>
          <h3 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            {data.name}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-blue)' }} />
              <span className="text-sm font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                {location}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-blue)' }} />
              <span className="text-sm font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                {data.occupation.job_profile}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-blue)' }} />
              <span className="text-sm font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                {data.education.qualification} - {data.education.specialization}
              </span>
            </div>
          </div>

          {/* View Profile Button */}
          <div className="w-full mt-6 py-3 rounded-lg font-montserrat font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gold-gradient text-black text-center cursor-pointer">
            View Profile
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

