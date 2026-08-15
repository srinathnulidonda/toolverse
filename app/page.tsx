// app/page.tsx
import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import QuickAccess from "@/components/home/QuickAccess";
import BrowseCategories from "@/components/home/BrowseCategories";
import TodaysTasks from "@/components/home/TodaysTasks";
import PopularTools from "@/components/home/PopularTools";
import TrendingTools from "@/components/home/TrendingTools";
import RecentlyAdded from "@/components/home/RecentlyAdded";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toolverses.vercel.app";

export const metadata: Metadata = {
  title: "Toolverse — Free Utility Hub for Everyone",
  description:
    "PDF, image, finance, dev, and resume tools — processed entirely in your browser. No sign-up. No upload limits. Free forever.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Toolverse — Free Utility Hub for Everyone",
    description:
      "PDF, image, finance, dev, and resume tools — processed entirely in your browser. No sign-up. No upload limits. Free forever.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse — Free Utility Hub for Everyone",
    description:
      "PDF, image, finance, dev, and resume tools — processed entirely in your browser. No sign-up. No upload limits. Free forever.",
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Toolverse — Free Utility Hub for Everyone",
  description:
    "PDF, image, finance, dev, and resume tools — processed entirely in your browser. No sign-up. No upload limits. Free forever.",
  url: SITE_URL,
  isPartOf: {
    "@type": "WebSite",
    name: "Toolverse",
    url: SITE_URL,
  },
  about: [
    { "@type": "Thing", name: "PDF Tools" },
    { "@type": "Thing", name: "Image Tools" },
    { "@type": "Thing", name: "Finance Tools" },
    { "@type": "Thing", name: "Developer Tools" },
    { "@type": "Thing", name: "Resume Tools" },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <Hero />

      <section className="pb-40">
        <div className="page-container dashboard-container">
          <div className="dashboard-grid">
            <QuickAccess />
            <BrowseCategories />
            <TodaysTasks />
          </div>

          <div className="home-stack">
            <PopularTools />
            <TrendingTools />
            <RecentlyAdded />
          </div>
        </div>
      </section>

      <style>{`
        .home-stack {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-top: 40px;
        }
      `}</style>
    </>
  );
}