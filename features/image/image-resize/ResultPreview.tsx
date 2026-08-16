// features/image/image-resize/ResultPreview.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatFileSize, formatDimensions } from "../shared/ts/imageFileUtils";
import { downloadBlob, sanitizeFilename } from "../../pdf/shared/ts/pdfFileUtils";
import type { ResizeResultWithError } from "./ts/resizeEngine";
import styles from "./style/ResultPreview.module.css";

type ResultPreviewProps = {
    results: ResizeResultWithError[];
    onStartOver: () => void;
};

function getExtension(format: string): string {
    const subtype = format.split("/")[1] || "img";
    return subtype === "jpeg" ? "jpg" : subtype;
}

export function ResultPreview({ results, onStartOver }: ResultPreviewProps) {
    const validResults = useMemo(() => results.filter((r) => !r.error), [results]);
    const previewCandidates = useMemo(
        () => validResults.filter((r) => !!r.originalDataUrl),
        [validResults]
    );

    const [activeId, setActiveId] = useState<string | null>(previewCandidates[0]?.id ?? null);
    const [sliderPercent, setSliderPercent] = useState(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [isZipping, setIsZipping] = useState(false);
    const [zipError, setZipError] = useState("");
    const [resizedUrl, setResizedUrl] = useState<string | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const activeResult = useMemo(
        () => previewCandidates.find((r) => r.id === activeId) ?? previewCandidates[0] ?? null,
        [previewCandidates, activeId]
    );

    useEffect(() => {
        if (!activeResult) {
            setResizedUrl(null);
            return;
        }
        const url = URL.createObjectURL(activeResult.blob);
        setResizedUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [activeResult]);

    const totalOriginal = useMemo(
        () => validResults.reduce((sum, r) => sum + r.originalSize, 0),
        [validResults]
    );
    const totalResized = useMemo(
        () => validResults.reduce((sum, r) => sum + r.resizedSize, 0),
        [validResults]
    );
    const totalSavedPercent = totalOriginal > 0
        ? ((totalOriginal - totalResized) / totalOriginal) * 100
        : 0;
    const errorCount = results.length - validResults.length;

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

    const handleDownloadSingle = useCallback((result: ResizeResultWithError) => {
        downloadBlob(result.blob, `${sanitizeFilename(result.filename)}-resized.${getExtension(result.format)}`);
    }, []);

    const handleDownloadAll = useCallback(async () => {
        if (validResults.length === 0) return;
        setZipError("");

        if (validResults.length === 1) {
            handleDownloadSingle(validResults[0]);
            return;
        }

        setIsZipping(true);
        try {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();

            validResults.forEach((result) => {
                zip.file(
                    `${sanitizeFilename(result.filename)}-resized.${getExtension(result.format)}`,
                    result.blob
                );
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            downloadBlob(zipBlob, "resized-images.zip");
        } catch (error) {
            console.error("Failed to create ZIP archive", error);
            setZipError("Could not create ZIP file. Try downloading files individually.");
        } finally {
            setIsZipping(false);
        }
    }, [validResults, handleDownloadSingle]);

    return (
        <div className={styles.resultContainer} role="status" aria-live="polite">
            <div className={styles.successIconWrapper}>
                <div className={styles.successRing} />
                <div className={styles.resultIcon}>
                    <i className="ti ti-check" aria-hidden="true" />
                </div>
            </div>

            <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>
                    {validResults.length} image{validResults.length !== 1 ? "s" : ""} resized
                </h3>
                <p className={styles.resultDesc}>
                    {errorCount > 0
                        ? `${errorCount} image${errorCount !== 1 ? "s" : ""} could not be processed`
                        : "All images processed successfully"}
                </p>
            </div>

            {totalOriginal > 0 && (
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Original</span>
                        <strong className={styles.statValue}>{formatFileSize(totalOriginal)}</strong>
                    </div>
                    <div className={styles.statArrow}>
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Resized</span>
                        <strong className={styles.statValue}>{formatFileSize(totalResized)}</strong>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
                        <span className={styles.statLabel}>Change</span>
                        <strong
                            className={`${styles.statValue} ${totalSavedPercent >= 0 ? styles.reduction : styles.increasedSize}`}
                        >
                            {totalSavedPercent >= 0
                                ? `-${totalSavedPercent.toFixed(0)}%`
                                : `+${Math.abs(totalSavedPercent).toFixed(0)}%`}
                        </strong>
                    </div>
                </div>
            )}

            {activeResult && resizedUrl && (
                <div className={styles.previewSection}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewLabel}>Before / After</span>
                        <span className={styles.previewFilename} title={activeResult.filename}>
                            {activeResult.filename}
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
                            src={resizedUrl}
                            alt="Resized"
                            className={styles.sliderImageBase}
                            draggable={false}
                        />
                        <div
                            className={styles.sliderImageOverlay}
                            style={{ clipPath: `inset(0 ${100 - sliderPercent}% 0 0)` }}
                        >
                            <img
                                src={activeResult.originalDataUrl ?? undefined}
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
                        <span className={`${styles.sliderTag} ${styles.sliderTagRight}`}>Resized</span>
                    </div>

                    <div className={styles.previewMeta}>
                        <span className={styles.previewMetaDim}>
                            {formatDimensions(activeResult.originalDimensions)}
                        </span>
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                        <span className={`${styles.previewMetaDim} ${styles.previewMetaDimActive}`}>
                            {formatDimensions(activeResult.resizedDimensions)}
                        </span>
                    </div>

                    {previewCandidates.length > 1 && (
                        <div className={styles.previewThumbs}>
                            {previewCandidates.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    className={`${styles.previewThumb}${r.id === activeResult.id ? ` ${styles.previewThumbActive}` : ""}`}
                                    onClick={() => setActiveId(r.id)}
                                    aria-label={`Preview ${r.filename}`}
                                    aria-pressed={r.id === activeResult.id}
                                >
                                    <img src={r.originalDataUrl ?? undefined} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.comparisonList}>
                {results.map((result) => {
                    const reductionPercent = result.originalSize > 0
                        ? ((result.originalSize - result.resizedSize) / result.originalSize) * 100
                        : 0;
                    const isLarger = result.resizedSize > result.originalSize && !result.keptOriginal;

                    return (
                        <div
                            key={result.id}
                            className={`${styles.comparisonCard}${result.error ? ` ${styles.comparisonCardError}` : ""}`}
                        >
                            <div className={styles.comparisonInfo}>
                                <span className={styles.comparisonFilename} title={result.filename}>
                                    {result.filename}
                                </span>
                                {result.error ? (
                                    <div className={styles.errorMessage}>
                                        <i className="ti ti-alert-circle" aria-hidden="true" />
                                        <span>{result.error}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.dimensionsRow}>
                                            <span className={styles.dimOriginal}>
                                                {formatDimensions(result.originalDimensions)}
                                            </span>
                                            <i className="ti ti-arrow-right" aria-hidden="true" />
                                            <span className={styles.dimResized}>
                                                {formatDimensions(result.resizedDimensions)}
                                            </span>
                                        </div>
                                        {result.keptOriginal ? (
                                            <span className={styles.keptOriginalNote}>
                                                <i className="ti ti-info-circle" aria-hidden="true" />
                                                No resize needed — original retained
                                            </span>
                                        ) : (
                                            <>
                                                <div className={styles.comparisonSizes}>
                                                    <span className={styles.sizeOriginal}>
                                                        {formatFileSize(result.originalSize)}
                                                    </span>
                                                    <i className="ti ti-arrow-right" aria-hidden="true" />
                                                    <span className={styles.sizeResized}>
                                                        {formatFileSize(result.resizedSize)}
                                                    </span>
                                                </div>
                                                <div className={styles.reductionInfo}>
                                                    <span className={isLarger ? styles.increasedSize : styles.reduction}>
                                                        {reductionPercent >= 0
                                                            ? `${reductionPercent.toFixed(1)}% smaller`
                                                            : `${Math.abs(reductionPercent).toFixed(1)}% larger`}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {!result.error && (
                                <button
                                    type="button"
                                    className={styles.downloadSingleBtn}
                                    onClick={() => handleDownloadSingle(result)}
                                    aria-label={`Download ${result.filename}`}
                                >
                                    <i className="ti ti-download" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={styles.actions}>
                {zipError && (
                    <div className={styles.errorMessage} role="alert">
                        <i className="ti ti-alert-circle" aria-hidden="true" />
                        <span>{zipError}</span>
                    </div>
                )}

                <button
                    type="button"
                    className={styles.downloadAllBtn}
                    onClick={handleDownloadAll}
                    disabled={validResults.length === 0 || isZipping}
                    aria-busy={isZipping}
                >
                    <i className={`ti ${isZipping ? `ti-loader-2 ${styles.spin}` : "ti-download"}`} aria-hidden="true" />
                    <span>
                        {isZipping
                            ? "Preparing ZIP…"
                            : validResults.length > 1
                            ? "Download All (ZIP)"
                            : "Download Resized Image"}
                    </span>
                </button>

                <button type="button" className={styles.startOverBtn} onClick={onStartOver}>
                    <i className="ti ti-refresh" aria-hidden="true" />
                    <span>Resize More Images</span>
                </button>
            </div>
        </div>
    );
}