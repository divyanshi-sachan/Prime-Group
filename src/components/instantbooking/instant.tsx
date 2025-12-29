"use client";

import React, {useEffect, useState} from 'react';
import { motion } from "framer-motion"
import { Download, Sparkles, Star, ArrowUpRight } from "lucide-react"
import Image from 'next/image';
// import App from "@/assets/phone_image.png"

export default function MemoApp() {
    const [status, setStatus] = useState<boolean>(false); // Explicit boolean type
    const [tos, setTos] = useState<string>(''); // Explicit string type
    
    function navigate(to: string) {
      setStatus(true);
      setTos(to);
    }

    return(
        <div className="relative overflow-hidden mt-20 min-h-screen">
        <div className="absolute inset-0 bg-grid-black/[0.02] [mask-image:radial-gradient(white,transparent_70%)]" />
        
        <div className="container relative px-4 py-16 mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  // @ts-ignore
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-black rounded-full"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Discover the new way to connect</span>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  // @ts-ignore
                  className="text-4xl font-bold tracking-tight lg:text-5xl text-gray-900"
                >
                  Experience Our Apps
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  // @ts-ignore
                  className="text-xl text-gray-600"
                >
                  Explore both Mémow and Mémow Partners for the complete experience. Connect, book, and create memories together.
                </motion.p>
              </div>
  
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                // @ts-ignore
                className="flex flex-col gap-4 sm:flex-row"
              >
                <button 
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Mémow
                </button>
                <button 
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Mémow Partners
                </button>
              </motion.div>
  
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                // @ts-ignore
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Have a 5 star User Experience</p>
                  <p className="text-gray-600">Leave you reviews</p>
                </div>
              </motion.div>
            </div>
  
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              // @ts-ignore
              className="relative lg:ml-auto min-h-[500px] flex items-center"
            >
              <div className="relative w-full max-w-[260px] mx-auto lg:max-w-[280px]">
                <div className="relative overflow-hidden rounded-[2.5rem] shadow-xl">
                <Image
                  src="/assets/phone_image.png" // Path to your image or imported image
                  alt="App screenshot" // Descriptive alt text
                  height={1200}
                  width={1200}
                  className="object-cover" // Tailwind CSS class for styling
                  priority // Optimizes loading for above-the-fold content
                />
                </div>
              </div>
                
                <div className="absolute -bottom-6 -left-6 h-40 w-40 bg-black/5 rounded-full blur-3xl" />
                <div className="absolute -top-6 -right-6 h-40 w-40 bg-black/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </div>
 )
}

