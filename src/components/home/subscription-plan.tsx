'use client'

import { motion } from "framer-motion";
import { Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubscriptionPlan() {
  const features = [
    "Instant full contact details",
    "Scroll up to 10 to 15 profiles",
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--pure-white)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--accent-gold)' }}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--primary-blue)' }}></div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4 px-6 py-2 rounded-full" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <span className="text-sm font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
              Membership
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair-display font-bold mb-4 text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            Unlock Premium Features
          </h2>
          <p className="text-lg sm:text-xl font-montserrat max-w-2xl mx-auto" style={{ color: 'var(--primary-blue)' }}>
            Get instant access to contact details and browse more profiles with our premium membership
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div 
            className="rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-blue) 0%, #004080 100%)',
              border: `3px solid var(--accent-gold)`
            }}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
              <Crown className="w-full h-full" style={{ color: 'var(--accent-gold)' }} />
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20">
              <Sparkles className="w-full h-full" style={{ color: 'var(--accent-gold)' }} />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex-1">
                  {/* Badge */}
                  <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gold-gradient">
                    <span className="text-sm font-montserrat font-bold text-black">Most Popular</span>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-3xl md:text-4xl font-playfair-display font-bold text-gold-gradient">
                    Premium Membership
                  </h3>
                </div>

                {/* Price - Right Corner */}
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-2 mb-2">
                    <span className="text-2xl md:text-3xl font-montserrat line-through opacity-70" style={{ color: 'var(--pure-white)' }}>
                      ₹3,500
                    </span>
                    <span className="text-4xl md:text-5xl font-playfair-display font-bold" style={{ color: 'var(--pure-white)' }}>
                      ₹1,100
                    </span>
                  </div>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-lg font-montserrat" style={{ color: 'var(--accent-gold)' }}>
                      /year
                    </span>
                  </div>
                  <p className="text-sm font-montserrat mt-2" style={{ color: 'var(--pure-white)', opacity: 0.9 }}>
                    Just ₹92 per month
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-10 space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
                      <Check className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-lg font-montserrat font-semibold" style={{ color: 'var(--pure-white)' }}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link href="/checkout?plan=premium">
                  <Button 
                    className="w-full md:w-auto px-12 py-6 text-lg font-montserrat font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gold-gradient text-black border-none"
                  >
                    Get Started Now
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Badge */}
              <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--accent-gold)', opacity: 0.3 }}>
                <p className="text-sm font-montserrat text-center" style={{ color: 'var(--pure-white)', opacity: 0.8 }}>
                  ✓ Secure Payment ✓ 30-Day Money Back Guarantee ✓ Cancel Anytime
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

