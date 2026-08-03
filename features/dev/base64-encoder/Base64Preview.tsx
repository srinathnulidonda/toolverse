// features/dev/base64-encoder/Base64Preview.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { detectMime, extensionForMime, looksBinary, readFileAsBase64 } from "./utils";
import { formatBytes } from "@/utils";
import type { Mode, InputSource } from "./utils";

interface Base64PreviewProps {
  mode: Mode;
  source: InputSource;
  input: string;
  output: string;
  file: File | null;
  decodeResult: { text: string; error?: string; bytes?: Uint8Array };
  dragOver: boolean;
  mobileView: "input" | "output";
  fileRef: React.RefObject<HTMLInputElement>;
  onInputChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onDragOver: (over: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onMobileViewChange: (view: "input" | "output") => void;
}

export default function Base64Preview({
  mode,
  source,
  input,
  output,
  file,
  decodeResult,
  dragOver,
  mobileView,
  fileRef,
  onInputChange,
  onFileChange,
  onDragOver,
  onDrop,
  onMobileViewChange,
}: Base64PreviewProps) {
  const [fileBase64, setFileBase64] = useState("");

  useEffect(() => {
    if (file && mode === "encode") {
      readFileAsBase64(file).then(setFileBase64);
    }
  }, [file, mode]);

  const decodeImageInfo = useMemo(() => {
    if (mode !== "decode" || !input.trim() || decodeResult.error) return null;
    return detectMime(input);
  }, [mode, input, decodeResult.error]);

  const isBinaryOutput = useMemo(() => {
    if (mode !== "decode" || decodeResult.error || decodeImageInfo) return false;
    return looksBinary(output);
  }, [mode, decodeResult.error, decodeImageInfo, output]);

  const inputBytes = useMemo(() => {
    if (mode === "encode" && source === "file") return file?.size ?? 0;
    return new Blob([input]).size;
  }, [mode, source, file, input]);

  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  const ratio =
    inputBytes > 0 && outputBytes > 0 ? Math.round((outputBytes / inputBytes) * 100) : null;

  const hasContent = mode === "encode" ? (source === "file" ? !!file : !!input) : !!input;

  return (
    <>
      <div className="bp-root">
        {/*  Mobile Switcher  */}
        <div className="bp-mobile-tabs">
          <button
            type="button"
            className={`bp-mobile-tab${mobileView === "input" ? " active" : ""}`}
            onClick={() => onMobileViewChange("input")}
          >
            <i className="ti ti-pencil" />
            Input
          </button>
          <button
            type="button"
            className={`bp-mobile-tab${mobileView === "output" ? " active" : ""}`}
            onClick={() => onMobileViewChange("output")}
          >
            <i className="ti ti-eye" />
            Output
            {output && <span className="bp-mobile-dot" />}
          </button>
        </div>

        {/*  Panels  */}
        <div className="bp-panels">
          {/* Input Panel */}
          <div
            className={`bp-panel${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="bp-panel-header">
              <div className="bp-panel-label">
                <i className="ti ti-pencil" />
                Input
              </div>
              <div className="bp-panel-meta">
                {inputBytes > 0 && <span className="bp-meta-text">{formatBytes(inputBytes)}</span>}
              </div>
            </div>

            <div className="bp-panel-body">
              {mode === "encode" && source === "file" ? (
                <div
                  className={`bp-dropzone${dragOver ? " drag-over" : ""}${file ? " has-file" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver(true);
                  }}
                  onDragLeave={() => onDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    className="bp-file-input"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      onFileChange(f || null);
                    }}
                  />
                  {file ? (
                    <div className="bp-file-card">
                      {file.type.startsWith("image/") && fileBase64 ? (
                        <img
                          src={`data:${file.type};base64,${fileBase64}`}
                          alt=""
                          className="bp-file-thumb"
                        />
                      ) : (
                        <div className="bp-file-icon">
                          <i className="ti ti-file-check" />
                        </div>
                      )}
                      <div className="bp-file-meta">
                        <span className="bp-file-name">{file.name}</span>
                        <span className="bp-file-sub">
                          {formatBytes(file.size)} · {file.type || "unknown"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="bp-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileChange(null);
                        }}
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  ) : (
                    <div className="bp-drop-empty">
                      <div className="bp-drop-icon">
                        <i className="ti ti-cloud-upload" />
                      </div>
                      <p className="bp-drop-title">Drop a file here</p>
                      <p className="bp-drop-sub">or click to browse — any file type, any size</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="bp-textarea"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={
                    mode === "encode"
                      ? "Type or paste text to encode..."
                      : "Paste a Base64 string to decode..."
                  }
                  spellCheck={false}
                />
              )}
            </div>

            {decodeResult.error && (
              <div className="bp-error-bar">
                <i className="ti ti-alert-circle" />
                <div>
                  <strong>Decode error</strong>
                  <span>{decodeResult.error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="bp-divider">
            <div className="bp-divider-icon">
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`bp-panel${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="bp-panel-header">
              <div className="bp-panel-label">
                <i className="ti ti-eye" />
                Output
              </div>
              <div className="bp-panel-meta">
                {outputBytes > 0 && (
                  <span className="bp-meta-text">{formatBytes(outputBytes)}</span>
                )}
                {ratio !== null && <span className="bp-ratio-pill">{ratio}%</span>}
              </div>
            </div>

            <div className="bp-panel-body">
              {!output ? (
                <div className="bp-empty">
                  <div className="bp-empty-icon">
                    <i className="ti ti-arrow-big-right-lines" />
                  </div>
                  <p className="bp-empty-title">Output appears here</p>
                  <p className="bp-empty-desc">
                    {mode === "encode"
                      ? source === "file"
                        ? "Drop a file on the left to encode"
                        : "Start typing on the left"
                      : "Paste a Base64 string on the left"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Image Preview for Decode */}
                  {mode === "decode" && decodeImageInfo && (
                    <div className="bp-preview">
                      <img
                        src={`data:${decodeImageInfo.mime};base64,${input.replace(/\s/g, "")}`}
                        alt="Decoded preview"
                        className="bp-preview-img"
                      />
                      <span className="bp-preview-label">
                        Image preview · {decodeImageInfo.mime} · .
                        {extensionForMime(decodeImageInfo.mime)}
                      </span>
                    </div>
                  )}

                  {/* Image Preview for Encode */}
                  {mode === "encode" &&
                    source === "file" &&
                    file?.type.startsWith("image/") &&
                    fileBase64 && (
                      <div className="bp-preview">
                        <img
                          src={`data:${file.type};base64,${fileBase64}`}
                          alt="Source preview"
                          className="bp-preview-img"
                        />
                        <span className="bp-preview-label">Source preview · {file.type}</span>
                      </div>
                    )}

                  {/* Binary Data Message */}
                  {mode === "decode" && isBinaryOutput && !decodeImageInfo ? (
                    <div className="bp-binary-msg">
                      <div className="bp-binary-icon">
                        <i className="ti ti-binary" />
                      </div>
                      <p className="bp-binary-title">Binary data decoded</p>
                      <p className="bp-binary-desc">
                        This doesn't look like readable text — download it as a raw file.
                      </p>
                    </div>
                  ) : (
                    !decodeImageInfo && <pre className="bp-output">{output}</pre>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/*  Status Bar  */}
        {hasContent && (
          <div className="bp-status">
            <div className="bp-status-badges">
              {decodeResult.error ? (
                <span className="bp-badge error">
                  <i className="ti ti-alert-triangle" />
                  {decodeResult.error}
                </span>
              ) : decodeImageInfo ? (
                <span className="bp-badge brand">
                  <i className="ti ti-photo" />
                  {decodeImageInfo.mime}
                </span>
              ) : isBinaryOutput ? (
                <span className="bp-badge neutral">
                  <i className="ti ti-binary" />
                  Binary data
                </span>
              ) : hasContent ? (
                <span className="bp-badge valid">
                  <i className="ti ti-check" />
                  Ready
                </span>
              ) : null}
            </div>

            <div className="bp-stats">
              <span className="bp-stat">
                <span className="bp-stat-value">{formatBytes(inputBytes)}</span>
                <span className="bp-stat-label">in</span>
              </span>
              <i className="ti ti-arrow-right bp-stat-arrow" />
              <span className="bp-stat">
                <span className="bp-stat-value">{formatBytes(outputBytes)}</span>
                <span className="bp-stat-label">out</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
