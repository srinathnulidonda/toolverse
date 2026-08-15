/* features/pdf/jpg-to-pdf/Workspace.tsx */
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Tool } from '@/lib/tools';
import { formatFileSize, downloadBlob } from '@/features/pdf/shared/ts/pdfFileUtils';
import { processImageFile, ACCEPTED_IMAGE_TYPES, type ImageFileInfo } from '@/features/image/shared/ts/imageFileUtils';
import { buildPdf, type JpgToPdfSettings, type BuildProgress } from './ts/jpgToPdfEngine';
import { DEFAULT_SETTINGS } from './ts/jpgToPdfConfig';
import { UploadZone } from './UploadZone';
import { SettingsPanel } from './SettingsPanel';
import { ImageThumbnailCard } from './ImageThumbnailCard';
import { ProcessingStage } from './ProcessingStage';
import { ResultPreview, getResultFilename } from './ResultPreview';
import styles from './style/Workspace.module.css';

type MobilePanel = 'input' | 'output';

type PdfResult = {
    blob: Blob;
    pageCount: number;
    filenames: string[];
    thumbnails: string[];
    errorCount: number;
};

const LARGE_BATCH_WARNING_BYTES = 50 * 1024 * 1024;
const REORDER_HINT_KEY = 'jpgToPdfHintDismissed';

interface Props {
    tool: Tool;
}

export default function JpgToPdfWorkspace({ tool }: Props) {
    const [images, setImages] = useState<ImageFileInfo[]>([]);
    const [settings, setSettings] = useState<JpgToPdfSettings>(DEFAULT_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('input');
    const [isGenerating, setIsGenerating] = useState(false);
    const [buildProgress, setBuildProgress] = useState<BuildProgress | null>(null);
    const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);
    const [globalError, setGlobalError] = useState<string>('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [showReorderHint, setShowReorderHint] = useState(false);
    const addMoreInputRef = useRef<HTMLInputElement>(null);
    const activeBatchRef = useRef(0);

    const validImages = images.filter((img) => !img.error);
    const erroredImages = images.filter((img) => !!img.error);
    const loadingCount = images.filter((img) => !img.dataUrl && !img.error).length;
    const totalSize = images.reduce((sum, img) => sum + img.file.size, 0);
    const sizeWarning = totalSize > LARGE_BATCH_WARNING_BYTES;
    const canGenerate = validImages.length > 0 && loadingCount === 0 && !isGenerating;
    const hasResult = !!pdfResult;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (images.length >= 2) {
            setShowReorderHint(window.localStorage.getItem(REORDER_HINT_KEY) !== '1');
        }
    }, [images.length]);

    const dismissHint = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(REORDER_HINT_KEY, '1');
        }
        setShowReorderHint(false);
    }, []);

    const handleSortByName = useCallback(() => {
        setImages((prev) => {
            const valid = prev.filter((img) => !img.error);
            const errored = prev.filter((img) => img.error);
            valid.sort((a, b) =>
                sortAsc ? a.file.name.localeCompare(b.file.name) : b.file.name.localeCompare(a.file.name)
            );
            return [...valid, ...errored];
        });
        setSortAsc((s) => !s);
    }, [sortAsc]);

    const processBatch = useCallback(async (
        entries: { id: string; file: File }[],
        batchId: number
    ) => {
        for (const { id, file } of entries) {
            const processed = await processImageFile(file);
            setImages((prev) => prev.map((img) => (img.id === id ? processed : img)));
        }
    }, []);

    const handleFilesAdded = useCallback((newFiles: File[]) => {
        setGlobalError('');
        const batchId = ++activeBatchRef.current;

        setImages((prev) => {
            const existingKeys = new Set(prev.map((img) => `${img.file.name}-${img.file.size}`));
            const uniqueFiles = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
            const duplicateCount = newFiles.length - uniqueFiles.length;

            if (duplicateCount > 0) {
                setGlobalError(`${duplicateCount} file${duplicateCount > 1 ? 's were' : ' was'} already added and skipped`);
            }
            if (uniqueFiles.length === 0) return prev;

            const loadingEntries = uniqueFiles.map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                file,
            }));

            queueMicrotask(() => processBatch(loadingEntries, batchId));

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

        setPdfResult(null);
        setMobilePanel('input');
    }, [processBatch]);

    const handleAddMoreClick = useCallback(() => {
        addMoreInputRef.current?.click();
    }, []);

    const handleAddMoreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(Array.from(e.target.files));
        }
        e.target.value = '';
    }, [handleFilesAdded]);

    const removeImage = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setGlobalError('');
    }, []);

    const removeAllErrored = useCallback(() => {
        setImages((prev) => prev.filter((img) => !img.error));
        setGlobalError('');
    }, []);

    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        setImages((prev) => {
            if (toIndex < 0 || toIndex >= prev.length || fromIndex === toIndex) return prev;
            const newImages = [...prev];
            const [movedImage] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, movedImage);
            return newImages;
        });
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        setDraggedIndex(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    }, [draggedIndex]);

    const handleDrop = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            moveImage(draggedIndex, index);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [draggedIndex, moveImage]);

    const handleGenerate = useCallback(async () => {
        if (!canGenerate) return;

        setIsGenerating(true);
        setGlobalError('');
        setBuildProgress({ stage: 'preparing', done: 0, total: validImages.length });
        setMobilePanel('output');

        try {
            const result = await buildPdf(validImages, settings, (progress) => setBuildProgress(progress));

            setPdfResult({
                blob: result.blob,
                pageCount: result.pageCount,
                filenames: validImages.map((img) => img.file.name),
                thumbnails: validImages.slice(0, 3).map((img) => img.dataUrl!).filter(Boolean),
                errorCount: result.errors.length,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create PDF. Please try again.';
            setGlobalError(errorMessage);
            setMobilePanel('input');
        } finally {
            setIsGenerating(false);
            setBuildProgress(null);
        }
    }, [validImages, settings, canGenerate]);

    const handleStartOver = useCallback(() => {
        setImages([]);
        setPdfResult(null);
        setGlobalError('');
        setShowSettings(false);
        setBuildProgress(null);
        setSettings(DEFAULT_SETTINGS);
        setMobilePanel('input');
    }, []);

    const handleReset = useCallback(() => {
        if (isGenerating || loadingCount > 0) return;
        handleStartOver();
    }, [isGenerating, loadingCount, handleStartOver]);

    const handleQuickDownload = useCallback(() => {
        if (!pdfResult) return;
        downloadBlob(pdfResult.blob, getResultFilename(pdfResult.filenames));
    }, [pdfResult]);

    return (
        <div className={styles.workspace} role="main" aria-label="JPG to PDF Converter">
            <div className={styles.chrome}>
                <div className={styles.chromeLeft}>
                    <div className={styles.title}>
                        <i className="ti ti-file-type-pdf" aria-hidden="true" />
                        JPG to PDF
                    </div>
                    {images.length > 0 && (
                        <div className={styles.fileCount}>
                            {validImages.length} image{validImages.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                <div className={styles.chromeRight}>
                    {images.length > 0 && (
                        <button
                            type="button"
                            className={`${styles.btn}${showSettings ? ` ${styles.active}` : ''}`}
                            onClick={() => setShowSettings((s) => !s)}
                            aria-label="Toggle settings"
                            aria-expanded={showSettings}
                        >
                            <i className="ti ti-adjustments" aria-hidden="true" />
                            <span>Settings</span>
                        </button>
                    )}
                    {hasResult && (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleQuickDownload}
                            aria-label="Download PDF"
                        >
                            <i className="ti ti-download" aria-hidden="true" />
                            <span>Download</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.btn}
                        onClick={handleReset}
                        disabled={images.length === 0 || isGenerating || loadingCount > 0}
                    >
                        <i className="ti ti-refresh" aria-hidden="true" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {showSettings && images.length > 0 && (
                <div className={styles.settingsWrap}>
                    <SettingsPanel
                        pageSize={settings.pageSize}
                        orientation={settings.orientation}
                        margin={settings.margin}
                        imageFit={settings.imageFit}
                        onPageSizeChange={(pageSize) => setSettings((s) => ({ ...s, pageSize }))}
                        onOrientationChange={(orientation) => setSettings((s) => ({ ...s, orientation }))}
                        onMarginChange={(margin) => setSettings((s) => ({ ...s, margin }))}
                        onImageFitChange={(imageFit) => setSettings((s) => ({ ...s, imageFit }))}
                        disabled={isGenerating}
                    />
                </div>
            )}

            <div className={styles.mobileTabs} role="tablist" aria-label="Panel selector">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === 'input'}
                    className={`${styles.mobileTab}${mobilePanel === 'input' ? ` ${styles.active}` : ''}`}
                    onClick={() => setMobilePanel('input')}
                >
                    Setup
                    {erroredImages.length > 0 && (
                        <span className={`${styles.mobileBadge} ${styles.error}`}>
                            <i className="ti ti-alert-circle" aria-hidden="true" />
                        </span>
                    )}
                    {images.length > 0 && erroredImages.length === 0 && (
                        <span className={`${styles.mobileBadge} ${styles.valid}`}>
                            <i className="ti ti-check" aria-hidden="true" />
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === 'output'}
                    className={`${styles.mobileTab}${mobilePanel === 'output' ? ` ${styles.active}` : ''}`}
                    onClick={() => setMobilePanel('output')}
                >
                    Result
                    {(isGenerating || hasResult) && <span className={styles.mobileDot} />}
                </button>
            </div>

            <div className={styles.body}>
                <div className={`${styles.panel} ${mobilePanel === 'input' ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-photo" aria-hidden="true" />
                            Setup
                        </div>
                        {images.length > 0 && (
                            <span className={`${styles.statusPill} ${loadingCount > 0 ? styles.processing : styles.valid}`}>
                                <i
                                    className={`ti ${loadingCount > 0 ? `ti-loader-2 ${styles.spin}` : 'ti-check'}`}
                                    aria-hidden="true"
                                />
                                {loadingCount > 0 ? 'Loading' : `${validImages.length} ready`}
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
                                {showReorderHint && images.length >= 2 && (
                                    <div className={styles.reorderHint}>
                                        <i className="ti ti-info-circle" aria-hidden="true" />
                                        <span>Drag the cards to change page order in your PDF.</span>
                                        <button
                                            type="button"
                                            className={styles.reorderHintClose}
                                            onClick={dismissHint}
                                            aria-label="Dismiss hint"
                                        >
                                            <i className="ti ti-x" aria-hidden="true" />
                                        </button>
                                    </div>
                                )}

                                <div className={styles.imageGridWrapper}>
                                    <div className={styles.floatingControls}>
                                        <button
                                            type="button"
                                            className={styles.floatingBtn}
                                            onClick={handleSortByName}
                                            disabled={isGenerating}
                                            title={sortAsc ? 'Sort A → Z' : 'Sort Z → A'}
                                            aria-label="Sort images by name"
                                        >
                                            <i className={`ti ti-sort-${sortAsc ? 'ascending' : 'descending'}-letters`} aria-hidden="true" />
                                        </button>

                                        <button
                                            type="button"
                                            className={`${styles.floatingBtn} ${styles.floatingBtnPrimary}`}
                                            onClick={handleAddMoreClick}
                                            disabled={isGenerating}
                                            title="Add more images"
                                            aria-label="Add more images"
                                        >
                                            <i className="ti ti-plus" aria-hidden="true" />
                                            <span className={styles.floatingBadge}>{validImages.length}</span>
                                        </button>
                                        <input
                                            ref={addMoreInputRef}
                                            type="file"
                                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                            multiple
                                            className={styles.hiddenInput}
                                            onChange={handleAddMoreChange}
                                            disabled={isGenerating}
                                        />
                                    </div>

                                    <div className={styles.imageGrid}>
                                        {images.map((image, index) => (
                                            <ImageThumbnailCard
                                                key={image.id}
                                                image={image}
                                                index={index}
                                                total={images.length}
                                                isDragging={draggedIndex === index}
                                                isDragOver={dragOverIndex === index}
                                                disabled={isGenerating}
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onRemove={() => removeImage(image.id)}
                                                onMoveUp={() => moveImage(index, index - 1)}
                                                onMoveDown={() => moveImage(index, index + 1)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.generateSection}>
                                    {erroredImages.length > 0 && (
                                        <div className={styles.erroredWarning}>
                                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                                            <span>
                                                {erroredImages.length} image{erroredImages.length !== 1 ? 's' : ''} failed to load and will be skipped
                                            </span>
                                            <button
                                                type="button"
                                                className={styles.erroredWarningBtn}
                                                onClick={removeAllErrored}
                                            >
                                                Remove failed
                                            </button>
                                        </div>
                                    )}

                                    {sizeWarning && (
                                        <div className={styles.sizeWarning}>
                                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                                            <span>
                                                Large batch ({formatFileSize(totalSize)}) — processing may take a moment
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className={styles.generateButton}
                                        onClick={handleGenerate}
                                        disabled={!canGenerate}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                                                <span>Creating PDF…</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-file-type-pdf" aria-hidden="true" />
                                                <span>
                                                    {hasResult ? 'Regenerate' : 'Create'} PDF from {validImages.length} Image{validImages.length !== 1 ? 's' : ''}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.divider} aria-hidden="true" />

                <div className={`${styles.panel} ${mobilePanel === 'output' ? styles.mobileVisible : styles.mobileHidden}`}>
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
                        {isGenerating ? (
                            <ProcessingStage
                                stage={buildProgress?.stage ?? 'preparing'}
                                done={buildProgress?.done ?? 0}
                                total={buildProgress?.total ?? validImages.length}
                            />
                        ) : hasResult && pdfResult ? (
                            <ResultPreview
                                pdfBlob={pdfResult.blob}
                                pageCount={pdfResult.pageCount}
                                originalFilenames={pdfResult.filenames}
                                previewThumbnails={pdfResult.thumbnails}
                                partialFailureCount={pdfResult.errorCount}
                                onStartOver={handleStartOver}
                            />
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="ti ti-file-type-pdf" aria-hidden="true" />
                                </div>
                                <h3 className={styles.emptyTitle}>No Result Yet</h3>
                                <p className={styles.emptyText}>
                                    {images.length > 0
                                        ? 'Adjust your layout settings and create the PDF to see results here'
                                        : 'Upload images to get started'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <span className={styles.srOnly} role="status" aria-live="polite">
                {isGenerating ? 'Creating PDF...' : ''}
                {hasResult ? 'PDF ready' : ''}
            </span>
        </div>
    );
}