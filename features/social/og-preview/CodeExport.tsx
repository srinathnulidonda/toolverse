// features/social/og-preview/CodeExport.tsx
"use client";

import { useState } from "react";
import type { MetaData } from "./types";
import { generateMetaTags } from "./utils";

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
      console.error("Failed to copy:", err);
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
      <div className="ce-root">
        {/* Header */}
        <div className="ce-header">
          <div className="ce-header-left">
            <i className="ti ti-code" aria-hidden="true" />
            <span className="ce-title">Generated Meta Tags</span>
            <span className="ce-line-count">{lineCount} lines</span>
          </div>
          <div className="ce-header-actions">
            <div className="ce-format-toggle">
              <button
                className={`ce-format-btn ${format === "html" ? "active" : ""}`}
                onClick={() => setFormat("html")}
              >
                HTML
              </button>
              <button
                className={`ce-format-btn ${format === "jsx" ? "active" : ""}`}
                onClick={() => setFormat("jsx")}
              >
                JSX
              </button>
            </div>
            <button className="ce-action-btn" onClick={handleDownload} title="Download">
              <i className="ti ti-download" aria-hidden="true" />
            </button>
            <button className="ce-action-btn" onClick={handleCopy} title="Copy to clipboard">
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Code block */}
        <div className="ce-code-wrapper">
          <pre className="ce-code">
            <code>{displayCode || "// Fill in meta data to generate tags"}</code>
          </pre>
        </div>

        {/* Footer hint */}
        <div className="ce-footer">
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            Paste these tags inside the <code>&lt;head&gt;</code> section of your HTML
          </span>
        </div>

        {/* Copied notification */}
        {copied && (
          <div className="ce-copied-toast">
            <i className="ti ti-check" aria-hidden="true" />
            Copied to clipboard!
          </div>
        )}
      </div>

      <style>{`
        .ce-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .ce-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ce-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .ce-header-left i {
          font-size: 16px;
          color: var(--text-secondary);
        }
        .ce-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ce-line-count {
          padding: 2px 7px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 4px;
          font-size: 10.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
        }

        .ce-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ce-format-toggle {
          display: flex;
          gap: 4px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          padding: 3px;
        }
        .ce-format-btn {
          padding: 5px 12px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-mono);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .ce-format-btn:hover { color: var(--text-secondary); background: var(--bg-surface); }
        .ce-format-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .ce-action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-tertiary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.12s;
          font-size: 15px;
        }
        .ce-action-btn:hover {
          background: var(--border);
          color: var(--text-secondary);
        }

        .ce-code-wrapper {
          flex: 1;
          overflow: auto;
          background: var(--bg-surface);
        }
        .ce-code {
          margin: 0;
          padding: 16px 18px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          min-height: 100%;
        }
        .ce-code code {
          background: none;
          border: none;
          padding: 0;
          font-size: inherit;
          color: inherit;
        }

        .ce-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--brand-light);
          border-top: 0.5px solid var(--brand-border);
          font-size: 11.5px;
          color: var(--brand-text);
          flex-shrink: 0;
        }
        .ce-footer i {
          font-size: 14px;
          flex-shrink: 0;
        }
        .ce-footer code {
          background: var(--bg-card);
          border: 0.5px solid var(--brand-border);
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 10.5px;
        }

        .ce-copied-toast {
          position: absolute;
          bottom: 60px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--brand);
          color: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          animation: ce-toast-in 0.2s ease;
          z-index: 10;
        }
        .ce-copied-toast i { font-size: 16px; }

        @keyframes ce-toast-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .ce-header {
            flex-direction: column;
            align-items: stretch;
          }
          .ce-header-actions {
            justify-content: space-between;
          }
          .ce-line-count { margin-left: auto; }
        }
      `}</style>
    </>
  );
}