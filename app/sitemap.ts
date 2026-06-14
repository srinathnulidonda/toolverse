// app/sitemap.ts
import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/lib/tools";

// Safely import COLLECTIONS
let COLLECTIONS: any[] = [];
try {
    const collections = require("@/data/collections");
    COLLECTIONS = collections.COLLECTIONS || [];
} catch {
    // Collections file doesn't exist, that's fine
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