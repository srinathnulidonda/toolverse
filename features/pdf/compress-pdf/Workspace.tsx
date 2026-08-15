/* features/pdf/compress-pdf/Workspace.tsx */
"use client";

import { useState, useCallback } from 'react';
import type { Tool } from '@/lib/tools';
import { compressPdf, PdfCompressError, type CompressProgress } from './ts/compressEngine';
import { loadPdfMeta } from '../shared/ts/pdfThumbnail';
import { PdfLoadError } from '../shared/ts/pdfErrors';
import { formatFileSize, downloadBlob } from '../shared/ts/pdfFileUtils';
import { LARGE_FILE_WARNING_BYTES, type CompressionLevel } from './ts/compressRules.config';
import { UploadZone } from './UploadZone';
import { SettingsPanel } from './SettingsPanel';
import { FileThumbnailCard } from './FileThumbnailCard';
import { ResultPreview, getCompressedFilename } from './ResultPreview';
import { ProcessingStage } from './ProcessingStage';
import styles from './style/Workspace.module.css';

type FileState = {
    file: File;
    pageCount: number;
    thumbnailDataUrl: string;
};

type CompressResult = {
    blob: Blob;
    originalSize: number;
    compressedSize: number;
};

type WorkspaceState = 'upload' | 'loadingFile' | 'loaded' | 'compressing' | 'result';
type MobilePanel = 'input' | 'output';

interface Props {
    tool: Tool;
}

export default function CompressPdfWorkspace({ tool }: Props) {
    const [state, setState] = useState<WorkspaceState>('upload');
    const [fileState, setFileState] = useState<FileState | null>(null);
    const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
    const [compressResult, setCompressResult] = useState<CompressResult | null>(null);
    const [error, setError] = useState<string>('');
    const [progress, setProgress] = useState<CompressProgress | null>(null);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('input');

    const showSizeWarning = !!fileState && fileState.file.size > LARGE_FILE_WARNING_BYTES;
    const hasResult = state === 'result' && !!compressResult;
    const canCompress = !!fileState && (state === 'loaded' || state === 'result');

    const handleFileSelected = useCallback(async (file: File) => {
        setError('');
        setState('loadingFile');

        try {
            const { pageCount, thumbnailDataUrl } = await loadPdfMeta(file);
            setFileState({ file, pageCount, thumbnailDataUrl });
            setCompressResult(null);
            setState('loaded');
        } catch (err) {
            const message = err instanceof PdfLoadError ? err.message : 'Failed to load PDF. Please try again.';
            setError(message);
            setFileState(null);
            setState('upload');
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setFileState(null);
        setCompressResult(null);
        setError('');
        setProgress(null);
        setState('upload');
        setMobilePanel('input');
    }, []);

    // Changing the compression level after a result already exists should
    // invalidate that stale result — otherwise the file card keeps showing
    // "Compressed" / old size numbers for settings that were never applied.
    const handleLevelChange = useCallback((level: CompressionLevel) => {
        setCompressionLevel(level);
        setState((prev) => {
            if (prev === 'result') {
                setCompressResult(null);
                return 'loaded';
            }
            return prev;
        });
    }, []);

    const handleCompress = useCallback(async () => {
        if (!fileState || state === 'compressing' || state === 'loadingFile') return;

        setError('');
        setCompressResult(null);
        setState('compressing');
        setProgress({ stage: 'loading', done: 0, total: 1 });
        setMobilePanel('output');

        try {
            const result = await compressPdf(
                fileState.file,
                compressionLevel,
                (p) => setProgress(p)
            );

            setCompressResult(result);
            setState('result');
        } catch (err) {
            const message = err instanceof PdfLoadError || err instanceof PdfCompressError
                ? err.message
                : 'Failed to compress PDF. Please try again.';
            setError(message);
            setState('loaded');
            setMobilePanel('input');
        } finally {
            setProgress(null);
        }
    }, [fileState, state, compressionLevel]);

    const handleStartOver = useCallback(() => {
        setFileState(null);
        setCompressResult(null);
        setError('');
        setProgress(null);
        setCompressionLevel('medium');
        setState('upload');
        setMobilePanel('input');
    }, []);

    const handleReset = useCallback(() => {
        if (state === 'compressing' || state === 'loadingFile') return;
        handleStartOver();
    }, [state, handleStartOver]);

    const handleQuickDownload = useCallback(() => {
        if (!compressResult || !fileState) return;
        downloadBlob(compressResult.blob, getCompressedFilename(fileState.file.name));
    }, [compressResult, fileState]);

    return (
        <div className={styles.compressWorkspace} role="main" aria-label="PDF Compress Tool">
            <div className={styles.compressChrome}>
                <div className={styles.compressChromeLeft}>
                    <div className={styles.compressTitle}>
                        <i className="ti ti-file-zip" aria-hidden="true" />
                        PDF Compress
                    </div>
                    {fileState && (
                        <div className={styles.fileCount}>
                            <i className="ti ti-file-type-pdf" aria-hidden="true" />
                            1 file
                        </div>
                    )}
                </div>

                <div className={styles.compressChromeRight}>
                    {hasResult && (
                        <button
                            type="button"
                            className={`${styles.compressBtn} ${styles.compressBtnPrimary}`}
                            onClick={handleQuickDownload}
                            aria-label="Download compressed PDF"
                        >
                            <i className="ti ti-download" aria-hidden="true" />
                            <span>Download</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.compressBtn}
                        onClick={handleReset}
                        disabled={!fileState || state === 'compressing' || state === 'loadingFile'}
                        aria-label="Reset"
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
                    aria-selected={mobilePanel === 'input'}
                    className={`${styles.mobileTab}${mobilePanel === 'input' ? ` ${styles.active}` : ''}`}
                    onClick={() => setMobilePanel('input')}
                >
                    Setup
                    {error && !fileState && (
                        <span className={`${styles.mobileBadge} ${styles.error}`}>
                            <i className="ti ti-alert-circle" aria-hidden="true" />
                        </span>
                    )}
                    {fileState && (
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
                    {(state === 'compressing' || hasResult) && <span className={styles.mobileDot} />}
                </button>
            </div>

            <div className={styles.compressBody}>
                <div className={`${styles.panel} ${mobilePanel === 'input' ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-settings" aria-hidden="true" />
                            Setup
                        </div>
                        {fileState && (
                            <span className={`${styles.statusPill} ${state === 'compressing' ? styles.processing : styles.valid}`}>
                                <i
                                    className={`ti ${state === 'compressing' ? `ti-loader-2 ${styles.spin}` : 'ti-check'}`}
                                    aria-hidden="true"
                                />
                                {state === 'compressing' ? 'Processing' : hasResult ? 'Compressed' : 'Ready'}
                            </span>
                        )}
                    </div>

                    <div className={styles.panelContent}>
                        {!fileState ? (
                            state === 'loadingFile' ? (
                                <div className={styles.loadingState}>
                                    <div className={styles.loadingSpinner} aria-hidden="true" />
                                    <span className={styles.loadingText}>Loading PDF…</span>
                                </div>
                            ) : (
                                <div className={styles.uploadWrap}>
                                    {error && (
                                        <div className={styles.uploadErrorBox} role="alert">
                                            <i className="ti ti-alert-circle" aria-hidden="true" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    <UploadZone onFileSelected={handleFileSelected} isProcessing={false} />
                                </div>
                            )
                        ) : (
                            <div className={styles.fileManager}>
                                <FileThumbnailCard
                                    fileName={fileState.file.name}
                                    fileSize={fileState.file.size}
                                    pageCount={fileState.pageCount}
                                    thumbnailDataUrl={fileState.thumbnailDataUrl}
                                    onRemove={handleRemoveFile}
                                    disabled={state === 'compressing'}
                                    isCompressed={hasResult}
                                    compressedSize={compressResult?.compressedSize}
                                />

                                <SettingsPanel
                                    selectedLevel={compressionLevel}
                                    onLevelChange={handleLevelChange}
                                    disabled={state === 'compressing'}
                                />

                                {showSizeWarning && (
                                    <div className={styles.sizeWarning}>
                                        <i className="ti ti-alert-triangle" aria-hidden="true" />
                                        <span>
                                            Large file ({formatFileSize(fileState.file.size)}) — compression may take a few moments
                                        </span>
                                    </div>
                                )}

                                {error && (
                                    <div className={styles.globalError} role="alert">
                                        <i className="ti ti-alert-circle" aria-hidden="true" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className={styles.compressButton}
                                    onClick={handleCompress}
                                    disabled={!canCompress}
                                >
                                    <i
                                        className={`ti ${state === 'compressing' ? `ti-loader-2 ${styles.spin}` : 'ti-file-zip'}`}
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {state === 'compressing' ? 'Compressing…' : hasResult ? 'Recompress' : 'Compress PDF'}
                                    </span>
                                </button>
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
                        {state === 'compressing' && fileState ? (
                            <ProcessingStage progress={progress} fileName={fileState.file.name} />
                        ) : hasResult && compressResult && fileState ? (
                            <ResultPreview
                                originalFilename={fileState.file.name}
                                originalSize={compressResult.originalSize}
                                compressedSize={compressResult.compressedSize}
                                compressedBlob={compressResult.blob}
                                onStartOver={handleStartOver}
                            />
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="ti ti-file-zip" aria-hidden="true" />
                                </div>
                                <h3 className={styles.emptyTitle}>No Result Yet</h3>
                                <p className={styles.emptyText}>
                                    {fileState
                                        ? 'Choose a compression level and run compression to see results here'
                                        : 'Upload a PDF file to get started'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <span className={styles.srOnly} role="status" aria-live="polite">
                {state === 'compressing' && progress ? `${progress.stage}...` : ''}
                {state === 'loadingFile' ? 'Loading PDF...' : ''}
                {hasResult ? 'Compression complete' : ''}
            </span>
        </div>
    );
}