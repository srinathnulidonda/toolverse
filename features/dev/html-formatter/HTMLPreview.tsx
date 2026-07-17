// features/dev/html-formatter/HTMLPreview.tsx
"use client";

import { useState } from "react";

interface HTMLPreviewProps {
  html: string;
  onError?: (error: Error) => void;
}

type PreviewMode = "desktop" | "tablet" | "mobile";

const VIEWPORT_CONFIG: Record<PreviewMode, { width: string; label: string; icon: string }> = {
  desktop: { width: "100%", label: "Desktop", icon: "ti-device-desktop" },
  tablet: { width: "768px", label: "Tablet", icon: "ti-device-tablet" },
  mobile: { width: "375px", label: "Mobile", icon: "ti-device-mobile" },
};

export default function HTMLPreview({ html, onError }: HTMLPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  return (
    <>
      <div className="hp-root">
        {/*  Toolbar  */}
        <div className="hp-toolbar">
          <div className="hp-toolbar-left">
            <i className="ti ti-eye" />
            <span>Live Preview</span>
          </div>

          <div className="hp-mode-group">
            {(
              Object.entries(VIEWPORT_CONFIG) as [
                PreviewMode,
                (typeof VIEWPORT_CONFIG)[PreviewMode],
              ][]
            ).map(([mode, cfg]) => (
              <button
                key={mode}
                type="button"
                className={`hp-mode-btn ${previewMode === mode ? "active" : ""}`}
                onClick={() => setPreviewMode(mode)}
                title={cfg.label}
              >
                <i className={`ti ${cfg.icon}`} />
                <span className="hp-mode-label">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/*  Canvas  */}
        <div className="hp-canvas">
          {isLoading && (
            <div className="hp-overlay">
              <div className="hp-spinner">
                <i className="ti ti-loader" />
              </div>
              <span>Rendering…</span>
            </div>
          )}

          <div className="hp-shell" style={{ maxWidth: VIEWPORT_CONFIG[previewMode].width }}>
            {/* Browser chrome */}
            <div className="hp-browser-bar">
              <div className="hp-browser-dots">
                <span className="dot red" />
                <span className="dot amber" />
                <span className="dot green" />
              </div>
              <div className="hp-browser-url">
                <i className="ti ti-lock" />
                <span>preview</span>
              </div>
              <div className="hp-browser-spacer" />
            </div>

            <iframe
              className="hp-iframe"
              title="HTML Preview"
              srcDoc={html}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                onError?.(new Error("Failed to render preview"));
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hp-root {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          overflow: hidden;
        }

        /*  Toolbar  */
        .hp-toolbar {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
          padding: 0 16px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          z-index: 10;
        }

        .hp-toolbar-left {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .hp-toolbar-left i {
          font-size: 15px;
        }

        .hp-mode-group {
          display: flex;
          gap: 2px;
          padding: 3px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 10px;
        }

        .hp-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .hp-mode-btn i {
          font-size: 15px;
        }

        .hp-mode-btn:hover {
          color: var(--text);
          background: var(--bg-card);
        }

        .hp-mode-btn.active {
          background: var(--bg-card);
          color: var(--text);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        /*  Canvas  */
        .hp-canvas {
          flex: 1;
          min-height: 0;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: stretch;
          background-color: #e8eaed;
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          overflow: auto;
          padding: 24px;
        }

        @media (prefers-color-scheme: dark) {
          .hp-canvas {
            background-color: #1a1b1e;
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          }
        }

        /* Overlay */
        .hp-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(6px);
          z-index: 20;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
        }

        .hp-spinner i {
          font-size: 28px;
          display: block;
          animation: spin 0.9s linear infinite;
        }

        /*  Shell  */
        .hp-shell {
          width: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.12),
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.15);
          background: white;
          align-self: stretch;
          transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Browser bar */
        .hp-browser-bar {
          flex-shrink: 0;
          height: 38px;
          background: #ececec;
          border-bottom: 1px solid #d8d8d8;
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 10px;
          user-select: none;
        }

        @media (prefers-color-scheme: dark) {
          .hp-browser-bar {
            background: #28292c;
            border-color: #3a3a3a;
          }
        }

        .hp-browser-dots {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15);
        }

        .dot.red {
          background: #ff5f57;
        }
        .dot.amber {
          background: #febc2e;
        }
        .dot.green {
          background: #28c840;
        }

        .hp-browser-url {
          flex: 1;
          max-width: 340px;
          height: 24px;
          margin: 0 auto;
          background: white;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
          font-size: 11px;
          color: #777;
        }

        @media (prefers-color-scheme: dark) {
          .hp-browser-url {
            background: #1e1e1e;
            border-color: #444;
            color: #888;
          }
        }

        .hp-browser-url i {
          font-size: 11px;
          color: #28c840;
          flex-shrink: 0;
        }

        .hp-browser-spacer {
          width: 46px;
          flex-shrink: 0;
        }

        /*  Iframe  */
        .hp-iframe {
          flex: 1;
          min-height: 0;
          width: 100%;
          border: none;
          display: block;
          background: white;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /*  Mobile  */
        @media (max-width: 768px) {
          .hp-canvas {
            padding: 0;
            overflow: hidden;
            align-items: stretch;
            background-image: none;
          }

          .hp-shell {
            border-radius: 0;
            box-shadow: none;
            max-width: 100% !important;
            align-self: stretch;
          }

          .hp-browser-bar {
            height: 44px;
            padding: 0 12px;
          }

          .hp-mode-label {
            display: none;
          }

          .hp-iframe {
            /* fill remaining height after browser bar */
            flex: 1;
            min-height: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hp-shell {
            transition: none;
          }
          .hp-spinner i {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
