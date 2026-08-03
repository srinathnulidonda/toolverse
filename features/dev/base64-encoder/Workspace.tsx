// features/dev/base64-encoder/Workspace.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
  SAMPLE_BASE64,
  SAMPLE_TEXT,
  decodeBase64,
  encodeBase64,
  type InputSource,
  type Mode,
  type EncodingOptions,
  type HistoryEntry,
} from "./utils";
import Base64History from "./Base64History";
import Base64Batch from "./Base64Batch";
import Base64Compare from "./Base64Compare";
import Base64Preview from "./Base64Preview";
import { useHistoryStore } from "@/lib/useHistoryStore";
import Button from "@/components/ui/Button";
import "../base64-encoder/style/Base64Batch.css";
import "../base64-encoder/style/Base64Compare.css";
import "../base64-encoder/style/Base64History.css";
import "../base64-encoder/style/Base64Preview.css";
import "../base64-encoder/style/Workspace.css";
type ViewTab = "single" | "batch" | "compare" | "history";

export default function Base64Workspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [mode, setMode] = useState<Mode>("encode");
  const [source, setSource] = useState<InputSource>("text");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [options, setOptions] = useState<EncodingOptions>({
    urlSafe: false,
    wrapLines: false,
    lineWidth: 76,
    asDataUri: false,
    charset: "UTF-8",
    padding: true,
  });

  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mobileView, setMobileView] = useState<"input" | "output">("input");

  const fileRef = useRef<HTMLInputElement>(null);
  const { addToHistory, history, clearHistory } = useHistoryStore<HistoryEntry>({
    key: "base64-history",
    maxItems: 100, // unified limit
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).input === "string" &&
        typeof (raw as any).output === "string" &&
        typeof (raw as any).timestamp === "number" &&
        typeof (raw as any).options === "object" &&
        (raw as any).options !== null
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some((h) => h.input === newItem.input && h.output === newItem.output);
    },
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const rawEncoded = useMemo(() => {
    if (mode !== "encode") return "";
    if (source === "file" && file) {
      return encodeBase64(file, options);
    }
    if (!input) return "";
    return encodeBase64(input, options);
  }, [mode, source, file, input, options]);

  const decodeResult = useMemo(() => {
    if (mode !== "decode" || !input.trim()) return { text: "" };
    return decodeBase64(input, options);
  }, [mode, input, options]);

  const output = useMemo(() => {
    if (mode === "decode") return decodeResult.text;
    return rawEncoded;
  }, [mode, decodeResult.text, rawEncoded]);

  const handleProcess = useCallback(() => {
    if (!output) return;

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      mode,
      input: input.substring(0, 100),
      output: output.substring(0, 100),
      timestamp: Date.now(),
      options: { ...options },
    };

    addToHistory(entry);
  }, [output, mode, input, options, addToHistory]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      handleProcess();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent */
    }
  }, [output, handleProcess]);

  const handleDownload = useCallback(
    (content = output, filename = "encoded.txt") => {
      if (!content) return;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      handleProcess();
    },
    [output, handleProcess]
  );

  const handleClear = useCallback(() => {
    setInput("");
    setFile(null);
  }, []);

  const handleSwap = useCallback(() => {
    if (!output) return;
    setMode(mode === "encode" ? "decode" : "encode");
    setSource("text");
    setInput(output);
    setFile(null);
    setMobileView("output");
  }, [mode, output]);

  const loadSample = useCallback(() => {
    setInput(mode === "encode" ? SAMPLE_TEXT : SAMPLE_BASE64);
    setSource("text");
    setFile(null);
  }, [mode]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setSource("file");
      setFile(droppedFile);
    }
  }, []);

  const VIEW_TABS = [
    { id: "single" as const, label: "Single", icon: "ti-file" },
    { id: "batch" as const, label: "Batch", icon: "ti-files" },
    { id: "compare" as const, label: "Compare", icon: "ti-git-compare" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  return (
    <>
      <div className="b64-root">
        {/*  Top Chrome  */}
        <div className="b64-chrome">
          <div className="b64-chrome-left">
            <div className="b64-pill-group">
              <button
                type="button"
                className={`b64-pill${mode === "encode" ? " active" : ""}`}
                onClick={() => setMode("encode")}
              >
                <i className="ti ti-lock" />
                Encode
              </button>
              <button
                type="button"
                className={`b64-pill${mode === "decode" ? " active" : ""}`}
                onClick={() => setMode("decode")}
              >
                <i className="ti ti-lock-open" />
                Decode
              </button>
            </div>

            {mode === "encode" && viewTab === "single" && (
              <div className="b64-pill-group b64-pill-ghost">
                <button
                  type="button"
                  className={`b64-pill${source === "text" ? " active" : ""}`}
                  onClick={() => {
                    setSource("text");
                    setFile(null);
                  }}
                >
                  <i className="ti ti-typography" />
                  Text
                </button>
                <button
                  type="button"
                  className={`b64-pill${source === "file" ? " active" : ""}`}
                  onClick={() => {
                    setSource("file");
                    setInput("");
                  }}
                >
                  <i className="ti ti-paperclip" />
                  File
                </button>
              </div>
            )}

            <button type="button" className="b64-icon-btn" onClick={loadSample} title="Load sample">
              <i className="ti ti-wand" />
              <span className="b64-label">Sample</span>
            </button>

            {viewTab === "single" && (
              <button
                type="button"
                className="b64-icon-btn"
                onClick={handleSwap}
                disabled={!output}
                title="Swap input/output"
              >
                <i className="ti ti-arrows-right-left" />
                <span className="b64-label">Swap</span>
              </button>
            )}
          </div>

          <div className="b64-chrome-right">
            {viewTab === "single" && output && (
              <>
                <button
                  type="button"
                  className={`b64-action-btn${copied ? " success" : ""}`}
                  onClick={handleCopy}
                >
                  <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className="b64-action-btn" onClick={() => handleDownload()}>
                  <i className="ti ti-download" />
                  <span className="b64-label">Save</span>
                </button>
              </>
            )}
            <button
              type="button"
              className="b64-icon-btn b64-clear-btn"
              onClick={handleClear}
              disabled={!input && !file}
              title="Clear all"
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>

        {/*  View Tabs  */}
        <div className="b64-tabs-bar">
          <nav className="b64-tabs" role="tablist">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`b64-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                {tab.label}
                {typeof window !== 'undefined' && tab.id === "history" && history.length > 0 && (
                  <span className="b64-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Options Bar (Single view only)  */}
        {viewTab === "single" && (
          <div className="b64-options-bar">
            <label className="b64-toggle">
              <input
                type="checkbox"
                checked={options.urlSafe}
                onChange={(e) => setOptions((prev) => ({ ...prev, urlSafe: e.target.checked }))}
              />
              <span className="b64-toggle-track">
                <span className="b64-toggle-thumb" />
              </span>
              <span className="b64-toggle-label">URL-safe</span>
            </label>

            {mode === "encode" && !(source === "file" && options.asDataUri) && (
              <label className="b64-toggle">
                <input
                  type="checkbox"
                  checked={options.wrapLines}
                  onChange={(e) => setOptions((prev) => ({ ...prev, wrapLines: e.target.checked }))}
                />
                <span className="b64-toggle-track">
                  <span className="b64-toggle-thumb" />
                </span>
                <span className="b64-toggle-label">Wrap at {options.lineWidth} chars</span>
              </label>
            )}

            {mode === "encode" && source === "file" && (
              <label className="b64-toggle">
                <input
                  type="checkbox"
                  checked={options.asDataUri}
                  onChange={(e) => setOptions((prev) => ({ ...prev, asDataUri: e.target.checked }))}
                />
                <span className="b64-toggle-track">
                  <span className="b64-toggle-thumb" />
                </span>
                <span className="b64-toggle-label">Data URI</span>
              </label>
            )}

            <label className="b64-toggle">
              <input
                type="checkbox"
                checked={options.padding}
                onChange={(e) => setOptions((prev) => ({ ...prev, padding: e.target.checked }))}
              />
              <span className="b64-toggle-track">
                <span className="b64-toggle-thumb" />
              </span>
              <span className="b64-toggle-label">Padding (=)</span>
            </label>

            <div className="b64-select-wrap">
              <label className="b64-select-label">Charset:</label>
              <select
                className="b64-select"
                value={options.charset}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, charset: e.target.value as any }))
                }
              >
                <option value="UTF-8">UTF-8</option>
                <option value="UTF-16">UTF-16</option>
                <option value="ASCII">ASCII</option>
                <option value="ISO-8859-1">ISO-8859-1</option>
              </select>
            </div>
          </div>
        )}

        {/*  Tab Content  */}
        <div className="b64-tab-content">
          {viewTab === "single" && (
            <Base64Preview
              mode={mode}
              source={source}
              input={input}
              output={output}
              file={file}
              decodeResult={decodeResult}
              dragOver={dragOver}
              mobileView={mobileView}
              fileRef={fileRef}
              onInputChange={setInput}
              onFileChange={setFile}
              onDragOver={(over) => setDragOver(over)}
              onDrop={handleFileDrop}
              onMobileViewChange={setMobileView}
            />
          )}

          {viewTab === "batch" && (
            <Base64Batch mode={mode} options={options} onComplete={handleProcess} />
          )}

          {viewTab === "compare" && <Base64Compare mode={mode} options={options} />}

          {viewTab === "history" && (
            <Base64History
              history={history}
              onClear={clearHistory}
              onRestore={(entry) => {
                setMode(entry.mode);
                setInput(entry.input);
                setOptions(entry.options);
                setViewTab("single");
              }}
            />
          )}
        </div>

        {/*  Footer  */}
        <div className="b64-footer">
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}
