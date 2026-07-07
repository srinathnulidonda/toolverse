// features/social/og-preview/PlatformPreviews.tsx
"use client";

import { useState } from "react";
import type { Platform, MetaData, DeviceMode } from "./types";
import { getPlatformLabel, getPlatformIcon } from "./utils";
import PlatformPreview from "./PlatformPreview";

const PLATFORMS: Platform[] = [
  "facebook",
  "twitter",
  "linkedin",
  "slack",
  "discord",
  "whatsapp",
  "imessage",
  "telegram",
];

type PlatformPreviewsProps = {
  meta: MetaData;
};

export default function PlatformPreviews({ meta }: PlatformPreviewsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("facebook");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  return (
    <>
      <div className="ppv-root">
        {/* Header controls */}
        <div className="ppv-header">
          <div className="ppv-header-left">
            <div className="ppv-view-toggle">
              <button
                className={`ppv-view-btn ${viewMode === "single" ? "active" : ""}`}
                onClick={() => setViewMode("single")}
                title="Single platform view"
              >
                <i className="ti ti-square" aria-hidden="true" />
              </button>
              <button
                className={`ppv-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view (all platforms)"
              >
                <i className="ti ti-layout-grid" aria-hidden="true" />
              </button>
            </div>

            {viewMode === "single" && (
              <select
                className="ppv-platform-select"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {getPlatformLabel(p)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="ppv-device-toggle">
            <button
              className={`ppv-device-btn ${device === "desktop" ? "active" : ""}`}
              onClick={() => setDevice("desktop")}
              title="Desktop view"
            >
              <i className="ti ti-device-desktop" aria-hidden="true" />
            </button>
            <button
              className={`ppv-device-btn ${device === "mobile" ? "active" : ""}`}
              onClick={() => setDevice("mobile")}
              title="Mobile view"
            >
              <i className="ti ti-device-mobile" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="ppv-content">
          {viewMode === "single" ? (
            <div className="ppv-single-view">
              <div className="ppv-platform-label">
                <i className={`ti ${getPlatformIcon(selectedPlatform)}`} aria-hidden="true" />
                <span>{getPlatformLabel(selectedPlatform)}</span>
                <span className="ppv-device-indicator">{device === "desktop" ? "Desktop" : "Mobile"}</span>
              </div>
              <div className={`ppv-preview-wrapper ${device === "mobile" ? "mobile" : ""}`}>
                <PlatformPreview
                  platform={selectedPlatform}
                  meta={meta}
                  device={device}
                />
              </div>
            </div>
          ) : (
            <div className="ppv-grid-view">
              {PLATFORMS.map((platform) => (
                <div key={platform} className="ppv-grid-item">
                  <div className="ppv-grid-item-header">
                    <i className={`ti ${getPlatformIcon(platform)}`} aria-hidden="true" />
                    <span>{getPlatformLabel(platform)}</span>
                  </div>
                  <div className={`ppv-grid-item-preview ${device === "mobile" ? "mobile" : ""}`}>
                    <PlatformPreview
                      platform={platform}
                      meta={meta}
                      device={device}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {!meta.title && !meta.description && !meta.image && (
          <div className="ppv-empty-overlay">
            <div className="ppv-empty-content">
              <div className="ppv-empty-icon">
                <i className="ti ti-eye-off" aria-hidden="true" />
              </div>
              <p className="ppv-empty-title">No preview available</p>
              <p className="ppv-empty-text">
                Fill in the title, description, and image to see how your content will look when shared
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ppv-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }

        .ppv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-shrink: 0;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ppv-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .ppv-view-toggle {
          display: flex;
          gap: 4px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 3px;
        }
        .ppv-view-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.12s;
          font-size: 16px;
        }
        .ppv-view-btn:hover { color: var(--text-secondary); background: var(--bg-surface); }
        .ppv-view-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .ppv-platform-select {
          flex: 1;
          max-width: 200px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 8px 10px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .ppv-platform-select:focus { border-color: var(--brand); }

        .ppv-device-toggle {
          display: flex;
          gap: 4px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 3px;
        }
        .ppv-device-btn {
          width: 36px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.12s;
          font-size: 16px;
        }
        .ppv-device-btn:hover { color: var(--text-secondary); background: var(--bg-surface); }
        .ppv-device-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .ppv-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: var(--bg);
        }

        /* Single view */
        .ppv-single-view {
          max-width: 680px;
          margin: 0 auto;
        }
        .ppv-platform-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ppv-platform-label i { font-size: 18px; color: var(--text-secondary); }
        .ppv-device-indicator {
          margin-left: auto;
          padding: 3px 8px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .ppv-preview-wrapper {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          padding: 24px;
        }
        .ppv-preview-wrapper.mobile {
          max-width: 400px;
          margin: 0 auto;
        }

        /* Grid view */
        .ppv-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .ppv-grid-item {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .ppv-grid-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text);
        }
        .ppv-grid-item-header i { font-size: 16px; color: var(--text-secondary); }
        .ppv-grid-item-preview {
          padding: 20px;
        }
        .ppv-grid-item-preview.mobile {
          display: flex;
          justify-content: center;
        }

        /* Empty state */
        .ppv-empty-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          z-index: 1;
          pointer-events: none;
        }
        .ppv-empty-content {
          text-align: center;
          max-width: 280px;
          padding: 20px;
        }
        .ppv-empty-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 16px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--text-disabled);
        }
        .ppv-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 8px;
        }
        .ppv-empty-text {
          font-size: 12.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .ppv-header { padding: 10px 12px; }
          .ppv-content { padding: 16px; }
          .ppv-preview-wrapper { padding: 16px; }
          .ppv-grid-view {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .ppv-platform-select { max-width: none; }
        }

        @media (max-width: 480px) {
          .ppv-view-toggle { display: none; }
          .ppv-device-indicator { display: none; }
        }
      `}</style>
    </>
  );
}