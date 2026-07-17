// features/social/meta-tag-generator/CodeExport.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import type { MetaTags, ExportFormat } from "./types";
import { generateMetaTagsCode } from "./utils";

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
    <>
      <div className="ce-root">
        <div className="ce-format-tabs">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              className={`ce-format-tab ${format === f.value ? "active" : ""}`}
              onClick={() => setFormat(f.value)}
            >
              <i className={`ti ${f.icon}`} aria-hidden="true" />
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <div className="ce-toolbar">
          <span className="ce-line-count">{lineCount} lines</span>
          <div className="ce-actions">
            <button className="ce-action-btn" onClick={handleDownload}>
              <i className="ti ti-download" aria-hidden="true" />
              Download
            </button>
            <button className="ce-action-btn ce-copy-btn" onClick={handleCopy}>
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
        </div>

        <div className="ce-code-container">
          <pre className="ce-code">
            <code>{code || "// Fill in your meta tags to generate code"}</code>
          </pre>
        </div>

        <div className="ce-info-box">
          <i className="ti ti-info-circle" aria-hidden="true" />
          <div className="ce-info-text">
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

      <style>{`
        .ce-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ce-format-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .ce-format-tabs::-webkit-scrollbar { display: none; }

        .ce-format-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .ce-format-tab i { font-size: 15px; }
        .ce-format-tab:hover { background: var(--border-faint); color: var(--text-secondary); }
        .ce-format-tab.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .ce-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .ce-line-count {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          padding: 4px 8px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 5px;
        }
        .ce-actions {
          display: flex;
          gap: 8px;
        }
        .ce-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ce-action-btn i { font-size: 14px; }
        .ce-action-btn:hover { background: var(--border); color: var(--text); }
        .ce-copy-btn {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .ce-copy-btn:hover { background: var(--brand); color: white; }

        .ce-code-container {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          max-height: 500px;
          overflow-y: auto;
        }
        .ce-code {
          margin: 0;
          padding: 18px 20px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          color: var(--text-secondary);
          background: transparent;
          border: none;
        }
        .ce-code code {
          background: none;
          border: none;
          padding: 0;
          font-size: inherit;
          color: inherit;
        }

        .ce-info-box {
          display: flex;
          gap: 10px;
          padding: 12px 14px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 8px;
        }
        .ce-info-box i {
          font-size: 16px;
          color: var(--brand-text);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .ce-info-text {
          font-size: 12px;
          color: var(--brand-text);
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .ce-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .ce-actions {
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}
