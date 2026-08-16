// app/sitemap.ts
import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/lib/tools";
import { logger } from "@/lib/logger";

// Safely import COLLECTIONS
let COLLECTIONS: any[] = [];
try {
  const collections = require("@/data/collections");
  COLLECTIONS = collections.COLLECTIONS || [];
} catch (error) {
  // Log the error for debugging purposes but continue with empty collections
  // This prevents sitemap generation from failing if collections data is unavailable
  if (process.env.NODE_ENV !== "production") {
    logger.warn("Failed to load collections data for sitemap:", error);
  }
  COLLECTIONS = [];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverses.vercel.app";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/tools/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = COLLECTIONS.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...categoryRoutes, ...toolRoutes, ...collectionRoutes];
}