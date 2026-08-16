// features\dev\base64-encoder\Base64Preview.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { detectMime, extensionForMime, looksBinary, readFileAsBase64 } from "./ts/utils";
import { formatBytes } from "@/utils";
import type { Mode, InputSource } from "./ts/utils";
import styles from "./style/Base64Preview.module.css";

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
    <div className={styles.root}>
      {/*  Mobile Switcher  */}
      <div className={styles.mobileTabs}>
        <button
          type="button"
          className={`${styles.mobileTab} ${mobileView === "input" ? styles.active : ""}`}
          onClick={() => onMobileViewChange("input")}
        >
          <i className="ti ti-pencil" />
          Input
        </button>
        <button
          type="button"
          className={`${styles.mobileTab} ${mobileView === "output" ? styles.active : ""}`}
          onClick={() => onMobileViewChange("output")}
        >
          <i className="ti ti-eye" />
          Output
          {output && <span className={styles.mobileDot} />}
        </button>
      </div>

      {/*  Panels  */}
      <div className={styles.panels}>
        {/* Input Panel */}
        <div
          className={`${styles.panel} ${mobileView === "input" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelLabel}>
              <i className="ti ti-pencil" />
              Input
            </div>
            <div className={styles.panelMeta}>
              {inputBytes > 0 && <span className={styles.metaText}>{formatBytes(inputBytes)}</span>}
            </div>
          </div>

          <div className={styles.panelBody}>
            {mode === "encode" && source === "file" ? (
              <div
                className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""} ${file ? styles.hasFile : ""}`}
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
                  className={styles.fileInput}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    onFileChange(f || null);
                  }}
                />
                {file ? (
                  <div className={styles.fileCard}>
                    {file.type.startsWith("image/") && fileBase64 ? (
                      <img
                        src={`data:${file.type};base64,${fileBase64}`}
                        alt=""
                        className={styles.fileThumb}
                      />
                    ) : (
                      <div className={styles.fileIcon}>
                        <i className="ti ti-file-check" />
                      </div>
                    )}
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileSub}>
                        {formatBytes(file.size)} · {file.type || "unknown"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileChange(null);
                      }}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropEmpty}>
                    <div className={styles.dropIcon}>
                      <i className="ti ti-cloud-upload" />
                    </div>
                    <p className={styles.dropTitle}>Drop a file here</p>
                    <p className={styles.dropSub}>or click to browse — any file type, any size</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                className={styles.textarea}
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
            <div className={styles.errorBar}>
              <i className="ti ti-alert-circle" />
              <div>
                <strong>Decode error</strong>
                <span>{decodeResult.error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerIcon}>
            <i className="ti ti-arrow-right" />
          </div>
        </div>

        {/* Output Panel */}
        <div
          className={`${styles.panel} ${mobileView === "output" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelLabel}>
              <i className="ti ti-eye" />
              Output
            </div>
            <div className={styles.panelMeta}>
              {outputBytes > 0 && (
                <span className={styles.metaText}>{formatBytes(outputBytes)}</span>
              )}
              {ratio !== null && <span className={styles.ratioPill}>{ratio}%</span>}
            </div>
          </div>

          <div className={styles.panelBody}>
            {!output ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <i className="ti ti-arrow-big-right-lines" />
                </div>
                <p className={styles.emptyTitle}>Output appears here</p>
                <p className={styles.emptyDesc}>
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
                  <div className={styles.preview}>
                    <img
                      src={`data:${decodeImageInfo.mime};base64,${input.replace(/\s/g, "")}`}
                      alt="Decoded preview"
                      className={styles.previewImg}
                    />
                    <span className={styles.previewLabel}>
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
                    <div className={styles.preview}>
                      <img
                        src={`data:${file.type};base64,${fileBase64}`}
                        alt="Source preview"
                        className={styles.previewImg}
                      />
                      <span className={styles.previewLabel}>Source preview · {file.type}</span>
                    </div>
                  )}

                {/* Binary Data Message */}
                {mode === "decode" && isBinaryOutput && !decodeImageInfo ? (
                  <div className={styles.binaryMsg}>
                    <div className={styles.binaryIcon}>
                      <i className="ti ti-binary" />
                    </div>
                    <p className={styles.binaryTitle}>Binary data decoded</p>
                    <p className={styles.binaryDesc}>
                      This doesn't look like readable text — download it as a raw file.
                    </p>
                  </div>
                ) : (
                  !decodeImageInfo && <pre className={styles.output}>{output}</pre>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/*  Status Bar  */}
      {hasContent && (
        <div className={styles.status}>
          <div className={styles.statusBadges}>
            {decodeResult.error ? (
              <span className={`${styles.badge} ${styles.error}`}>
                <i className="ti ti-alert-triangle" />
                {decodeResult.error}
              </span>
            ) : decodeImageInfo ? (
              <span className={`${styles.badge} ${styles.brand}`}>
                <i className="ti ti-photo" />
                {decodeImageInfo.mime}
              </span>
            ) : isBinaryOutput ? (
              <span className={`${styles.badge} ${styles.neutral}`}>
                <i className="ti ti-binary" />
                Binary data
              </span>
            ) : hasContent ? (
              <span className={`${styles.badge} ${styles.valid}`}>
                <i className="ti ti-check" />
                Ready
              </span>
            ) : null}
          </div>

          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statValue}>{formatBytes(inputBytes)}</span>
              <span className={styles.statLabel}>in</span>
            </span>
            <i className={`ti ti-arrow-right ${styles.statArrow}`} />
            <span className={styles.stat}>
              <span className={styles.statValue}>{formatBytes(outputBytes)}</span>
              <span className={styles.statLabel}>out</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}