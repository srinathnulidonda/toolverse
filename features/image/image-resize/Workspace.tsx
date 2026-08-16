// features/image/image-resize/Workspace.tsx
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
import { resizeImage, type ResizeResultWithError } from "./ts/resizeEngine";
import {
    DEFAULT_SETTINGS,
    RESIZE_PRESETS,
    FIT_METHOD_OPTIONS,
    OUTPUT_FORMAT_OPTIONS,
    LARGE_BATCH_WARNING_BYTES,
    MIN_CUSTOM_DIMENSION,
    MAX_CUSTOM_DIMENSION,
    MIN_PERCENTAGE,
    MAX_PERCENTAGE,
    type ResizeMode,
    type ResizeFit,
    type OutputFormat,
    type QualityPreset,
} from "./ts/resizeRules.config";
import { UploadZone } from "./UploadZone";
import { SettingsPanel } from "./SettingsPanel";
import { ProcessingStage } from "./ProcessingStage";
import { ResultPreview } from "./ResultPreview";
import styles from "./style/Workspace.module.css";

type MobilePanel = "input" | "output";

interface Props {
    tool: Tool;
}

function isValidDimension(value: number): boolean {
    return Number.isFinite(value) && value >= MIN_CUSTOM_DIMENSION && value <= MAX_CUSTOM_DIMENSION;
}

function isValidPercentage(value: number): boolean {
    return Number.isFinite(value) && value >= MIN_PERCENTAGE && value <= MAX_PERCENTAGE;
}

export default function ImageResizeWorkspace({ tool }: Props) {
    const [images, setImages] = useState<ImageFileInfo[]>([]);
    const [mode, setMode] = useState<ResizeMode>(DEFAULT_SETTINGS.mode);
    const [presetId, setPresetId] = useState<string>(DEFAULT_SETTINGS.presetId);
    const [customWidth, setCustomWidth] = useState<number>(DEFAULT_SETTINGS.customWidth);
    const [customHeight, setCustomHeight] = useState<number>(DEFAULT_SETTINGS.customHeight);
    const [percentage, setPercentage] = useState<number>(DEFAULT_SETTINGS.percentage);
    const [fitMethod, setFitMethod] = useState<ResizeFit>(DEFAULT_SETTINGS.fitMethod);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>(DEFAULT_SETTINGS.outputFormat);
    const [quality, setQuality] = useState<QualityPreset>(DEFAULT_SETTINGS.quality);
    const [backgroundColor, setBackgroundColor] = useState<string>(DEFAULT_SETTINGS.backgroundColor);
    const [upscale, setUpscale] = useState<boolean>(DEFAULT_SETTINGS.upscale);

    const [mobilePanel, setMobilePanel] = useState<MobilePanel>("input");
    const [isResizing, setIsResizing] = useState(false);
    const [resizeProgress, setResizeProgress] = useState<{ current: number; total: number; fileName?: string } | null>(null);
    const [results, setResults] = useState<ResizeResultWithError[] | null>(null);
    const [globalError, setGlobalError] = useState("");
    const addMoreInputRef = useRef<HTMLInputElement>(null);

    const validImages = useMemo(() => images.filter((img) => !img.error && img.dataUrl), [images]);
    const erroredImages = useMemo(() => images.filter((img) => !!img.error), [images]);
    const loadingCount = useMemo(() => images.filter((img) => !img.dataUrl && !img.error).length, [images]);
    const totalSize = useMemo(() => images.reduce((sum, img) => sum + img.file.size, 0), [images]);
    const sizeWarning = totalSize > LARGE_BATCH_WARNING_BYTES;
    const hasResult = !!results && results.length > 0;

    const hasPng = useMemo(() => validImages.some((img) => img.file.type === "image/png"), [validImages]);
    const hasLossy = useMemo(
        () => validImages.some((img) => img.file.type === "image/jpeg" || img.file.type === "image/webp"),
        [validImages]
    );

    const settingsValid = useMemo(() => {
        if (mode === "custom") return isValidDimension(customWidth) && isValidDimension(customHeight);
        if (mode === "percentage") return isValidPercentage(percentage);
        return true;
    }, [mode, customWidth, customHeight, percentage]);

    const canResize = validImages.length > 0 && loadingCount === 0 && !isResizing && settingsValid;

    const outputSummary = useMemo(() => {
        let dimsLabel = "";
        if (mode === "preset") {
            const preset = RESIZE_PRESETS.find((p) => p.id === presetId);
            dimsLabel = preset ? `${preset.width}×${preset.height}px` : "Select a preset";
        } else if (mode === "custom") {
            dimsLabel = settingsValid ? `${customWidth}×${customHeight}px` : "Invalid dimensions";
        } else {
            dimsLabel = settingsValid ? `${percentage}% scale` : "Invalid percentage";
        }

        const fitLabel = mode !== "percentage"
            ? FIT_METHOD_OPTIONS.find((f) => f.value === fitMethod)?.label
            : null;

        const formatLabel = OUTPUT_FORMAT_OPTIONS.find((f) => f.value === outputFormat)?.label ?? "Original";

        return {
            text: [dimsLabel, fitLabel, formatLabel].filter(Boolean).join(" · "),
            isError: !settingsValid,
        };
    }, [mode, presetId, customWidth, customHeight, percentage, fitMethod, outputFormat, settingsValid]);

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

    const handleResize = useCallback(async () => {
        if (!canResize) return;

        setIsResizing(true);
        setGlobalError("");
        setResults(null);
        setResizeProgress({ current: 0, total: validImages.length });
        setMobilePanel("output");

        const newResults: ResizeResultWithError[] = [];

        for (let i = 0; i < validImages.length; i++) {
            const img = validImages[i];
            setResizeProgress({ current: i, total: validImages.length, fileName: img.file.name });

            try {
                const result = await resizeImage(img.file, {
                    mode,
                    presetId,
                    customWidth,
                    customHeight,
                    percentage,
                    fitMethod,
                    outputFormat,
                    quality,
                    backgroundColor,
                    upscale,
                });
                newResults.push({
                    ...result,
                    id: img.id,
                    filename: img.file.name,
                    originalDataUrl: img.dataUrl,
                });
            } catch (error) {
                newResults.push({
                    blob: new Blob(),
                    originalDimensions: img.dimensions || { width: 0, height: 0 },
                    resizedDimensions: { width: 0, height: 0 },
                    originalSize: img.file.size,
                    resizedSize: 0,
                    format: "",
                    keptOriginal: false,
                    error: error instanceof Error ? error.message : "Failed to resize image",
                    id: img.id,
                    filename: img.file.name,
                    originalDataUrl: img.dataUrl,
                });
            }

            setResizeProgress({ current: i + 1, total: validImages.length });
        }

        setResults(newResults);
        setResizeProgress(null);
        setIsResizing(false);
    }, [
        canResize,
        validImages,
        mode,
        presetId,
        customWidth,
        customHeight,
        percentage,
        fitMethod,
        outputFormat,
        quality,
        backgroundColor,
        upscale,
    ]);

    const handleStartOver = useCallback(() => {
        setImages([]);
        setResults(null);
        setGlobalError("");
        setResizeProgress(null);
        setIsResizing(false);
        setMode(DEFAULT_SETTINGS.mode);
        setPresetId(DEFAULT_SETTINGS.presetId);
        setCustomWidth(DEFAULT_SETTINGS.customWidth);
        setCustomHeight(DEFAULT_SETTINGS.customHeight);
        setPercentage(DEFAULT_SETTINGS.percentage);
        setFitMethod(DEFAULT_SETTINGS.fitMethod);
        setOutputFormat(DEFAULT_SETTINGS.outputFormat);
        setQuality(DEFAULT_SETTINGS.quality);
        setBackgroundColor(DEFAULT_SETTINGS.backgroundColor);
        setUpscale(DEFAULT_SETTINGS.upscale);
        setMobilePanel("input");
    }, []);

    const handleReset = useCallback(() => {
        if (isResizing || loadingCount > 0) return;
        handleStartOver();
    }, [isResizing, loadingCount, handleStartOver]);

    return (
        <div className={styles.workspace} role="main" aria-label="Image Resize Tool">
            <div className={styles.chrome}>
                <div className={styles.chromeLeft}>
                    <div className={styles.title}>
                        <i className="ti ti-crop" aria-hidden="true" />
                        <span>Image Resize</span>
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
                        disabled={images.length === 0 || isResizing || loadingCount > 0}
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
                    {(isResizing || hasResult) && <span className={styles.mobileDot} />}
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
                                <SettingsPanel
                                    mode={mode}
                                    presetId={presetId}
                                    customWidth={customWidth}
                                    customHeight={customHeight}
                                    percentage={percentage}
                                    fitMethod={fitMethod}
                                    outputFormat={outputFormat}
                                    quality={quality}
                                    backgroundColor={backgroundColor}
                                    upscale={upscale}
                                    hasPng={hasPng}
                                    hasLossy={hasLossy}
                                    onModeChange={setMode}
                                    onPresetChange={setPresetId}
                                    onCustomWidthChange={setCustomWidth}
                                    onCustomHeightChange={setCustomHeight}
                                    onPercentageChange={setPercentage}
                                    onFitMethodChange={setFitMethod}
                                    onOutputFormatChange={setOutputFormat}
                                    onQualityChange={setQuality}
                                    onBackgroundColorChange={setBackgroundColor}
                                    onUpscaleChange={setUpscale}
                                    disabled={isResizing}
                                />

                                <div className={styles.imageGridWrapper}>
                                    <div className={styles.desktopFloatingControls}>
                                        <button
                                            type="button"
                                            className={`${styles.floatingBtn} ${styles.floatingBtnPrimary}`}
                                            onClick={handleAddMoreClick}
                                            disabled={isResizing}
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
                                                            disabled={isResizing || isLoading}
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

                                    <div className={`${styles.outputSummary}${outputSummary.isError ? ` ${styles.outputSummaryError}` : ""}`}>
                                        <i className={`ti ${outputSummary.isError ? "ti-alert-circle" : "ti-info-circle"}`} aria-hidden="true" />
                                        <span>
                                            Output: <strong>{outputSummary.text}</strong>
                                        </span>
                                    </div>

                                    <div className={styles.actionRow}>
                                        <button
                                            type="button"
                                            className={styles.addMoreBtnMobile}
                                            onClick={handleAddMoreClick}
                                            disabled={isResizing}
                                            aria-label="Add more images"
                                        >
                                            <i className="ti ti-plus" aria-hidden="true" />
                                            <span>Add</span>
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.resizeButton}
                                            onClick={handleResize}
                                            disabled={!canResize}
                                        >
                                            {isResizing ? (
                                                <>
                                                    <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                                                    <span>Resizing…</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-crop" aria-hidden="true" />
                                                    <span>
                                                        {hasResult ? "Resize Again" : "Resize"} {validImages.length} Image{validImages.length !== 1 ? "s" : ""}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {!isResizing && !canResize && loadingCount > 0 && (
                                        <p className={styles.resizeHint}>
                                            Waiting for {loadingCount} image{loadingCount !== 1 ? "s" : ""} to finish loading…
                                        </p>
                                    )}
                                    {!isResizing && !canResize && loadingCount === 0 && validImages.length === 0 && (
                                        <p className={styles.resizeHint}>Add at least one valid image to resize.</p>
                                    )}
                                    {!isResizing && !canResize && loadingCount === 0 && validImages.length > 0 && !settingsValid && (
                                        <p className={styles.resizeHint}>Fix the highlighted settings above to continue.</p>
                                    )}
                                </div>

                                <input
                                    ref={addMoreInputRef}
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                    multiple
                                    className={styles.hiddenInput}
                                    onChange={handleAddMoreChange}
                                    disabled={isResizing}
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
                        {isResizing ? (
                            <ProcessingStage
                                current={resizeProgress?.current ?? 0}
                                total={resizeProgress?.total ?? validImages.length}
                                currentFileName={resizeProgress?.fileName}
                            />
                        ) : hasResult && results ? (
                            <ResultPreview results={results} onStartOver={handleStartOver} />
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="ti ti-crop" aria-hidden="true" />
                                </div>
                                <h3 className={styles.emptyTitle}>No Result Yet</h3>
                                <p className={styles.emptyText}>
                                    {images.length > 0
                                        ? "Adjust your settings and resize to see results here"
                                        : "Upload images to get started"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <span className={styles.srOnly} role="status" aria-live="polite">
                {isResizing && resizeProgress ? `Resizing image ${resizeProgress.current + 1} of ${resizeProgress.total}` : ""}
                {hasResult ? "Resize complete" : ""}
            </span>
        </div>
    );
}