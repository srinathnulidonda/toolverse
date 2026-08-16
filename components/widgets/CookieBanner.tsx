// components/widgets/CookieBanner.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CONSENT_CATEGORIES,
  CONSENT_OPEN_EVENT,
  ConsentCategoryKey,
  acceptAll,
  rejectAll,
  saveConsent,
  getConsent,
  hasRespondedToConsent,
} from "@/lib/cookieConsent";

type View = "banner" | "modal";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>("banner");
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<
    Record<ConsentCategoryKey, boolean>
  >({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!hasRespondedToConsent()) {
      const t = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(t);
    }
  }, [mounted]);

  useEffect(() => {
    const handler = () => {
      const existing = getConsent()?.categories;
      if (existing) {
        setCategories({
          necessary: true,
          functional: existing.functional ?? false,
          analytics: existing.analytics ?? false,
          marketing: existing.marketing ?? false,
        });
      }
      setView("modal");
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, handler);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (view === "modal" && hasRespondedToConsent()) {
          dismiss();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, view]);

  useEffect(() => {
    if (view === "modal" && visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [view, visible]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setView("banner"), 300);
  }, []);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    dismiss();
  }, [dismiss]);

  const handleRejectAll = useCallback(() => {
    rejectAll();
    dismiss();
  }, [dismiss]);

  const handleSavePreferences = useCallback(() => {
    saveConsent(categories);
    dismiss();
  }, [categories, dismiss]);

  const toggleCategory = useCallback((key: ConsentCategoryKey) => {
    if (CONSENT_CATEGORIES[key].locked) return;
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const openModal = useCallback(() => {
    const existing = getConsent()?.categories;
    if (existing) {
      setCategories({
        necessary: true,
        functional: existing.functional ?? false,
        analytics: existing.analytics ?? false,
        marketing: existing.marketing ?? false,
      });
    }
    setView("modal");
  }, []);

  if (!mounted || !visible) return null;

  return (
    <>
      {view === "banner" && (
        <div className="cookie-consent-overlay">
          <div
            className="cookie-consent-banner"
            role="alertdialog"
            aria-labelledby="cookie-title"
            aria-describedby="cookie-desc"
          >
            <div className="cookie-consent-header">
              <h2 id="cookie-title" className="cookie-consent-title">
                Allow cookies
              </h2>
              <button
                onClick={handleRejectAll}
                className="cookie-consent-close"
                aria-label="Reject non-essential cookies and close"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <p id="cookie-desc" className="cookie-consent-description">
              We use essential cookies to make our site work. With your consent, we may also use
              non-essential cookies to remember your preferences and personalise recommendations.{" "}
              <Link href="/privacy" className="cookie-consent-link">
                Privacy Policy
              </Link>
            </p>

            <div className="cookie-consent-actions">
              <button
                onClick={openModal}
                className="cookie-consent-btn cookie-consent-btn-default"
              >
                Cookie preferences
              </button>
              <button
                onClick={handleRejectAll}
                className="cookie-consent-btn cookie-consent-btn-default"
              >
                Reject all
              </button>
              <button
                onClick={handleAcceptAll}
                className="cookie-consent-btn cookie-consent-btn-accept"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "modal" && (
        <div
          className="cookie-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && hasRespondedToConsent()) {
              dismiss();
            }
          }}
        >
          <div className="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
            <div className="cookie-modal-header">
              <h2 id="cookie-modal-title" className="cookie-modal-title">
                Cookie preferences
              </h2>
              {hasRespondedToConsent() && (
                <button
                  className="cookie-consent-close"
                  onClick={dismiss}
                  aria-label="Close preferences"
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </div>

            <p className="cookie-modal-intro">
              Choose which categories of cookies Toolverse can use. You can change these settings
              anytime from the{" "}
              <Link href="/cookies" className="cookie-consent-link">
                Cookie Policy
              </Link>{" "}
              page.
            </p>

            <div className="cookie-modal-list">
              {(
                Object.values(CONSENT_CATEGORIES) as Array<
                  (typeof CONSENT_CATEGORIES)[ConsentCategoryKey]
                >
              ).map((cat) => (
                <div className="cookie-category" key={cat.key}>
                  <div className="cookie-category-info">
                    <span className="cookie-category-label">
                      {cat.label}
                      {cat.locked && <span className="cookie-category-badge">Always on</span>}
                    </span>
                    <p className="cookie-category-desc">{cat.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={categories[cat.key]}
                    aria-label={`Toggle ${cat.label} cookies`}
                    disabled={cat.locked}
                    className={`cookie-toggle${categories[cat.key] ? " is-on" : ""}${
                      cat.locked ? " is-locked" : ""
                    }`}
                    onClick={() => toggleCategory(cat.key)}
                  >
                    <span className="cookie-toggle-thumb" />
                  </button>
                </div>
              ))}
            </div>

            <div className="cookie-modal-actions">
              <button
                className="cookie-consent-btn cookie-consent-btn-default"
                onClick={handleRejectAll}
              >
                Reject all
              </button>
              <button
                className="cookie-consent-btn cookie-consent-btn-default"
                onClick={handleAcceptAll}
              >
                Accept all
              </button>
              <button
                className="cookie-consent-btn cookie-consent-btn-accept"
                onClick={handleSavePreferences}
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cookie-consent-overlay {
          position: fixed;
          bottom: 80px;
          right: 100px;
          z-index: 2000;
          animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cookie-consent-banner {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.12);
          padding: 20px;
          width: 400px;
          max-width: calc(100vw - 40px);
        }

        .cookie-consent-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 12px;
        }

        .cookie-consent-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.4;
          flex: 1;
          letter-spacing: -0.2px;
        }

        .cookie-consent-close {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
          margin: -4px -4px 0 0;
        }

        .cookie-consent-close:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .cookie-consent-close i {
          font-size: 16px;
        }

        .cookie-consent-description {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .cookie-consent-link {
          color: var(--brand-text);
          text-decoration: underline;
          text-underline-offset: 2px;
          font-weight: 500;
          transition: opacity 0.15s;
        }

        .cookie-consent-link:hover {
          opacity: 0.8;
        }

        .cookie-consent-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 16px;
        }

        .cookie-consent-btn {
          height: 32px;
          padding: 0 16px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid transparent;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
        }

        .cookie-consent-btn-default {
          color: var(--text);
          background: var(--bg-surface);
          border-color: var(--border);
        }

        .cookie-consent-btn-default:hover {
          background: var(--bg);
          border-color: var(--border);
        }

        .cookie-consent-btn-accept {
          color: var(--brand-text);
          background: transparent;
          border-color: var(--brand);
        }

        .cookie-consent-btn-accept:hover {
          background: var(--brand-light);
          border-color: var(--brand-text);
        }

        .cookie-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .cookie-modal {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15), 0 32px 64px rgba(0, 0, 0, 0.12);
          width: 480px;
          max-width: 100%;
          max-height: min(640px, 85vh);
          overflow-y: auto;
          padding: 24px;
        }

        .cookie-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .cookie-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.2px;
        }

        .cookie-modal-intro {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .cookie-modal-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 20px;
        }

        .cookie-category {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          border-top: 1px solid var(--border);
        }

        .cookie-category:first-child {
          border-top: none;
        }

        .cookie-category-info {
          flex: 1;
          min-width: 0;
        }

        .cookie-category-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.1px;
        }

        .cookie-category-badge {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 2px 8px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .cookie-category-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.6;
          margin: 4px 0 0 0;
        }

        .cookie-toggle {
          flex-shrink: 0;
          width: 40px;
          height: 22px;
          border-radius: 999px;
          border: none;
          background: var(--bg-surface);
          position: relative;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s;
          margin-top: 2px;
        }

        .cookie-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .cookie-toggle.is-on {
          background: var(--brand);
        }

        .cookie-toggle.is-on .cookie-toggle-thumb {
          transform: translateX(18px);
        }

        .cookie-toggle.is-locked {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cookie-modal-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }

        @media (max-width: 480px) {
          .cookie-consent-overlay {
            bottom: 16px;
            left: 16px;
            right: 16px;
          }

          .cookie-consent-banner {
            width: 100%;
            padding: 16px;
          }

          .cookie-consent-actions {
            flex-direction: column;
          }

          .cookie-consent-btn {
            width: 100%;
            height: 36px;
          }

          .cookie-consent-description {
            font-size: 13px;
          }

          .cookie-modal {
            padding: 20px;
          }

          .cookie-modal-actions {
            flex-direction: column;
          }

          .cookie-modal-actions .cookie-consent-btn {
            width: 100%;
            height: 36px;
          }
        }

        @media (max-width: 768px) and (min-width: 481px) {
          .cookie-consent-overlay {
            bottom: 16px;
            right: 16px;
          }

          .cookie-consent-banner {
            width: 360px;
          }
        }

        .cookie-consent-btn:focus-visible,
        .cookie-consent-close:focus-visible,
        .cookie-consent-link:focus-visible,
        .cookie-toggle:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cookie-consent-overlay,
          .cookie-modal-overlay {
            animation: none;
          }

          .cookie-consent-btn,
          .cookie-consent-close,
          .cookie-consent-link,
          .cookie-toggle,
          .cookie-toggle-thumb {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}