import { Shield, Heart, Lock, UserCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export const Feature6 = () => (
  <div className="w-full pt-20 lg:pt-40 pb-8 lg:pb-12 px-4">
    <div className="container mx-auto">
      <div className="flex flex-col gap-10">
        <div className="flex gap-4 flex-col items-start">
          <div>
            <Badge className="font-montserrat" style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--pure-white)' }}>Our Services</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-playfair-display font-bold text-left text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
              See what we have to offer
            </h2>
            <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-left font-montserrat" style={{ color: 'var(--primary-blue)' }}>
              Discover our comprehensive matrimonial services designed to help you find your perfect life partner.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-muted rounded-md h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop" 
                alt="Verified Profiles" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative z-10">
              <UserCheck className="w-8 h-8 stroke-1 text-white" />
            </div>
            <div className="flex flex-col mt-4 relative z-10">
              <h3 className="text-xl tracking-tight text-white font-playfair-display font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>Verified Profiles</h3>
              <p className="text-white/80 max-w-xs text-base font-montserrat">
                Browse through verified profiles of eligible matches with complete background checks and authentic information.
              </p>
            </div>
          </div>
          <div className="bg-muted rounded-md aspect-square p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=600&fit=crop" 
                alt="Smart Matching" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative z-10">
              <Heart className="w-8 h-8 stroke-1 text-white fill-white" />
            </div>
            <div className="flex flex-col mt-4 relative z-10">
              <h3 className="text-xl tracking-tight text-white font-playfair-display font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>Smart Matching</h3>
              <p className="text-white/80 max-w-xs text-base font-montserrat">
                Our advanced matching algorithm connects you with compatible partners based on preferences, values, and lifestyle.
              </p>
            </div>
          </div>
          <div className="bg-muted rounded-md aspect-square p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop" 
                alt="Privacy & Security" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative z-10">
              <Lock className="w-8 h-8 stroke-1 text-white" />
            </div>
            <div className="flex flex-col mt-4 relative z-10">
              <h3 className="text-xl tracking-tight text-white font-playfair-display font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>Privacy & Security</h3>
              <p className="text-white/80 max-w-xs text-base font-montserrat">
                Your privacy is our priority. We ensure secure communication and protect your personal information with advanced encryption.
              </p>
            </div>
          </div>
          <div className="bg-muted rounded-md h-full lg:col-span-2 p-6 aspect-square lg:aspect-auto flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0">
              <Image 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop" 
                alt="Personalized Assistance" 
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative z-10">
              <Shield className="w-8 h-8 stroke-1 text-white" />
            </div>
            <div className="flex flex-col mt-4 relative z-10">
              <h3 className="text-xl tracking-tight text-white font-playfair-display font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>Personalized Assistance</h3>
              <p className="text-white/80 max-w-xs text-base font-montserrat">
                Get dedicated support from our relationship experts who guide you through every step of your matrimonial journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

