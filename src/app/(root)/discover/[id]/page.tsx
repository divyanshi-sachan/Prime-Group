'use client'

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Calendar, Ruler, Users, Home, Heart, Phone } from "lucide-react";
import profilesData from "@/data/profiles.json";
import { useState, useEffect } from "react";

// Featured profiles data (matching featured-profiles component)
const featuredProfiles = [
  {
    id: "1",
    name: "Priya Sharma",
    birth_year: 1996,
    education: {
      qualification: "B.Tech",
      specialization: "Computer Science"
    },
    occupation: {
      job_profile: "Software Engineer",
      organization: "Tech Corp",
      salary_package: null
    },
    personal_details: {
      dob: "1996-01-01",
      birthplace: "Mumbai",
      height: "5'4\"",
      complexion: "Fair"
    },
    family_details: {
      father: { name: "N/A", profession: "N/A" },
      mother: { name: "N/A", profession: "N/A" },
      siblings: []
    },
    residential_address: {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India"
    },
    gotra: [],
    family_base: "N/A",
    preferences: "Looking for a compatible partner",
    contact: {
      whatsapp: null
    }
  },
  {
    id: "2",
    name: "Arjun Patel",
    birth_year: 1994,
    education: {
      qualification: "MBA",
      specialization: "Finance"
    },
    occupation: {
      job_profile: "Business Consultant",
      organization: "Consulting Firm",
      salary_package: null
    },
    personal_details: {
      dob: "1994-01-01",
      birthplace: "Ahmedabad",
      height: "5'10\"",
      complexion: "Wheatish"
    },
    family_details: {
      father: { name: "N/A", profession: "N/A" },
      mother: { name: "N/A", profession: "N/A" },
      siblings: []
    },
    residential_address: {
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India"
    },
    gotra: [],
    family_base: "N/A",
    preferences: "Looking for a compatible partner",
    contact: {
      whatsapp: null
    }
  },
  {
    id: "3",
    name: "Kavya Reddy",
    birth_year: 1998,
    education: {
      qualification: "MBBS",
      specialization: "MD"
    },
    occupation: {
      job_profile: "Doctor",
      organization: "Hospital",
      salary_package: null
    },
    personal_details: {
      dob: "1998-01-01",
      birthplace: "Hyderabad",
      height: "5'5\"",
      complexion: "Fair"
    },
    family_details: {
      father: { name: "N/A", profession: "N/A" },
      mother: { name: "N/A", profession: "N/A" },
      siblings: []
    },
    residential_address: {
      city: "Hyderabad",
      state: "Telangana",
      country: "India"
    },
    gotra: [],
    family_base: "N/A",
    preferences: "Looking for a compatible partner",
    contact: {
      whatsapp: null
    }
  },
  {
    id: "4",
    name: "Rohan Singh",
    birth_year: 1992,
    education: {
      qualification: "MBA",
      specialization: "IIM"
    },
    occupation: {
      job_profile: "Investment Banker",
      organization: "Bank",
      salary_package: null
    },
    personal_details: {
      dob: "1992-01-01",
      birthplace: "Delhi",
      height: "5'11\"",
      complexion: "Wheatish"
    },
    family_details: {
      father: { name: "N/A", profession: "N/A" },
      mother: { name: "N/A", profession: "N/A" },
      siblings: []
    },
    residential_address: {
      city: "Delhi",
      state: "NCR",
      country: "India"
    },
    gotra: [],
    family_base: "N/A",
    preferences: "Looking for a compatible partner",
    contact: {
      whatsapp: null
    }
  }
];

export default function ProfileDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  // Check both profiles.json and featured profiles
  const profile = profilesData.profiles.find(p => p.id === id) || 
                  featuredProfiles.find(p => p.id === id);
  const [showBackButton, setShowBackButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Only hide on mobile (window width < 640px) and when scrolled down
      if (window.innerWidth < 640) {
        setShowBackButton(window.scrollY < 100);
      } else {
        setShowBackButton(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!profile) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - profile.birth_year;
  const location = `${profile.residential_address.city}, ${profile.residential_address.state}`;

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
  ];
  const imageIndex = parseInt(profile.id.replace('P', '')) - 1;
  const profileImage = profileImages[imageIndex] || profileImages[0];

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--pure-white)' }}>
      {/* Back Button - Fixed in top left corner, only visible at top on mobile */}
      <div 
        className={`fixed top-20 left-4 sm:left-10 z-50 transition-opacity duration-300 sm:opacity-100 ${
          showBackButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Link href="/discover">
          <Button 
            variant="outline"
            className="shadow-lg backdrop-blur-sm bg-white/90"
            style={{ 
              borderColor: 'var(--primary-blue)',
              color: 'var(--primary-blue)'
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
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl mb-6" style={{ border: `2px solid var(--accent-gold)` }}>
                  <Image
                    src={profileImage}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                  <h1 className="text-3xl font-playfair-display font-bold mb-4 text-gold-gradient">
                    {profile.name}
                  </h1>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" style={{ color: 'var(--primary-blue)' }} />
                      <span className="font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                        {age} Years
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" style={{ color: 'var(--primary-blue)' }} />
                      <span className="font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                        {location}
                      </span>
                    </div>
                  </div>

                  {profile.contact.whatsapp && (
                    <a 
                      href={`https://wa.me/${profile.contact.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        className="w-full bg-gold-gradient text-black hover:opacity-90"
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
              <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                <h2 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  Education
                </h2>
                <div className="space-y-2 font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                  <p><span className="font-semibold">Qualification:</span> {profile.education.qualification}</p>
                  <p><span className="font-semibold">Specialization:</span> {profile.education.specialization}</p>
                </div>
              </div>

              {/* Occupation */}
              <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                <h2 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient flex items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  Occupation
                </h2>
                <div className="space-y-2 font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                  <p><span className="font-semibold">Job Profile:</span> {profile.occupation.job_profile}</p>
                  <p><span className="font-semibold">Organization:</span> {profile.occupation.organization}</p>
                  {profile.occupation.salary_package && (
                    <p><span className="font-semibold">Salary Package:</span> {profile.occupation.salary_package}</p>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                <h2 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient flex items-center gap-2">
                  <Ruler className="h-6 w-6" />
                  Personal Details
                </h2>
                <div className="space-y-2 font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                  <p><span className="font-semibold">Date of Birth:</span> {new Date(profile.personal_details.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><span className="font-semibold">Birthplace:</span> {profile.personal_details.birthplace}</p>
                  <p><span className="font-semibold">Height:</span> {profile.personal_details.height}</p>
                  <p><span className="font-semibold">Complexion:</span> {profile.personal_details.complexion}</p>
                </div>
              </div>

              {/* Family Details */}
              <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                <h2 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Family Details
                </h2>
                <div className="space-y-4 font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                  <div>
                    <p><span className="font-semibold">Father:</span> {profile.family_details.father.name} - {profile.family_details.father.profession}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Mother:</span> {profile.family_details.mother.name} - {profile.family_details.mother.profession}</p>
                  </div>
                  {profile.family_details.siblings && profile.family_details.siblings.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Siblings:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        {profile.family_details.siblings.map((sibling, index) => (
                          <li key={index}>
                            {sibling.name} ({sibling.relation}) - {sibling.profession || 'N/A'} 
                            {sibling.marital_status && ` - ${sibling.marital_status}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile.gotra && profile.gotra.length > 0 && (
                    <div>
                      <p><span className="font-semibold">Gotra:</span> {profile.gotra.join(', ')}</p>
                    </div>
                  )}
                  <div>
                    <p><span className="font-semibold">Family Base:</span> {profile.family_base}</p>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                <h2 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient flex items-center gap-2">
                  <Home className="h-6 w-6" />
                  Residential Address
                </h2>
                <div className="font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                  <p>{profile.residential_address.city}, {profile.residential_address.state}</p>
                  <p>{profile.residential_address.country}</p>
                </div>
              </div>

              {/* Preferences */}
              {profile.preferences && (
                <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: `2px solid var(--accent-gold)` }}>
                  <h2 className="text-2xl font-playfair-display font-bold mb-4 text-gold-gradient flex items-center gap-2">
                    <Heart className="h-6 w-6" />
                    Preferences
                  </h2>
                  <p className="font-montserrat" style={{ color: 'var(--primary-blue)' }}>
                    {profile.preferences}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

