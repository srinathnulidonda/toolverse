// features/image/image-compress/ResultPreview.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatFileSize } from "../shared/ts/imageFileUtils";
import { downloadBlob, sanitizeFilename } from "../../pdf/shared/ts/pdfFileUtils";
import type { CompressResultWithError } from "./ts/compressEngine";
import styles from "./style/ResultPreview.module.css";

type ResultPreviewProps = {
    results: CompressResultWithError[];
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
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const activeResult = useMemo(
        () => previewCandidates.find((r) => r.id === activeId) ?? previewCandidates[0] ?? null,
        [previewCandidates, activeId]
    );

    useEffect(() => {
        if (!activeResult) {
            setCompressedUrl(null);
            return;
        }
        const url = URL.createObjectURL(activeResult.blob);
        setCompressedUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [activeResult]);

    const totalOriginal = useMemo(
        () => validResults.reduce((sum, r) => sum + r.originalSize, 0),
        [validResults]
    );
    const totalCompressed = useMemo(
        () => validResults.reduce((sum, r) => sum + r.compressedSize, 0),
        [validResults]
    );
    const totalSavedPercent = totalOriginal > 0
        ? ((totalOriginal - totalCompressed) / totalOriginal) * 100
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

    const handleDownloadSingle = useCallback((result: CompressResultWithError) => {
        downloadBlob(result.blob, `${sanitizeFilename(result.filename)}-compressed.${getExtension(result.format)}`);
    }, []);

    const handleDownloadAll = useCallback(async () => {
        if (validResults.length === 0) return;

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
                    `${sanitizeFilename(result.filename)}-compressed.${getExtension(result.format)}`,
                    result.blob
                );
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            downloadBlob(zipBlob, "compressed-images.zip");
        } catch (error) {
            console.error("Failed to create ZIP archive", error);
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
                    {validResults.length} image{validResults.length !== 1 ? "s" : ""} compressed
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
                        <span className={styles.statLabel}>Compressed</span>
                        <strong className={styles.statValue}>{formatFileSize(totalCompressed)}</strong>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
                        <span className={styles.statLabel}>Saved</span>
                        <strong className={styles.statValue}>
                            {totalSavedPercent > 0 ? `${totalSavedPercent.toFixed(0)}%` : "0%"}
                        </strong>
                    </div>
                </div>
            )}

            {activeResult && compressedUrl && (
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
                            src={compressedUrl}
                            alt="Compressed"
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
                        <span className={`${styles.sliderTag} ${styles.sliderTagRight}`}>Compressed</span>
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
                        ? ((result.originalSize - result.compressedSize) / result.originalSize) * 100
                        : 0;
                    const isLarger = result.compressedSize > result.originalSize && !result.keptOriginal;

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
                                        <div className={styles.comparisonSizes}>
                                            <span className={styles.sizeOriginal}>{formatFileSize(result.originalSize)}</span>
                                            <i className="ti ti-arrow-right" aria-hidden="true" />
                                            <span className={styles.sizeCompressed}>{formatFileSize(result.compressedSize)}</span>
                                        </div>
                                        <div className={styles.reductionInfo}>
                                            {result.keptOriginal ? (
                                                <span className={styles.keptOriginalNote}>
                                                    <i className="ti ti-info-circle" aria-hidden="true" />
                                                    Original kept — already optimal
                                                </span>
                                            ) : (
                                                <span className={isLarger ? styles.increasedSize : styles.reduction}>
                                                    {reductionPercent >= 0
                                                        ? `${reductionPercent.toFixed(1)}% smaller`
                                                        : `${Math.abs(reductionPercent).toFixed(1)}% larger`}
                                                </span>
                                            )}
                                        </div>
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
                            : "Download Compressed Image"}
                    </span>
                </button>

                <button type="button" className={styles.startOverBtn} onClick={onStartOver}>
                    <i className="ti ti-refresh" aria-hidden="true" />
                    <span>Compress More Images</span>
                </button>
            </div>
        </div>
    );
}