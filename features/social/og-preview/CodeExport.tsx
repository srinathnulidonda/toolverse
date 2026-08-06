// features/social/og-preview/CodeExport.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import type { MetaData } from "./ts/types";
import { generateMetaTags } from "./ts/utils";
import styles from "./style/CodeExport.module.css";

type CodeExportProps = {
  meta: MetaData;
};

export default function CodeExport({ meta }: CodeExportProps) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<"html" | "jsx">("html");

  const code = generateMetaTags(meta);

  const jsxCode = code
    .replace(/<!--.*?-->/g, (match) => `{/* ${match.slice(4, -3).trim()} */}`)
    .replace(/(<meta[^>]*>)/g, (match) => match.replace(/"/g, '"'));

  const displayCode = format === "html" ? code : jsxCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([displayCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meta-tags.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = displayCode.split("\n").length;

  return (
    <>
      <div className={styles.ceRoot}>
        {/* Header */}
        <div className={styles.ceHeader}>
          <div className={styles.ceHeaderLeft}>
            <i className="ti ti-code" aria-hidden="true" />
            <span className={styles.ceTitle}>Generated Meta Tags</span>
            <span className={styles.ceLineCount}>{lineCount} lines</span>
          </div>
          <div className={styles.ceHeaderActions}>
            <div className={styles.ceFormatToggle}>
              <button
                className={`${styles.ceFormatBtn} ${format === "html" ? styles.active : ""}`}
                onClick={() => setFormat("html")}
              >
                HTML
              </button>
              <button
                className={`${styles.ceFormatBtn} ${format === "jsx" ? styles.active : ""}`}
                onClick={() => setFormat("jsx")}
              >
                JSX
              </button>
            </div>
            <button className={styles.ceActionBtn} onClick={handleDownload} title="Download">
              <i className="ti ti-download" aria-hidden="true" />
            </button>
            <button className={styles.ceActionBtn} onClick={handleCopy} title="Copy to clipboard">
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Code block */}
        <div className={styles.ceCodeWrapper}>
          <pre className={styles.ceCode}>
            <code>{displayCode || "// Fill in meta data to generate tags"}</code>
          </pre>
        </div>

        {/* Footer hint */}
        <div className={styles.ceFooter}>
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            Paste these tags inside the <code><head /></code> section of your HTML
          </span>
        </div>

        {/* Copied notification */}
        {copied && (
          <div className={styles.ceCopiedToast}>
            <i className="ti ti-check" aria-hidden="true" />
            Copied to clipboard!
          </div>
        )}
      </div>
    </>
  );
}