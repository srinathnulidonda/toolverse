// components/home/SearchBar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?s=${encodeURIComponent(query.trim())}`);
        } else {
            router.push("/search");
        }
    }

    return (
        <>
            <form
                onSubmit={handleSearch}
                className="hero-search-form"
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    background: "#1A1A17",
                    border: "0.5px solid #2C2C28",
                    borderRadius: "9999px",
                    boxShadow:
                        "0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.2s ease",
                }}
            >
                {/* Search icon */}
                <span
                    style={{
                        position: "absolute",
                        left: "16px",
                        color: "#3C3B35",
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "none",
                    }}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </span>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tools..."
                    className="hero-search-input"
                    style={{
                        flex: 1,
                        padding: "12px 18px 12px 42px",
                        background: "transparent",
                        border: "none",
                        fontSize: "14px",
                        color: "#EDEDEA",
                        fontFamily: font,
                        outline: "none",
                        caretColor: "#4CAF82",
                        minWidth: 0,
                        letterSpacing: "-0.1px",
                        borderRadius: "9999px",
                    }}
                />
            </form>

            <style>{`
        .hero-search-input::placeholder {
          color: #3C3B35;
          font-weight: 400;
        }

        .hero-search-form:hover {
          border-color: #3C3B35 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16),
            0 2px 4px rgba(0, 0, 0, 0.12) !important;
        }

        .hero-search-form:focus-within {
          border-color: #4CAF82 !important;
          box-shadow: 0 0 0 3px rgba(76, 175, 130, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.16) !important;
        }

        @media (max-width: 480px) {
          .hero-search-form {
            max-width: 100% !important;
          }
        }
      `}</style>
        </>
    );
}