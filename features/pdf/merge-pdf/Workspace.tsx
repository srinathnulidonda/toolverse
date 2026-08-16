// features/pdf/merge-pdf/Workspace.tsx
"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Tool } from '@/lib/tools';
import { mergePdfs, PdfMergeError, type MergeProgress } from './ts/mergeEngine';
import { loadPdfMeta } from '../shared/ts/pdfThumbnail';
import { PdfLoadError } from '../shared/ts/pdfErrors';
import { formatFileSize, downloadBlob } from '../shared/ts/pdfFileUtils';
import { UploadZone } from './UploadZone';
import { FileThumbnailCard, type PdfFileInfo } from './FileThumbnailCard';
import { ProcessingStage } from './ProcessingStage';
import { ResultPreview, getMergedFilename } from './ResultPreview';
import styles from './style/Workspace.module.css';

type MobilePanel = 'files' | 'result';

type MergeResult = {
    blob: Blob;
    totalPages: number;
    filenames: string[];
    thumbnails: string[];
};
const LARGE_BATCH_WARNING_BYTES = 50 * 1024 * 1024;
const REORDER_HINT_KEY = 'mergePdfHintDismissed';

function createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface Props {
    tool: Tool;
}

export default function MergePdfWorkspace({ tool }: Props) {
    const [files, setFiles] = useState<PdfFileInfo[]>([]);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('files');
    const [isMerging, setIsMerging] = useState(false);
    const [mergeProgress, setMergeProgress] = useState<MergeProgress | null>(null);
    const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
    const [globalError, setGlobalError] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [sortAsc, setSortAsc] = useState(true);
    const [showReorderHint, setShowReorderHint] = useState(false);
    const addMoreInputRef = useRef<HTMLInputElement>(null);

    const validFiles = useMemo(() => files.filter((f) => !f.error), [files]);
    const erroredFiles = useMemo(() => files.filter((f) => !!f.error), [files]);
    const loadingCount = useMemo(() => files.filter((f) => f.loading).length, [files]);
    const totalSize = useMemo(() => validFiles.reduce((sum, f) => sum + f.file.size, 0), [validFiles]);
    const sizeWarning = totalSize > LARGE_BATCH_WARNING_BYTES;
    const canMerge = validFiles.length >= 2 && loadingCount === 0 && !isMerging;
    const hasResult = !!mergeResult;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (files.length >= 2) {
            setShowReorderHint(window.localStorage.getItem(REORDER_HINT_KEY) !== '1');
        }
    }, [files.length]);

    const dismissHint = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(REORDER_HINT_KEY, '1');
        }
        setShowReorderHint(false);
    }, []);

    const handleSortByName = useCallback(() => {
        setFiles((prev) => {
            const ok = prev.filter((f) => !f.error);
            const errored = prev.filter((f) => f.error);
            ok.sort((a, b) =>
                sortAsc ? a.file.name.localeCompare(b.file.name) : b.file.name.localeCompare(a.file.name)
            );
            return [...ok, ...errored];
        });
        setSortAsc((s) => !s);
    }, [sortAsc]);

    const processFile = useCallback(async (file: File, id: string): Promise<PdfFileInfo> => {
        try {
            const { pageCount, thumbnailDataUrl } = await loadPdfMeta(file);
            return { id, file, pageCount, thumbnailDataUrl };
        } catch (error) {
            const errorMessage = error instanceof PdfLoadError ? error.message : 'Failed to load PDF';
            return { id, file, pageCount: 0, thumbnailDataUrl: '', error: errorMessage };
        }
    }, []);

    const processBatch = useCallback(async (entries: { id: string; file: File }[]) => {
        for (const { id, file } of entries) {
            const processed = await processFile(file, id);
            setFiles((prev) => prev.map((f) => (f.id === id ? { ...processed, loading: false } : f)));
        }
    }, [processFile]);

    const handleFilesAdded = useCallback((newFiles: File[]) => {
        setGlobalError('');

        setFiles((prev) => {
            const existingKeys = new Set(prev.map((f) => `${f.file.name}-${f.file.size}`));
            const uniqueFiles = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
            const duplicateCount = newFiles.length - uniqueFiles.length;

            if (duplicateCount > 0) {
                setGlobalError(`${duplicateCount} file${duplicateCount > 1 ? 's were' : ' was'} already added and skipped`);
            }
            if (uniqueFiles.length === 0) return prev;

            const loadingEntries = uniqueFiles.map((file) => ({ id: createId(), file }));
            queueMicrotask(() => processBatch(loadingEntries));

            return [
                ...prev,
                ...loadingEntries.map(({ id, file }) => ({
                    id,
                    file,
                    pageCount: 0,
                    thumbnailDataUrl: '',
                    loading: true,
                } as PdfFileInfo)),
            ];
        });

        setMergeResult(null);
        setMobilePanel('files');
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

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setGlobalError('');
    }, []);

    const removeAllErrored = useCallback(() => {
        setFiles((prev) => prev.filter((f) => !f.error));
        setGlobalError('');
    }, []);

    const moveFile = useCallback((fromIndex: number, toIndex: number) => {
        setFiles((prev) => {
            if (toIndex < 0 || toIndex >= prev.length || fromIndex === toIndex) return prev;
            const newFiles = [...prev];
            const [moved] = newFiles.splice(fromIndex, 1);
            newFiles.splice(toIndex, 0, moved);
            return newFiles;
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
            moveFile(draggedIndex, index);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [draggedIndex, moveFile]);

    const handleMerge = useCallback(async () => {
        if (!canMerge) return;

        setIsMerging(true);
        setGlobalError('');
        setMergeProgress({ stage: 'reading', done: 0, total: validFiles.length });
        setMobilePanel('result');

        try {
            const filesToMerge = validFiles.map((f) => f.file);
            const totalPages = validFiles.reduce((sum, f) => sum + f.pageCount, 0);
            const mergedBlob = await mergePdfs(filesToMerge, (progress) => setMergeProgress(progress));

            setMergeResult({
                blob: mergedBlob,
                totalPages,
                filenames: filesToMerge.map((f) => f.name),
                thumbnails: validFiles.slice(0, 3).map((f) => f.thumbnailDataUrl).filter(Boolean),
            });
        } catch (error) {
            const errorMessage = error instanceof PdfMergeError ? error.message : 'Failed to merge PDFs. Please try again.';
            setGlobalError(errorMessage);
            setMobilePanel('files');
        } finally {
            setIsMerging(false);
            setMergeProgress(null);
        }
    }, [validFiles, canMerge]);

    const handleStartOver = useCallback(() => {
        setFiles([]);
        setMergeResult(null);
        setGlobalError('');
        setMergeProgress(null);
        setMobilePanel('files');
    }, []);

    const handleReset = useCallback(() => {
        if (isMerging || loadingCount > 0) return;
        handleStartOver();
    }, [isMerging, loadingCount, handleStartOver]);

    const handleQuickDownload = useCallback(() => {
        if (!mergeResult) return;
        downloadBlob(mergeResult.blob, getMergedFilename(mergeResult.filenames));
    }, [mergeResult]);

    return (
        <div className={styles.workspace} role="main" aria-label="Merge PDF Tool">
            <div className={styles.chrome}>
                <div className={styles.chromeLeft}>
                    <div className={styles.title}>
                        <i className="ti ti-file-stack" aria-hidden="true" />
                        Merge PDF
                    </div>
                    {files.length > 0 && (
                        <div className={styles.fileCount}>
                            {validFiles.length} file{validFiles.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                <div className={styles.chromeRight}>
                    {hasResult && (
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleQuickDownload}
                            aria-label="Download merged PDF"
                        >
                            <i className="ti ti-download" aria-hidden="true" />
                            <span>Download</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.btn}
                        onClick={handleReset}
                        disabled={files.length === 0 || isMerging || loadingCount > 0}
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
                    aria-selected={mobilePanel === 'files'}
                    className={`${styles.mobileTab}${mobilePanel === 'files' ? ` ${styles.active}` : ''}`}
                    onClick={() => setMobilePanel('files')}
                >
                    Files
                    {erroredFiles.length > 0 && (
                        <span className={`${styles.mobileBadge} ${styles.error}`}>
                            <i className="ti ti-alert-circle" aria-hidden="true" />
                        </span>
                    )}
                    {files.length > 0 && erroredFiles.length === 0 && (
                        <span className={`${styles.mobileBadge} ${styles.valid}`}>
                            <i className="ti ti-check" aria-hidden="true" />
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === 'result'}
                    className={`${styles.mobileTab}${mobilePanel === 'result' ? ` ${styles.active}` : ''}`}
                    onClick={() => setMobilePanel('result')}
                >
                    Result
                    {(isMerging || hasResult) && <span className={styles.mobileDot} />}
                </button>
            </div>

            <div className={styles.body}>
                <div className={`${styles.panel} ${mobilePanel === 'files' ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-files" aria-hidden="true" />
                            Files
                        </div>
                        {files.length > 0 && (
                            <span className={`${styles.statusPill} ${loadingCount > 0 ? styles.processing : styles.valid}`}>
                                <i
                                    className={`ti ${loadingCount > 0 ? `ti-loader-2 ${styles.spin}` : 'ti-check'}`}
                                    aria-hidden="true"
                                />
                                {loadingCount > 0 ? 'Loading' : `${validFiles.length} ready`}
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

                        {files.length === 0 ? (
                            <div className={styles.uploadWrap}>
                                <UploadZone onFilesAdded={handleFilesAdded} isProcessing={false} />
                            </div>
                        ) : (
                            <div className={styles.fileManager}>
                                {showReorderHint && files.length >= 2 && (
                                    <div className={styles.reorderHint}>
                                        <i className="ti ti-info-circle" aria-hidden="true" />
                                        <span>Drag cards or use the arrow buttons to change merge order.</span>
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

                                <div className={styles.fileGridWrapper}>
                                    <div className={styles.floatingControls}>
                                        <button
                                            type="button"
                                            className={styles.floatingBtn}
                                            onClick={handleSortByName}
                                            disabled={isMerging}
                                            title={sortAsc ? 'Sort A → Z' : 'Sort Z → A'}
                                            aria-label="Sort files by name"
                                        >
                                            <i className={`ti ti-sort-${sortAsc ? 'ascending' : 'descending'}-letters`} aria-hidden="true" />
                                        </button>

                                        <button
                                            type="button"
                                            className={`${styles.floatingBtn} ${styles.floatingBtnPrimary}`}
                                            onClick={handleAddMoreClick}
                                            disabled={isMerging}
                                            title="Add more files"
                                            aria-label="Add more files"
                                        >
                                            <i className="ti ti-plus" aria-hidden="true" />
                                            <span className={styles.floatingBadge}>{validFiles.length}</span>
                                        </button>
                                        <input
                                            ref={addMoreInputRef}
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            multiple
                                            className={styles.hiddenInput}
                                            onChange={handleAddMoreChange}
                                            disabled={isMerging}
                                        />
                                    </div>

                                    <div className={styles.fileGrid}>
                                        {files.map((fileInfo, index) => (
                                            <FileThumbnailCard
                                                key={fileInfo.id}
                                                fileInfo={fileInfo}
                                                index={index}
                                                total={files.length}
                                                isDragging={draggedIndex === index}
                                                isDragOver={dragOverIndex === index}
                                                disabled={isMerging}
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onRemove={() => removeFile(fileInfo.id)}
                                                onMoveUp={() => moveFile(index, index - 1)}
                                                onMoveDown={() => moveFile(index, index + 1)}
                                            />
                                        ))}
                                    </div>

                                    {files.length > 2 && (
                                        <p className={styles.scrollHint}>
                                            <i className="ti ti-arrows-horizontal" aria-hidden="true" />
                                            Swipe to view all files
                                        </p>
                                    )}
                                </div>

                                <div className={styles.mergeSection}>
                                    {erroredFiles.length > 0 && (
                                        <div className={styles.erroredWarning}>
                                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                                            <span>
                                                {erroredFiles.length} file{erroredFiles.length !== 1 ? 's' : ''} failed to load and will be skipped
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
                                                Large batch ({formatFileSize(totalSize)}) — merging may take a moment
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className={styles.mergeButton}
                                        onClick={handleMerge}
                                        disabled={!canMerge}
                                    >
                                        {isMerging ? (
                                            <>
                                                <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                                                <span>Merging…</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-file-stack" aria-hidden="true" />
                                                <span>
                                                    {hasResult ? 'Merge Again' : `Merge ${validFiles.length} PDF${validFiles.length !== 1 ? 's' : ''}`}
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    {validFiles.length < 2 && loadingCount === 0 && (
                                        <p className={styles.mergeHint}>Add at least 2 valid PDF files to merge</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.divider} aria-hidden="true" />

                <div className={`${styles.panel} ${mobilePanel === 'result' ? styles.mobileVisible : styles.mobileHidden}`}>
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
                        {isMerging ? (
                            <ProcessingStage
                                stage={mergeProgress?.stage ?? 'reading'}
                                done={mergeProgress?.done ?? 0}
                                total={mergeProgress?.total ?? validFiles.length}
                            />
                        ) : hasResult && mergeResult ? (
                        <ResultPreview
                            mergedBlob={mergeResult.blob}
                            totalPages={mergeResult.totalPages}
                            originalFilenames={mergeResult.filenames}
                            previewThumbnails={mergeResult.thumbnails}
                            onStartOver={handleStartOver}
                        />
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="ti ti-file-stack" aria-hidden="true" />
                                </div>
                                <h3 className={styles.emptyTitle}>No Result Yet</h3>
                                <p className={styles.emptyText}>
                                    {files.length > 0
                                        ? 'Arrange your files and merge to see the result here'
                                        : 'Upload PDF files to get started'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}