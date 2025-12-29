import React from 'react';
import { PackageCard } from './PackageCard';

interface Package {
  name: string;
  originalPrice?: number;
  offerPrice?: number;
  description: string;
  features: string[];
}

interface PackageCarouselProps {
  title: string;
  packages: Package[];
}

export function PackageCarousel({ title, packages }: PackageCarouselProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg, index) => (
        <div key={index} className="flex">
          <PackageCard index={index} title={title} {...pkg} />
        </div>
      ))}
    </div>
  );
}

