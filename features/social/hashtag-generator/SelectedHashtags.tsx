// features/social/hashtag-generator/SelectedHashtags.tsx
"use client";

import { useState } from "react";
import type { Platform } from "./types";
import { validateHashtagSet, formatHashtagsForExport } from "./utils";
import { PLATFORM_LIMITS } from "./data";

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
      console.error("Failed to copy:", err);
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
    <>
      <div className="sh-root">
        <div className="sh-header">
          <div className="sh-title">
            <i className="ti ti-bookmark" aria-hidden="true" />
            <span>Selected Hashtags</span>
          </div>
          <div className="sh-actions">
            {hashtags.length > 0 && (
              <>
                <button className="sh-copy-btn" onClick={handleCopy}>
                  <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button className="sh-clear-btn" onClick={onClear}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="sh-stats">
          <div className="sh-stat">
            <span className="sh-stat-value" style={{ color: getCountColor() }}>
              {hashtags.length}
            </span>
            <span className="sh-stat-label">
              / {limit.maxHashtags} hashtags
            </span>
          </div>
          <div className="sh-stat">
            <span className="sh-stat-value" style={{ color: getCharColor() }}>
              {totalChars}
            </span>
            <span className="sh-stat-label">
              / {limit.maxCharacters.toLocaleString()} chars
            </span>
          </div>
          <div className="sh-stat">
            <span className="sh-stat-value" style={{ color: hashtags.length <= limit.recommended ? "var(--brand)" : "#D97706" }}>
              {limit.recommended}
            </span>
            <span className="sh-stat-label">recommended</span>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="sh-warnings">
            {warnings.map((warning, idx) => (
              <div key={idx} className={`sh-warning sh-warning-${warning.level}`}>
                <i
                  className={`ti ${
                    warning.level === "error"
                      ? "ti-alert-circle"
                      : warning.level === "warning"
                      ? "ti-alert-triangle"
                      : "ti-info-circle"
                  }`}
                  aria-hidden="true"
                />
                <span className="sh-warning-text">{warning.message}</span>
                {warning.hashtags && warning.hashtags.length > 0 && (
                  <div className="sh-warning-tags">
                    {warning.hashtags.map((tag) => (
                      <span key={tag} className="sh-warning-tag">
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
          <div className="sh-empty">
            <i className="ti ti-hash" aria-hidden="true" />
            <p>No hashtags selected</p>
            <span>Click on hashtags above to add them to your collection</span>
          </div>
        ) : (
          <div className="sh-tags">
            {hashtags.map((tag) => (
              <div key={tag} className="sh-tag">
                <span className="sh-tag-text">#{tag}</span>
                <button
                  className="sh-tag-remove"
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
          <div className="sh-preview">
            <span className="sh-preview-label">Copy preview:</span>
            <div className="sh-preview-text">
              {formatHashtagsForExport(hashtags.slice(0, 5), "space")}
              {hashtags.length > 5 && <span className="sh-preview-more">... +{hashtags.length - 5} more</span>}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sh-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          padding: 16px;
        }

        .sh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .sh-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .sh-title i { font-size: 16px; color: var(--text-secondary); }

        .sh-actions {
          display: flex;
          gap: 6px;
        }
        .sh-copy-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 6px;
          color: var(--brand-text);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .sh-copy-btn:hover { background: var(--brand); color: white; }
        .sh-copy-btn i { font-size: 13px; }

        .sh-clear-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .sh-clear-btn:hover {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }

        .sh-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .sh-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px;
          background: var(--bg-surface);
          border-radius: 6px;
        }
        .sh-stat-value {
          font-size: 16px;
          font-weight: 700;
          font-family: var(--font-mono);
        }
        .sh-stat-label {
          font-size: 10px;
          color: var(--text-tertiary);
          text-align: center;
        }

        .sh-warnings {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sh-warning {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 6px;
          border: 0.5px solid;
        }
        .sh-warning i {
          font-size: 14px;
          flex-shrink: 0;
          margin-right: 6px;
        }
        .sh-warning-text {
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
        .sh-warning-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-left: 20px;
        }
        .sh-warning-tag {
          font-size: 10px;
          font-family: var(--font-mono);
          padding: 2px 6px;
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }

        .sh-warning-error {
          background: var(--error-bg);
          border-color: #FECACA;
          color: #B91C1C;
        }
        .sh-warning-warning {
          background: var(--warning-bg);
          border-color: #FDE68A;
          color: #D97706;
        }
        .sh-warning-info {
          background: var(--bg-surface);
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .sh-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 20px;
          text-align: center;
        }
        .sh-empty i {
          font-size: 28px;
          color: var(--text-disabled);
        }
        .sh-empty p {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }
        .sh-empty span {
          font-size: 11px;
          color: var(--text-tertiary);
          max-width: 200px;
          line-height: 1.4;
        }

        .sh-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .sh-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px 6px 10px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 6px;
        }
        .sh-tag-text {
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--brand-text);
        }
        .sh-tag-remove {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 50%;
          color: var(--brand-text);
          font-size: 10px;
          cursor: pointer;
          transition: background 0.12s;
        }
        .sh-tag-remove:hover {
          background: rgba(0,0,0,0.1);
        }

        .sh-preview {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px;
          background: var(--bg-surface);
          border-radius: 6px;
        }
        .sh-preview-label {
          font-size: 10px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .sh-preview-text {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          line-height: 1.5;
          word-break: break-all;
        }
        .sh-preview-more {
          color: var(--text-tertiary);
          font-style: italic;
        }

        @media (max-width: 600px) {
          .sh-stats {
            grid-template-columns: 1fr;
          }
          .sh-stat {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .sh-stat-value,
          .sh-stat-label {
            font-size: 13px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .sh-clear-btn:hover { color: #F87171; }
          .sh-warning-error { color: #F87171; border-color: #7F1D1D; }
          .sh-warning-warning { color: #FCD34D; border-color: #78350F; }
        }
      `}</style>
    </>
  );
}