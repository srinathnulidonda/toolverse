// app/(legal)/cookies/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { lastUpdated } from "./data";
import styles from "./Cookies.module.css";
import CookiesContent from "./CookiesContent";
import { logger } from "@/lib/logger";

export const metadata = {
  title: "Cookie Policy – Toolverse",
  description: "Learn about our cookie usage and your choices.",
};

export default function CookiesPage() {
  return (
    <>
      <CookiesContent />
    </>
  );
}