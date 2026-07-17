// app/(marketing)/faq/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { categories, faqs } from "./data";
import styles from "./FAQ.module.css";
import FAQContent from "./FAQContent";
import { logger } from "@/lib/logger";

export const metadata = {
  title: "FAQ – Toolverse",
  description: "Find answers to common questions about Toolverse features, privacy, and more.",
};

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.faqHero}>
        <div className={styles.faqHeroContainer}>
          <div className={styles.faqHeroContent}>
            <div className={styles.faqHeroBadge}>
              <i className="ti ti-help-circle" />
              <span>Help Center</span>
            </div>
            <h1 className={styles.faqHeroTitle}>How can we help you?</h1>
            <p className={styles.faqHeroDescription}>
              Find answers to common questions about Toolverse. Can't find what you need?{" "}
              <Link href="/contact">Contact support</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Main content handled by client component */}
      <FAQContent />
    </>
  );
}