// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="tv-header" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            zIndex: 1000,
            background: "#1A1A18",
            borderBottom: "0.5px solid #2C2C28",
            height: "56px",
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
        }}>

            {/* Logo */}
            <Link href="/" style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                textDecoration: "none",
                flexShrink: 0,
            }}>
                <span style={{ fontSize: "18px", lineHeight: 1 }}>⚡</span>
                <span style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#EDEDEA",
                    letterSpacing: "-0.4px",
                    fontFamily: font,
                }}>
                    Toolverse
                </span>
            </Link>

            {/* Centre nav — desktop only*/}
            <nav className="tv-nav-links" style={{
                display: "flex",
                alignItems: "center",
                gap: "36px",
                flex: 1,
                justifyContent: "center",
            }}>
                {["Tools", "Blog", "API"].map((item) => (
                    <Link
                        key={item}
                        href={`/${item.toLowerCase()}`}
                        className="tv-nav-link"
                        style={{
                            fontSize: "15px",
                            fontWeight: 400,
                            color: "#A8A79E",
                            textDecoration: "none",
                            fontFamily: font,
                        }}
                    >
                        {item}
                    </Link>
                ))}
            </nav>

            {/* Right — CTA (desktop) + hamburger (mobile) */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginLeft: "auto" }}>

                {/* CTA — hidden on mobile */}
                <Link
                    href="/signup"
                    className="tv-cta-btn"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 20px",
                        background: "#145C3C",
                        color: "#FFFFFF",
                        borderRadius: "7px",
                        fontSize: "14px",
                        fontWeight: 600,
                        textDecoration: "none",
                        letterSpacing: "-0.1px",
                        fontFamily: font,
                        whiteSpace: "nowrap",
                    }}
                >
                    Try free
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </Link>

                {/* Hamburger — mobile only */}
                <button
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="tv-hamburger"
                    style={{
                        display: "none",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px",
                        color: "#A8A79E",
                        flexShrink: 0,
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        {menuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="8" x2="21" y2="8" />
                                <line x1="3" y1="16" x2="21" y2="16" />
                            </>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div style={{
                    position: "absolute",
                    top: "56px",
                    left: 0,
                    right: 0,
                    background: "#1A1A18",
                    borderBottom: "0.5px solid #2C2C28",
                    padding: "16px 24px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                }}>
                    {["Tools", "Blog", "API"].map((item) => (
                        <Link
                            key={item}
                            href={`/${item.toLowerCase()}`}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                fontSize: "16px",
                                color: "#A8A79E",
                                textDecoration: "none",
                                padding: "12px 0",
                                borderBottom: "0.5px solid #2C2C28",
                                fontFamily: font,
                            }}
                        >
                            {item}
                        </Link>
                    ))}
                    <Link
                        href="/signup"
                        onClick={() => setMenuOpen(false)}
                        style={{
                            marginTop: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "12px 16px",
                            background: "#145C3C",
                            color: "#FFFFFF",
                            borderRadius: "7px",
                            fontSize: "15px",
                            fontWeight: 600,
                            textDecoration: "none",
                            fontFamily: font,
                        }}
                    >
                        Try free →
                    </Link>
                </div>
            )}

            <style>{`
        .tv-nav-link:hover { color: #EDEDEA !important; transition: color 0.15s; }
        .tv-cta-btn:hover  { background: #1F7A52 !important; transition: background 0.15s; }

        @media (max-width: 768px) {
          .tv-nav-links { display: none !important; }
          .tv-cta-btn   { display: none !important; }
          .tv-hamburger { display: flex !important; }
          .tv-header    { padding: 0 16px !important; }
        }
      `}</style>
        </header>
    );
}