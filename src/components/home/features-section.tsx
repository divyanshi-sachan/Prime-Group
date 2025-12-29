

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, CreditCard, ArrowLeft, Headphones } from "lucide-react";

export default function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 300);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: Package,
      title: "Free Shipping",
      description: "You will love at great low prices",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: CreditCard,
      title: "Flexible Payment",
      description: "Pay with Multiple Credit Cards",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: ArrowLeft,
      title: "14 Day Returns",
      description: "Within 30 days for an exchange",
      color: "from-amber-500 to-orange-400"
    },
    {
      icon: Headphones,
      title: "Premium Support",
      description: "Outstanding premium support",
      color: "from-emerald-500 to-teal-400"
    },
  ];

  return (
    <div 
      ref={sectionRef}
      className="container px-4 py-16 mx-auto relative overflow-hidden min-h-screen flex flex-col justify-center"
    >
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
      
      {/* Interactive spotlight effect */}
      <div 
        className="absolute bg-gradient-to-r from-blue-500 to-purple-500 opacity-5 rounded-full blur-3xl w-64 h-64 pointer-events-none transition-all duration-300"
        style={{
          left: `${mousePosition.x - 128}px`,
          top: `${mousePosition.y - 128}px`,
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-16 relative">
          <h1 className="text-4xl md:text-6xl tracking-tighter font-light text-left mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Features</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <p className="text-base md:text-lg text-gray-600 mt-4 max-w-lg">Elevate your shopping experience with our premium features designed for your convenience.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 relative z-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ${
                animated ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card 
                className={`border border-gray-200 overflow-hidden group bg-white/80 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-500 ${
                  hoveredIndex === index ? 'shadow-lg scale-105' : 'shadow-sm'
                }`}
              >
                <CardContent className="flex flex-col items-center text-center p-8 relative">
                  {/* Background glow */}
                  <div 
                    className={`absolute -inset-px bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg blur-sm`}
                  ></div>
                  
                  {/* Icon container with animations */}
                  <div className={`relative mb-6 p-4 rounded-full transition-all duration-500 ${
                    hoveredIndex === index ? `bg-gradient-to-br ${feature.color} shadow-lg` : 'bg-gray-100'
                  }`}>
                    <feature.icon className={`w-8 h-8 transition-all duration-500 z-10 relative ${
                      hoveredIndex === index ? 'text-white animate-pulse' : 'text-gray-700'
                    }`} />
                    
                    {hoveredIndex === index && (
                      <>
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white"></div>
                        <div className="absolute -inset-1 rounded-full animate-pulse opacity-10 bg-white blur-sm"></div>
                      </>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-medium mb-3 transition-colors duration-300 ${
                    hoveredIndex === index ? `text-transparent bg-clip-text bg-gradient-to-r ${feature.color}` : ''
                  }`}>{feature.title}</h3>
                  
                  <p className="text-sm text-gray-600 relative z-10 font-light">
                    {feature.description}
                  </p>
                  
                  {/* Animated underline for card */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-500 rounded-full ${
                    hoveredIndex === index ? 'w-full' : 'w-0'
                  }`}></div>
                  
                  {/* Animated corner accents */}
                  <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-transparent transition-all duration-500 ${
                    hoveredIndex === index ? `border-t-purple-400 border-l-purple-400` : ''
                  }`}></div>
                  <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-transparent transition-all duration-500 ${
                    hoveredIndex === index ? `border-b-blue-400 border-r-blue-400` : ''
                  }`}></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}