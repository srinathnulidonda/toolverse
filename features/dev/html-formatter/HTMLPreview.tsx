// features/dev/html-formatter/HTMLPreview.tsx
"use client";

import { useState } from "react";
import styles from "./style/HTMLPreview.module.css";

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
      <div className={styles.hpRoot}>
        {/*  Toolbar  */}
        <div className={styles.hpToolbar}>
          <div className={styles.hpToolbarLeft}>
            <i className="ti ti-eye" />
            <span>Live Preview</span>
          </div>

          <div className={styles.hpModeGroup}>
            {(
              Object.entries(VIEWPORT_CONFIG) as [
                PreviewMode,
                (typeof VIEWPORT_CONFIG)[PreviewMode],
              ][]
            ).map(([mode, cfg]) => (
              <button
                key={mode}
                type="button"
                className={`${styles.hpModeBtn}${previewMode === mode ? ` ${styles.active}` : ""}`}
                onClick={() => setPreviewMode(mode)}
                title={cfg.label}
              >
                <i className={`ti ${cfg.icon}`} />
                <span className={styles.hpModeLabel}>{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/*  Canvas  */}
        <div className={styles.hpCanvas}>
          {isLoading && (
            <div className={styles.hpOverlay}>
              <div className={styles.hpSpinner}>
                <i className="ti ti-loader" />
              </div>
              <span>Rendering…</span>
            </div>
          )}

          <div className={styles.hpShell} style={{ maxWidth: VIEWPORT_CONFIG[previewMode].width }}>
            {/* Browser chrome */}
            <div className={styles.hpBrowserBar}>
              <div className={styles.hpBrowserDots}>
                <span className={`${styles.dot} ${styles.red}`} />
                <span className={`${styles.dot} ${styles.amber}`} />
                <span className={`${styles.dot} ${styles.green}`} />
              </div>
              <div className={styles.hpBrowserUrl}>
                <i className="ti ti-lock" />
                <span>preview</span>
              </div>
              <div className={styles.hpBrowserSpacer} />
            </div>

            <iframe
              className={styles.hpIframe}
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