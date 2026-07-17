//features/social/qr-generator/PreviewFab.tsx
"use client";

import type { QrStyle } from "./types";
import QrPreview from "./QrPreview";

type PreviewFabProps = {
  data: string;
  style: QrStyle;
  slug: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: (thumbnail: string) => void;
};

export default function PreviewFab({
  data,
  style,
  slug,
  isOpen,
  onOpen,
  onClose,
  onSave,
}: PreviewFabProps) {
  if (!data) return null;

  return (
    <>
      {/* Floating action button — sticky at bottom of config panel */}
      <button
        className="pfab-btn"
        onClick={onOpen}
        aria-label="View QR code preview"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="pfab-btn-inner">
          <i className="ti ti-qrcode pfab-icon" aria-hidden="true" />
          <span className="pfab-label">View QR code</span>
        </span>
        <span className="pfab-arrow" aria-hidden="true">
          <i className="ti ti-chevron-up" />
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="pfab-backdrop" onClick={onClose} aria-hidden="true" />}

      {/* Bottom sheet */}
      <div
        className={`pfab-sheet${isOpen ? " pfab-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="QR code preview"
      >
        {/* Drag handle */}
        <button className="pfab-handle" onClick={onClose} aria-label="Close preview">
          <span className="pfab-handle-bar" />
        </button>

        {/* Sheet header */}
        <div className="pfab-sheet-header">
          <div className="pfab-sheet-title-group">
            <span className="pfab-sheet-title">Your QR Code</span>
            {data && (
              <span className="pfab-sheet-live">
                <span className="pfab-live-dot" aria-hidden="true" />
                Live preview
              </span>
            )}
          </div>
          <button className="pfab-sheet-close" onClick={onClose} aria-label="Close preview">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Sheet content */}
        <div className="pfab-sheet-body">
          <QrPreview data={data} style={style} slug={slug} onSave={onSave} />
        </div>
      </div>

      <style>{`
        /* ── FAB — hidden on desktop, shown on mobile via media query ── */
        .pfab-btn {
          display: none;
        }

        /* ── Backdrop — hidden on desktop ── */
        .pfab-backdrop {
          display: none;
        }

        /* ── Sheet — hidden on desktop ── */
        .pfab-sheet {
          display: none;
        }

        /* ══════════════════════════════════════════
           MOBILE  ≤ 768px
        ══════════════════════════════════════════ */
        @media (max-width: 768px) {

          /* ── FAB ── */
          .pfab-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            bottom: 16px;
            left: 16px;
            right: 16px;
            margin: 0 16px 16px;
            height: 48px;
            padding: 0 14px 0 16px;
            background: var(--bg-card);
            color: var(--text);
            border: 0.5px solid var(--border);
            border-radius: 12px;
            font-family: var(--font-sans);
            cursor: pointer;
            box-shadow:
              0 1px 3px rgba(0,0,0,0.08),
              0 4px 16px rgba(0,0,0,0.1),
              0 0 0 0.5px var(--border);
            transition: box-shadow 0.15s, transform 0.12s, background 0.12s;
            -webkit-tap-highlight-color: transparent;
            z-index: 10;
            gap: 8px;
          }
          .pfab-btn:hover {
            background: var(--bg-surface);
            box-shadow:
              0 2px 6px rgba(0,0,0,0.1),
              0 8px 24px rgba(0,0,0,0.12),
              0 0 0 0.5px var(--border);
          }
          .pfab-btn:active {
            transform: scale(0.98);
            box-shadow:
              0 1px 2px rgba(0,0,0,0.06),
              0 2px 8px rgba(0,0,0,0.08),
              0 0 0 0.5px var(--border);
          }

          .pfab-btn-inner {
            display: flex;
            align-items: center;
            gap: 9px;
            flex: 1;
            min-width: 0;
          }

          .pfab-icon {
            font-size: 18px;
            color: var(--text-secondary);
            flex-shrink: 0;
          }

          .pfab-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text);
            letter-spacing: -0.1px;
            white-space: nowrap;
          }

          .pfab-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            border-radius: 6px;
            background: var(--bg-surface);
            border: 0.5px solid var(--border);
            font-size: 13px;
            color: var(--text-tertiary);
            flex-shrink: 0;
            transition: background 0.12s;
          }
          .pfab-btn:hover .pfab-arrow {
            background: var(--border);
            color: var(--text-secondary);
          }

          /* ── Backdrop ── */
          .pfab-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            z-index: 49;
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            animation: pfab-fade-in 0.2s ease forwards;
          }
          @keyframes pfab-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          /* ── Bottom sheet ── */
          .pfab-sheet {
            display: flex;
            flex-direction: column;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 92dvh;
            background: var(--bg-card);
            border-radius: 20px 20px 0 0;
            border: 0.5px solid var(--border);
            border-bottom: none;
            z-index: 50;
            transform: translateY(100%);
            transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
            will-change: transform;
            overflow: hidden;
          }
          .pfab-sheet--open {
            transform: translateY(0);
          }

          /* Handle */
          .pfab-handle {
            padding: 12px 0 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            flex-shrink: 0;
            background: none;
            border: none;
            width: 100%;
            -webkit-tap-highlight-color: transparent;
          }
          .pfab-handle-bar {
            width: 36px;
            height: 4px;
            border-radius: 2px;
            background: var(--border);
            transition: background 0.12s;
          }
          .pfab-handle:hover .pfab-handle-bar,
          .pfab-handle:active .pfab-handle-bar {
            background: var(--text-disabled);
          }

          /* Sheet header */
          .pfab-sheet-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 20px 14px;
            border-bottom: 0.5px solid var(--border);
            flex-shrink: 0;
            gap: 12px;
          }
          .pfab-sheet-title-group {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }
          .pfab-sheet-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text);
            font-family: var(--font-sans);
            letter-spacing: -0.3px;
            white-space: nowrap;
          }
          .pfab-sheet-live {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 8px;
            border-radius: 999px;
            background: var(--brand-light);
            border: 0.5px solid var(--brand-border);
            font-size: 11px;
            font-weight: 500;
            color: var(--brand-text);
            font-family: var(--font-sans);
            white-space: nowrap;
          }
          .pfab-live-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--brand);
            animation: pfab-pulse 2s ease-in-out infinite;
          }
          @keyframes pfab-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.5; transform: scale(0.8); }
          }

          .pfab-sheet-close {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 0.5px solid var(--border);
            background: var(--bg-surface);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: var(--text-secondary);
            cursor: pointer;
            flex-shrink: 0;
            -webkit-tap-highlight-color: transparent;
            transition: background 0.12s, color 0.12s;
          }
          .pfab-sheet-close:hover  { background: var(--border-faint); }
          .pfab-sheet-close:active { background: var(--border); color: var(--text); }

          /* Sheet body */
          .pfab-sheet-body {
            overflow-y: auto;
            flex: 1;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </>
  );
}
