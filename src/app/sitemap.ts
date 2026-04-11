import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/privacy",
    "/terms",
    "/refund",
    "/shipping-delivery",
    "/community-guidelines",
    "/discover",
    "/blog",
    "/faqs",
    "/contact-us",
    "/favorites",
    "/gallary",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : ("weekly" as const),
    priority: path === "" ? 1 : 0.8,
  }));

  return staticRoutes;
}
