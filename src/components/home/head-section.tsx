"use client";

import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "../ui/carousel";
import Image from "next/image";

const heading = {
  title: "Success Stories",
  subtitle:
    "Celebrating the beautiful unions we've helped create - real stories of love, commitment, and lifelong happiness.",
};

export default function HeadSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 2000);
  }, [api, current]);
  const successStories = [
    {
      image: "/couples/image.png",
      alt: "Success Story 1"
    },
    {
      image: "/couples/image1.png",
      alt: "Success Story 2"
    },
    {
      image: "/couples/image2.png",
      alt: "Success Story 3"
    },
    {
      image: "/couples/image3.png",
      alt: "Success Story 4"
    },
    {
      image: "/couples/image4.png",
      alt: "Success Story 5"
    },
    {
      image: "/couples/image5.png",
      alt: "Success Story 6"
    },
    {
      image: "/couples/image6.png",
      alt: "Success Story 7"
    },
    {
      image: "/couples/image7.png",
      alt: "Success Story 8"
    },
    {
      image: "/couples/image8.png",
      alt: "Success Story 9"
    },
    {
      image: "/couples/image9.png",
      alt: "Success Story 10"
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--pure-white)' }}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 p-5 md:p-10 flex-col text-center mb-12"
        >
          <div className="inline-block mb-4 px-6 py-2 rounded-full" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <span className="text-sm font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
              Gallery
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair-display font-bold text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
            {heading.title}
          </h2>
          <p className="text-lg sm:text-xl font-montserrat max-w-3xl mx-auto mt-4" style={{ color: 'var(--primary-blue)' }}>
            {heading.subtitle}
          </p>
        </motion.div>
        
        <div className="relative">
          <Carousel setApi={setApi} className="p-0">
            <CarouselContent className="p-0">
              {successStories.map((story, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                    style={{ border: `2px solid var(--accent-gold)` }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={story.image}
                        alt={story.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-montserrat font-semibold text-sm">
                          A Beautiful Union
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
