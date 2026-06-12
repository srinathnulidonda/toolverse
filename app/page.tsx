// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
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
      <section style={{ background: "#111110", padding: "0 40px 40px" }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}>
          <div
            className="dashboard-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
              maxWidth: "1200px",
            }}
          >
            <QuickAccess />
            <BrowseCategories />
            <TodaysTasks />
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1080px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1081px) {
          .dashboard-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}