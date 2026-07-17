// app/(legal)/terms/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { lastUpdated } from "./data";
import styles from "./Terms.module.css";
import TermsContent from "./TermsContent";
import { logger } from "@/lib/logger";

export const metadata = {
  title: "Terms of Service – Toolverse",
  description: "Read the terms and conditions for using Toolverse’s free tools.",
};

export default function TermsPage() {
  return (
    <>
      <TermsContent />
    </>
  );
}