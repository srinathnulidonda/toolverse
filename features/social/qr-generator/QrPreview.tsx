// features/social/qr-generator/QrPreview.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import type { QrStyle, ExportFormat } from "./ts/types";
import styles from "./style/QrPreview.module.css";

type QrPreviewProps = {
  data: string;
  style: QrStyle;
  slug: string;
  onSave: (thumbnail: string) => void;
};

export default function QrPreview({ data, style, slug, onSave }: QrPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const [hasQr, setHasQr] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!data) {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      setError(null);
      setHasQr(false);
      return;
    }
    QRCode.toCanvas(
      canvas,
      data,
      {
        width: style.size,
        margin: style.margin,
        errorCorrectionLevel: style.errorLevel,
        color: {
          dark: style.fgColor,
          light: style.transparent ? "#ffffff00" : style.bgColor,
        },
      },
      (err) => {
        if (err) {
          setError("Content too long. Try error-correction level L or shorten your input.");
          setHasQr(false);
        } else {
          setError(null);
          setHasQr(true);
        }
      }
    );
  }, [data, style]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasQr) return;
    onSave(canvas.toDataURL("image/png"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [hasQr, onSave]);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasQr) return;
    setDownloading("png");
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: `${slug}-qr.png` }).click();
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, "image/png");
  }, [hasQr, slug]);

  const downloadSvg = useCallback(async () => {
    if (!hasQr) return;
    setDownloading("svg");
    try {
      const svg = await QRCode.toString(data, {
        type: "svg",
        margin: style.margin,
        errorCorrectionLevel: style.errorLevel,
        color: { dark: style.fgColor, light: style.transparent ? "transparent" : style.bgColor },
      });
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      Object.assign(document.createElement("a"), { href: url, download: `${slug}-qr.svg` }).click();
      URL.revokeObjectURL(url);
    } catch { }
    setDownloading(null);
  }, [hasQr, data, style, slug]);

  const downloadJpg = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasQr) return;
    setDownloading("jpg");
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const ctx = off.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(canvas, 0, 0);
    off.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), {
          href: url,
          download: `${slug}-qr.jpg`,
        }).click();
        URL.revokeObjectURL(url);
        setDownloading(null);
      },
      "image/jpeg",
      0.95
    );
  }, [hasQr, slug]);

  const copyImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasQr) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { }
    }, "image/png");
  }, [hasQr]);

  return (
    <div className={styles.qpRoot}>
      <div className={styles.qpCanvasRegion}>
        <div
          className={`${styles.qpCanvasWrap} ${!data ? styles.qpEmptyState : ""}`}
          style={data && !style.transparent ? { background: style.bgColor } : undefined}
        >
          {!data ? (
            <div className={styles.qpPlaceholder}>
              <div className={styles.qpPlaceholderIcon}>
                <i className="ti ti-qrcode" aria-hidden="true" />
              </div>
              <p className={styles.qpPlaceholderText}>Enter content to generate</p>
            </div>
          ) : null}
          <canvas
            ref={canvasRef}
            className={styles.qpCanvas}
            style={{ display: data ? "block" : "none" }}
          />
        </div>

        {error && (
          <p className={styles.qpError}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {data && (
        <div className={styles.qpDataPill}>
          <i className="ti ti-code" aria-hidden="true" />
          <span className={styles.qpDataText}>
            {data.length > 72 ? data.slice(0, 72) + "…" : data}
          </span>
        </div>
      )}

      <div className={styles.qpPrimaryActions}>
        <button
          className={`${styles.qpActionBtn} ${styles.qpSaveBtn} ${saved ? styles.qpSaved : ""}`}
          onClick={handleSave}
          disabled={!hasQr}
        >
          <i className={`ti ${saved ? "ti-check" : "ti-bookmark"}`} aria-hidden="true" />
          <span>{saved ? "Saved!" : "Save to history"}</span>
        </button>

        <button className={`${styles.qpActionBtn} ${styles.qpCopyBtn}`} onClick={copyImage} disabled={!hasQr}>
          <i className={`ti ${copied ? "ti-check" : "ti-clipboard"}`} aria-hidden="true" />
          <span>{copied ? "Copied!" : "Copy image"}</span>
        </button>
      </div>

      <div className={styles.qpExportSection}>
        <span className={styles.qpExportLabel}>
          <i className="ti ti-download" aria-hidden="true" />
          Export
        </span>
        <div className={styles.qpExportBtns}>
          <button
            className={`${styles.qpExportBtn} ${styles.qpExportPrimary}`}
            onClick={downloadPng}
            disabled={!hasQr}
          >
            {downloading === "png" ? (
              <i className={`ti ti-loader-2 ${styles.qpSpin}`} aria-hidden="true" />
            ) : (
              <i className="ti ti-download" aria-hidden="true" />
            )}
            PNG
          </button>
          <button className={styles.qpExportBtn} onClick={downloadSvg} disabled={!hasQr}>
            {downloading === "svg" ? (
              <i className={`ti ti-loader-2 ${styles.qpSpin}`} aria-hidden="true" />
            ) : (
              <i className="ti ti-download" aria-hidden="true" />
            )}
            SVG
          </button>
          <button className={styles.qpExportBtn} onClick={downloadJpg} disabled={!hasQr}>
            {downloading === "jpg" ? (
              <i className={`ti ti-loader-2 ${styles.qpSpin}`} aria-hidden="true" />
            ) : (
              <i className="ti ti-download" aria-hidden="true" />
            )}
            JPG
          </button>
        </div>
      </div>
    </div>
  );
}