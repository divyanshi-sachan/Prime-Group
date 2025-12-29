import React from "react";
import {
  Eye,
  Heart,
  LucideCross,
  Search as SearchIcon,
  ShoppingBag,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";

const QuickLinks = ["Occasions", "Business", "Instant Booking"];

export default function SearchBar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-transparent group" style={{ color: 'var(--pure-white)' }}
        >
          <SearchIcon className="h-10 w-10 stroke-[2.5px] group-hover:text-gold-gradient transition-colors" style={{ color: 'var(--pure-white)' }} />
          <span className="sr-only">Search</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-screen">
        <SheetHeader className="flex flex-col items-center justify-center mt-10 md:mt-24">
          <SheetTitle className="md:text-3xl">Search our site</SheetTitle>

          <SheetDescription asChild className="w-full mt-5">
            <div className="relative md:w-1/2 mx-auto">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="dark:bg-gray-800 w-full pl-10 ring-0 dark:text-white"
              />
            </div>
          </SheetDescription>
        </SheetHeader>
        <div className=" container mx-auto p-10 md:p-10 md:flex gap-20 ">
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Search </h2>
            <div className="flex flex-col">
              {QuickLinks.map((link, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-sm ">{link}</h3>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="md:text-2xl font-bold mb-4 text-lg">
              Need some inspiration?
            </h2>
            <div className="flex flex-wrap gap-2">
              <ItemCard />
              <ItemCard />
              <ItemCard />
              <ItemCard />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ItemCard() {
  return (
    <>
      <div className="border-none shadow-none flex md:flex-col gap-3 border-b-[1px] border group">
        <div className="relative overflow-hidden rounded-lg w-[60px]  md:w-[230px]">
          <Image
            src="https://placehold.co/200x520"
            alt="Shoes"
            priority
            width={230}
            height={220}
            className=" h-[100px] md:w-full group-hover:scale-105 transition duration-1000  md:h-[320px]  object-cover "
          />
          <div className="absolute inset-0 w-full h-full p-3 opacity-0 group-hover:opacity-100 transition duration-1000">
            <div className="flex flex-col justify-end w-full h-full">
            </div>
          </div>
        </div>
        <div className="  ">
          <div>Pre Wedding</div>
          <div>
            <div className=" font-bold text-sm">$ 17,000 - 150,000</div>
          </div>
        </div>
      </div>
    </>
  );
}