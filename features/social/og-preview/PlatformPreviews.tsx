// features/social/og-preview/PlatformPreviews.tsx
"use client";
import { useState } from "react";
import type { Platform, MetaData, DeviceMode } from "./ts/types";
import { getPlatformLabel, getPlatformIcon } from "./ts/utils";
import PlatformPreview from "./PlatformPreview";
import styles from "./style/PlatformPreviews.module.css";

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
      <div className={styles.ppvRoot}>
        {/* Header controls */}
        <div className={styles.ppvHeader}>
          <div className={styles.ppvHeaderLeft}>
            <div className={styles.ppvViewToggle}>
              <button
                className={`${styles.ppvViewBtn} ${viewMode === "single" ? styles.active : ""}`}
                onClick={() => setViewMode("single")}
                title="Single platform view"
              >
                <i className="ti ti-square" aria-hidden="true" />
              </button>
              <button
                className={`${styles.ppvViewBtn} ${viewMode === "grid" ? styles.active : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view (all platforms)"
              >
                <i className="ti ti-layout-grid" aria-hidden="true" />
              </button>
            </div>

            {viewMode === "single" && (
              <select
                className={styles.ppvPlatformSelect}
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

          <div className={styles.ppvDeviceToggle}>
            <button
              className={`${styles.ppvDeviceBtn} ${device === "desktop" ? styles.active : ""}`}
              onClick={() => setDevice("desktop")}
              title="Desktop view"
            >
              <i className="ti ti-device-desktop" aria-hidden="true" />
            </button>
            <button
              className={`${styles.ppvDeviceBtn} ${device === "mobile" ? styles.active : ""}`}
              onClick={() => setDevice("mobile")}
              title="Mobile view"
            >
              <i className="ti ti-device-mobile" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className={styles.ppvContent}>
          {viewMode === "single" ? (
            <div className={styles.ppvSingleView}>
              <div className={styles.ppvPlatformLabel}>
                <i className={`ti ${getPlatformIcon(selectedPlatform)}`} aria-hidden="true" />
                <span>{getPlatformLabel(selectedPlatform)}</span>
                <span className={styles.ppvDeviceIndicator}>
                  {device === "desktop" ? "Desktop" : "Mobile"}
                </span>
              </div>
              <div className={`${styles.ppvPreviewWrapper} ${device === "mobile" ? styles.mobile : ""}`}>
                <PlatformPreview platform={selectedPlatform} meta={meta} device={device} />
              </div>
            </div>
          ) : (
            <div className={styles.ppvGridView}>
              {PLATFORMS.map((platform) => (
                <div key={platform} className={styles.ppvGridItem}>
                  <div className={styles.ppvGridItemHeader}>
                    <i className={`ti ${getPlatformIcon(platform)}`} aria-hidden="true" />
                    <span>{getPlatformLabel(platform)}</span>
                  </div>
                  <div className={`${styles.ppvGridItemPreview} ${device === "mobile" ? styles.mobile : ""}`}>
                    <PlatformPreview platform={platform} meta={meta} device={device} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {!meta.title && !meta.description && !meta.image && (
          <div className={styles.ppvEmptyOverlay}>
            <div className={styles.ppvEmptyContent}>
              <div className={styles.ppvEmptyIcon}>
                <i className="ti ti-eye-off" aria-hidden="true" />
              </div>
              <p className={styles.ppvEmptyTitle}>No preview available</p>
              <p className={styles.ppvEmptyText}>
                Fill in the title, description, and image to see how your content will look when
                shared
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}