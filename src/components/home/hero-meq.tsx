import React from "react";
import Marquee from "../ui/marquee";

const springClearanceSlogans = [
  "Spring into Savings: Up to 70% Off Furniture!",
  "Refresh Your Space, Refresh Your Wallet - Spring Clearance Event",
  "Bloom Your Home with Massive Furniture Discounts",
  "Seasonal Savings Spectacular: 70% Off Select Furniture",
  "Spring Clean Your Living Space with Unbeatable Deals",
  "Transform Your Home for Less - Spring Clearance Sale",
  "Furniture Makeover Sale: Save Big This Spring",
  "Clearance Countdown: Up to 70% Off Home Essentials",
  "Spring Forward with Stunning Furniture Savings",
  "Massive Markdowns on Must-Have Furniture - Limited Time!",
];

export default function HeroMeq() {
  return (
    <Marquee className="w-full text-white bg-black mt-2 md:text-xl md:font-medium">
      {springClearanceSlogans.map((slogan, index) => (
        <span key={index}>{slogan}</span>
      ))}
    </Marquee>
  );
}
