// features/social/hashtag-generator/PlatformSelector.tsx
"use client";

import type { Platform } from "./ts/types";
import { PLATFORM_LIMITS } from "./ts/data";
import styles from "./style/PlatformSelector.module.css";

type PlatformSelectorProps = {
  selectedPlatform: Platform;
  onChange: (platform: Platform) => void;
};

export default function PlatformSelector({ selectedPlatform, onChange }: PlatformSelectorProps) {
  const platforms = Object.entries(PLATFORM_LIMITS) as [
    Platform,
    (typeof PLATFORM_LIMITS)[Platform],
  ][];

  return (
    <div className={styles.psRoot}>
      <div className={styles.psHeader}>
        <i className="ti ti-apps" aria-hidden="true" />
        <span>Select Platform</span>
      </div>
      <div className={styles.psGrid}>
        {platforms.map(([key, config]) => (
          <button
            key={key}
            className={`${styles.psPlatform}${selectedPlatform === key ? ` ${styles.active}` : ""}`}
            onClick={() => onChange(key)}
          >
            <div className={styles.psPlatformIcon}>
              <i className={`ti ${config.icon}`} aria-hidden="true" />
            </div>
            <div className={styles.psPlatformInfo}>
              <span className={styles.psPlatformName}>{config.label}</span>
              <span className={styles.psPlatformLimit}>Max: {config.maxHashtags}</span>
            </div>
          </button>
        ))}
      </div>
      <div className={styles.psSelectedInfo}>
        <div className={styles.psInfoCard}>
          <div className={styles.psInfoHeader}>
            <i className={`ti ${PLATFORM_LIMITS[selectedPlatform].icon}`} aria-hidden="true" />
            <span>{PLATFORM_LIMITS[selectedPlatform].label} Guidelines</span>
          </div>
          <ul className={styles.psInfoList}>
            <li>
              <strong>Recommended:</strong> {PLATFORM_LIMITS[selectedPlatform].recommended}{" "}
              hashtags
            </li>
            <li>
              <strong>Maximum:</strong> {PLATFORM_LIMITS[selectedPlatform].maxHashtags} hashtags
            </li>
            <li>
              <strong>Character limit:</strong>{" "}
              {PLATFORM_LIMITS[selectedPlatform].maxCharacters.toLocaleString()}
            </li>
          </ul>
          <p className={styles.psInfoNote}>{PLATFORM_LIMITS[selectedPlatform].notes}</p>
        </div>
      </div>
    </div>
  );
}