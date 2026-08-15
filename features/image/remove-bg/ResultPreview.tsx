// features/image/remove-bg/ResultPreview.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatFileSize } from "../shared/ts/imageFileUtils";
import { downloadBlob, sanitizeFilename } from "../../pdf/shared/ts/pdfFileUtils";
import styles from "./style/ResultPreview.module.css";

type ResultPreviewProps = {
    originalFile: File;
    resultBlob: Blob;
    onStartOver: () => void;
};

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
    });
}

const CLIPBOARD_SUPPORTED =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof (window as any).ClipboardItem !== "undefined";

export function ResultPreview({ originalFile, resultBlob, onStartOver }: ResultPreviewProps) {
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [sliderPercent, setSliderPercent] = useState(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const url = URL.createObjectURL(originalFile);
        setOriginalUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [originalFile]);

    useEffect(() => {
        const url = URL.createObjectURL(resultBlob);
        setResultUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [resultBlob]);

    useEffect(() => {
        if (!resultUrl) return;
        let cancelled = false;
        getImageDimensions(resultUrl)
            .then((dims) => {
                if (!cancelled) setDimensions(dims);
            })
            .catch(() => {
                if (!cancelled) setDimensions(null);
            });
        return () => {
            cancelled = true;
        };
    }, [resultUrl]);

    const updateSliderFromClientX = useCallback((clientX: number) => {
        const el = sliderRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const ratio = ((clientX - rect.left) / rect.width) * 100;
        setSliderPercent(Math.min(100, Math.max(0, ratio)));
    }, []);

    useEffect(() => {
        if (!isDraggingSlider) return;
        const handleMove = (e: PointerEvent) => updateSliderFromClientX(e.clientX);
        const handleUp = () => setIsDraggingSlider(false);
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };
    }, [isDraggingSlider, updateSliderFromClientX]);

    const outputFilename = useMemo(() => {
        const base = originalFile.name.split(".").slice(0, -1).join(".") || originalFile.name;
        return `${sanitizeFilename(base)}-no-bg.png`;
    }, [originalFile.name]);

    const handleDownload = useCallback(() => {
        downloadBlob(resultBlob, outputFilename);
    }, [resultBlob, outputFilename]);

    const handleCopy = useCallback(async () => {
        if (!CLIPBOARD_SUPPORTED) return;
        try {
            const item = new (window as any).ClipboardItem({ "image/png": resultBlob });
            await navigator.clipboard.write([item]);
            setCopyState("copied");
            setTimeout(() => setCopyState("idle"), 2000);
        } catch {
            setCopyState("error");
            setTimeout(() => setCopyState("idle"), 2000);
        }
    }, [resultBlob]);

    const savingsPercent = originalFile.size > 0
        ? ((originalFile.size - resultBlob.size) / originalFile.size) * 100
        : 0;

    return (
        <div className={styles.resultContainer} role="status" aria-live="polite">
            <div className={styles.successIconWrapper}>
                <div className={styles.successRing} />
                <div className={styles.resultIcon}>
                    <i className="ti ti-check" aria-hidden="true" />
                </div>
            </div>

            <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>Background Removed</h3>
                <p className={styles.resultDesc}>Your image is ready to download</p>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Original</span>
                    <strong className={styles.statValue}>{formatFileSize(originalFile.size)}</strong>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Result (PNG)</span>
                    <strong className={styles.statValue}>{formatFileSize(resultBlob.size)}</strong>
                </div>
                <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
                    <span className={styles.statLabel}>{savingsPercent >= 0 ? "Saved" : "Change"}</span>
                    <strong className={styles.statValue}>
                        {savingsPercent >= 0
                            ? `-${savingsPercent.toFixed(0)}%`
                            : `+${Math.abs(savingsPercent).toFixed(0)}%`}
                    </strong>
                </div>
            </div>

            {originalUrl && resultUrl && (
                <div className={styles.previewSection}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewLabel}>Before / After</span>
                        <span className={styles.previewFilename} title={originalFile.name}>
                            {originalFile.name}
                        </span>
                    </div>

                    <div
                        ref={sliderRef}
                        className={styles.sliderFrame}
                        onPointerDown={(e) => {
                            setIsDraggingSlider(true);
                            updateSliderFromClientX(e.clientX);
                        }}
                    >
                        <img
                            src={resultUrl}
                            alt="Background removed"
                            className={styles.sliderImageBase}
                            draggable={false}
                        />
                        <div
                            className={styles.sliderImageOverlay}
                            style={{ clipPath: `inset(0 ${100 - sliderPercent}% 0 0)` }}
                        >
                            <img
                                src={originalUrl}
                                alt="Original"
                                className={styles.sliderImageTop}
                                draggable={false}
                            />
                        </div>
                        <div className={styles.sliderHandle} style={{ left: `${sliderPercent}%` }}>
                            <div className={styles.sliderHandleGrip}>
                                <i className="ti ti-arrows-horizontal" aria-hidden="true" />
                            </div>
                        </div>
                        <span className={`${styles.sliderTag} ${styles.sliderTagLeft}`}>Original</span>
                        <span className={`${styles.sliderTag} ${styles.sliderTagRight}`}>No Background</span>
                    </div>

                    {dimensions && (
                        <div className={styles.previewMeta}>
                            <i className="ti ti-photo" aria-hidden="true" />
                            <span>{dimensions.width} × {dimensions.height}px · Transparent PNG</span>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.actions}>
                <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
                    <i className="ti ti-download" aria-hidden="true" />
                    <span>Download PNG</span>
                </button>

                <div className={styles.secondaryActions}>
                    {CLIPBOARD_SUPPORTED && (
                        <button type="button" className={styles.formatBtn} onClick={handleCopy}>
                            <i
                                className={`ti ${copyState === "copied" ? "ti-check" : copyState === "error" ? "ti-alert-circle" : "ti-clipboard"}`}
                                aria-hidden="true"
                            />
                            <span>{copyState === "copied" ? "Copied" : copyState === "error" ? "Failed" : "Copy Image"}</span>
                        </button>
                    )}
                    <button type="button" className={styles.startOverBtn} onClick={onStartOver}>
                        <i className="ti ti-refresh" aria-hidden="true" />
                        <span>Try Another Image</span>
                    </button>
                </div>
            </div>
        </div>
    );
}