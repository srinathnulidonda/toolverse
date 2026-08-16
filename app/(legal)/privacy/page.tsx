// app/(legal)/privacy/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { lastUpdated } from "./data";
import styles from "./Privacy.module.css";
import PrivacyContent from "./PrivacyContent";
import { logger } from "@/lib/logger";

export const metadata = {
  title: "Privacy Policy – Toolverse",
  description: "Learn how we protect your privacy and handle your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <PrivacyContent />
    </>
  );
}