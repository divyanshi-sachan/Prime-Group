"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Send, Twitter } from "lucide-react"
function Footerdemo() {
  return (
    <footer className="relative border-t transition-colors duration-300" style={{ backgroundColor: 'var(--primary-blue)', borderColor: 'var(--accent-gold)' }}>
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-playfair-display font-bold tracking-tight text-gold-gradient">Stay Connected</h2>
            <p className="mb-6 font-montserrat" style={{ color: 'var(--pure-white)' }}>
              Subscribe to our newsletter for the latest matches, success stories, and matrimonial updates.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm border-2"
                style={{ borderColor: 'var(--accent-gold)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-gold-gradient text-black transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: 'var(--accent-gold)' }} />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-playfair-display font-bold text-gold-gradient">Quick Links</h3>
            <nav className="space-y-2 text-sm font-montserrat">
              <a href="/" className="block transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
                Home
              </a>
              <a href="/packages" className="block transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
                Discover
              </a>
              <a href="/blog" className="block transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
                Blog
              </a>
              <a href="/faqs" className="block transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
                FAQs
              </a>
              <a href="/contact-us" className="block transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
                Contact Us
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-playfair-display font-bold text-gold-gradient">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic font-montserrat" style={{ color: 'var(--pure-white)' }}>
              <p>Prime Group Matrimony</p>
              <p>123 Matrimony Avenue</p>
              <p>Mumbai, Maharashtra 400001</p>
              <p>Phone: +91 123 456 7890</p>
              <p>Email: info@primegroupmatrimony.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-playfair-display font-bold text-gold-gradient">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-2 transition-all duration-300 hover:scale-110"
                      style={{ 
                        borderColor: 'var(--accent-gold)',
                        backgroundColor: 'transparent',
                        color: 'var(--pure-white)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                        e.currentTarget.style.color = 'var(--primary-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--pure-white)';
                      }}
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-2 transition-all duration-300 hover:scale-110"
                      style={{ 
                        borderColor: 'var(--accent-gold)',
                        backgroundColor: 'transparent',
                        color: 'var(--pure-white)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                        e.currentTarget.style.color = 'var(--primary-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--pure-white)';
                      }}
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-2 transition-all duration-300 hover:scale-110"
                      style={{ 
                        borderColor: 'var(--accent-gold)',
                        backgroundColor: 'transparent',
                        color: 'var(--pure-white)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                        e.currentTarget.style.color = 'var(--primary-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--pure-white)';
                      }}
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-2 transition-all duration-300 hover:scale-110"
                      style={{ 
                        borderColor: 'var(--accent-gold)',
                        backgroundColor: 'transparent',
                        color: 'var(--pure-white)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                        e.currentTarget.style.color = 'var(--primary-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--pure-white)';
                      }}
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row" style={{ borderColor: 'var(--accent-gold)' }}>
          <p className="text-sm font-montserrat" style={{ color: 'var(--pure-white)' }}>
            © 2024 Prime Group Matrimony. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm font-montserrat">
            <a href="#" className="transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
              Privacy Policy
            </a>
            <a href="#" className="transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
              Terms of Service
            </a>
            <a href="#" className="transition-colors duration-300" style={{ color: 'var(--pure-white)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--pure-white)'}>
              Cookie Settings
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
