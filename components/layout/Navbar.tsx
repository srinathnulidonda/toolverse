// components/layout/Navbar.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DropdownId = "categories" | "collections" | "popular" | "blog" | null;

const CATEGORIES = [
    { label: "PDF", sub: "18 tools", icon: "ti-file-text", href: "/tools?cat=pdf" },
    { label: "Images", sub: "7 tools", icon: "ti-photo", href: "/tools?cat=image" },
    { label: "Converters", sub: "11 tools", icon: "ti-refresh", href: "/tools?cat=convert" },
    { label: "Text & Writing", sub: "9 tools", icon: "ti-edit", href: "/tools?cat=text" },
    { label: "Developer", sub: "9 tools", icon: "ti-code", href: "/tools?cat=dev" },
    { label: "Finance", sub: "8 tools", icon: "ti-calculator", href: "/tools?cat=finance" },
    { label: "Resume", sub: "4 tools", icon: "ti-file-cv", href: "/tools?cat=resume" },
    { label: "Utilities", sub: "6 tools", icon: "ti-settings", href: "/tools?cat=utils" },
];

const COLLECTIONS = [
    { label: "Student Toolkit", count: 8, icon: "ti-school", href: "/collections/student" },
    { label: "Developer Toolkit", count: 12, icon: "ti-code", href: "/collections/developer" },
    { label: "Job Seeker Toolkit", count: 7, icon: "ti-briefcase", href: "/collections/job-seeker" },
    { label: "Creator Toolkit", count: 9, icon: "ti-palette", href: "/collections/creator" },
    { label: "Business Toolkit", count: 11, icon: "ti-building", href: "/collections/business" },
];

const POPULAR = [
    { label: "Trending Tools", icon: "ti-trending-up", href: "/popular/trending" },
    { label: "Most Used", icon: "ti-star", href: "/popular/most-used" },
    { label: "Recently Added", icon: "ti-sparkles", href: "/popular/new", sep: true },
    { label: "Featured Tools", icon: "ti-bolt", href: "/popular/featured" },
];

const BLOG = [
    { label: "Guides", icon: "ti-book", href: "/blog/guides" },
    { label: "Tutorials", icon: "ti-player-play", href: "/blog/tutorials" },
    { label: "Product Updates", icon: "ti-bell", href: "/blog/updates" },
];

export default function Navbar() {
    const [open, setOpen] = useState<DropdownId>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    const close = useCallback(() => setOpen(null), []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) close();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [close]);

    useEffect(() => { close(); setMenuOpen(false); }, [pathname, close]);

    function toggle(id: DropdownId) {
        setOpen(prev => prev === id ? null : id);
    }

    return (
        <header className="tv-nav" ref={navRef as any}>

            {/* Logo */}
            <Link href="/" className="tv-logo" aria-label="Toolverse home">
                <img src="/logo.png" alt="Toolverse" className="tv-logo-image" />
            </Link>

            {/* Centre nav container */}
            <div className="tv-nav-wrapper">
                <nav className="tv-nav-center" aria-label="Main navigation">

                    {/* Categories — mega menu */}
                    <div className="tv-ni" onClick={() => toggle("categories")} aria-haspopup="true" aria-expanded={open === "categories"}>
                        Categories <i className={`ti ti-chevron-down${open === "categories" ? " rot" : ""}`} aria-hidden="true" />
                        <div className={`tv-mega${open === "categories" ? " open" : ""}`} role="menu">
                            <div className="tv-mega-grid">
                                <div className="tv-mega-col">
                                    <p className="tv-mega-heading">File & Docs</p>
                                    {CATEGORIES.slice(0, 4).map(c => (
                                        <Link key={c.label} href={c.href} className="tv-mega-item" role="menuitem">
                                            <i className={`ti ${c.icon} tv-mega-icon`} aria-hidden="true" />
                                            <span className="tv-mega-body">
                                                <span className="tv-mega-name">{c.label}</span>
                                                <span className="tv-mega-sub">{c.sub}</span>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="tv-mega-col">
                                    <p className="tv-mega-heading">Specialized</p>
                                    {CATEGORIES.slice(4).map(c => (
                                        <Link key={c.label} href={c.href} className="tv-mega-item" role="menuitem">
                                            <i className={`ti ${c.icon} tv-mega-icon`} aria-hidden="true" />
                                            <span className="tv-mega-body">
                                                <span className="tv-mega-name">{c.label}</span>
                                                <span className="tv-mega-sub">{c.sub}</span>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="tv-mega-footer">
                                <span className="tv-mega-footer-text">51 tools · free forever</span>
                                <Link href="/tools" className="tv-mega-footer-link">
                                    Browse all <i className="ti ti-arrow-right" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Collections */}
                    <div className="tv-ni" onClick={() => toggle("collections")} aria-haspopup="true" aria-expanded={open === "collections"}>
                        Collections <i className={`ti ti-chevron-down${open === "collections" ? " rot" : ""}`} aria-hidden="true" />
                        <div className={`tv-drop${open === "collections" ? " open" : ""}`} role="menu">
                            {COLLECTIONS.map(c => (
                                <Link key={c.label} href={c.href} className="tv-drop-item" role="menuitem">
                                    <i className={`ti ${c.icon} tv-drop-icon`} aria-hidden="true" />
                                    <span className="tv-drop-label">{c.label}</span>
                                    <span className="tv-drop-count">{c.count}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Popular */}
                    <div className="tv-ni" onClick={() => toggle("popular")} aria-haspopup="true" aria-expanded={open === "popular"}>
                        Popular <i className={`ti ti-chevron-down${open === "popular" ? " rot" : ""}`} aria-hidden="true" />
                        <div className={`tv-drop${open === "popular" ? " open" : ""}`} role="menu">
                            {POPULAR.map(p => (
                                <div key={p.label}>
                                    {p.sep && <div className="tv-drop-sep" />}
                                    <Link href={p.href} className="tv-drop-item" role="menuitem">
                                        <i className={`ti ${p.icon} tv-drop-icon`} aria-hidden="true" />
                                        <span className="tv-drop-label">{p.label}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Blog */}
                    <div className="tv-ni" onClick={() => toggle("blog")} aria-haspopup="true" aria-expanded={open === "blog"}>
                        Blog <i className={`ti ti-chevron-down${open === "blog" ? " rot" : ""}`} aria-hidden="true" />
                        <div className={`tv-drop${open === "blog" ? " open" : ""}`} role="menu">
                            {BLOG.map(b => (
                                <Link key={b.label} href={b.href} className="tv-drop-item" role="menuitem">
                                    <i className={`ti ${b.icon} tv-drop-icon`} aria-hidden="true" />
                                    <span className="tv-drop-label">{b.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                </nav>
            </div>

            {/* Right side - CTA */}
            <div className="tv-nav-right">
                <Link href="/tools" className="tv-cta">
                    Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
                </Link>
            </div>

            {/* Hamburger */}
            <button className="tv-ham" aria-label="Toggle menu" aria-expanded={menuOpen}
                onClick={() => { setMenuOpen(p => !p); close(); }}>
                <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"}`} aria-hidden="true" />
            </button>

            {/* Mobile drawer */}
            {menuOpen && (
                <div className="tv-mob" role="dialog" aria-label="Navigation menu">
                    {[
                        { label: "Categories", icon: "ti-layout-grid", href: "/tools" },
                        { label: "Collections", icon: "ti-stack-2", href: "/collections" },
                        { label: "Popular", icon: "ti-trending-up", href: "/popular" },
                        { label: "Blog", icon: "ti-news", href: "/blog" },
                    ].map(l => (
                        <Link key={l.label} href={l.href} className="tv-mob-link" onClick={() => setMenuOpen(false)}>
                            <i className={`ti ${l.icon}`} aria-hidden="true" />
                            {l.label}
                        </Link>
                    ))}
                    <div className="tv-mob-sep" />
                    <Link href="/tools" className="tv-mob-cta" onClick={() => setMenuOpen(false)}>
                        Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
                    </Link>
                </div>
            )}

            <style>{`
        .tv-nav {
          position: fixed; top: 0; left: 0; right: 0;
          height: 56px;
          background: #1A1A18;
          border-bottom: 0.5px solid #2C2C28;
          display: flex; align-items: center;
          padding: 0 40px;
          z-index: 1000;
          font-family: var(--font-sans);
        }

        /* Logo */
        .tv-logo {
          display: flex; 
          align-items: center; 
          text-decoration: none; 
          flex-shrink: 0;
        }
        .tv-logo-image {
          height: 32px;
          width: auto;
          object-fit: contain;
        }

        /* Wrapper to center nav */
        .tv-nav-wrapper {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
        }

        /* Nav center */
        .tv-nav-center {
          display: flex; 
          align-items: center; 
          gap: 2px;
        }

        /* Nav item trigger */
        .tv-ni {
          position: relative;
          display: flex; align-items: center; gap: 4px;
          height: 34px; padding: 0 11px;
          font-size: 13.5px; font-weight: 450;
          color: #A8A79E;
          border-radius: 7px;
          cursor: pointer;
          transition: color 0.12s, background 0.12s;
          user-select: none; white-space: nowrap;
        }
        .tv-ni:hover { color: #EDEDEA; background: #222220; }
        .tv-ni i { font-size: 12px; opacity: 0.5; transition: transform 0.2s, opacity 0.12s; }
        .tv-ni:hover i { opacity: 0.8; }
        .tv-ni i.rot { transform: rotate(180deg); opacity: 0.8; }

        /* Simple dropdown */
        .tv-drop {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: #1A1A17;
          border: 0.5px solid #2C2C28;
          border-radius: 12px;
          padding: 6px; min-width: 210px;
          z-index: 200;
          opacity: 0; pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.14s, transform 0.14s;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
        }
        .tv-drop.open { opacity: 1; pointer-events: all; transform: translateY(0); }

        .tv-drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 7px;
          text-decoration: none;
          transition: background 0.1s;
        }
        .tv-drop-item:hover { background: #222220; text-decoration: none; }
        
        .tv-drop-icon {
          font-size: 15px;
          color: #6B6A62;
          flex-shrink: 0;
          transition: color 0.1s;
        }
        .tv-drop-item:hover .tv-drop-icon { color: #A8A79E; }
        
        .tv-drop-label { 
          font-size: 13px; 
          font-weight: 450; 
          color: #A8A79E; 
          flex: 1; 
          transition: color 0.1s; 
        }
        .tv-drop-item:hover .tv-drop-label { color: #EDEDEA; }
        .tv-drop-count { font-size: 11px; color: #6B6A62; }
        .tv-drop-sep { height: 0.5px; background: #2C2C28; margin: 5px 0; }

        /* Mega menu */
        .tv-mega {
          position: absolute; top: calc(100% + 8px); left: -120px;
          background: #1A1A17;
          border: 0.5px solid #2C2C28;
          border-radius: 12px;
          z-index: 200;
          opacity: 0; pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.14s, transform 0.14s;
          overflow: hidden;
          width: 440px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
        }
        .tv-mega.open { opacity: 1; pointer-events: all; transform: translateY(0); }
        .tv-mega-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .tv-mega-col { padding: 12px 8px; }
        .tv-mega-col + .tv-mega-col { border-left: 0.5px solid #2C2C28; }
        .tv-mega-heading {
          font-size: 10px; font-weight: 600;
          color: #6B6A62; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 4px 10px 8px;
        }
        .tv-mega-item {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 10px; border-radius: 7px;
          text-decoration: none;
          transition: background 0.1s;
        }
        .tv-mega-item:hover { background: #222220; text-decoration: none; }
        
        .tv-mega-icon {
          font-size: 15px;
          color: #6B6A62;
          flex-shrink: 0;
          transition: color 0.1s;
        }
        .tv-mega-item:hover .tv-mega-icon { color: #4CAF82; }
        
        .tv-mega-body { display: flex; flex-direction: column; gap: 1px; }
        .tv-mega-name { font-size: 13px; font-weight: 450; color: #A8A79E; transition: color 0.1s; }
        .tv-mega-item:hover .tv-mega-name { color: #EDEDEA; }
        .tv-mega-sub { font-size: 11px; color: #6B6A62; }
        .tv-mega-footer {
          border-top: 0.5px solid #2C2C28;
          padding: 10px 14px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .tv-mega-footer-text { font-size: 12px; color: #6B6A62; }
        .tv-mega-footer-link {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: #4CAF82;
          text-decoration: none; transition: opacity 0.12s;
        }
        .tv-mega-footer-link:hover { opacity: 0.75; text-decoration: none; }
        .tv-mega-footer-link i { font-size: 11px; }

        /* Right side */
        .tv-nav-right { 
          margin-left: auto; 
          flex-shrink: 0; 
        }

        /* CTA button */
        .tv-cta {
          display: inline-flex; align-items: center; gap: 5px;
          height: 31px; padding: 0 14px;
          font-size: 13px; font-weight: 580;
          color: #FFFFFF; background: #145C3C;
          border: none; border-radius: 7px;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
          letter-spacing: -0.1px;
        }
        .tv-cta:hover { background: #1F7A52; text-decoration: none; }
        .tv-cta i { font-size: 12px; }

        /* Hamburger */
        .tv-ham {
          display: none; background: none; border: none; cursor: pointer;
          padding: 6px; color: #A8A79E; border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          margin-left: auto;
        }
        .tv-ham:hover { color: #EDEDEA; background: #222220; }
        .tv-ham i { font-size: 19px; display: block; }

        /* Mobile drawer */
        .tv-mob {
          position: absolute; top: 56px; left: 0; right: 0;
          background: #1A1A18;
          border-bottom: 0.5px solid #2C2C28;
          padding: 8px 12px 20px;
          display: flex; flex-direction: column; gap: 2px; z-index: 100;
        }
        .tv-mob-link {
          display: flex; align-items: center; gap: 10px;
          height: 44px; padding: 0 12px;
          font-size: 15px; color: #A8A79E;
          text-decoration: none; border-radius: 8px;
          transition: background 0.1s, color 0.1s;
        }
        .tv-mob-link i { font-size: 17px; color: #6B6A62; }
        .tv-mob-link:hover { background: #222220; color: #EDEDEA; text-decoration: none; }
        .tv-mob-sep { height: 0.5px; background: #2C2C28; margin: 6px 0; }
        .tv-mob-cta {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          height: 44px; margin-top: 6px;
          background: #145C3C; color: #FFFFFF;
          font-size: 14px; font-weight: 600;
          border-radius: 8px; text-decoration: none;
          transition: background 0.15s;
        }
        .tv-mob-cta:hover { background: #1F7A52; text-decoration: none; }

        @media (max-width: 768px) {
          .tv-nav-wrapper, .tv-nav-right { display: none !important; }
          .tv-ham { display: flex !important; }
          .tv-nav { padding: 0 16px !important; }
        }
      `}</style>
        </header>
    );
}