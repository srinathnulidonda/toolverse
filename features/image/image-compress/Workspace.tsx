// features/image/image-compress/Workspace.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
    processImageFile,
    formatFileSize,
    formatDimensions,
    ACCEPTED_IMAGE_TYPES,
    type ImageFileInfo,
} from "../shared/ts/imageFileUtils";
import { compressImage, type CompressResultWithError } from "./ts/compressEngine";
import {
    DEFAULT_SETTINGS,
    LARGE_BATCH_WARNING_BYTES,
    type CompressionQuality,
    type OutputFormat,
} from "./ts/compressRules.config";
import { UploadZone } from "./UploadZone";
import { CompressionSettings } from "./CompressionSettings";
import { ProcessingStage } from "./ProcessingStage";
import { ResultPreview } from "./ResultPreview";
import styles from "./style/Workspace.module.css";

type MobilePanel = "input" | "output";

interface Props {
    tool: Tool;
}

export default function ImageCompressWorkspace({ tool }: Props) {
    const [images, setImages] = useState<ImageFileInfo[]>([]);
    const [quality, setQuality] = useState<CompressionQuality>(DEFAULT_SETTINGS.quality);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>(DEFAULT_SETTINGS.outputFormat);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>("input");
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressProgress, setCompressProgress] = useState<{ current: number; total: number; fileName?: string } | null>(null);
    const [results, setResults] = useState<CompressResultWithError[] | null>(null);
    const [globalError, setGlobalError] = useState("");
    const addMoreInputRef = useRef<HTMLInputElement>(null);

    const validImages = useMemo(() => images.filter((img) => !img.error && img.dataUrl), [images]);
    const erroredImages = useMemo(() => images.filter((img) => !!img.error), [images]);
    const loadingCount = useMemo(() => images.filter((img) => !img.dataUrl && !img.error).length, [images]);
    const totalSize = useMemo(() => images.reduce((sum, img) => sum + img.file.size, 0), [images]);
    const sizeWarning = totalSize > LARGE_BATCH_WARNING_BYTES;
    const canCompress = validImages.length > 0 && loadingCount === 0 && !isCompressing;
    const hasResult = !!results && results.length > 0;

    const hasPng = useMemo(() => validImages.some((img) => img.file.type === "image/png"), [validImages]);
    const hasLossy = useMemo(
        () => validImages.some((img) => img.file.type === "image/jpeg" || img.file.type === "image/webp"),
        [validImages]
    );

    const processBatch = useCallback(async (entries: { id: string; file: File }[]) => {
        for (const { id, file } of entries) {
            const processed = await processImageFile(file);
            setImages((prev) => prev.map((img) => (img.id === id ? processed : img)));
        }
    }, []);

    const handleFilesAdded = useCallback((newFiles: File[]) => {
        setGlobalError("");
        setResults(null);

        setImages((prev) => {
            const existingKeys = new Set(prev.map((img) => `${img.file.name}-${img.file.size}`));
            const uniqueFiles = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
            const duplicateCount = newFiles.length - uniqueFiles.length;

            if (duplicateCount > 0) {
                setGlobalError(`${duplicateCount} file${duplicateCount > 1 ? "s were" : " was"} already added and skipped`);
            }
            if (uniqueFiles.length === 0) return prev;

            const loadingEntries = uniqueFiles.map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                file,
            }));

            queueMicrotask(() => processBatch(loadingEntries));

            return [
                ...prev,
                ...loadingEntries.map(({ id, file }) => ({
                    id,
                    file,
                    dimensions: null,
                    dataUrl: null,
                } as ImageFileInfo)),
            ];
        });

        setMobilePanel("input");
    }, [processBatch]);

    const handleAddMoreClick = useCallback(() => {
        addMoreInputRef.current?.click();
    }, []);

    const handleAddMoreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(Array.from(e.target.files));
        }
        e.target.value = "";
    }, [handleFilesAdded]);

    const removeImage = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setGlobalError("");
    }, []);

    const removeAllErrored = useCallback(() => {
        setImages((prev) => prev.filter((img) => !img.error));
        setGlobalError("");
    }, []);

    const handleCompress = useCallback(async () => {
        if (!canCompress) return;

        setIsCompressing(true);
        setGlobalError("");
        setResults(null);
        setCompressProgress({ current: 0, total: validImages.length });
        setMobilePanel("output");

        const newResults: CompressResultWithError[] = [];

        for (let i = 0; i < validImages.length; i++) {
            const img = validImages[i];
            setCompressProgress({ current: i, total: validImages.length, fileName: img.file.name });

            try {
                const result = await compressImage(img.file, { quality, outputFormat });
                newResults.push({
                    ...result,
                    id: img.id,
                    filename: img.file.name,
                    originalDataUrl: img.dataUrl,
                });
            } catch (error) {
                newResults.push({
                    blob: new Blob(),
                    originalSize: img.file.size,
                    compressedSize: 0,
                    format: "",
                    keptOriginal: false,
                    originalDimensions: img.dimensions || { width: 0, height: 0 },
                    error: error instanceof Error ? error.message : "Failed to compress image",
                    id: img.id,
                    filename: img.file.name,
                    originalDataUrl: img.dataUrl,
                });
            }

            setCompressProgress({ current: i + 1, total: validImages.length });
        }

        setResults(newResults);
        setCompressProgress(null);
        setIsCompressing(false);
    }, [canCompress, validImages, quality, outputFormat]);

    const handleStartOver = useCallback(() => {
        setImages([]);
        setResults(null);
        setGlobalError("");
        setCompressProgress(null);
        setIsCompressing(false);
        setQuality(DEFAULT_SETTINGS.quality);
        setOutputFormat(DEFAULT_SETTINGS.outputFormat);
        setMobilePanel("input");
    }, []);

    const handleReset = useCallback(() => {
        if (isCompressing || loadingCount > 0) return;
        handleStartOver();
    }, [isCompressing, loadingCount, handleStartOver]);

    return (
        <div className={styles.workspace} role="main" aria-label="Image Compress Tool">
            <div className={styles.chrome}>
                <div className={styles.chromeLeft}>
                    <div className={styles.title}>
                        <i className="ti ti-photo-edit" aria-hidden="true" />
                        <span>Image Compress</span>
                    </div>
                    {images.length > 0 && (
                        <div
                            className={styles.fileCount}
                            aria-label={`${validImages.length} image${validImages.length !== 1 ? "s" : ""} ready`}
                        >
                            {validImages.length}
                        </div>
                    )}
                </div>

                <div className={styles.chromeRight}>
                    <button
                        type="button"
                        className={styles.btn}
                        onClick={handleReset}
                        disabled={images.length === 0 || isCompressing || loadingCount > 0}
                    >
                        <i className="ti ti-refresh" aria-hidden="true" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className={styles.mobileTabs} role="tablist" aria-label="Panel selector">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === "input"}
                    className={`${styles.mobileTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
                    onClick={() => setMobilePanel("input")}
                >
                    Setup
                    {erroredImages.length > 0 ? (
                        <span className={`${styles.mobileBadge} ${styles.error}`} aria-label="Has errors">
                            <i className="ti ti-alert-circle" aria-hidden="true" />
                        </span>
                    ) : loadingCount > 0 ? (
                        <span className={`${styles.mobileBadge} ${styles.processing}`} aria-label="Loading">
                            <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                        </span>
                    ) : images.length > 0 ? (
                        <span className={`${styles.mobileBadge} ${styles.valid}`} aria-label="Ready">
                            <i className="ti ti-check" aria-hidden="true" />
                        </span>
                    ) : null}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === "output"}
                    className={`${styles.mobileTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
                    onClick={() => setMobilePanel("output")}
                >
                    Result
                    {(isCompressing || hasResult) && <span className={styles.mobileDot} />}
                </button>
            </div>

            <div className={styles.body}>
                <div className={`${styles.panel} ${mobilePanel === "input" ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-photo" aria-hidden="true" />
                            Setup
                        </div>
                        {images.length > 0 && (
                            <span className={`${styles.statusPill} ${loadingCount > 0 ? styles.processing : styles.valid}`}>
                                <i className={`ti ${loadingCount > 0 ? `ti-loader-2 ${styles.spin}` : "ti-check"}`} aria-hidden="true" />
                                {loadingCount > 0 ? "Loading" : `${validImages.length} ready`}
                            </span>
                        )}
                    </div>

                    <div className={styles.panelContent}>
                        {globalError && (
                            <div className={styles.globalError} role="alert">
                                <i className="ti ti-alert-circle" aria-hidden="true" />
                                <span>{globalError}</span>
                            </div>
                        )}

                        {images.length === 0 ? (
                            <div className={styles.uploadWrap}>
                                <UploadZone onFilesAdded={handleFilesAdded} isProcessing={false} />
                            </div>
                        ) : (
                            <div className={styles.imageManager}>
                                <CompressionSettings
                                    hasPng={hasPng}
                                    hasLossy={hasLossy}
                                    quality={quality}
                                    outputFormat={outputFormat}
                                    onQualityChange={setQuality}
                                    onOutputFormatChange={setOutputFormat}
                                    disabled={isCompressing}
                                />

                                <div className={styles.imageGridWrapper}>
                                    <div className={styles.desktopFloatingControls}>
                                        <button
                                            type="button"
                                            className={`${styles.floatingBtn} ${styles.floatingBtnPrimary}`}
                                            onClick={handleAddMoreClick}
                                            disabled={isCompressing}
                                            title="Add more images"
                                            aria-label="Add more images"
                                        >
                                            <i className="ti ti-plus" aria-hidden="true" />
                                            <span className={styles.floatingBadge}>{validImages.length}</span>
                                        </button>
                                    </div>

                                    <div className={styles.imageGrid}>
                                        {images.map((image) => {
                                            const isLoading = !image.dataUrl && !image.error;
                                            const isError = !!image.error;
                                            return (
                                                <div key={image.id} className={styles.imageCardWrapper}>
                                                    <div
                                                        className={`${styles.imageCard}${isError ? ` ${styles.imageCardError}` : ""}${isLoading ? ` ${styles.imageCardLoading}` : ""}`}
                                                    >
                                                        <button
                                                            type="button"
                                                            className={styles.removeBtn}
                                                            onClick={() => removeImage(image.id)}
                                                            disabled={isCompressing || isLoading}
                                                            aria-label={`Remove ${image.file.name}`}
                                                        >
                                                            <i className="ti ti-x" aria-hidden="true" />
                                                        </button>

                                                        <div className={styles.imageThumbnailWrapper}>
                                                            {isLoading && (
                                                                <div className={styles.imageLoading}>
                                                                    <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                                                                    <span>Loading…</span>
                                                                </div>
                                                            )}
                                                            {isError && (
                                                                <div className={styles.thumbnailError}>
                                                                    <i className="ti ti-photo-off" aria-hidden="true" />
                                                                </div>
                                                            )}
                                                            {!isLoading && !isError && (
                                                                <img
                                                                    src={image.dataUrl!}
                                                                    alt={`${image.file.name} preview`}
                                                                    className={styles.thumbnailImage}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={styles.imageNameBelow} title={image.file.name}>
                                                        {image.file.name}
                                                    </div>

                                                    <div className={styles.metaRow}>
                                                        {image.dimensions && (
                                                            <>
                                                                <span className={styles.metaItem}>
                                                                    <i className="ti ti-photo" aria-hidden="true" />
                                                                    {formatDimensions(image.dimensions)}
                                                                </span>
                                                                <span className={styles.metaDivider} />
                                                            </>
                                                        )}
                                                        <span className={styles.metaItem}>
                                                            <i className="ti ti-file" aria-hidden="true" />
                                                            {formatFileSize(image.file.size)}
                                                        </span>
                                                    </div>

                                                    {isError && (
                                                        <div className={styles.imageErrorBelow}>
                                                            <i className="ti ti-alert-circle" aria-hidden="true" />
                                                            <span>{image.error}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.generateSection}>
                                    {erroredImages.length > 0 && (
                                        <div className={styles.erroredWarning}>
                                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                                            <span>
                                                {erroredImages.length} image{erroredImages.length !== 1 ? "s" : ""} failed to load and will be skipped
                                            </span>
                                            <button type="button" className={styles.erroredWarningBtn} onClick={removeAllErrored}>
                                                Remove failed
                                            </button>
                                        </div>
                                    )}

                                    {sizeWarning && (
                                        <div className={styles.sizeWarning}>
                                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                                            <span>Large batch ({formatFileSize(totalSize)}) — processing may take a moment</span>
                                        </div>
                                    )}

                                    <div className={styles.actionRow}>
                                        <button
                                            type="button"
                                            className={styles.addMoreBtnMobile}
                                            onClick={handleAddMoreClick}
                                            disabled={isCompressing}
                                            aria-label="Add more images"
                                        >
                                            <i className="ti ti-plus" aria-hidden="true" />
                                            <span>Add</span>
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.compressButton}
                                            onClick={handleCompress}
                                            disabled={!canCompress}
                                        >
                                            {isCompressing ? (
                                                <>
                                                    <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                                                    <span>Compressing…</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-photo-edit" aria-hidden="true" />
                                                    <span>
                                                        {hasResult ? "Recompress" : "Compress"} {validImages.length} Image{validImages.length !== 1 ? "s" : ""}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {!isCompressing && !canCompress && loadingCount > 0 && (
                                        <p className={styles.compressHint}>
                                            Waiting for {loadingCount} image{loadingCount !== 1 ? "s" : ""} to finish loading…
                                        </p>
                                    )}
                                    {!isCompressing && !canCompress && loadingCount === 0 && validImages.length === 0 && (
                                        <p className={styles.compressHint}>Add at least one valid image to compress.</p>
                                    )}
                                </div>

                                <input
                                    ref={addMoreInputRef}
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                    multiple
                                    className={styles.hiddenInput}
                                    onChange={handleAddMoreChange}
                                    disabled={isCompressing}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.divider} aria-hidden="true" />

                <div className={`${styles.panel} ${mobilePanel === "output" ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-report-analytics" aria-hidden="true" />
                            Result
                        </div>
                        {hasResult && (
                            <span className={`${styles.statusPill} ${styles.valid}`}>
                                <i className="ti ti-check" aria-hidden="true" />
                                Done
                            </span>
                        )}
                    </div>

                    <div className={styles.panelContent}>
                        {isCompressing ? (
                            <ProcessingStage
                                current={compressProgress?.current ?? 0}
                                total={compressProgress?.total ?? validImages.length}
                                currentFileName={compressProgress?.fileName}
                            />
                        ) : hasResult && results ? (
                            <ResultPreview results={results} onStartOver={handleStartOver} />
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="ti ti-photo-edit" aria-hidden="true" />
                                </div>
                                <h3 className={styles.emptyTitle}>No Result Yet</h3>
                                <p className={styles.emptyText}>
                                    {images.length > 0
                                        ? "Adjust your settings and compress to see results here"
                                        : "Upload images to get started"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <span className={styles.srOnly} role="status" aria-live="polite">
                {isCompressing && compressProgress ? `Compressing image ${compressProgress.current + 1} of ${compressProgress.total}` : ""}
                {hasResult ? "Compression complete" : ""}
            </span>
        </div>
    );
}