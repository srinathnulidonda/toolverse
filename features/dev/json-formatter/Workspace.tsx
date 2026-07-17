// features/dev/json-formatter/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { smartParse } from "./smartParse";
import JsonTree from "./JsonTree";
import JsonDiff from "./JsonDiff";
import JsonStats from "./JsonStats";

type Mode = "format" | "minify";
type Indent = 2 | 4 | "tab";
type ViewTab = "code" | "tree" | "diff" | "stats";
type ConvertTarget = "csv" | "yaml" | "toml";

const SAMPLE_JSON = `{
  "name": "Toolverse",
  "tagline": "One tab. Every file task.",
  "version": "2.0",
  "private": true,
  "tools": 38,
  "categories": ["pdf", "image", "dev", "finance", "resume", "social"],
  "pricing": null,
  "author": {
    "name": "Toolverse Team",
    "email": "hello@toolverse.app"
  }
}`;

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightJson(json: string) {
  const escaped = escapeHtml(json);
  const elements: Array<React.ReactNode> = [];
  let lastIndex = 0;
  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let match;
  while ((match = regex.exec(escaped)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      elements.push(escaped.substring(lastIndex, match.index));
    }

    // Determine the class for the matched token
    let cls = "jf-number";
    if (/^"/.test(match[0])) {
      cls = /:\s*$/.test(match[0]) ? "jf-key" : "jf-string";
    } else if (/true|false/.test(match[0])) {
      cls = "jf-boolean";
    } else if (match[0] === "null") {
      cls = "jf-null";
    }

    // Add the matched token as a span element
    elements.push(
      <span key={match.index} className={cls}>
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < escaped.length) {
    elements.push(escaped.substring(lastIndex));
  }

  return elements;
}

function fmtSize(str: string) {
  const bytes = new Blob([str]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function jsonToCsv(value: unknown): string {
  if (!Array.isArray(value)) value = [value];
  const arr = value as Record<string, unknown>[];
  if (arr.length === 0) return "";
  const keys = Object.keys(arr[0]);
  const header = keys.map((k) => `"${k}"`).join(",");
  const rows = arr.map((row) =>
    keys
      .map((k) => {
        const v = row[k];
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
        if (typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n")))
          return `"${v.replace(/"/g, '""')}"`;
        return String(v);
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

function jsonToYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/[:\n#&*?|<>{}\[\],]/.test(value) || value.includes("  "))
      return `"${value.replace(/"/g, '\\"')}"`;
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value.map((v) => `\n${pad}- ${jsonToYaml(v, indent + 1)}`).join("");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        const valStr = jsonToYaml(v, indent + 1);
        const isComplex = typeof v === "object" && v !== null;
        return `\n${pad}${k}:${isComplex ? valStr : " " + valStr}`;
      })
      .join("");
  }
  return String(value);
}

function jsonToToml(value: unknown): string {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return "# TOML requires a top-level object\n";
  const lines: string[] = [];
  const obj = value as Record<string, unknown>;
  const simple = Object.entries(obj).filter(([, v]) => typeof v !== "object" || v === null);
  const complex = Object.entries(obj).filter(([, v]) => typeof v === "object" && v !== null);
  for (const [k, v] of simple) {
    if (v === null) lines.push(`# ${k} = null`);
    else if (typeof v === "string") lines.push(`${k} = "${v}"`);
    else lines.push(`${k} = ${v}`);
  }
  for (const [k, v] of complex) {
    if (Array.isArray(v)) {
      const isSimple = (v as unknown[]).every((i) => typeof i !== "object" || i === null);
      if (isSimple) {
        lines.push(
          `${k} = [${(v as unknown[]).map((i) => (typeof i === "string" ? `"${i}"` : String(i))).join(", ")}]`
        );
      } else {
        for (const item of v as Record<string, unknown>[]) {
          lines.push(`\n[[${k}]]`);
          for (const [ik, iv] of Object.entries(item)) {
            if (typeof iv === "string") lines.push(`${ik} = "${iv}"`);
            else lines.push(`${ik} = ${iv}`);
          }
        }
      }
    } else {
      lines.push(`\n[${k}]`);
      for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) {
        if (typeof iv === "string") lines.push(`${ik} = "${iv}"`);
        else if (iv === null) lines.push(`# ${ik} = null`);
        else lines.push(`${ik} = ${iv}`);
      }
    }
  }
  return lines.join("\n");
}

function sortJsonKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(value as Record<string, unknown>).sort()) {
    sorted[k] = sortJsonKeys((value as Record<string, unknown>)[k]);
  }
  return sorted;
}

const VIEW_TABS: Array<{ id: ViewTab; label: string; icon: string }> = [
  { id: "code", label: "Code", icon: "ti-code" },
  { id: "tree", label: "Tree", icon: "ti-hierarchy-2" },
  { id: "diff", label: "Diff", icon: "ti-git-diff" },
  { id: "stats", label: "Stats", icon: "ti-chart-bar" },
];

export default function JsonFormatterWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<Indent>(2);
  const [viewTab, setViewTab] = useState<ViewTab>("code");
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pathHint, setPathHint] = useState("");
  const [diffRight, setDiffRight] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseResult = useMemo(() => smartParse(input), [input]);

  const output = useMemo(() => {
    if (!input.trim() || !parseResult.ok) return "";
    let value = parseResult.value;
    if (sortKeys) value = sortJsonKeys(value);
    if (mode === "minify") return JSON.stringify(value);
    const space = indent === "tab" ? "\t" : indent;
    return JSON.stringify(value, null, space);
  }, [input, parseResult, mode, indent, sortKeys]);

  const highlighted = useMemo(() => (output ? highlightJson(output) : ""), [output]);

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);
  const savings =
    inputBytes > 0 && outputBytes < inputBytes
      ? Math.round((1 - outputBytes / inputBytes) * 100)
      : 0;

  const validJson = parseResult.ok && !!input.trim();
  const hasError = !parseResult.ok && !!input.trim();

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* */
    }
  }, [output]);

  const handleDownload = useCallback(
    (ext = "json", content = output) => {
      if (!content) return;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tool.slug}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [output, tool.slug]
  );

  const handleConvert = useCallback(
    (target: ConvertTarget) => {
      if (!parseResult.ok) return;
      let converted = "";
      if (target === "csv") converted = jsonToCsv(parseResult.value);
      else if (target === "yaml") converted = jsonToYaml(parseResult.value).trim();
      else if (target === "toml") converted = jsonToToml(parseResult.value);
      handleDownload(target, converted);
      setShowMoreMenu(false);
    },
    [parseResult, handleDownload]
  );

  const handleClear = useCallback(() => {
    setInput("");
    setDiffRight("");
    setPathHint("");
    textareaRef.current?.focus();
  }, []);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setMobilePanel("input");
  }, []);

  return (
    <>
      <div className="jf-root" role="main" aria-label="JSON Formatter">
        {/*  Top Chrome  */}
        <div className="jf-chrome">
          {/* Left: Mode + Indent controls */}
          <div className="jf-chrome-left">
            <div className="jf-pill-group" role="group" aria-label="Output mode">
              <button
                type="button"
                className={`jf-pill${mode === "format" ? " active" : ""}`}
                onClick={() => setMode("format")}
                aria-pressed={mode === "format"}
              >
                Format
              </button>
              <button
                type="button"
                className={`jf-pill${mode === "minify" ? " active" : ""}`}
                onClick={() => setMode("minify")}
                aria-pressed={mode === "minify"}
              >
                Minify
              </button>
            </div>

            {mode === "format" && (
              <div className="jf-pill-group jf-indent-group" role="group" aria-label="Indent size">
                {([2, 4, "tab"] as Indent[]).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    className={`jf-pill${indent === v ? " active" : ""}`}
                    onClick={() => setIndent(v)}
                    aria-pressed={indent === v}
                    aria-label={v === "tab" ? "Tab indent" : `${v} space indent`}
                  >
                    {v === "tab" ? "⇥ Tab" : `${v}sp`}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className={`jf-icon-btn${sortKeys ? " active" : ""}`}
              onClick={() => setSortKeys((s) => !s)}
              title="Sort keys A–Z"
              aria-pressed={sortKeys}
            >
              <i className="ti ti-sort-ascending-letters" aria-hidden="true" />
              <span className="jf-icon-btn-label">Sort</span>
            </button>

            <button
              type="button"
              className="jf-icon-btn"
              onClick={loadSample}
              title="Load example JSON"
            >
              <i className="ti ti-wand" aria-hidden="true" />
              <span className="jf-icon-btn-label">Example</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="jf-chrome-right">
            {validJson && (
              <div className="jf-export-row">
                <span className="jf-export-label">Export</span>
                {(["csv", "yaml", "toml"] as ConvertTarget[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="jf-chip"
                    onClick={() => handleConvert(t)}
                    title={`Download as ${t.toUpperCase()}`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className={`jf-action-btn${copied ? " success" : ""}`}
              onClick={handleCopy}
              disabled={!output}
              aria-label={copied ? "Copied!" : "Copy output"}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              type="button"
              className="jf-action-btn"
              onClick={() => handleDownload()}
              disabled={!output}
              aria-label="Download JSON"
            >
              <i className="ti ti-download" aria-hidden="true" />
              <span className="jf-action-label">Save</span>
            </button>

            <button
              type="button"
              className="jf-icon-btn jf-clear-btn"
              onClick={handleClear}
              disabled={!input && !diffRight}
              title="Clear all"
            >
              <i className="ti ti-trash" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/*  Mobile panel switcher  */}
        <div className="jf-mobile-tabs" role="tablist" aria-label="Panel selector">
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "input"}
            className={`jf-mobile-tab${mobilePanel === "input" ? " active" : ""}`}
            onClick={() => setMobilePanel("input")}
          >
            Input
            {input.trim() && (
              <span className={`jf-mobile-badge ${hasError ? "error" : "valid"}`}>
                {hasError ? (
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                ) : (
                  <i className="ti ti-check" aria-hidden="true" />
                )}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "output"}
            className={`jf-mobile-tab${mobilePanel === "output" ? " active" : ""}`}
            onClick={() => setMobilePanel("output")}
          >
            Output
            {validJson && mode === "minify" && savings > 0 && (
              <span className="jf-mobile-savings">{savings}% smaller</span>
            )}
          </button>
        </div>

        {/*  Smart parse hint  */}
        {validJson && parseResult.hint && (
          <div className="jf-hint" role="status">
            <i className="ti ti-sparkles" aria-hidden="true" />
            {parseResult.hint}
          </div>
        )}
        {pathHint && (
          <div className="jf-hint jf-hint-path" role="status">
            <i className="ti ti-copy" aria-hidden="true" />
            Path copied: <code>{pathHint}</code>
          </div>
        )}

        {/*  Main panels  */}
        <div className="jf-body">
          {/* Input Panel */}
          <div
            className={`jf-panel jf-panel-input${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="jf-panel-header">
              <div className="jf-panel-label">
                <i className="ti ti-pencil" aria-hidden="true" />
                Input
              </div>
              <div className="jf-panel-meta">
                {input.length > 0 && <span className="jf-meta-text">{fmtSize(input)}</span>}
                {input.trim() &&
                  (hasError ? (
                    <span className="jf-status-badge error">
                      <i className="ti ti-alert-circle" aria-hidden="true" />
                      Invalid
                    </span>
                  ) : (
                    <span className="jf-status-badge valid">
                      <i className="ti ti-check" aria-hidden="true" />
                      Valid
                    </span>
                  ))}
              </div>
            </div>
            <div className="jf-textarea-wrap">
              <textarea
                ref={textareaRef}
                className="jf-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"Paste JSON, a JS object, key=value pairs, YAML, or CSV…"}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="JSON input"
                aria-invalid={hasError}
                aria-describedby={hasError ? "jf-error-msg" : undefined}
              />
              {!input && (
                <div className="jf-placeholder-hints" aria-hidden="true">
                  <span>
                    <span className="jf-hint-kw">{"{"}</span>name: 'Alice'
                    <span className="jf-hint-kw">{"}"}</span> ← unquoted keys
                  </span>
                  <span>name = Alice ← key=value pairs</span>
                  <span>name: Alice ← YAML-like</span>
                </div>
              )}
            </div>
            {hasError && (
              <div className="jf-error-bar" id="jf-error-msg" role="alert">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <div>
                  <strong>Parse error</strong>
                  <span>{parseResult.error}</span>
                  <span className="jf-error-tip">
                    Auto-fixes: unquoted keys, trailing commas, single quotes, key=value pairs.
                    Check for mismatched brackets.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Divider (desktop only) */}
          <div className="jf-divider" aria-hidden="true" />

          {/* Output Panel */}
          <div
            className={`jf-panel jf-panel-output${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="jf-panel-header">
              <nav className="jf-tabs" role="tablist" aria-label="Output view">
                {VIEW_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`jf-tab-${tab.id}`}
                    aria-selected={viewTab === tab.id}
                    aria-controls={`jf-tabpanel-${tab.id}`}
                    className={`jf-tab${viewTab === tab.id ? " active" : ""}`}
                    onClick={() => setViewTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} aria-hidden="true" />
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="jf-panel-meta">
                {output && <span className="jf-meta-text">{fmtSize(output)}</span>}
                {validJson && mode === "minify" && savings > 0 && (
                  <span className="jf-savings-pill">{savings}% smaller</span>
                )}
              </div>
            </div>

            {/* Tab panels */}
            <div
              className="jf-tab-content"
              role="tabpanel"
              id={`jf-tabpanel-${viewTab}`}
              aria-labelledby={`jf-tab-${viewTab}`}
            >
              {/* Code */}
              {viewTab === "code" && (
                <>
                  {!input.trim() && (
                    <div className="jf-empty">
                      <i className="ti ti-code" aria-hidden="true" />
                      <p>Formatted output appears here</p>
                    </div>
                  )}
                  {validJson && (
                    <pre className="jf-output" aria-label="Formatted JSON output">
                      {highlighted}
                    </pre>
                  )}
                </>
              )}

              {/* Tree */}
              {viewTab === "tree" && (
                <>
                  {!validJson && (
                    <div className="jf-empty">
                      <i className="ti ti-hierarchy-2" aria-hidden="true" />
                      <p>Valid JSON required for tree view</p>
                    </div>
                  )}
                  {validJson && (
                    <JsonTree value={parseResult.value} onPathClick={(p) => setPathHint(p)} />
                  )}
                </>
              )}

              {/* Diff */}
              {viewTab === "diff" && (
                <div className="jf-diff-wrapper">
                  <div className="jf-diff-inputs">
                    <div className="jf-diff-slot">
                      <label className="jf-diff-label" htmlFor="jf-diff-left">
                        <i className="ti ti-arrow-left" aria-hidden="true" />
                        Original
                      </label>
                      <textarea
                        id="jf-diff-left"
                        className="jf-textarea jf-diff-ta"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste first JSON…"
                        spellCheck={false}
                        aria-label="Left side for diff comparison"
                      />
                    </div>
                    <div className="jf-diff-slot">
                      <label className="jf-diff-label" htmlFor="jf-diff-right">
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                        Modified
                      </label>
                      <textarea
                        id="jf-diff-right"
                        className="jf-textarea jf-diff-ta"
                        value={diffRight}
                        onChange={(e) => setDiffRight(e.target.value)}
                        placeholder="Paste second JSON to compare…"
                        spellCheck={false}
                        aria-label="Right side for diff comparison"
                      />
                    </div>
                  </div>
                  <div className="jf-diff-result">
                    <JsonDiff leftText={output || input} rightText={diffRight} />
                  </div>
                </div>
              )}

              {/* Stats */}
              {viewTab === "stats" && (
                <>
                  {!validJson && (
                    <div className="jf-empty">
                      <i className="ti ti-chart-bar" aria-hidden="true" />
                      <p>Valid JSON required for stats</p>
                    </div>
                  )}
                  {validJson && <JsonStats value={parseResult.value} rawText={output} />}
                </>
              )}
            </div>
          </div>
        </div>

        {/*  Mobile bottom action bar  */}
        <div className="jf-mobile-actions" role="toolbar" aria-label="Output actions">
          <button
            type="button"
            className={`jf-mob-action${copied ? " success" : ""}`}
            onClick={handleCopy}
            disabled={!output}
          >
            <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="jf-mob-action"
            onClick={() => handleDownload()}
            disabled={!output}
          >
            <i className="ti ti-download" aria-hidden="true" />
            Save
          </button>
          {validJson && (
            <div className="jf-mob-more" ref={moreRef}>
              <button
                type="button"
                className="jf-mob-action"
                onClick={() => setShowMoreMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showMoreMenu}
              >
                <i className="ti ti-dots" aria-hidden="true" />
                More
              </button>
              {showMoreMenu && (
                <div className="jf-mob-menu" role="menu">
                  <div className="jf-mob-menu-label">Export as</div>
                  {(["csv", "yaml", "toml"] as ConvertTarget[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="menuitem"
                      className="jf-mob-menu-item"
                      onClick={() => handleConvert(t)}
                    >
                      <i className="ti ti-file-export" aria-hidden="true" />
                      {t.toUpperCase()}
                    </button>
                  ))}
                  <div className="jf-mob-menu-divider" />
                  <button
                    type="button"
                    role="menuitem"
                    className={`jf-mob-menu-item${sortKeys ? " checked" : ""}`}
                    onClick={() => {
                      setSortKeys((s) => !s);
                      setShowMoreMenu(false);
                    }}
                  >
                    <i className="ti ti-sort-ascending-letters" aria-hidden="true" />
                    Sort keys {sortKeys ? "✓" : ""}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="jf-mob-menu-item danger"
                    onClick={() => {
                      handleClear();
                      setShowMoreMenu(false);
                    }}
                    disabled={!input && !diffRight}
                  >
                    <i className="ti ti-trash" aria-hidden="true" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /*  Root  */
        .jf-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 580px;
        }

        /*  Top Chrome  */
        .jf-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 12px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }
        .jf-chrome-left,
        .jf-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        /* Pill group (Mode / Indent) */
        .jf-pill-group {
          display: flex;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .jf-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 10px;
          border: none;
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
          white-space: nowrap;
        }
        .jf-pill:last-child { border-right: none; }
        .jf-pill:hover { background: var(--border); color: var(--text); }
        .jf-pill.active {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        /* Icon buttons */
        .jf-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-family: var(--font-sans);
          font-weight: 500;
          cursor: pointer;
          transition: background 0.1s, color 0.1s, border-color 0.1s;
        }
        .jf-icon-btn i { font-size: 13px; }
        .jf-icon-btn:hover { background: var(--bg-surface); color: var(--text); }
        .jf-icon-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }
        .jf-icon-btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .jf-icon-btn-label { font-size: 11.5px; }

        .jf-clear-btn { color: var(--text-tertiary); }
        .jf-clear-btn:hover { color: #B91C1C; border-color: currentColor; background: var(--error-bg); }
        @media (prefers-color-scheme: dark) {
          .jf-clear-btn:hover { color: #F87171; }
        }

        /* Export chips */
        .jf-export-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .jf-export-label {
          font-size: 10.5px;
          color: var(--text-disabled);
          font-family: var(--font-sans);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-right: 2px;
        }
        .jf-chip {
          height: 24px;
          padding: 0 8px;
          border-radius: 99px;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 600;
          font-family: var(--font-mono);
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.1s;
        }
        .jf-chip:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /* Action buttons */
        .jf-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.1s;
          white-space: nowrap;
        }
        .jf-action-btn i { font-size: 12px; }
        .jf-action-btn:hover { background: var(--border); color: var(--text); }
        .jf-action-btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .jf-action-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }
        .jf-action-label { display: inline; }

        /*  Mobile panel switcher  */
        .jf-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }
        .jf-mobile-tab {
          flex: 1;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          position: relative;
          transition: color 0.1s;
        }
        .jf-mobile-tab.active {
          color: var(--text);
        }
        .jf-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }
        .jf-mobile-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 99px;
          font-size: 9px;
        }
        .jf-mobile-badge.valid { background: var(--brand-light); color: var(--brand-text); }
        .jf-mobile-badge.error { background: var(--error-bg); color: #B91C1C; }
        @media (prefers-color-scheme: dark) {
          .jf-mobile-badge.error { color: #F87171; }
        }
        .jf-mobile-savings {
          font-size: 10px;
          font-weight: 600;
          background: var(--brand-light);
          color: var(--brand-text);
          padding: 1px 6px;
          border-radius: 99px;
        }

        /*  Hint bars  */
        .jf-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 11.5px;
          color: var(--brand-text);
          background: var(--brand-light);
          border-bottom: 0.5px solid var(--brand-border);
          font-family: var(--font-sans);
        }
        .jf-hint i { font-size: 12px; flex-shrink: 0; }
        .jf-hint-path {
          background: var(--bg-surface);
          color: var(--text-secondary);
          border-color: var(--border-faint);
        }
        .jf-hint-path code {
          font-size: 11px;
          padding: 1px 5px;
          background: var(--border);
          border: none;
          border-radius: 3px;
          color: var(--text);
          font-family: var(--font-mono);
        }

        /*  Body (panels)  */
        .jf-body {
          display: grid;
          grid-template-columns: 1fr 0.5px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .jf-divider {
          background: var(--border);
          width: 0.5px;
        }
        .jf-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Panel headers  */
        .jf-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 36px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-shrink: 0;
          gap: 8px;
        }
        .jf-panel-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-family: var(--font-sans);
        }
        .jf-panel-label i { font-size: 11px; }
        .jf-panel-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .jf-meta-text {
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
        }
        .jf-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 99px;
          font-family: var(--font-sans);
        }
        .jf-status-badge i { font-size: 9px; }
        .jf-status-badge.valid { background: var(--brand-light); color: var(--brand-text); }
        .jf-status-badge.error { background: var(--error-bg); color: #B91C1C; }
        @media (prefers-color-scheme: dark) {
          .jf-status-badge.error { color: #F87171; }
        }

        /* View tabs */
        .jf-tabs {
          display: flex;
          gap: 0;
          height: 100%;
        }
        .jf-tab {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 100%;
          padding: 0 11px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          position: relative;
          transition: color 0.1s;
          white-space: nowrap;
        }
        .jf-tab i { font-size: 11px; }
        .jf-tab:hover { color: var(--text); }
        .jf-tab.active { color: var(--text); }
        .jf-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 8px;
          right: 8px;
          height: 1.5px;
          background: var(--brand);
          border-radius: 1.5px 1.5px 0 0;
        }
        .jf-savings-pill {
          font-size: 10px;
          font-weight: 600;
          background: var(--brand-light);
          color: var(--brand-text);
          padding: 2px 7px;
          border-radius: 99px;
          font-family: var(--font-sans);
        }

        /*  Tab content area  */
        .jf-tab-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Textarea  */
        .jf-textarea-wrap {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .jf-textarea {
          flex: 1;
          margin: 0;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: none;
          overflow: auto;
          tab-size: 2;
          white-space: pre;
        }
        .jf-textarea::placeholder {
          color: transparent;
        }
        .jf-placeholder-hints {
          position: absolute;
          top: 14px;
          left: 16px;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.7;
          color: var(--text-disabled);
        }
        .jf-placeholder-hints::before {
          content: "Paste JSON, a JS object, key=value pairs, YAML, or CSV…";
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-size: 12.5px;
          margin-bottom: 10px;
        }
        .jf-hint-kw { color: var(--text-secondary); }

        /*  Output pre  */
        .jf-output {
          flex: 1;
          margin: 0;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          color: var(--text);
          background: transparent;
          border: none;
          overflow: auto;
          white-space: pre;
          tab-size: 2;
        }
        .jf-key { color: var(--brand); }
        .jf-string { color: #0A7D65; }
        .jf-number { color: #1D5FBF; }
        .jf-boolean { color: #A0501A; }
        .jf-null { color: var(--text-tertiary); font-style: italic; }
        @media (prefers-color-scheme: dark) {
          .jf-string { color: #5EEAD4; }
          .jf-number { color: #93C5FD; }
          .jf-boolean { color: #FDBA74; }
        }

        /*  Error bar  */
        .jf-error-bar {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px 16px;
          background: var(--error-bg);
          border-top: 0.5px solid var(--border-faint);
          font-family: var(--font-sans);
          flex-shrink: 0;
        }
        .jf-error-bar > i {
          font-size: 15px;
          color: #B91C1C;
          flex-shrink: 0;
          margin-top: 1px;
        }
        @media (prefers-color-scheme: dark) {
          .jf-error-bar > i { color: #F87171; }
        }
        .jf-error-bar > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .jf-error-bar strong {
          font-size: 12px;
          font-weight: 600;
          color: #B91C1C;
        }
        @media (prefers-color-scheme: dark) {
          .jf-error-bar strong { color: #F87171; }
        }
        .jf-error-bar span {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          line-height: 1.5;
        }
        .jf-error-tip {
          font-family: var(--font-sans) !important;
          font-size: 11px !important;
          color: var(--text-tertiary) !important;
          line-height: 1.6 !important;
          margin-top: 2px;
        }

        /*  Empty state  */
        .jf-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-disabled);
          font-family: var(--font-sans);
          padding: 32px;
        }
        .jf-empty i { font-size: 20px; }
        .jf-empty p { font-size: 12.5px; margin: 0; text-align: center; }

        /*  Diff view  */
        .jf-diff-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .jf-diff-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 0.5px solid var(--border);
          height: 180px;
          flex-shrink: 0;
        }
        .jf-diff-slot {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .jf-diff-slot + .jf-diff-slot { border-left: 0.5px solid var(--border); }
        .jf-diff-label {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 14px;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-family: var(--font-sans);
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          cursor: default;
        }
        .jf-diff-label i { font-size: 10px; }
        .jf-diff-ta { font-size: 11.5px !important; }
        .jf-diff-result {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        /*  Mobile bottom actions  */
        .jf-mobile-actions {
          display: none;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          padding: 8px 12px;
          gap: 6px;
          align-items: center;
          position: relative;
        }
        .jf-mob-action {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 36px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.1s;
        }
        .jf-mob-action i { font-size: 14px; }
        .jf-mob-action:hover { background: var(--border); color: var(--text); }
        .jf-mob-action:disabled { opacity: 0.38; cursor: not-allowed; }
        .jf-mob-action.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }
        .jf-mob-more {
          flex: 1;
          position: relative;
        }
        .jf-mob-more .jf-mob-action { width: 100%; }
        .jf-mob-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          left: 0;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .jf-mob-menu-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          padding: 8px 12px 4px;
          font-family: var(--font-sans);
        }
        .jf-mob-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.1s;
          text-align: left;
        }
        .jf-mob-menu-item i { font-size: 14px; color: var(--text-tertiary); }
        .jf-mob-menu-item:hover { background: var(--bg-surface); color: var(--text); }
        .jf-mob-menu-item.checked { color: var(--brand); }
        .jf-mob-menu-item.danger { color: #B91C1C; }
        @media (prefers-color-scheme: dark) {
          .jf-mob-menu-item.danger { color: #F87171; }
        }
        .jf-mob-menu-item:disabled { opacity: 0.38; cursor: not-allowed; }
        .jf-mob-menu-divider {
          height: 0.5px;
          background: var(--border-faint);
          margin: 4px 0;
        }

        /*  Responsive breakpoints  */
        @media (max-width: 900px) {
          .jf-indent-group,
          .jf-export-row { display: none; }
          .jf-action-label { display: none; }
        }

        @media (max-width: 768px) {
          .jf-root { min-height: auto; border-radius: var(--radius-lg); }
          .jf-chrome { padding: 8px 10px; }
          .jf-mobile-tabs { display: flex; }
          .jf-body {
            display: block;
            overflow: visible;
          }
          .jf-divider { display: none; }
          .jf-panel {
            min-height: 360px;
          }
          .jf-panel.mobile-hidden { display: none; }
          .jf-panel.mobile-visible { display: flex; }
          .jf-mobile-actions { display: flex; }
          .jf-diff-inputs {
            grid-template-columns: 1fr;
            height: 280px;
          }
          .jf-diff-slot + .jf-diff-slot {
            border-left: none;
            border-top: 0.5px solid var(--border);
          }
          .jf-chrome-right .jf-export-row { display: none; }
        }

        @media (max-width: 480px) {
          .jf-chrome { gap: 6px; }
          .jf-icon-btn-label { display: none; }
          .jf-tabs .jf-tab span:not(.jf-tab i) { display: none; }
        }

        /*  Focus rings (accessibility)  */
        .jf-pill:focus-visible,
        .jf-icon-btn:focus-visible,
        .jf-action-btn:focus-visible,
        .jf-chip:focus-visible,
        .jf-tab:focus-visible,
        .jf-mobile-tab:focus-visible,
        .jf-mob-action:focus-visible,
        .jf-mob-menu-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .jf-pill, .jf-icon-btn, .jf-action-btn, .jf-chip, .jf-tab,
          .jf-mob-action, .jf-mob-menu-item { transition: none; }
        }
      `}</style>
    </>
  );
}
