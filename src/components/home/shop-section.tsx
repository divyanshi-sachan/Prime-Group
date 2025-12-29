"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { ShoppingBag } from "lucide-react";

interface ShopInterface {
  title: string;
  image: string;
  link: string;
}

const shopInterface: ShopInterface[] = [
  {
    title: "Living Room",
    image: "/stock/interior-designers.jpg",
    link: "/categories/living-room",
  },
  {
    title: "Bedroom",
    image: "/stock/interior-designers.jpg",
    link: "/categories/bedroom",
  },
  {
    title: "Dining",
    image: "/stock/interior-designers.jpg",
    link: "/categories/dining",
  },
  {
    title: "Office",
    image: "/stock/interior-designers.jpg",
    link: "/categories/office",
  },
  {
    title: "New Arrivals",
    image: "/stock/interior-designers.jpg",
    link: "/new-arrivals",
  },
  {
    title: "New Arrivals",
    image: "/stock/interior-designers.jpg",
    link: "/new-arrivals",
  },
];

const heading = {
  title: "Shop Gram",
  subtitle:
    "Inspire and let yourself be inspired, from one unique fashion to another.",
};

export default function ShopSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  return (
    <div>
      <div className=" px-3 md:mt-7 md:mb-7">
        <div className=" flex items-center justify-center gap-4 p-5  md:p-10 flex-col text-center">
          <div className=" text-3xl md:text-5xl  tracking-tight  ">
            {heading.title}
          </div>
          <div className="text-sm md:text-base">{heading.subtitle}</div>
        </div>
        <div>
          {" "}
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            setApi={setApi}
            className=" max-w-screen-2xl mx-auto"
          >
            <CarouselContent className=" max-w-screen-2xl mx-auto ">
              {shopInterface.map((items, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 md:basis-1/2 lg:basis-1/2 xl:basis-1/5 w-1/3 lg:w-1/2 xl:w-1/3"
                >
                  <ImageCard
                    image={items.image}
                    title={items.title}
                    link={items.link}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className=" flex items-center justify-center md:hidden gap-2 p-3 md:mt-10 mt-5">
            {[...Array(5)].map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className={`w-2 h-2 rounded-full p-0 ${
                  index === current ? "bg-primary" : "bg-primary/30"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ image, link }: ShopInterface) {
  return (
    <Link href={link}>
      <div className="relative md:ml-3 group overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={image}
          width={500}
          height={900}
          className=" aspect-square object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute z-10 inset-0 w-full h-full p-5 rounded-lg bg-black/30 group-hover:scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center justify-center w-full h-full">
            <Button className="rounded-full w-12 h-12 opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
              <ShoppingBag className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
