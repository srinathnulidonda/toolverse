// app/sitemap.ts
import { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { COLLECTIONS } from "@/data/collections";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverses.vercel.app";

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
    ];

    // Category pages
    const categoryPages = CATEGORIES.map((cat) => ({
        url: `${baseUrl}/tools/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Tool pages
    const toolPages = TOOLS.map((tool) => ({
        url: `${baseUrl}${tool.href}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Collection pages
    const collectionPages = COLLECTIONS.map((col) => ({
        url: `${baseUrl}/collections/${col.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [
        ...staticPages,
        ...categoryPages,
        ...toolPages,
        ...collectionPages,
    ];
}