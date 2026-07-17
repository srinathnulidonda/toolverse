// features/social/hashtag-generator/ExportPanel.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import type { ExportFormat, Platform } from "./types";
import { formatHashtagsForExport } from "./utils";
import { PLATFORM_LIMITS } from "./data";

type ExportPanelProps = {
  hashtags: string[];
  platform: Platform;
};

const FORMATS: { value: ExportFormat; label: string; desc: string; icon: string }[] = [
  { value: "space", label: "Space Separated", desc: "#tag1 #tag2 #tag3", icon: "ti-space" },
  { value: "comma", label: "Comma Separated", desc: "#tag1, #tag2, #tag3", icon: "ti-list" },
  { value: "newline", label: "One Per Line", desc: "#tag1\n#tag2\n#tag3", icon: "ti-list-numbers" },
  {
    value: "numbered",
    label: "Numbered List",
    desc: "1. #tag1\n2. #tag2",
    icon: "ti-list-numbers",
  },
];

const CAPTION_POSITIONS = [
  { value: "below", label: "Below caption" },
  { value: "above", label: "Above caption" },
  { value: "comment", label: "First comment" },
  { value: "inline", label: "Inline with text" },
];

export default function ExportPanel({ hashtags, platform }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("space");
  const [copied, setCopied] = useState(false);
  const [captionPosition, setCaptionPosition] = useState("below");
  const [customCaption, setCustomCaption] = useState("");

  const formattedOutput = formatHashtagsForExport(hashtags, format);
  const limit = PLATFORM_LIMITS[platform];
  const charCount = formattedOutput.length;

  const handleCopy = async () => {
    if (hashtags.length === 0) return;
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  };

  const handleCopyWithCaption = async () => {
    if (!customCaption.trim() && hashtags.length === 0) return;
    const tags = formatHashtagsForExport(hashtags, "space");
    let combined = "";
    if (captionPosition === "below") {
      combined = `${customCaption}\n\n${tags}`;
    } else if (captionPosition === "above") {
      combined = `${tags}\n\n${customCaption}`;
    } else {
      combined = customCaption;
    }
    try {
      await navigator.clipboard.writeText(combined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (hashtags.length === 0) return;
    const content = formattedOutput;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hashtags-${platform}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (hashtags.length === 0) {
    return (
      <>
        <div className="ep-empty">
          <i className="ti ti-file-export" aria-hidden="true" />
          <p>No hashtags to export</p>
          <span>Select hashtags first to export them</span>
        </div>
        <style>{`
          .ep-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 40px 20px;
            text-align: center;
          }
          .ep-empty i { font-size: 32px; color: var(--text-disabled); }
          .ep-empty p {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            margin: 0;
          }
          .ep-empty span {
            font-size: 12px;
            color: var(--text-tertiary);
            line-height: 1.4;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="ep-root">
        <div className="ep-header">
          <i className="ti ti-file-export" aria-hidden="true" />
          <span>Export Hashtags</span>
        </div>

        <div className="ep-formats">
          <span className="ep-section-label">Format</span>
          <div className="ep-format-grid">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                className={`ep-format-btn ${format === f.value ? "active" : ""}`}
                onClick={() => setFormat(f.value)}
              >
                <i className={`ti ${f.icon}`} aria-hidden="true" />
                <span className="ep-format-label">{f.label}</span>
                <code className="ep-format-preview">{f.desc}</code>
              </button>
            ))}
          </div>
        </div>

        <div className="ep-output">
          <div className="ep-output-header">
            <span className="ep-section-label">Output Preview</span>
            <div className="ep-output-meta">
              <span
                className="ep-char-count"
                style={{
                  color: charCount > limit.maxCharacters ? "#B91C1C" : "var(--text-tertiary)",
                }}
              >
                {charCount} chars
              </span>
              <span className="ep-tag-count">{hashtags.length} hashtags</span>
            </div>
          </div>
          <div className="ep-output-box">
            <pre className="ep-output-text">{formattedOutput}</pre>
          </div>
        </div>

        <div className="ep-caption-section">
          <span className="ep-section-label">Add Caption</span>
          <div className="ep-caption-field">
            <textarea
              className="ep-caption-input"
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              placeholder="Type your caption here..."
              rows={3}
            />
          </div>
          <div className="ep-position-tabs">
            {CAPTION_POSITIONS.map((pos) => (
              <button
                key={pos.value}
                className={`ep-position-btn ${captionPosition === pos.value ? "active" : ""}`}
                onClick={() => setCaptionPosition(pos.value)}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ep-actions">
          <button className="ep-action-btn ep-copy-tags" onClick={handleCopy}>
            <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
            {copied ? "Copied!" : "Copy Tags Only"}
          </button>
          <button
            className="ep-action-btn ep-copy-all"
            onClick={handleCopyWithCaption}
            disabled={!customCaption.trim()}
          >
            <i className="ti ti-clipboard-text" aria-hidden="true" />
            Copy with Caption
          </button>
          <button className="ep-action-btn ep-download" onClick={handleDownload}>
            <i className="ti ti-download" aria-hidden="true" />
            Download .txt
          </button>
        </div>
      </div>

      <style>{`
        .ep-root {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ep-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ep-header i { font-size: 16px; color: var(--text-secondary); }

        .ep-section-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 8px;
        }

        .ep-format-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .ep-format-btn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s;
        }
        .ep-format-btn:hover { background: var(--border-faint); }
        .ep-format-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }
        .ep-format-btn i {
          font-size: 15px;
          color: var(--text-tertiary);
        }
        .ep-format-btn.active i { color: var(--brand-text); }
        .ep-format-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text);
        }
        .ep-format-btn.active .ep-format-label { color: var(--brand-text); }
        .ep-format-preview {
          font-size: 9.5px;
          color: var(--text-tertiary);
          background: none;
          border: none;
          padding: 0;
          font-family: var(--font-mono);
        }
        .ep-format-btn.active .ep-format-preview { color: var(--brand-text); opacity: 0.7; }

        .ep-output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .ep-output-header .ep-section-label { margin-bottom: 0; }
        .ep-output-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .ep-char-count, .ep-tag-count {
          font-size: 10.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
        }

        .ep-output-box {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          max-height: 160px;
          overflow-y: auto;
        }
        .ep-output-text {
          margin: 0;
          padding: 12px 14px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.7;
        }

        .ep-caption-field {
          margin-bottom: 8px;
        }
        .ep-caption-input {
          width: 100%;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          resize: vertical;
          line-height: 1.6;
          transition: border-color 0.15s;
        }
        .ep-caption-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .ep-caption-input::placeholder { color: var(--text-disabled); }

        .ep-position-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .ep-position-btn {
          padding: 5px 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .ep-position-btn:hover { background: var(--border-faint); }
        .ep-position-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .ep-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .ep-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .ep-action-btn i { font-size: 14px; }
        .ep-action-btn:hover:not(:disabled) { background: var(--border); color: var(--text); }
        .ep-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ep-copy-tags {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
          grid-column: 1 / -1;
        }
        .ep-copy-tags:hover:not(:disabled) { background: var(--brand); color: white; }
        .ep-download { grid-column: 1 / -1; }

        @media (max-width: 600px) {
          .ep-format-grid { grid-template-columns: 1fr; }
          .ep-actions { grid-template-columns: 1fr; }
          .ep-copy-tags,
          .ep-download { grid-column: auto; }
        }
      `}</style>
    </>
  );
}
