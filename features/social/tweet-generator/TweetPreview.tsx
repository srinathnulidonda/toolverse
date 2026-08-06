// features/social/tweet-generator/TweetPreview.tsx
"use client";
import { logger } from "@/lib/logger";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TweetData, TweetStyle, ExportFormat } from "./ts/types";
import {
  THEME_PRESETS,
  formatNumber,
  formatTimestamp,
  highlightTextEntities,
  getAspectRatioDimensions,
  VERIFIED_BADGE_COLORS,
} from "./ts/utils";
import html2canvas from "html2canvas";
import styles from "./style/TweetPreview.module.css";

type TweetPreviewProps = {
  tweetData: TweetData;
  style: TweetStyle;
  onSave: (thumbnail: string) => void;
};

export default function TweetPreview({ tweetData, style, onSave }: TweetPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasContent = tweetData.content.text.trim().length > 0;

  const theme =
    style.theme === "custom" && style.customTheme ? style.customTheme : THEME_PRESETS[style.theme];

  const dimensions = getAspectRatioDimensions(
    style.aspectRatio === "custom" ? "16:9" : style.aspectRatio,
    800
  );

  useEffect(() => {
    setSaved(false);
  }, [tweetData, style]);

  const handleSave = useCallback(async () => {
    if (!previewRef.current || !hasContent) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const thumbnail = canvas.toDataURL("image/png");
      onSave(thumbnail);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      logger.error("Failed to save:", error);
    }
  }, [hasContent, onSave]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!previewRef.current || !hasContent) return;

      setExporting(format);

      try {
        const scale = format === "svg" ? 1 : 3;
        const canvas = await html2canvas(previewRef.current, {
          backgroundColor: style.backgroundType === "solid" ? theme.background : "transparent",
          scale,
          logging: false,
          useCORS: true,
          width: dimensions.width,
          height: dimensions.height,
        });

        if (format === "png") {
          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tweet-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            setExporting(null);
          }, "image/png");
        } else if (format === "jpg") {
          const offCanvas = document.createElement("canvas");
          offCanvas.width = canvas.width;
          offCanvas.height = canvas.height;
          const ctx = offCanvas.getContext("2d")!;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);
          ctx.drawImage(canvas, 0, 0);

          offCanvas.toBlob(
            (blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `tweet-${Date.now()}.jpg`;
              a.click();
              URL.revokeObjectURL(url);
              setExporting(null);
            },
            "image/jpeg",
            0.95
          );
        }
      } catch (error) {
        logger.error("Export failed:", error);
        setExporting(null);
      }
    },
    [hasContent, style, theme, dimensions]
  );

  const handleCopyImage = useCallback(async () => {
    if (!previewRef.current || !hasContent) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: theme.background,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          logger.error("Copy failed:", err);
        }
      }, "image/png");
    } catch (error) {
      logger.error("Failed to copy:", error);
    }
  }, [hasContent, theme]);

  const getBackgroundStyle = () => {
    if (style.backgroundType === "gradient" && style.backgroundGradient) {
      return `linear-gradient(${style.backgroundGradient.angle}deg, ${style.backgroundGradient.start}, ${style.backgroundGradient.end})`;
    }
    if (style.backgroundType === "pattern" && style.backgroundPattern) {
      const patterns: Record<string, string> = {
        dots: `radial-gradient(circle, ${style.backgroundPattern.color} 1px, transparent 1px)`,
        grid: `linear-gradient(${style.backgroundPattern.color} 1px, transparent 1px), linear-gradient(90deg, ${style.backgroundPattern.color} 1px, transparent 1px)`,
        diagonal: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${style.backgroundPattern.color} 10px, ${style.backgroundPattern.color} 11px)`,
        waves: `repeating-radial-gradient(circle at 0 0, transparent 0, ${style.backgroundPattern.color} 10px, transparent 20px)`,
        noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
      };

      const pattern = patterns[style.backgroundPattern.type] || patterns.dots;

      return pattern;
    }

    return theme.background;
  };

  const getPatternStyle = () => {
    if (style.backgroundType === "pattern" && style.backgroundPattern) {
      const size = 20 * style.backgroundPattern.scale;
      return {
        backgroundSize:
          style.backgroundPattern.type === "grid" ? `${size}px ${size}px` : `${size}px ${size}px`,
        opacity: style.backgroundPattern.opacity,
      };
    }
    return {};
  };

  const getBorderRadius = () => {
    switch (style.cornerStyle) {
      case "sharp":
        return "0px";
      case "rounded":
        return "12px";
      case "extra-rounded":
        return "24px";
      default:
        return "12px";
    }
  };

  const getShadow = () => {
    const shadows = [
      "none",
      "0 1px 3px rgba(0,0,0,0.08)",
      "0 2px 8px rgba(0,0,0,0.1)",
      "0 4px 16px rgba(0,0,0,0.12)",
      "0 8px 24px rgba(0,0,0,0.15)",
      "0 12px 32px rgba(0,0,0,0.18)",
    ];
    return shadows[style.shadowIntensity] || shadows[2];
  };

  const verifiedBadgeColor = VERIFIED_BADGE_COLORS[tweetData.profile.verifiedType];

  return (
    <div className={styles.tpRoot}>
      <div className={styles.tpCanvasRegion}>
        <div
          className={`${styles.tpCanvasWrap}${!hasContent ? ` ${styles.tpEmptyState}` : ""}`}
          style={{
            background: getBackgroundStyle(),
            ...getPatternStyle(),
          }}
        >
          {!hasContent ? (
            <div className={styles.tpPlaceholder}>
              <div className={styles.tpPlaceholderIcon}>
                <i className="ti ti-message" aria-hidden="true" />
              </div>
              <p className={styles.tpPlaceholderText}>Enter tweet content to see preview</p>
            </div>
          ) : (
            <div
              ref={previewRef}
              className={styles.tpTweetCard}
              style={{
                background: theme.cardBg,
                borderRadius: getBorderRadius(),
                boxShadow: getShadow(),
                border: style.showBorder
                  ? `${style.borderWidth}px solid ${theme.border}`
                  : "none",
                padding: `${style.padding}px`,
                maxWidth: "600px",
                width: "100%",
              }}
            >
              <div className={styles.tpTweetHeader}>
                <img
                  src={tweetData.profile.avatar}
                  alt={tweetData.profile.displayName}
                  className={styles.tpAvatar}
                />
                <div className={styles.tpProfileInfo}>
                  <div className={styles.tpNameRow}>
                    <span className={styles.tpDisplayName} style={{ color: theme.text }}>
                      {tweetData.profile.displayName}
                    </span>
                    {tweetData.profile.verified && (
                      <i
                        className={`ti ti-circle-check-filled ${styles.tpVerified}`}
                        style={{ color: verifiedBadgeColor }}
                        aria-label="Verified"
                      />
                    )}
                  </div>
                  <span className={styles.tpHandle} style={{ color: theme.textSecondary }}>
                    @{tweetData.profile.handle}
                  </span>
                </div>
              </div>

              <div className={styles.tpTweetBody}>
                <p
                  className={styles.tpTweetText}
                  style={{
                    color: theme.text,
                    fontSize: `${style.fontSize}px`,
                    lineHeight: style.lineHeight,
                    fontFamily: getFontFamily(style.fontFamily),
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlightTextEntities(tweetData.content.text, theme),
                  }}
                />
              </div>

              <div className={styles.tpTweetMeta}>
                <span className={styles.tpTimestamp} style={{ color: theme.textSecondary }}>
                  {formatTimestamp(
                    tweetData.content.timestamp,
                    tweetData.content.timestampFormat,
                    tweetData.content.customTimestamp
                  )}
                </span>
                {tweetData.content.showSource && (
                  <>
                    <span className={styles.tpMetaDot} style={{ color: theme.textTertiary }}>
                      ·
                    </span>
                    <span className={styles.tpSource} style={{ color: theme.textSecondary }}>
                      {tweetData.content.source}
                    </span>
                  </>
                )}
              </div>

              {tweetData.engagement.showMetrics && (
                <div className={styles.tpEngagement} style={{ borderColor: theme.border }}>
                  <div className={styles.tpMetrics}>
                    <div className={styles.tpMetric}>
                      <i
                        className="ti ti-message-circle"
                        style={{ color: theme.textTertiary }}
                        aria-hidden="true"
                      />
                      <span style={{ color: theme.textSecondary }}>
                        {formatNumber(tweetData.engagement.replies)}
                      </span>
                    </div>
                    <div className={styles.tpMetric}>
                      <i
                        className="ti ti-repeat"
                        style={{ color: theme.textTertiary }}
                        aria-hidden="true"
                      />
                      <span style={{ color: theme.textSecondary }}>
                        {formatNumber(tweetData.engagement.retweets)}
                      </span>
                    </div>
                    <div className={styles.tpMetric}>
                      <i
                        className="ti ti-heart"
                        style={{ color: theme.textTertiary }}
                        aria-hidden="true"
                      />
                      <span style={{ color: theme.textSecondary }}>
                        {formatNumber(tweetData.engagement.likes)}
                      </span>
                    </div>
                    <div className={styles.tpMetric}>
                      <i
                        className="ti ti-bookmark"
                        style={{ color: theme.textTertiary }}
                        aria-hidden="true"
                      />
                      <span style={{ color: theme.textSecondary }}>
                        {formatNumber(tweetData.engagement.bookmarks)}
                      </span>
                    </div>
                    {tweetData.engagement.showViews && (
                      <div className={styles.tpMetric}>
                        <i
                          className="ti ti-eye"
                          style={{ color: theme.textTertiary }}
                          aria-hidden="true"
                        />
                        <span style={{ color: theme.textSecondary }}>
                          {formatNumber(tweetData.engagement.views)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {style.watermark.enabled && style.watermark.text && (
                <div
                  className={`${styles.tpWatermark} ${styles[`tpWatermark${style.watermark.position.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("")}`]}`}
                  style={{
                    opacity: style.watermark.opacity,
                    color: theme.textTertiary,
                  }}
                >
                  {style.watermark.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.tpActions}>
        <button
          className={`${styles.tpActionBtn} ${styles.tpSaveBtn}${saved ? ` ${styles.tpSaved}` : ""}`}
          onClick={handleSave}
          disabled={!hasContent}
        >
          <i className={`ti ${saved ? "ti-check" : "ti-bookmark"}`} aria-hidden="true" />
          <span>{saved ? "Saved!" : "Save to history"}</span>
        </button>

        <button
          className={`${styles.tpActionBtn} ${styles.tpCopyBtn}`}
          onClick={handleCopyImage}
          disabled={!hasContent}
        >
          <i className={`ti ${copied ? "ti-check" : "ti-clipboard"}`} aria-hidden="true" />
          <span>{copied ? "Copied!" : "Copy image"}</span>
        </button>
      </div>

      <div className={styles.tpExportSection}>
        <span className={styles.tpExportLabel}>
          <i className="ti ti-download" aria-hidden="true" />
          Export
        </span>
        <div className={styles.tpExportBtns}>
          <button
            className={`${styles.tpExportBtn} ${styles.tpExportPrimary}`}
            onClick={() => handleExport("png")}
            disabled={!hasContent}
          >
            {exporting === "png" ? (
              <i className={`ti ti-loader-2 ${styles.tpSpin}`} aria-hidden="true" />
            ) : (
              <i className="ti ti-download" aria-hidden="true" />
            )}
            PNG
          </button>
          <button
            className={styles.tpExportBtn}
            onClick={() => handleExport("jpg")}
            disabled={!hasContent}
          >
            {exporting === "jpg" ? (
              <i className={`ti ti-loader-2 ${styles.tpSpin}`} aria-hidden="true" />
            ) : (
              <i className="ti ti-download" aria-hidden="true" />
            )}
            JPG
          </button>
        </div>
      </div>
    </div>
  );
}

function getFontFamily(family: string): string {
  const families: Record<string, string> = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter: '"Inter", -apple-system, sans-serif',
    segoe: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    "sf-pro": '"SF Pro Display", -apple-system, sans-serif',
    roboto: '"Roboto", Arial, sans-serif',
    poppins: '"Poppins", sans-serif',
  };
  return families[family] || families.system;
}