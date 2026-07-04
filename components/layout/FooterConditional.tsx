// components/layout/FooterConditional.tsx
"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterConditional() {
    const pathname = usePathname();

    // Define paths that should hide the footer (application pages)
    // Using exact matches for exact paths and startsWith for dynamic routes
    const shouldHideFooter =
        pathname === "/categories" ||
        pathname === "/search" ||
        pathname.startsWith("/tools");

    return shouldHideFooter ? null : <Footer />;
}