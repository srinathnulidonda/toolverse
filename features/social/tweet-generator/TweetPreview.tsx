// features/social/tweet-generator/TweetPreview.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TweetData, TweetStyle, ExportFormat } from "./types";
import {
  THEME_PRESETS,
  formatNumber,
  formatTimestamp,
  highlightTextEntities,
  getAspectRatioDimensions,
  VERIFIED_BADGE_COLORS,
} from "./utils";
import html2canvas from "html2canvas";

type TweetPreviewProps = {
  tweetData: TweetData;
  style: TweetStyle;
  onSave: (thumbnail: string) => void;
};

export default function TweetPreview({
  tweetData,
  style,
  onSave,
}: TweetPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasContent = tweetData.content.text.trim().length > 0;

  const theme =
    style.theme === "custom" && style.customTheme
      ? style.customTheme
      : THEME_PRESETS[style.theme];

  const dimensions = getAspectRatioDimensions(
    style.aspectRatio === "custom"
      ? "16:9"
      : style.aspectRatio,
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
      console.error("Failed to save:", error);
    }
  }, [hasContent, onSave]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!previewRef.current || !hasContent) return;

      setExporting(format);

      try {
        const scale = format === "svg" ? 1 : 3; // 3x for retina
        const canvas = await html2canvas(previewRef.current, {
          backgroundColor:
            style.backgroundType === "solid"
              ? theme.background
              : "transparent",
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
          // Create white background for JPG
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
        console.error("Export failed:", error);
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
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Copy failed:", err);
        }
      }, "image/png");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [hasContent, theme]);

  const getBackgroundStyle = () => {
    if (style.backgroundType === "gradient" && style.backgroundGradient) {
      return `linear-gradient(${style.backgroundGradient.angle}deg, ${style.backgroundGradient.start}, ${style.backgroundGradient.end})`;
    }
    if (style.backgroundType === "pattern" && style.backgroundPattern) {
      // Generate pattern based on type
      const patterns: Record<string, string> = {
        dots: `radial-gradient(circle, ${style.backgroundPattern.color} 1px, transparent 1px)`,
        grid: `linear-gradient(${style.backgroundPattern.color} 1px, transparent 1px), linear-gradient(90deg, ${style.backgroundPattern.color} 1px, transparent 1px)`,
        diagonal: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${style.backgroundPattern.color} 10px, ${style.backgroundPattern.color} 11px)`,
        waves: `repeating-radial-gradient(circle at 0 0, transparent 0, ${style.backgroundPattern.color} 10px, transparent 20px)`,
        noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
      };

      const pattern = patterns[style.backgroundPattern.type] || patterns.dots;
      const size = 20 * style.backgroundPattern.scale;

      return pattern;
    }

    return theme.background;
  };

  const getPatternStyle = () => {
    if (style.backgroundType === "pattern" && style.backgroundPattern) {
      const size = 20 * style.backgroundPattern.scale;
      return {
        backgroundSize:
          style.backgroundPattern.type === "grid"
            ? `${size}px ${size}px`
            : `${size}px ${size}px`,
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

  const verifiedBadgeColor =
    VERIFIED_BADGE_COLORS[tweetData.profile.verifiedType];

  return (
    <>
      <div className="tp-root">
        {/* Preview container */}
        <div className="tp-canvas-region">
          <div
            className={`tp-canvas-wrap${!hasContent ? " tp-empty-state" : ""}`}
            style={{
              background: getBackgroundStyle(),
              ...getPatternStyle(),
            }}
          >
            {!hasContent ? (
              <div className="tp-placeholder">
                <div className="tp-placeholder-icon">
                  <i className="ti ti-message" aria-hidden="true" />
                </div>
                <p className="tp-placeholder-text">
                  Enter tweet content to see preview
                </p>
              </div>
            ) : (
              <div
                ref={previewRef}
                className="tp-tweet-card"
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
                {/* Tweet Header */}
                <div className="tp-tweet-header">
                  <img
                    src={tweetData.profile.avatar}
                    alt={tweetData.profile.displayName}
                    className="tp-avatar"
                  />
                  <div className="tp-profile-info">
                    <div className="tp-name-row">
                      <span
                        className="tp-display-name"
                        style={{ color: theme.text }}
                      >
                        {tweetData.profile.displayName}
                      </span>
                      {tweetData.profile.verified && (
                        <i
                          className="ti ti-circle-check-filled tp-verified"
                          style={{ color: verifiedBadgeColor }}
                          aria-label="Verified"
                        />
                      )}
                    </div>
                    <span
                      className="tp-handle"
                      style={{ color: theme.textSecondary }}
                    >
                      @{tweetData.profile.handle}
                    </span>
                  </div>
                </div>

                {/* Tweet Content */}
                <div className="tp-tweet-body">
                  <p
                    className="tp-tweet-text"
                    style={{
                      color: theme.text,
                      fontSize: `${style.fontSize}px`,
                      lineHeight: style.lineHeight,
                      fontFamily: getFontFamily(style.fontFamily),
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightTextEntities(
                        tweetData.content.text,
                        theme
                      ),
                    }}
                  />
                </div>

                {/* Timestamp & Source */}
                <div className="tp-tweet-meta">
                  <span
                    className="tp-timestamp"
                    style={{ color: theme.textSecondary }}
                  >
                    {formatTimestamp(
                      tweetData.content.timestamp,
                      tweetData.content.timestampFormat,
                      tweetData.content.customTimestamp
                    )}
                  </span>
                  {tweetData.content.showSource && (
                    <>
                      <span
                        className="tp-meta-dot"
                        style={{ color: theme.textTertiary }}
                      >
                        ·
                      </span>
                      <span
                        className="tp-source"
                        style={{ color: theme.textSecondary }}
                      >
                        {tweetData.content.source}
                      </span>
                    </>
                  )}
                </div>

                {/* Engagement Metrics */}
                {tweetData.engagement.showMetrics && (
                  <div
                    className="tp-engagement"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="tp-metrics">
                      <div className="tp-metric">
                        <i
                          className="ti ti-message-circle"
                          style={{ color: theme.textTertiary }}
                          aria-hidden="true"
                        />
                        <span style={{ color: theme.textSecondary }}>
                          {formatNumber(tweetData.engagement.replies)}
                        </span>
                      </div>
                      <div className="tp-metric">
                        <i
                          className="ti ti-repeat"
                          style={{ color: theme.textTertiary }}
                          aria-hidden="true"
                        />
                        <span style={{ color: theme.textSecondary }}>
                          {formatNumber(tweetData.engagement.retweets)}
                        </span>
                      </div>
                      <div className="tp-metric">
                        <i
                          className="ti ti-heart"
                          style={{ color: theme.textTertiary }}
                          aria-hidden="true"
                        />
                        <span style={{ color: theme.textSecondary }}>
                          {formatNumber(tweetData.engagement.likes)}
                        </span>
                      </div>
                      <div className="tp-metric">
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
                        <div className="tp-metric">
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

                {/* Watermark */}
                {style.watermark.enabled && style.watermark.text && (
                  <div
                    className={`tp-watermark tp-watermark-${style.watermark.position}`}
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

        {/* Action Buttons */}
        <div className="tp-actions">
          <button
            className={`tp-action-btn tp-save-btn${saved ? " tp-saved" : ""}`}
            onClick={handleSave}
            disabled={!hasContent}
          >
            <i
              className={`ti ${saved ? "ti-check" : "ti-bookmark"}`}
              aria-hidden="true"
            />
            <span>{saved ? "Saved!" : "Save to history"}</span>
          </button>

          <button
            className="tp-action-btn tp-copy-btn"
            onClick={handleCopyImage}
            disabled={!hasContent}
          >
            <i
              className={`ti ${copied ? "ti-check" : "ti-clipboard"}`}
              aria-hidden="true"
            />
            <span>{copied ? "Copied!" : "Copy image"}</span>
          </button>
        </div>

        {/* Export Section */}
        <div className="tp-export-section">
          <span className="tp-export-label">
            <i className="ti ti-download" aria-hidden="true" />
            Export
          </span>
          <div className="tp-export-btns">
            <button
              className="tp-export-btn tp-export-primary"
              onClick={() => handleExport("png")}
              disabled={!hasContent}
            >
              {exporting === "png" ? (
                <i className="ti ti-loader-2 tp-spin" aria-hidden="true" />
              ) : (
                <i className="ti ti-download" aria-hidden="true" />
              )}
              PNG
            </button>
            <button
              className="tp-export-btn"
              onClick={() => handleExport("jpg")}
              disabled={!hasContent}
            >
              {exporting === "jpg" ? (
                <i className="ti ti-loader-2 tp-spin" aria-hidden="true" />
              ) : (
                <i className="ti ti-download" aria-hidden="true" />
              )}
              JPG
            </button>
          </div>
        </div>
      </div>

      <style>{previewStyles}</style>
    </>
  );
}

function getFontFamily(family: string): string {
  const families: Record<string, string> = {
    system:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter: '"Inter", -apple-system, sans-serif',
    segoe: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    "sf-pro": '"SF Pro Display", -apple-system, sans-serif',
    roboto: '"Roboto", Arial, sans-serif',
    poppins: '"Poppins", sans-serif',
  };
  return families[family] || families.system;
}

const previewStyles = `
  .tp-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
    flex: 1;
  }

  .tp-canvas-region {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .tp-canvas-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 400px;
    border-radius: 12px;
    overflow: hidden;
    border: 0.5px solid var(--border);
    padding: 20px;
  }

  .tp-canvas-wrap.tp-empty-state {
    background: var(--bg-surface) !important;
  }

  .tp-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
  }

  .tp-placeholder-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--text-disabled);
  }

  .tp-placeholder-text {
    font-size: 13px;
    color: var(--text-tertiary);
    line-height: 1.5;
    margin: 0;
    max-width: 200px;
    font-family: var(--font-sans);
  }

  /* Tweet Card */
  .tp-tweet-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
  }

  .tp-tweet-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .tp-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
    object-fit: cover;
  }

  .tp-profile-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .tp-name-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tp-display-name {
    font-size: 15px;
    font-weight: 700;
    font-family: var(--font-sans);
    line-height: 1.2;
  }

  .tp-verified {
    font-size: 18px;
    flex-shrink: 0;
  }

  .tp-handle {
    font-size: 15px;
    font-family: var(--font-sans);
    line-height: 1.2;
  }

  .tp-tweet-body {
    padding-left: 0;
  }

  .tp-tweet-text {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .tp-tweet-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-family: var(--font-sans);
  }

  .tp-timestamp,
  .tp-source {
    font-size: 15px;
  }

  .tp-meta-dot {
    font-size: 15px;
  }

  .tp-engagement {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 12px;
    margin-top: 12px;
    border-top: 0.5px solid;
  }

  .tp-metrics {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .tp-metric {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-family: var(--font-sans);
  }

  .tp-metric i {
    font-size: 18px;
  }

  .tp-metric span {
    font-weight: 500;
  }

  .tp-watermark {
    position: absolute;
    font-size: 10px;
    font-weight: 500;
    font-family: var(--font-sans);
    pointer-events: none;
  }

  .tp-watermark-top-left {
    top: 12px;
    left: 12px;
  }

  .tp-watermark-top-right {
    top: 12px;
    right: 12px;
  }

  .tp-watermark-bottom-left {
    bottom: 12px;
    left: 12px;
  }

  .tp-watermark-bottom-right {
    bottom: 12px;
    right: 12px;
  }

  /* Actions */
  .tp-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    max-width: 400px;
  }

  .tp-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    height: 42px;
    border-radius: 9px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 13.5px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .tp-action-btn i {
    font-size: 16px;
  }

  .tp-action-btn:hover:not(:disabled) {
    background: var(--border);
    color: var(--text);
  }

  .tp-action-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .tp-action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tp-save-btn.tp-saved {
    background: var(--brand-light);
    border-color: var(--brand-border);
    color: var(--brand-text);
  }

  /* Export */
  .tp-export-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 400px;
  }

  .tp-export-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-family: var(--font-sans);
  }

  .tp-export-label i {
    font-size: 13px;
  }

  .tp-export-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .tp-export-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    border-radius: 8px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .tp-export-btn i {
    font-size: 14px;
  }

  .tp-export-btn:hover:not(:disabled) {
    background: var(--border);
    color: var(--text);
  }

  .tp-export-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .tp-export-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tp-export-primary {
    background: var(--brand-light);
    border-color: var(--brand-border);
    color: var(--brand-text);
  }

  .tp-export-primary:hover:not(:disabled) {
    background: var(--brand-border);
  }

  @keyframes tp-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .tp-spin {
    animation: tp-spin 0.75s linear infinite;
  }

  @media (max-width: 768px) {
    .tp-root {
      padding: 16px 20px 32px;
    }

    .tp-canvas-wrap {
      min-height: 300px;
    }

    .tp-actions,
    .tp-export-section {
      max-width: 100%;
    }

    .tp-action-btn {
      height: 46px;
      font-size: 14px;
    }

    .tp-export-btn {
      height: 44px;
      font-size: 13.5px;
    }
  }
`;