// components/tool/RecentToolTracker.tsx
"use client";

import { useEffect } from "react";

const RECENT_KEY = "tv:recents";
const MAX_ITEMS = 6;

export default function RecentToolTracker({ slug }: { slug: string }) {
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
            const prev: string[] = Array.isArray(stored) ? stored : [];
            const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
            /* ignore storage errors */
        }
    }, [slug]);

    return null;
}