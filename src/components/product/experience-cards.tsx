'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { AutoScrollImage } from "./auto-scroll-image"
import { useRouter } from "next/navigation"

const experiences = [
    {
     tag: "Full experience",
     title: "Wedding Day",
     description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
     images: [
       "https://www.ptaufiqphotography.com/wp-content/uploads/2019/02/Indian-Wedding-Haldi-Sunny%E2%80%99s-World-1-1-1024x683.jpg",
       "https://www.ptaufiqphotography.com/wp-content/uploads/2024/06/ptaufiq-indian-wedding-hard-rock-riviera-maya-cancun-mexico-getting-ready.png",
       "https://www.brides.com/thmb/9JaT-qoGtnA6TfKCxe2A-JAhZFY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/12-colorful-amalfi-coast-wedding-couple-portrait-oliver-fly-photography-1123-47ae8a040ac5469790734b3cad79111b.jpg",
     ],
     link: "/packages/business/package?routeAttachment=Wedding Day"
    },
    {
        tag: "Full experience",
        title: "Wedding Week",
        description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
        images: [
          "https://www.manifestmagazine.in/wp-content/uploads/2024/06/The-Big-Day-Main-Crop.png",
          "https://im.idiva.com/luxury/photogallery/2013/Jul/rhit-bal-sonam-kapoor-india-bridal-fashion-week.jpg?w=450&h=338&cc=1",
          "https://awareness-days.co.uk/wp-content/uploads/2022/12/National-Marriage-Week.jpg",
        ],
        link: "/packages/business/package?routeAttachment=Wedding Week"
       },
  {
    tag: "Full experience",
    title: "Pre-Wedding",
    description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
    images: [
      "https://weddingvyapar.com/wp-content/uploads/2024/08/netarhat-min-1140x760.png",
      "https://kamatharjun.b-cdn.net/wp-content/uploads/2023/06/Prewedding-Photoshoot-Priyanka-Prito-21.jpg",
      "https://digiartphotography.com/wp-content/uploads/pre-wedding-couple-photography-with-digiart-photography-manikonda-photoshoot-at-Deccan-Park-9298051870-scaled.jpg",
    ],
    link: "/packages/business/package?routeAttachment=Pre Wedding"
  },
  {
    tag: "Only relax",
    title: "Maternity",
    description: "Enjoy the beautiful scenery, fresh air and tranquility without having to do a thing. Take a walk along the scenic trails, relax with a book or just enjoy the quiet",
    images: [
      "https://www.adventisthealth.org/images/bakersfield/bakersfield-maternity.jpg",
      "https://www.andsoidontforget.com.au/wp-content/uploads/sites/12336/2022/09/What-to-wear-for-Maternity-Photos-1-1024x683.jpg",
      "https://photos.smugmug.com/Maternity-Photography/i-zWTpCtH/0/LVgGPSD2hqRwrSkKsv6ngTKxp4m6PkXWcTFMtW3RV/XL/maternity-photography-creative-outdoors-bangalore-3-XL.jpg",
    ],
    link: "/packages/business/package?routeAttachment=Maternity"
  },
  {
    tag: "Full experience",
    title: "Baby Shower",
    description: "This format involves active participation in the day-to-day affairs of the farm, from caring for the animals to harvesting the crops",
    images: [
      "https://img.freepik.com/free-photo/small-baby-lies-basket-with-plaid_8353-7789.jpg?w=740&t=st=1679475378~exp=1679475978~hmac=0f5591afcfccbdbde0625a52d7a05773b815b402c99755d63772d4c491ae8586",
      "https://cherieswoodcom.b-cdn.net/wp-content/uploads/2023/07/Baby-Shower-Perfetto-scaled-1.webp",
      "https://meghnarathorephotography.com/wp-content/uploads/2023/09/Nishant-22-days-baby-photoshoot-by-best-baby-photographer-in-delhi-gurugram-India-august-2023-1.jpg",
    ],
    link: "/packages/business/package?routeAttachment=Baby Shower"
  },
  {
    tag: "Only relax",
    title: "Parties & Events",
    description: "Enjoy the beautiful scenery, fresh air and tranquility without having to do a thing. Take a walk along the scenic trails, relax with a book or just enjoy the quiet",
    images: [
      "https://media.licdn.com/dms/image/v2/C4E1BAQG0_xR2MJ8JIg/company-background_10000/company-background_10000/0/1584998692381/themed_parties_cover?e=2147483647&v=beta&t=tfstp63nTvwls7frYicN70ceYWlS8jFIBQR0NQUfFnY",
      "https://www.bettaeventhire.com.au/wp-content/uploads/2020/01/shutterstock_1527035324.jpg",
      "https://media.istockphoto.com/id/1397143960/photo/celebratory-red-wine-toast-between-senior-adult-friends-at-candle-light-social-event-party.jpg?s=612x612&w=0&k=20&c=fNSR-gTQS49WYKJ-ZnOMoUTHjHcUbafyxfyTv_pfKrA=",
    ],
    link: "/packages/business/package?routeAttachment=Parties-Events"
  },
]

export default function ExperienceCards() {
    const router = useRouter()

    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    function handelOnclik(link : string) {
      router.push(link)
    }
    return (
      <>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
        {experiences.map((experience, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden rounded-3xl border-0 aspect-[4/5]"
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handelOnclik(experience.link)}
          >
            <AutoScrollImage 
              images={experience.images} 
              alt={experience.title} 
              isPaused={hoveredCard === index}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 p-8 flex flex-col justify-end">
              <div className="bg-white/20 text-white text-sm w-fit px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {experience.tag}
              </div>
              <h2 className="text-white text-2xl font-bold mt-4 mb-3">
                {experience.title}
              </h2>
              <p className="text-white/90 text-sm">
                {experience.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
      </>
    )
  }
  
  