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
  const [catAccordionOpen, setCatAccordionOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpen(null), []);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setCatAccordionOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  useEffect(() => {
    close();
    closeMenu();
  }, [pathname, close, closeMenu]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    document.body.style.touchAction = menuOpen ? "none" : "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (catAccordionOpen) setCatAccordionOpen(false);
      else if (menuOpen) closeMenu();
      else if (open) close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, open, catAccordionOpen, close, closeMenu]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768 && menuOpen) closeMenu();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen, closeMenu]);

  function toggle(id: DropdownId) {
    setOpen((prev) => (prev === id ? null : id));
  }

  function toggleMobileMenu() {
    setMenuOpen((p) => !p);
    setCatAccordionOpen(false);
    close();
  }

  const isToolsActive = pathname?.startsWith("/tools");

  return (
    <header className={`tv-nav${scrolled ? " scrolled" : ""}`} ref={navRef}>
      <Link
        href="/"
        className="tv-logo"
        aria-label="Toolverse home"
        onClick={closeMenu}
      >
        <img src="/logo-light.png" alt="Toolverse" className="tv-logo-image" />
      </Link>

      <div className="tv-nav-wrapper">
        <nav className="tv-nav-center" aria-label="Main navigation">
          <div className="tv-ni-wrap">
            <button
              type="button"
              className="tv-ni"
              onClick={() => toggle("categories")}
              aria-haspopup="true"
              aria-expanded={open === "categories"}
            >
              <i className="ti ti-category-2 tv-ni-icon" aria-hidden="true" />
              Categories
              <i
                className={`ti ti-chevron-down tv-ni-chev${open === "categories" ? " rot" : ""}`}
                aria-hidden="true"
              />
            </button>

            <div className={`tv-mega${open === "categories" ? " open" : ""}`} role="menu">
              <div className="tv-mega-label">{TOOLS.length} tools · free forever</div>
              <div className="tv-mega-sep" />

              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/tools/${c.slug}`}
                  className="tv-mega-item"
                  role="menuitem"
                  onClick={close}
                >
                  <span className="tv-mega-icon-wrap">
                    <i className={`ti ${c.icon}`} aria-hidden="true" />
                  </span>
                  <span className="tv-mega-name">{c.label}</span>
                  <span className="tv-mega-count">{c.count}</span>
                </Link>
              ))}

              <div className="tv-mega-sep" />
              <Link
                href="/categories"
                className="tv-mega-item tv-mega-viewall"
                role="menuitem"
                onClick={close}
              >
                <span className="tv-mega-icon-wrap tv-mega-icon-wrap-accent">
                  <i className="ti ti-layout-grid" aria-hidden="true" />
                </span>
                <span className="tv-mega-name">View all categories</span>
                <i className="ti ti-arrow-right tv-mega-arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Link href="/tools" className={`tv-link${isToolsActive ? " active" : ""}`}>
            All Tools
          </Link>
        </nav>
      </div>

      <div className="tv-nav-right">
        <Link href="/tools" className="tv-cta">
          <span className="tv-cta-shine" aria-hidden="true" />
          Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      <div className={`tv-mob-menu${menuOpen ? " open" : ""}`}>
        <button
          type="button"
          className="tv-mob-icon-btn"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={toggleMobileMenu}
        >
          <span className="tv-burger">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div className="tv-mob-panel-wrap">
          <div className="tv-mob-panel">
            <svg
              className="tv-mob-border-svg"
              viewBox="0 0 275 222"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g transform="translate(0,20)">
                <path
                  className="tv-mob-border"
                  d="m 137.5,201.5003
                     h -126.393699
                     c -5.8760576,0 -10.606602,-4.73054 -10.606602,-10.6066
                     v -179.787399
                     c 0,-5.8760576 4.7305444,-10.606602 10.606602,-10.606602
                     h 217.893699
                     l 11,-10.999699 11,10.999699
                     h 12.893699
                     c 5.87606,0 10.6066,4.7305444 10.6066,10.606602
                     v 179.787399
                     c 0,5.87606 -4.73054,10.6066 -10.6066,10.6066
                     h -126.3937
                     Z"
                />
              </g>
            </svg>

            <div className="tv-mob-panel-inner" aria-hidden={!menuOpen}>
              <div className="tv-mob-col-main">
                <Link
                  href="/"
                  className="tv-mob-item"
                  role="menuitem"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="tv-mob-icon-wrap">
                    <i className="ti ti-home" aria-hidden="true" />
                  </span>
                  <span className="tv-mob-item-label">Home</span>
                </Link>

                <div className="tv-mob-cat-wrap">
                  <button
                    type="button"
                    className={`tv-mob-item${catAccordionOpen ? " active" : ""}`}
                    aria-haspopup="true"
                    aria-expanded={catAccordionOpen}
                    aria-controls="tv-mob-cat-sub"
                    onClick={() => setCatAccordionOpen((p) => !p)}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span className="tv-mob-icon-wrap">
                      <i className="ti ti-category-2" aria-hidden="true" />
                    </span>
                    <span className="tv-mob-item-label">Categories</span>
                    <i className="ti ti-chevron-right tv-mob-chev" aria-hidden="true" />
                  </button>

                  <div
                    id="tv-mob-cat-sub"
                    className={`tv-mob-sub${catAccordionOpen ? " open" : ""}`}
                    role="menu"
                  >
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/tools/${c.slug}`}
                        className="tv-mob-sub-item"
                        role="menuitem"
                        onClick={closeMenu}
                        tabIndex={menuOpen && catAccordionOpen ? 0 : -1}
                      >
                        <i className={`ti ${c.icon}`} aria-hidden="true" />
                        <span>{c.label}</span>
                        <span className="tv-mob-sub-count">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/tools"
                  className="tv-mob-item"
                  role="menuitem"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="tv-mob-icon-wrap">
                    <i className="ti ti-apps" aria-hidden="true" />
                  </span>
                  <span className="tv-mob-item-label">All Tools</span>
                </Link>

                <Link
                  href="/about"
                  className="tv-mob-item"
                  role="menuitem"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="tv-mob-icon-wrap">
                    <i className="ti ti-info-circle" aria-hidden="true" />
                  </span>
                  <span className="tv-mob-item-label">About</span>
                </Link>

                <Link
                  href="/support"
                  className="tv-mob-item"
                  role="menuitem"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="tv-mob-icon-wrap">
                    <i className="ti ti-headset" aria-hidden="true" />
                  </span>
                  <span className="tv-mob-item-label">Support</span>
                </Link>

                <Link
                  href="/tools"
                  className="tv-mob-cta"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  Browse Tools <i className="ti ti-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="tv-mob-backdrop" onClick={closeMenu} />
      </div>

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

        .tv-ni-wrap {
          position: relative;
          display: flex;
        }

        .tv-ni {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 14px;
          font-size: 13.5px;
          font-weight: 450;
          font-family: inherit;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-radius: 99px;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          user-select: none;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .tv-ni:hover {
          color: var(--text);
          background: var(--bg-card);
        }
        .tv-ni:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .tv-ni-icon {
          font-size: 14px;
          opacity: 0.7;
        }
        .tv-ni-chev {
          font-size: 12px;
          opacity: 0.5;
          transition: transform 0.2s cubic-bezier(.16,1,.3,1), opacity 0.15s;
        }
        .tv-ni:hover .tv-ni-chev { opacity: 0.8; }
        .tv-ni-chev.rot { transform: rotate(180deg); opacity: 0.8; }

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
        .tv-link:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .tv-link.active {
          color: var(--brand-text);
          background: var(--brand-light);
        }

        .tv-mega {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 236px;
          max-width: min(268px, calc(100vw - 32px));
          max-height: 360px;
          overflow-y: auto;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 6px;
          z-index: 200;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.04),
            0 8px 24px rgba(0, 0, 0, 0.08),
            0 20px 44px rgba(0, 0, 0, 0.08);
          opacity: 0;
          transform: scale(0.94) translateY(-6px);
          transform-origin: top left;
          pointer-events: none;
          transition:
            opacity 190ms cubic-bezier(.16,1,.3,1),
            transform 190ms cubic-bezier(.16,1,.3,1);
          will-change: transform, opacity;
        }
        .tv-mega.open {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        .tv-mega-label {
          padding: 7px 9px 6px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .tv-mega-sep {
          height: 1px;
          background: var(--border);
          margin: 4px 4px;
        }

        .tv-mega-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 6px 8px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.12s ease;
        }
        .tv-mega-item:hover { background: var(--bg-surface); text-decoration: none; }
        .tv-mega-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
        }

        .tv-mega-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--bg-surface);
          flex-shrink: 0;
          transition: background 0.12s ease;
        }
        .tv-mega-item:hover .tv-mega-icon-wrap { background: var(--bg-card); }
        .tv-mega-icon-wrap i {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .tv-mega-icon-wrap-accent {
          background: var(--brand-light);
        }
        .tv-mega-icon-wrap-accent i { color: var(--brand-text); }

        .tv-mega-name {
          flex: 1;
          font-size: 13px;
          font-weight: 450;
          color: var(--text);
        }

        .tv-mega-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
        }

        .tv-mega-viewall .tv-mega-name {
          color: var(--brand-text);
          font-weight: 500;
        }
        .tv-mega-arrow {
          font-size: 12px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

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
        .tv-cta:focus-visible {
          outline: 2px solid var(--text);
          outline-offset: 2px;
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

        .tv-mob-menu {
          display: none;
          position: relative;
          align-items: center;
          margin-left: auto;
        }

        .tv-mob-icon-btn {
          width: 44px;
          height: 44px;
          background: none;
          border: none;
          outline: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex: 0 0 auto;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .tv-mob-icon-btn:focus,
        .tv-mob-icon-btn:focus-visible,
        .tv-mob-icon-btn:active {
          outline: none;
          box-shadow: none;
        }

        .tv-burger { position: relative; width: 16px; height: 12px; display: block; }
        .tv-burger span {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          background: var(--text);
          transition:
            transform 260ms cubic-bezier(.16,1,.3,1),
            opacity 200ms ease,
            top 260ms cubic-bezier(.16,1,.3,1);
        }
        .tv-burger span:nth-child(1) { top: 0; }
        .tv-burger span:nth-child(2) { top: 5px; }
        .tv-burger span:nth-child(3) { top: 10px; }
        .tv-mob-menu.open .tv-burger span:nth-child(1) { top: 5px; transform: rotate(45deg); }
        .tv-mob-menu.open .tv-burger span:nth-child(2) { opacity: 0; }
        .tv-mob-menu.open .tv-burger span:nth-child(3) { top: 5px; transform: rotate(-45deg); }

        .tv-mob-panel-wrap {
          position: absolute;
          top: 44px;
          right: -6px;
          z-index: 1200;
          pointer-events: none;
        }

        .tv-mob-panel {
          position: relative;
          width: min(224px, calc(100vw - 24px));
          pointer-events: none;
          opacity: 0;
          transform: scale(0.95) translateY(-4px);
          transform-origin: top right;
          transition:
            opacity 220ms cubic-bezier(.16,1,.3,1),
            transform 220ms cubic-bezier(.16,1,.3,1);
          will-change: transform, opacity;
        }
        .tv-mob-menu.open .tv-mob-panel {
          pointer-events: auto;
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .tv-mob-border-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
          filter: drop-shadow(0 14px 26px rgba(20,20,30,0.13))
                  drop-shadow(0 3px 8px rgba(20,20,30,0.07));
        }

        .tv-mob-border {
          fill: var(--bg-card, #ffffff);
          stroke: var(--border, #e8e8e2);
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
        }

        .tv-mob-panel-inner {
          position: relative;
          z-index: 2;
          padding: 46px 8px 10px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 200ms 60ms cubic-bezier(.16,1,.3,1), visibility 0s 300ms;
        }
        .tv-mob-menu.open .tv-mob-panel-inner {
          opacity: 1;
          visibility: visible;
          transition: opacity 200ms 60ms cubic-bezier(.16,1,.3,1), visibility 0s 0s;
        }

        .tv-mob-col-main {
          display: flex;
          flex-direction: column;
        }

        .tv-mob-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          background: transparent;
          border: none;
          padding: 7px 8px;
          min-height: 38px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13.5px;
          color: var(--text);
          font-family: inherit;
          text-align: left;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: background 0.12s ease;
        }
        .tv-mob-item:hover { background: var(--bg-surface); text-decoration: none; }
        .tv-mob-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
        }
        .tv-mob-item.active {
          background: var(--bg-surface);
        }
        .tv-mob-item.active .tv-mob-icon-wrap {
          background: var(--bg-card);
        }

        .tv-mob-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: var(--bg-surface);
          flex-shrink: 0;
          transition: background 0.12s ease;
        }
        .tv-mob-item:hover .tv-mob-icon-wrap { background: var(--bg-card); }
        .tv-mob-icon-wrap i {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .tv-mob-item-label { flex: 1 1 auto; font-weight: 500; }

        .tv-mob-chev {
          color: var(--text-disabled);
          font-size: 12px;
          transition: color 150ms ease;
        }
        .tv-mob-item.active .tv-mob-chev {
          color: var(--brand-text);
        }

        .tv-mob-cat-wrap {
          position: relative;
        }

        .tv-mob-sub {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          left: auto;
          width: 146px;
          max-width: 100%;
          max-height: 220px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 5px;
          z-index: 6;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.04),
            0 8px 24px rgba(0, 0, 0, 0.10),
            0 20px 44px rgba(0, 0, 0, 0.10);
          opacity: 0;
          transform: scale(0.94) translateY(-4px);
          transform-origin: top right;
          pointer-events: none;
          transition:
            opacity 180ms cubic-bezier(.16,1,.3,1),
            transform 180ms cubic-bezier(.16,1,.3,1);
        }
        .tv-mob-sub.open {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        .tv-mob-sub-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 7px;
          border-radius: 7px;
          font-size: 11.5px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: background 0.12s ease, color 0.12s ease;
        }
        .tv-mob-sub-item:hover {
          background: var(--bg-surface);
          color: var(--text);
          text-decoration: none;
        }
        .tv-mob-sub-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
        }
        .tv-mob-sub-item i {
          font-size: 12px;
          width: 13px;
          flex-shrink: 0;
          text-align: center;
          opacity: 0.75;
        }
        .tv-mob-sub-item span:first-of-type { flex: 1 1 auto; }
        .tv-mob-sub-count {
          font-size: 9.5px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .tv-mob-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          margin-top: 4px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, var(--brand), var(--brand-hover));
          text-decoration: none;
          letter-spacing: -0.1px;
        }
        .tv-mob-cta:hover { text-decoration: none; }
        .tv-mob-cta:focus-visible {
          outline: 2px solid var(--text);
          outline-offset: 2px;
        }
        .tv-mob-cta i { font-size: 11px; }

        .tv-mob-backdrop {
          position: fixed;
          inset: 56px 0 0 0;
          background: transparent;
          z-index: 1100;
          opacity: 0;
          visibility: hidden;
          transition: opacity 200ms ease, visibility 0s 200ms;
        }
        .tv-mob-menu.open .tv-mob-backdrop {
          opacity: 1;
          visibility: visible;
          transition: opacity 200ms ease, visibility 0s 0s;
        }

        @media (max-width: 768px) {
          .tv-nav-wrapper,
          .tv-nav-right { display: none !important; }
          .tv-mob-menu { display: flex !important; }
          .tv-nav {
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }
        }

        @media (max-width: 380px) {
          .tv-nav { padding-left: 12px; padding-right: 12px; }
          .tv-logo-image { height: 28px; }
        }
      `}</style>
    </header>
  );
}