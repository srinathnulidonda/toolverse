// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/home/Hero";

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
    </>
  );
}