"use client";

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface PackageFeaturesProps {
  features: string[];
}

export function PackageFeatures({ features }: PackageFeaturesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialFeatures = 3;
  const hasMoreFeatures = features.length > initialFeatures;

  const visibleFeatures = isExpanded ? features : features.slice(0, initialFeatures);
  
  return (
    <div className="space-y-3">
      {visibleFeatures.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
          <span className="text-gray-600">{feature}</span>
        </div>
      ))}
      
      {hasMoreFeatures && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mt-2"
        >
          <span>{isExpanded ? 'View Less' : `View ${features.length - initialFeatures} More Features`}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}