'use client'

import { useFavorites } from "@/context/favorites-context";
import ProfileCard from "@/components/discover/profile-card";
import profilesData from "@/data/profiles.json";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [favoriteProfiles, setFavoriteProfiles] = useState<any[]>([]);

  useEffect(() => {
    // Filter favorites from profiles.json (featured profiles are now from same source)
    const filtered = profilesData.profiles.filter(profile => 
      favorites.has(profile.id)
    );
    setFavoriteProfiles(filtered);
  }, [favorites]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pure-white)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-8 py-4 rounded-full" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <span className="text-lg font-montserrat font-semibold uppercase tracking-wide text-gold-gradient flex items-center gap-2">
              <Heart className="h-5 w-5 fill-current" />
              My Favorites
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair-display font-bold mb-4 text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            {favoriteProfiles.length === 0 ? 'No Favorites Yet' : 'Your Favorite Profiles'}
          </h1>
          <p className="text-lg sm:text-xl font-montserrat max-w-2xl mx-auto" style={{ color: 'var(--primary-blue)' }}>
            {favoriteProfiles.length === 0 
              ? 'Start exploring profiles and add them to your favorites to see them here.'
              : `You have ${favoriteProfiles.length} ${favoriteProfiles.length === 1 ? 'profile' : 'profiles'} in your favorites.`
            }
          </p>
        </motion.div>

        {/* Favorites Grid */}
        {favoriteProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {favoriteProfiles.map((profile, index) => (
              <ProfileCard key={profile.id} data={profile} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-20"
          >
            <Heart className="h-24 w-24 mx-auto mb-6 opacity-20" style={{ color: 'var(--accent-gold)' }} />
            <p className="text-xl font-montserrat" style={{ color: 'var(--primary-blue)' }}>
              Explore profiles and click the heart icon to add them to your favorites.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

