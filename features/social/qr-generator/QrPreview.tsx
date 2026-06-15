//features/social/qr-generator/QrPreview.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import type { QrStyle, ExportFormat } from "./types";

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

    useEffect(() => { setSaved(false); }, [data]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!data) {
            canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
            setError(null);
            setHasQr(false);
            return;
        }
        QRCode.toCanvas(canvas, data, {
            width: style.size,
            margin: style.margin,
            errorCorrectionLevel: style.errorLevel,
            color: {
                dark: style.fgColor,
                light: style.transparent ? "#ffffff00" : style.bgColor,
            },
        }, err => {
            if (err) {
                setError("Content too long. Try error-correction level L or shorten your input.");
                setHasQr(false);
            } else {
                setError(null);
                setHasQr(true);
            }
        });
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
        canvas.toBlob(blob => {
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
                type: "svg", margin: style.margin, errorCorrectionLevel: style.errorLevel,
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
        off.width = canvas.width; off.height = canvas.height;
        const ctx = off.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, off.width, off.height);
        ctx.drawImage(canvas, 0, 0);
        off.toBlob(blob => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            Object.assign(document.createElement("a"), { href: url, download: `${slug}-qr.jpg` }).click();
            URL.revokeObjectURL(url);
            setDownloading(null);
        }, "image/jpeg", 0.95);
    }, [hasQr, slug]);

    const copyImage = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasQr) return;
        canvas.toBlob(async blob => {
            if (!blob) return;
            try {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch { }
        }, "image/png");
    }, [hasQr]);

    return (
        <>
            <div className="qp-root">

                {/* Canvas */}
                <div className="qp-canvas-region">
                    <div
                        className={`qp-canvas-wrap${!data ? " qp-empty-state" : ""}`}
                        style={data && !style.transparent ? { background: style.bgColor } : undefined}
                    >
                        {!data ? (
                            <div className="qp-placeholder">
                                <div className="qp-placeholder-icon">
                                    <i className="ti ti-qrcode" aria-hidden="true" />
                                </div>
                                <p className="qp-placeholder-text">Enter content to generate</p>
                            </div>
                        ) : null}
                        <canvas
                            ref={canvasRef}
                            className="qp-canvas"
                            style={{ display: data ? "block" : "none" }}
                        />
                    </div>

                    {error && (
                        <p className="qp-error">
                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                            {error}
                        </p>
                    )}
                </div>

                {/* Data string */}
                {data && (
                    <div className="qp-data-pill">
                        <i className="ti ti-code" aria-hidden="true" />
                        <span className="qp-data-text">
                            {data.length > 72 ? data.slice(0, 72) + "…" : data}
                        </span>
                    </div>
                )}

                {/* Primary actions */}
                <div className="qp-primary-actions">
                    <button
                        className={`qp-action-btn qp-save-btn${saved ? " qp-saved" : ""}`}
                        onClick={handleSave}
                        disabled={!hasQr}
                    >
                        <i className={`ti ${saved ? "ti-check" : "ti-bookmark"}`} aria-hidden="true" />
                        <span>{saved ? "Saved!" : "Save to history"}</span>
                    </button>

                    <button
                        className="qp-action-btn qp-copy-btn"
                        onClick={copyImage}
                        disabled={!hasQr}
                    >
                        <i className={`ti ${copied ? "ti-check" : "ti-clipboard"}`} aria-hidden="true" />
                        <span>{copied ? "Copied!" : "Copy image"}</span>
                    </button>
                </div>

                {/* Export row */}
                <div className="qp-export-section">
                    <span className="qp-export-label">
                        <i className="ti ti-download" aria-hidden="true" />
                        Export
                    </span>
                    <div className="qp-export-btns">
                        <button
                            className={`qp-export-btn qp-export-primary`}
                            onClick={downloadPng}
                            disabled={!hasQr}
                        >
                            {downloading === "png"
                                ? <i className="ti ti-loader-2 qp-spin" aria-hidden="true" />
                                : <i className="ti ti-download" aria-hidden="true" />
                            }
                            PNG
                        </button>
                        <button className="qp-export-btn" onClick={downloadSvg} disabled={!hasQr}>
                            {downloading === "svg"
                                ? <i className="ti ti-loader-2 qp-spin" aria-hidden="true" />
                                : <i className="ti ti-download" aria-hidden="true" />
                            }
                            SVG
                        </button>
                        <button className="qp-export-btn" onClick={downloadJpg} disabled={!hasQr}>
                            {downloading === "jpg"
                                ? <i className="ti ti-loader-2 qp-spin" aria-hidden="true" />
                                : <i className="ti ti-download" aria-hidden="true" />
                            }
                            JPG
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .qp-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 20px 24px;
          flex: 1;
        }

        /* Canvas region */
        .qp-canvas-region {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .qp-canvas-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 240px;
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          border: 0.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .qp-canvas-wrap.qp-empty-state {
          background: var(--bg-surface) !important;
          box-shadow: none;
        }

        .qp-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          text-align: center;
        }
        .qp-placeholder-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          color: var(--text-disabled);
        }
        .qp-placeholder-text {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
          max-width: 130px;
          font-family: var(--font-sans);
        }

        .qp-canvas {
          max-width: 100%;
          max-height: 100%;
          width: auto !important;
          height: auto !important;
          display: block;
        }

        .qp-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          background: var(--error-bg);
          border-radius: 8px;
          font-size: 11.5px;
          color: #B91C1C;
          font-family: var(--font-sans);
          line-height: 1.5;
          width: 100%;
          max-width: 240px;
          margin: 0;
        }
        .qp-error i { font-size: 14px; flex-shrink: 0; }
        @media (prefers-color-scheme: dark) { .qp-error { color: #F87171; } }

        /* Data pill */
        .qp-data-pill {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          width: 100%;
          max-width: 240px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 7px 10px;
        }
        .qp-data-pill i {
          font-size: 12px;
          color: var(--text-disabled);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .qp-data-text {
          font-size: 10.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          word-break: break-all;
          line-height: 1.45;
        }

        /* Primary actions */
        .qp-primary-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          width: 100%;
          max-width: 240px;
        }

        .qp-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, border-color 0.12s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
        }
        .qp-action-btn i { font-size: 14px; }
        .qp-action-btn:hover:not(:disabled) { background: var(--border); color: var(--text); }
        .qp-action-btn:active:not(:disabled) { transform: scale(0.97); }
        .qp-action-btn:disabled { opacity: 0.38; cursor: not-allowed; }

        .qp-save-btn.qp-saved {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        /* Export */
        .qp-export-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 240px;
        }
        .qp-export-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }
        .qp-export-label i { font-size: 12px; }

        .qp-export-btns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .qp-export-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 36px;
          border-radius: 7px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
        }
        .qp-export-btn i { font-size: 13px; }
        .qp-export-btn:hover:not(:disabled) { background: var(--border); color: var(--text); }
        .qp-export-btn:active:not(:disabled) { transform: scale(0.96); }
        .qp-export-btn:disabled { opacity: 0.38; cursor: not-allowed; }

        .qp-export-primary {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .qp-export-primary:hover:not(:disabled) { background: var(--brand-border); }

        @keyframes qp-spin { to { transform: rotate(360deg); } }
        .qp-spin { animation: qp-spin 0.75s linear infinite; }

        /* ── Mobile sheet layout adjustments ── */
        @media (max-width: 768px) {
          .qp-root {
            padding: 16px 20px 32px;
          }

          /* On mobile (in sheet) the canvas can be bigger */
          .qp-canvas-wrap {
            max-width: min(300px, 75vw);
          }
          .qp-data-pill,
          .qp-primary-actions,
          .qp-export-section {
            max-width: min(300px, 75vw);
          }

          /* Bigger touch targets */
          .qp-action-btn { height: 44px; font-size: 13px; }
          .qp-export-btn { height: 40px; font-size: 12.5px; }
        }
      `}</style>
        </>
    );
}