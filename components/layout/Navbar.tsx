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

  function toggle(id: DropdownId) {
    setOpen((prev) => (prev === id ? null : id));
  }

  return (
    <header className="tv-nav" ref={navRef as any}>
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
                {/* First column */}
                <div className="tv-mega-col">
                  {CATEGORIES.slice(0, 3).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/tools/${c.slug}`}
                      className="tv-mega-item"
                      role="menuitem"
                    >
                      <i className={`ti ${c.icon} tv-mega-icon`} aria-hidden="true" />
                      <span className="tv-mega-body">
                        <span className="tv-mega-name">{c.label}</span>
                        <span className="tv-mega-sub">{c.count} tools</span>
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Second column */}
                <div className="tv-mega-col">
                  {CATEGORIES.slice(3).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/tools/${c.slug}`}
                      className="tv-mega-item"
                      role="menuitem"
                    >
                      <i className={`ti ${c.icon} tv-mega-icon`} aria-hidden="true" />
                      <span className="tv-mega-body">
                        <span className="tv-mega-name">{c.label}</span>
                        <span className="tv-mega-sub">{c.count} tools</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="tv-mega-footer">
                <span className="tv-mega-footer-text">{TOOLS.length} tools · free forever</span>
                <Link href="/categories" className="tv-mega-footer-link">
                  View all categories <i className="ti ti-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Simple links */}
          <Link href="/tools" className="tv-link">
            All Tools
          </Link>
        </nav>
      </div>

      {/* Right side - CTA */}
      <div className="tv-nav-right">
        <Link href="/tools" className="tv-cta">
          Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      {/* Hamburger */}
      <button
        className="tv-ham"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((p) => !p);
          close();
        }}
      >
        <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"}`} aria-hidden="true" />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="tv-mob" role="dialog" aria-label="Navigation menu">
          <Link href="/categories" className="tv-mob-link" onClick={() => setMenuOpen(false)}>
            <i className="ti ti-layout-grid" aria-hidden="true" />
            Categories
          </Link>
          <Link href="/tools" className="tv-mob-link" onClick={() => setMenuOpen(false)}>
            <i className="ti ti-layout-grid" aria-hidden="true" />
            All Tools
          </Link>
          <div className="tv-mob-sep" />
          <Link href="/tools" className="tv-mob-cta" onClick={() => setMenuOpen(false)}>
            Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      )}

      <style>{`
        .tv-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: #1a1a18;
          border-bottom: 0.5px solid #2c2c28;
          display: flex;
          align-items: center;
          padding: 0 40px;
          z-index: 1000;
          font-family: var(--font-sans);
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
        }

        .tv-ni {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          height: 34px;
          padding: 0 11px;
          font-size: 13.5px;
          font-weight: 450;
          color: #a8a79e;
          border-radius: 7px;
          cursor: pointer;
          transition: color 0.12s, background 0.12s;
          user-select: none;
          white-space: nowrap;
        }
        .tv-ni:hover {
          color: #ededea;
          background: #222220;
        }
        .tv-ni i {
          font-size: 12px;
          opacity: 0.5;
          transition: transform 0.2s, opacity 0.12s;
        }
        .tv-ni:hover i {
          opacity: 0.8;
        }
        .tv-ni i.rot {
          transform: rotate(180deg);
          opacity: 0.8;
        }

        .tv-link {
          display: flex;
          align-items: center;
          height: 34px;
          padding: 0 11px;
          font-size: 13.5px;
          font-weight: 450;
          color: #a8a79e;
          border-radius: 7px;
          text-decoration: none;
          transition: color 0.12s, background 0.12s;
          white-space: nowrap;
        }
        .tv-link:hover {
          color: #ededea;
          background: #222220;
          text-decoration: none;
        }

        .tv-mega {
          position: absolute;
          top: calc(100% + 8px);
          left: -120px;
          background: #1a1a17;
          border: 0.5px solid #2c2c28;
          border-radius: 12px;
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.14s, transform 0.14s;
          overflow: hidden;
          width: 440px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
        }
        .tv-mega.open {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .tv-mega-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .tv-mega-col {
          padding: 12px 8px;
        }
        .tv-mega-col + .tv-mega-col {
          border-left: 0.5px solid #2c2c28;
        }
        .tv-mega-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 7px;
          text-decoration: none;
          transition: background 0.1s;
        }
        .tv-mega-item:hover {
          background: #222220;
          text-decoration: none;
        }

        .tv-mega-icon {
          font-size: 15px;
          color: #6b6a62;
          flex-shrink: 0;
          transition: color 0.1s;
        }
        .tv-mega-item:hover .tv-mega-icon {
          color: #4caf82;
        }

        .tv-mega-body {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .tv-mega-name {
          font-size: 13px;
          font-weight: 450;
          color: #a8a79e;
          transition: color 0.1s;
        }
        .tv-mega-item:hover .tv-mega-name {
          color: #ededea;
        }
        .tv-mega-sub {
          font-size: 11px;
          color: #6b6a62;
        }
        .tv-mega-footer {
          border-top: 0.5px solid #2c2c28;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tv-mega-footer-text {
          font-size: 12px;
          color: #6b6a62;
        }
        .tv-mega-footer-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #4caf82;
          text-decoration: none;
          transition: opacity 0.12s;
        }
        .tv-mega-footer-link:hover {
          opacity: 0.75;
          text-decoration: none;
        }
        .tv-mega-footer-link i {
          font-size: 11px;
        }

        .tv-nav-right {
          margin-left: auto;
          flex-shrink: 0;
        }

        .tv-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 31px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 580;
          color: #ffffff;
          background: #145c3c;
          border: none;
          border-radius: 7px;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
          letter-spacing: -0.1px;
        }
        .tv-cta:hover {
          background: #1f7a52;
          text-decoration: none;
        }
        .tv-cta i {
          font-size: 12px;
        }

        .tv-ham {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #a8a79e;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          margin-left: auto;
        }
        .tv-ham:hover {
          color: #ededea;
          background: #222220;
        }
        .tv-ham i {
          font-size: 19px;
          display: block;
        }

        .tv-mob {
          position: absolute;
          top: 56px;
          left: 0;
          right: 0;
          background: #1a1a18;
          border-bottom: 0.5px solid #2c2c28;
          padding: 8px 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 100;
        }
        .tv-mob-link {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 12px;
          font-size: 15px;
          color: #a8a79e;
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.1s, color 0.1s;
        }
        .tv-mob-link i {
          font-size: 17px;
          color: #6b6a62;
        }
        .tv-mob-link:hover {
          background: #222220;
          color: #ededea;
          text-decoration: none;
        }
        .tv-mob-sep {
          height: 0.5px;
          background: #2c2c28;
          margin: 6px 0;
        }
        .tv-mob-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 44px;
          margin-top: 6px;
          background: #145c3c;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .tv-mob-cta:hover {
          background: #1f7a52;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .tv-nav-wrapper,
          .tv-nav-right {
            display: none !important;
          }
          .tv-ham {
            display: flex !important;
          }
          .tv-nav {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </header>
  );
}
