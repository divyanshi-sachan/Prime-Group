// "use client"; 

// import { useState, useEffect } from 'react';
// import { Button } from "@/components/ui/button"
// import { motion, AnimatePresence } from 'framer-motion'
// import { CheckCircle2 } from 'lucide-react'
// import { useRouter } from 'next/navigation';  

// interface Package {
//   name: string
//   originalPrice: number
//   offerPrice?: number
//   description: string
//   features: string[]
// }

// interface PricingPlanProps {
//   packages: Package[]
//   activePackage: string | null
//   setActivePackage: (packageName: string | null) => void
// }

// export function PricingPlan({ 
//   packages, 
//   activePackage, 
//   setActivePackage 
// }: PricingPlanProps) {
//   const router = useRouter();  // Correct usage for App Router
//     const [currentRoute, setCurrentRoute] = useState<string>("Pre Wedding")
  
//     useEffect(() => {
//       const routeAttachment = new URLSearchParams(window.location.search).get("routeAttachment")
//       if (routeAttachment) {
//         setCurrentRoute(routeAttachment)
//       }
//     }, [])

//   const handleEnquireClick = () => {
//     router.push('/contact-us');  // Navigate to the Contact Us page
//   };
//   function handelOnclik(link : string) {
//     router.push(link)
//   }

//   return (
//     <section id="pricing" className="space-y-8">
//       <div>
//         <h2 className="text-4xl font-bold mb-4 
//           bg-black
//           text-transparent bg-clip-text ">
//           Pricing Plans<span className="text-black-500">.</span>
//         </h2>
//         <p className="text-gray-600">
//           Transparent, affordable packages crafted to capture your most precious moments.
//         </p>
//       </div>

//       <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
//         <div className="flex justify-between items-center mb-8 pb-4 border-b">
//           <h3 className="text-2xl font-bold text-black-800">
//             Custom Pricing<span className="text-black-500">.</span>
//           </h3>
//           <Button 
//             variant="destructive" 
//             className="bg-black hover:bg-black"
//             onClick={handleEnquireClick} 
//           >
//             Enquire Now
//           </Button>
//         </div>

//         <div className="space-y-6">
//           {packages.map((pkg,index) => (
//             <motion.div 
//               key={pkg.name}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//               className="border-b pb-6 last:border-b-0"
//             >
//               <div
//                 className="flex justify-between items-center cursor-pointer group"
//                 onClick={() => setActivePackage(activePackage === pkg.name ? null : pkg.name)}
//               >
//                 <h3 className="text-xl font-semibold text-blue-600 group-hover:text-blue-800 transition-colors group-hover:underline">
//                   {pkg.name}
//                 </h3>
//                 <div className="flex items-center space-x-4">
//                   <span className="text-gray-400 line-through text-sm">
//                     ₹{pkg.originalPrice}
//                   </span>
//                   <span className="text-2xl font-bold text-black-600">
//                     ₹{pkg.offerPrice || pkg.originalPrice}
//                   </span>
//                 </div>
//               </div>

//               <AnimatePresence>
//                 {activePackage === pkg.name && (
//                   <motion.div 
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="mt-6 overflow-hidden"
//                   >
//                     <p className="text-gray-700 mb-6">{pkg.description}</p>
                    
//                     <div className="grid md:grid-cols-2 gap-4 mb-6">
//                       {pkg.features.map((feature, index) => (
//                         <div 
//                           key={index} 
//                           className="flex items-center space-x-2 text-gray-700"
//                         >
//                           <CheckCircle2 className="text-black-500 w-5 h-5" />
//                           <span>{feature}</span>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-red-500 font-semibold mb-2">Offer Price</p>
//                         <div className="flex items-center space-x-3">
//                           <span className="text-gray-400 line-through text-sm">
//                             ₹{pkg.originalPrice}
//                           </span>
//                           <span className="text-3xl font-bold text-black-600">
//                             ₹{pkg.offerPrice || pkg.originalPrice}
//                           </span>
//                         </div>
//                       </div>
//                       <Button 
//                         variant="default" 
//                         className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
//                         onClick={() => handelOnclik(`/checkout?routeAttachment=${currentRoute}&packages=${index}`)}
//                       >
//                         Book Now
//                       </Button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Package {
  name: string
  originalPrice: number
  offerPrice?: number
  description: string
  features: string[]
}

interface PricingPlanProps {
  packages: Package[]
  activePackage: string | null
  setActivePackage: (packageName: string | null) => void
}

export function PricingPlan({ packages, activePackage, setActivePackage }: PricingPlanProps) {
  const router = useRouter()
  const [currentRoute, setCurrentRoute] = useState<string>("Pre Wedding")

  useEffect(() => {
    const routeAttachment = new URLSearchParams(window.location.search).get("routeAttachment")
    if (routeAttachment) {
      setCurrentRoute(routeAttachment)
    }
  }, [])

  const handleEnquireClick = () => {
    router.push("/contact-us")
  }

  function handelOnclik(link: string) {
    router.push(link)
  }

  return (
    <section id="pricing" className="space-y-8">
      <div>
        <h2
          className="text-3xl md:text-4xl font-bold mb-4 
          bg-black
          text-transparent bg-clip-text"
        >
          Pricing Plans<span className="text-black-500">.</span>
        </h2>
        <p className="text-gray-600">Transparent, affordable packages crafted to capture your most precious moments.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 pb-4 border-b gap-4">
          <h3 className="text-xl md:text-2xl font-bold text-black-800">
            Custom Pricing<span className="text-black-500">.</span>
          </h3>
          <Button
            variant="destructive"
            className="bg-black hover:bg-black w-full sm:w-auto"
            onClick={handleEnquireClick}
          >
            Enquire Now
          </Button>
        </div>

        <div className="space-y-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b pb-6 last:border-b-0"
            >
              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer group gap-2 sm:gap-0"
                onClick={() => setActivePackage(activePackage === pkg.name ? null : pkg.name)}
              >
                <h3 className="text-lg md:text-xl font-semibold text-blue-600 group-hover:text-blue-800 transition-colors group-hover:underline">
                  {pkg.name}
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 line-through text-sm">₹{pkg.originalPrice}</span>
                  <span className="text-xl md:text-2xl font-bold text-black-600">
                    ₹{pkg.offerPrice || pkg.originalPrice}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {activePackage === pkg.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <p className="text-gray-700 mb-6">{pkg.description}</p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-700">
                          <CheckCircle2 className="text-black-500 w-5 h-5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-red-500 font-semibold mb-2">Offer Price</p>
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400 line-through text-sm">₹{pkg.originalPrice}</span>
                          <span className="text-2xl md:text-3xl font-bold text-black-600">
                            ₹{pkg.offerPrice || pkg.originalPrice}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 w-full sm:w-auto"
                        onClick={() => handelOnclik(`/checkout?routeAttachment=${currentRoute}&packages=${index}`)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

