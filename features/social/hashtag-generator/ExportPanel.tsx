// features/social/hashtag-generator/ExportPanel.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import type { ExportFormat, Platform } from "./ts/types";
import { formatHashtagsForExport } from "./ts/utils";
import { PLATFORM_LIMITS } from "./ts/data";
import styles from "./style/ExportPanel.module.css";

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
      <div className={styles.epEmpty}>
        <i className="ti ti-file-export" aria-hidden="true" />
        <p>No hashtags to export</p>
        <span>Select hashtags first to export them</span>
      </div>
    );
  }

  return (
    <div className={styles.epRoot}>
      <div className={styles.epHeader}>
        <i className="ti ti-file-export" aria-hidden="true" />
        <span>Export Hashtags</span>
      </div>

      <div className={styles.epFormats}>
        <span className={styles.epSectionLabel}>Format</span>
        <div className={styles.epFormatGrid}>
          {FORMATS.map((f) => (
            <button
              key={f.value}
              className={`${styles.epFormatBtn}${format === f.value ? ` ${styles.active}` : ""}`}
              onClick={() => setFormat(f.value)}
            >
              <i className={`ti ${f.icon}`} aria-hidden="true" />
              <span className={styles.epFormatLabel}>{f.label}</span>
              <code className={styles.epFormatPreview}>{f.desc}</code>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.epOutput}>
        <div className={styles.epOutputHeader}>
          <span className={styles.epSectionLabel}>Output Preview</span>
          <div className={styles.epOutputMeta}>
            <span
              className={styles.epCharCount}
              style={{
                color: charCount > limit.maxCharacters ? "#B91C1C" : "var(--text-tertiary)",
              }}
            >
              {charCount} chars
            </span>
            <span className={styles.epTagCount}>{hashtags.length} hashtags</span>
          </div>
        </div>
        <div className={styles.epOutputBox}>
          <pre className={styles.epOutputText}>{formattedOutput}</pre>
        </div>
      </div>

      <div className={styles.epCaptionSection}>
        <span className={styles.epSectionLabel}>Add Caption</span>
        <div className={styles.epCaptionField}>
          <textarea
            className={styles.epCaptionInput}
            value={customCaption}
            onChange={(e) => setCustomCaption(e.target.value)}
            placeholder="Type your caption here..."
            rows={3}
          />
        </div>
        <div className={styles.epPositionTabs}>
          {CAPTION_POSITIONS.map((pos) => (
            <button
              key={pos.value}
              className={`${styles.epPositionBtn}${captionPosition === pos.value ? ` ${styles.active}` : ""}`}
              onClick={() => setCaptionPosition(pos.value)}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.epActions}>
        <button className={`${styles.epActionBtn} ${styles.epCopyTags}`} onClick={handleCopy}>
          <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copied ? "Copied!" : "Copy Tags Only"}
        </button>
        <button
          className={`${styles.epActionBtn} ${styles.epCopyAll}`}
          onClick={handleCopyWithCaption}
          disabled={!customCaption.trim()}
        >
          <i className="ti ti-clipboard-text" aria-hidden="true" />
          Copy with Caption
        </button>
        <button className={`${styles.epActionBtn} ${styles.epDownload}`} onClick={handleDownload}>
          <i className="ti ti-download" aria-hidden="true" />
          Download .txt
        </button>
      </div>
    </div>
  );
}