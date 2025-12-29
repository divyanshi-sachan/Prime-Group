"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Eye, Heart, LucideCross, ShoppingBag } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
// import React from "react";


export default function ProductCard() {
  const [hover, setHover] = React.useState(false);

  // type ForwardedProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;

  // const CustomWrapper = forwardRef<HTMLDivElement, ForwardedProps>(
  //   ({ className, ...props }, ref) => (
  //     <motion.div ref={ref} className={className} {...props} />
  //   )
  // );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="border-none shadow-none flex flex-col gap-2 sm:gap-4 group  md:w-[330px]"
    >
      <div className="relative overflow-hidden w-full rounded-lg h-[250px] sm:h-[300px] md:h-[450px]">
        <Image
          src="https://placehold.co/200x420"
          alt="Cotton T-Shirt"
          priority
          width={770}
          height={1075}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-1000"
        />
        <div className="absolute inset-0 w-full h-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition duration-1000 bg-black/20">
          <div className="flex flex-col justify-end w-full h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hover ? 1 : 0 }}
              style={{
                display: "flex",           // Corresponds to "flex"
                flexWrap: "wrap",          // Corresponds to "flex-wrap"
                gap: "0.5rem",             // Corresponds to "gap-2" (2 * 0.25rem = 0.5rem)
                alignItems: "center",      // Corresponds to "items-center"
                justifyContent: "center",  // Corresponds to "justify-center"
                transition: "all 0.2s",    // Corresponds to "transition" (default transition effect)
              }}              
            >
              <motion.div
                initial={{ y: -100 }}
                animate={{ y: hover ? 0 : 100 }}
                transition={{ delay: 0 }}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 w-10 h-10 "
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="sr-only">Add to cart</span>
                </Button>
              </motion.div>
              <motion.div
                initial={{ y: -100 }}
                animate={{ y: hover ? 0 : 100 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 w-10 h-10"
                >
                  <Heart className="w-5 h-5" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
              </motion.div>
              <motion.div
                initial={{ y: -100 }}
                animate={{ y: hover ? 0 : 100 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 w-10 h-10 "
                >
                  <LucideCross className="w-5 h-5" />
                  <span className="sr-only">Compare</span>
                </Button>
              </motion.div>
              <motion.div
                transition={{ delay: 0.4 }}
                initial={{ y: -100 }}
                animate={{ y: hover ? 0 : 100 }}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 w-10 h-10"
                >
                  <Eye className="w-5 h-5" />
                  <span className="sr-only">Quick view</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="text-center sm:text-left px-2 sm:px-0">
        <div className="text-sm sm:text-base font-medium">Cotton T-Shirt</div>
        <div className="font-bold text-sm sm:text-base mt-1">$12.00</div>
      </div>
    </div>
  );
}
