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
    </>
  );
}
