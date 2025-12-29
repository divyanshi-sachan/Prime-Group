"use client"
import React from "react";
import { useState, useEffect } from "react"
import { CategorySection } from "@/components/product/CategorySection";
import { photographyPackages } from "@/components/data/packages";
import { useRouter } from "next/navigation";

export default function PackagePage() {
  const [currentRoute, setCurrentRoute] = useState<string>("Pre Wedding")

  useEffect(() => {
    const routeAttachment = new URLSearchParams(window.location.search).get("routeAttachment")
    if (routeAttachment) {
      setCurrentRoute(routeAttachment)
    }
  }, [])
  //@ts-ignore
  const category = photographyPackages[currentRoute]
  const key = 1
  return (
    <>
      <div className="min-h-screen bg-gray-50">
      <main>
        <CategorySection
          key={key}
          title={category.title}
          oneline={category.oneline}
          description={category.description}
          packages={category.packages}
        />
      </main>
    </div>
    </>
  );
}