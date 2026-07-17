// app/page.tsx
import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import QuickAccess from "@/components/home/QuickAccess";
import BrowseCategories from "@/components/home/BrowseCategories";
import TodaysTasks from "@/components/home/TodaysTasks";

export const metadata: Metadata = {
  title: "Toolverse — Free Utility Hub for Everyone",
  description:
    "PDF, image, finance, dev, and resume tools — processed entirely in your browser. No sign-up. No upload limits. Free forever.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Dashboard grid section */}
      <section className="pb-40">
        <div className="page-container dashboard-container">
          <div className="dashboard-grid">
            <QuickAccess />
            <BrowseCategories />
            <TodaysTasks />
          </div>
        </div>
      </section>
    </>
  );
}
