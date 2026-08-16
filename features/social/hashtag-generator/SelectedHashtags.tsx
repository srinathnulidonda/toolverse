// features/social/hashtag-generator/SelectedHashtags.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import type { Platform } from "./ts/types";
import { validateHashtagSet, formatHashtagsForExport } from "./ts/utils";
import { PLATFORM_LIMITS } from "./ts/data";
import styles from "./style/SelectedHashtags.module.css";

type SelectedHashtagsProps = {
  hashtags: string[];
  platform: Platform;
  onRemove: (tag: string) => void;
  onClear: () => void;
};

export default function SelectedHashtags({
  hashtags,
  platform,
  onRemove,
  onClear,
}: SelectedHashtagsProps) {
  const [copied, setCopied] = useState(false);

  const warnings = validateHashtagSet(hashtags, platform);
  const limit = PLATFORM_LIMITS[platform];
  const totalChars = hashtags.reduce((sum, h) => sum + h.length + 2, 0);

  const handleCopy = async () => {
    if (hashtags.length === 0) return;

    try {
      const text = formatHashtagsForExport(hashtags, "space");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  };

  const getCountColor = () => {
    if (hashtags.length === 0) return "var(--text-disabled)";
    if (hashtags.length > limit.maxHashtags) return "#B91C1C";
    if (hashtags.length > limit.recommended * 1.5) return "#D97706";
    return "var(--brand)";
  };

  const getCharColor = () => {
    if (totalChars === 0) return "var(--text-disabled)";
    if (totalChars > limit.maxCharacters) return "#B91C1C";
    if (totalChars > limit.maxCharacters * 0.8) return "#D97706";
    return "var(--text-secondary)";
  };

  return (
    <div className={styles.shRoot}>
      <div className={styles.shHeader}>
        <div className={styles.shTitle}>
          <i className="ti ti-bookmark" aria-hidden="true" />
          <span>Selected Hashtags</span>
        </div>
        <div className={styles.shActions}>
          {hashtags.length > 0 && (
            <>
              <button className={styles.shCopyBtn} onClick={handleCopy}>
                <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button className={styles.shClearBtn} onClick={onClear}>
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.shStats}>
        <div className={styles.shStat}>
          <span className={styles.shStatValue} style={{ color: getCountColor() }}>
            {hashtags.length}
          </span>
          <span className={styles.shStatLabel}>/ {limit.maxHashtags} hashtags</span>
        </div>
        <div className={styles.shStat}>
          <span className={styles.shStatValue} style={{ color: getCharColor() }}>
            {totalChars}
          </span>
          <span className={styles.shStatLabel}>/ {limit.maxCharacters.toLocaleString()} chars</span>
        </div>
        <div className={styles.shStat}>
          <span
            className={styles.shStatValue}
            style={{ color: hashtags.length <= limit.recommended ? "var(--brand)" : "#D97706" }}
          >
            {limit.recommended}
          </span>
          <span className={styles.shStatLabel}>recommended</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className={styles.shWarnings}>
          {warnings.map((warning, idx) => (
            <div key={idx} className={`${styles.shWarning} ${styles[`shWarning${warning.level.charAt(0).toUpperCase() + warning.level.slice(1)}`]}`}>
              <i
                className={`ti ${warning.level === "error"
                  ? "ti-alert-circle"
                  : warning.level === "warning"
                    ? "ti-alert-triangle"
                    : "ti-info-circle"
                  }`}
                aria-hidden="true"
              />
              <span className={styles.shWarningText}>{warning.message}</span>
              {warning.hashtags && warning.hashtags.length > 0 && (
                <div className={styles.shWarningTags}>
                  {warning.hashtags.map((tag) => (
                    <span key={tag} className={styles.shWarningTag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hashtags.length === 0 ? (
        <div className={styles.shEmpty}>
          <i className="ti ti-hash" aria-hidden="true" />
          <p>No hashtags selected</p>
          <span>Click on hashtags above to add them to your collection</span>
        </div>
      ) : (
        <div className={styles.shTags}>
          {hashtags.map((tag) => (
            <div key={tag} className={styles.shTag}>
              <span className={styles.shTagText}>#{tag}</span>
              <button
                className={styles.shTagRemove}
                onClick={() => onRemove(tag)}
                aria-label={`Remove ${tag}`}
              >
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {hashtags.length > 0 && (
        <div className={styles.shPreview}>
          <span className={styles.shPreviewLabel}>Copy preview:</span>
          <div className={styles.shPreviewText}>
            {formatHashtagsForExport(hashtags.slice(0, 5), "space")}
            {hashtags.length > 5 && (
              <span className={styles.shPreviewMore}>... +{hashtags.length - 5} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}