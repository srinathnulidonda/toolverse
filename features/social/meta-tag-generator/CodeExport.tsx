// features/social/meta-tag-generator/CodeExport.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import type { MetaTags, ExportFormat } from "./ts/types";
import { generateMetaTagsCode } from "./ts/utils";
import styles from "./style/CodeExport.module.css";

type CodeExportProps = {
  tags: MetaTags;
};

const FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: "html", label: "HTML", icon: "ti-brand-html5" },
  { value: "jsx", label: "JSX", icon: "ti-brand-react" },
  { value: "nextjs", label: "Next.js", icon: "ti-brand-nextjs" },
  { value: "gatsby", label: "Gatsby", icon: "ti-flame" },
  { value: "vue", label: "Vue", icon: "ti-brand-vue" },
  { value: "json", label: "JSON", icon: "ti-braces" },
];

export default function CodeExport({ tags }: CodeExportProps) {
  const [format, setFormat] = useState<ExportFormat>("html");
  const [copied, setCopied] = useState(false);

  const code = generateMetaTagsCode(tags, format);
  const lineCount = code.split("\n").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const extensions: Record<ExportFormat, string> = {
      html: "html",
      jsx: "jsx",
      nextjs: "jsx",
      gatsby: "jsx",
      vue: "js",
      json: "json",
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meta-tags.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.ceRoot}>
      <div className={styles.ceFormatTabs}>
        {FORMATS.map((f) => (
          <button
            key={f.value}
            className={`${styles.ceFormatTab} ${format === f.value ? styles.active : ""}`}
            onClick={() => setFormat(f.value)}
          >
            <i className={`ti ${f.icon}`} aria-hidden="true" />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.ceToolbar}>
        <span className={styles.ceLineCount}>{lineCount} lines</span>
        <div className={styles.ceActions}>
          <button className={styles.ceActionBtn} onClick={handleDownload}>
            <i className="ti ti-download" aria-hidden="true" />
            Download
          </button>
          <button className={`${styles.ceActionBtn} ${styles.ceCopyBtn}`} onClick={handleCopy}>
            <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      <div className={styles.ceCodeContainer}>
        <pre className={styles.ceCode}>
          <code>{code || "// Fill in your meta tags to generate code"}</code>
        </pre>
      </div>

      <div className={styles.ceInfoBox}>
        <i className="ti ti-info-circle" aria-hidden="true" />
        <div className={styles.ceInfoText}>
          {format === "html" && "Paste this code inside the <head> tag of your HTML document."}
          {format === "jsx" && "Use this JSX inside your React component's return statement."}
          {format === "nextjs" &&
            "Import and use the Head component from 'next/head' in your Next.js pages."}
          {format === "gatsby" &&
            "Install react-helmet and use it to manage document head in Gatsby."}
          {format === "vue" &&
            "Add this to your Vue component's head() method (requires @nuxtjs/head or vue-meta)."}
          {format === "json" &&
            "Use this structured data in your application's meta tag management system."}
        </div>
      </div>
    </div>
  );
}
