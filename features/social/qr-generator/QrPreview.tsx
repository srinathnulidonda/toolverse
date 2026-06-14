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

    // Reset saved state whenever the data changes
    useEffect(() => {
        setSaved(false);
    }, [data]);

    // Render QR to canvas whenever inputs change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!data) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
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
        }, (err) => {
            if (err) {
                setError("Content too long for this error-correction level. Try level L or shorten the content.");
                setHasQr(false);
            } else {
                setError(null);
                setHasQr(true);
            }
        });
    }, [data, style]);

    // Explicit save to history — only fires when user clicks the button
    const handleSave = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasQr) return;
        const thumbnail = canvas.toDataURL("image/png");
        onSave(thumbnail);
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
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}-qr.png`;
            a.click();
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
                color: {
                    dark: style.fgColor,
                    light: style.transparent ? "transparent" : style.bgColor,
                },
            });
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}-qr.svg`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { }
        setDownloading(null);
    }, [hasQr, data, style, slug]);

    const downloadJpg = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasQr) return;
        setDownloading("jpg");
        // JPG has no transparency — composite onto white first
        const offscreen = document.createElement("canvas");
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const ctx = offscreen.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, offscreen.width, offscreen.height);
        ctx.drawImage(canvas, 0, 0);
        offscreen.toBlob(blob => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}-qr.jpg`;
            a.click();
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
                {/* Canvas area */}
                <div className="qp-canvas-area">
                    <div
                        className={`qp-canvas-wrap${!data ? " empty" : ""}`}
                        style={{ background: style.transparent ? "transparent" : "white" }}
                    >
                        {!data && (
                            <div className="qp-empty">
                                <div className="qp-empty-icon">
                                    <i className="ti ti-qrcode" aria-hidden="true" />
                                </div>
                                <p className="qp-empty-text">Fill in the form to generate your QR code</p>
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            className="qp-canvas"
                            style={{ display: data ? "block" : "none" }}
                        />
                    </div>

                    {error && (
                        <div className="qp-error">
                            <i className="ti ti-alert-circle" aria-hidden="true" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Raw data pill */}
                {data && (
                    <div className="qp-data">
                        <span className="qp-data-text">
                            {data.length > 80 ? data.slice(0, 80) + "…" : data}
                        </span>
                    </div>
                )}

                {/* Action buttons */}
                <div className="qp-actions">
                    {/* Save to history — explicit user action only */}
                    <button
                        className={`qp-btn qp-btn-save${saved ? " saved" : ""}`}
                        onClick={handleSave}
                        disabled={!hasQr}
                    >
                        <i className={`ti ${saved ? "ti-check" : "ti-bookmark"}`} aria-hidden="true" />
                        <span>{saved ? "Saved to history!" : "Save to history"}</span>
                    </button>

                    {/* Copy image */}
                    <button className="qp-btn" onClick={copyImage} disabled={!hasQr}>
                        <i className={`ti ${copied ? "ti-check" : "ti-clipboard"}`} aria-hidden="true" />
                        <span>{copied ? "Copied!" : "Copy image"}</span>
                    </button>

                    {/* Export group */}
                    <div className="qp-export-row">
                        <span className="qp-export-label">Export as</span>
                        <button className="qp-btn qp-btn-primary" onClick={downloadPng} disabled={!hasQr}>
                            <i className={`ti ${downloading === "png" ? "ti-loader-2" : "ti-download"}`} aria-hidden="true" />
                            PNG
                        </button>
                        <button className="qp-btn" onClick={downloadSvg} disabled={!hasQr}>
                            <i className={`ti ${downloading === "svg" ? "ti-loader-2" : "ti-download"}`} aria-hidden="true" />
                            SVG
                        </button>
                        <button className="qp-btn" onClick={downloadJpg} disabled={!hasQr}>
                            <i className={`ti ${downloading === "jpg" ? "ti-loader-2" : "ti-download"}`} aria-hidden="true" />
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
          gap: 14px;
          padding: 20px;
          height: 100%;
        }

        .qp-canvas-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
          width: 100%;
          justify-content: center;
        }

        .qp-canvas-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          overflow: hidden;
          border: 0.5px solid var(--border);
          width: 100%;
          aspect-ratio: 1;
          max-width: 260px;
        }
        .qp-canvas-wrap.empty {
          background: var(--bg-surface) !important;
        }

        .qp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 24px;
          text-align: center;
        }
        .qp-empty-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--text-disabled);
        }
        .qp-empty-text {
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
          max-width: 150px;
          font-family: var(--font-sans);
        }

        .qp-canvas {
          max-width: 100%;
          max-height: 100%;
          height: auto !important;
          width: auto !important;
          display: block;
        }

        .qp-error {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 9px 12px;
          background: var(--error-bg);
          border-radius: 7px;
          font-size: 11.5px;
          color: #B91C1C;
          font-family: var(--font-sans);
          line-height: 1.5;
          max-width: 260px;
        }
        .qp-error i { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        @media (prefers-color-scheme: dark) {
          .qp-error { color: #F87171; }
        }

        .qp-data {
          width: 100%;
          max-width: 260px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 7px 10px;
        }
        .qp-data-text {
          font-size: 10.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          word-break: break-all;
          line-height: 1.45;
          display: block;
        }

        .qp-actions {
          display: flex;
          flex-direction: column;
          gap: 7px;
          width: 100%;
          max-width: 260px;
        }

        .qp-export-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .qp-export-label {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          white-space: nowrap;
          margin-right: 2px;
        }

        .qp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 34px;
          padding: 0 12px;
          border-radius: 7px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.12s, color 0.12s, border-color 0.12s;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .qp-btn:first-child { width: 100%; }
        .qp-btn:hover:not(:disabled) { background: var(--border); color: var(--text); }
        .qp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .qp-btn i { font-size: 14px; }

        .qp-btn-save {
          width: 100%;
          border-color: var(--border);
        }
        .qp-btn-save.saved {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .qp-btn-primary {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .qp-btn-primary:hover:not(:disabled) {
          background: var(--brand-border);
        }

        @keyframes qp-spin {
          to { transform: rotate(360deg); }
        }
        .qp-btn .ti-loader-2 {
          animation: qp-spin 0.8s linear infinite;
        }
      `}</style>
        </>
    );
}