// components/layout/Navbar.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCategoriesWithCount, TOOLS } from "@/lib/tools";

const CATEGORIES = getCategoriesWithCount();

type DropdownId = "categories" | null;

export default function Navbar() {
  const [open, setOpen] = useState<DropdownId>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    close();
    setMenuOpen(false);
  }, [pathname, close]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function toggle(id: DropdownId) {
    setOpen((prev) => (prev === id ? null : id));
  }

  const isToolsActive = pathname?.startsWith("/tools");

  return (
    <header className={`tv-nav${scrolled ? " scrolled" : ""}`} ref={navRef as any}>
      {/* Logo */}
      <Link href="/" className="tv-logo" aria-label="Toolverse home">
        <img src="/logo-light.png" alt="Toolverse" className="tv-logo-image" />
      </Link>

      {/* Centre nav container */}
      <div className="tv-nav-wrapper">
        <nav className="tv-nav-center" aria-label="Main navigation">
          {/* Categories — mega menu */}
          <div
            className="tv-ni"
            onClick={() => toggle("categories")}
            aria-haspopup="true"
            aria-expanded={open === "categories"}
          >
            Categories{" "}
            <i
              className={`ti ti-chevron-down${open === "categories" ? " rot" : ""}`}
              aria-hidden="true"
            />
            <div className={`tv-mega${open === "categories" ? " open" : ""}`} role="menu">
              <div className="tv-mega-grid">
                <div className="tv-mega-col">
                  {CATEGORIES.slice(0, 3).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/tools/${c.slug}`}
                      className="tv-mega-item"
                      role="menuitem"
                    >
                      <i className={`ti ${c.icon} tv-mega-icon`} aria-hidden="true" />
                      <span className="tv-mega-name">{c.label}</span>
                      <span className="tv-mega-count">{c.count}</span>
                    </Link>
                  ))}
                </div>

                <div className="tv-mega-col">
                  {CATEGORIES.slice(3).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/tools/${c.slug}`}
                      className="tv-mega-item"
                      role="menuitem"
                    >
                      <i className={`ti ${c.icon} tv-mega-icon`} aria-hidden="true" />
                      <span className="tv-mega-name">{c.label}</span>
                      <span className="tv-mega-count">{c.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="tv-mega-footer">
                <span className="tv-mega-footer-text">{TOOLS.length} tools · free forever</span>
                <Link href="/categories" className="tv-mega-footer-link">
                  View all categories <i className="ti ti-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Simple links */}
          <Link href="/tools" className={`tv-link${isToolsActive ? " active" : ""}`}>
            All Tools
          </Link>
        </nav>
      </div>

      {/* Right side - CTA */}
      <div className="tv-nav-right">
        <Link href="/tools" className="tv-cta">
          <span className="tv-cta-shine" aria-hidden="true" />
          Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      {/* Hamburger */}
      <button
        className={`tv-ham${menuOpen ? " active" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((p) => !p);
          close();
        }}
      >
        <span className="tv-ham-line" />
        <span className="tv-ham-line" />
        <span className="tv-ham-line" />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="tv-mob-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="tv-mob" role="dialog" aria-label="Navigation menu">
            {/* Section heading */}
            <div className="tv-mob-heading">
              <i className="ti ti-layout-grid" aria-hidden="true" />
              Browse Categories
            </div>

            {/* Category chips */}
            <div className="tv-mob-categories">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/tools/${c.slug}`}
                  className="tv-mob-chip"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={`ti ${c.icon}`} aria-hidden="true" />
                  <span className="tv-mob-chip-name">{c.label}</span>
                  <span className="tv-mob-chip-count">{c.count}</span>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="tv-mob-divider" />

            {/* CTA */}
            <Link href="/tools" className="tv-mob-cta" onClick={() => setMenuOpen(false)}>
              <i className="ti ti-apps" aria-hidden="true" />
              View All {TOOLS.length} Tools
              <i className="ti ti-chevron-right tv-mob-cta-arrow" aria-hidden="true" />
            </Link>

            {/* Footer */}
            <p className="tv-mob-footnote">No sign-up · No uploads · Runs in your browser</p>
          </div>
        </>
      )}

      <style>{`
        .tv-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: color-mix(in srgb, var(--bg) 88%, transparent);
          backdrop-filter: blur(14px) saturate(160%);
          -webkit-backdrop-filter: blur(14px) saturate(160%);
          display: flex;
          align-items: center;
          padding: 0 40px;
          z-index: 1000;
          font-family: var(--font-sans);
          transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .tv-nav.scrolled {
          background: color-mix(in srgb, var(--bg-card) 92%, transparent);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

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

        .tv-nav-wrapper {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
        }

        .tv-nav-center {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 99px;
          padding: 3px;
        }

        .tv-ni {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          height: 32px;
          padding: 0 14px;
          font-size: 13.5px;
          font-weight: 450;
          color: var(--text-secondary);
          border-radius: 99px;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          user-select: none;
          white-space: nowrap;
        }
        .tv-ni:hover {
          color: var(--text);
          background: var(--bg-card);
        }
        .tv-ni i {
          font-size: 12px;
          opacity: 0.5;
          transition: transform 0.2s, opacity 0.15s;
        }
        .tv-ni:hover i { opacity: 0.8; }
        .tv-ni i.rot { transform: rotate(180deg); opacity: 0.8; }

        .tv-link {
          position: relative;
          display: flex;
          align-items: center;
          height: 32px;
          padding: 0 14px;
          font-size: 13.5px;
          font-weight: 450;
          color: var(--text-secondary);
          border-radius: 99px;
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .tv-link:hover {
          color: var(--text);
          background: var(--bg-card);
          text-decoration: none;
        }
        .tv-link.active {
          color: var(--brand-text);
          background: var(--brand-light);
        }

        .tv-mega {
          position: absolute;
          top: calc(100% + 12px);
          left: -120px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.16s, transform 0.16s;
          overflow: hidden;
          width: 420px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
        }
        .tv-mega.open {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .tv-mega-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .tv-mega-col { padding: 10px; }
        .tv-mega-col + .tv-mega-col { border-left: 0.5px solid var(--border); }
        .tv-mega-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.12s;
        }
        .tv-mega-item:hover { background: var(--bg-surface); text-decoration: none; }

        .tv-mega-icon {
          font-size: 15px;
          color: var(--text-secondary);
          flex-shrink: 0;
          width: 20px;
          text-align: center;
        }

        .tv-mega-name {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .tv-mega-count {
          font-size: 11px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 99px;
          flex-shrink: 0;
        }

        .tv-mega-footer {
          border-top: 0.5px solid var(--border);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
        }
        .tv-mega-footer-text { font-size: 12px; color: var(--text-tertiary); }
        .tv-mega-footer-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--brand);
          text-decoration: none;
          transition: opacity 0.12s;
        }
        .tv-mega-footer-link:hover { opacity: 0.75; text-decoration: none; }
        .tv-mega-footer-link i { font-size: 11px; }

        .tv-nav-right { margin-left: auto; flex-shrink: 0; }

        .tv-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 15px;
          font-size: 13px;
          font-weight: 580;
          color: #ffffff;
          background: linear-gradient(135deg, var(--brand), var(--brand-hover));
          border: none;
          border-radius: 99px;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          letter-spacing: -0.1px;
          overflow: hidden;
        }
        .tv-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--brand) 40%, transparent);
          text-decoration: none;
        }
        .tv-cta i { font-size: 12px; }
        .tv-cta-shine {
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .tv-cta:hover .tv-cta-shine { left: 120%; }

        .tv-ham {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          margin-left: auto;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          position: relative;
          transition: background 0.2s;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .tv-ham:hover { 
          background: var(--bg-surface);
        }

        .tv-ham-line {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--text-secondary);
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .tv-ham.active .tv-ham-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
          background: var(--brand);
        }
        .tv-ham.active .tv-ham-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .tv-ham.active .tv-ham-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
          background: var(--brand);
        }

        .tv-mob-backdrop {
          position: fixed;
          inset: 56px 0 0 0;
          background: rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(2px);
          z-index: 99;
          animation: tvFade 0.2s ease;
        }

        .tv-mob {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          background: var(--bg-card);
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 100;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.16);
          animation: tvSlideDown 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
          max-height: calc(100vh - 56px);
          overflow-y: auto;
        }

        @keyframes tvSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tvFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .tv-mob-heading {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0 2px;
        }
        .tv-mob-heading i {
          font-size: 13px;
        }

        .tv-mob-categories {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .tv-mob-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .tv-mob-chip:active {
          background: var(--bg-surface);
          border-color: var(--border-faint);
          text-decoration: none;
        }

        .tv-mob-chip > i {
          font-size: 15px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .tv-mob-chip-name {
          flex: 1;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .tv-mob-chip-count {
          font-size: 11px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          font-family: var(--font-sans);
        }

        .tv-mob-divider {
          height: 0.5px;
          background: var(--border);
          margin: 4px 0;
        }

        .tv-mob-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text);
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: -0.2px;
          position: relative;
        }
        .tv-mob-cta:active {
          background: var(--bg-card);
          transform: scale(0.98);
          text-decoration: none;
        }
        .tv-mob-cta > i:first-child {
          font-size: 15px;
          color: var(--text-secondary);
        }
        .tv-mob-cta-arrow {
          font-size: 13px;
          color: var(--text-disabled);
          margin-left: auto;
          position: absolute;
          right: 14px;
        }

        .tv-mob-footnote {
          text-align: center;
          font-size: 10.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          padding: 0 8px;
        }

        @media (max-width: 768px) {
          .tv-nav-wrapper,
          .tv-nav-right { display: none !important; }
          .tv-ham { display: flex !important; }
          .tv-nav { padding: 0 16px !important; }
        }
      `}</style>
    </header>
  );
}