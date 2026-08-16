/* features/pdf/compress-pdf/ResultPreview.tsx */
"use client";

import { useMemo, type CSSProperties } from 'react';
import { formatFileSize, downloadBlob } from '../shared/ts/pdfFileUtils';
import { NEGLIGIBLE_REDUCTION_THRESHOLD_PERCENT } from './ts/compressRules.config';
import styles from './style/ResultPreview.module.css';

type ResultPreviewProps = {
    originalFilename: string;
    originalSize: number;
    compressedSize: number;
    compressedBlob: Blob;
    onStartOver: () => void;
};

export function getCompressedFilename(originalFilename: string): string {
    const dotIndex = originalFilename.lastIndexOf('.');
    const baseName = dotIndex > 0 ? originalFilename.slice(0, dotIndex) : originalFilename;
    return `${baseName}-compressed.pdf`;
}

export function ResultPreview({
    originalFilename,
    originalSize,
    compressedSize,
    compressedBlob,
    onStartOver
}: ResultPreviewProps) {
    const reductionPercent = useMemo(() => {
        if (originalSize <= 0) return 0;
        return Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);
    }, [originalSize, compressedSize]);

    const noReduction = compressedSize >= originalSize;
    const isNegligible = reductionPercent < NEGLIGIBLE_REDUCTION_THRESHOLD_PERCENT;

    const displayPercent = Math.round(reductionPercent);
    const badgeText = noReduction || displayPercent <= 0 ? '0%' : `-${displayPercent}%`;

    const compressedBarWidth = useMemo(() => {
        if (originalSize <= 0) return 100;
        return Math.min(100, Math.max(4, (compressedSize / originalSize) * 100));
    }, [originalSize, compressedSize]);

    const handleDownload = () => {
        downloadBlob(compressedBlob, getCompressedFilename(originalFilename));
    };

    return (
        <div className={styles.resultContainer} role="status" aria-live="polite">
            <div className={styles.badgeWrap}>
                <div
                    className={styles.badgeRing}
                    style={{ '--pct': `${Math.min(100, reductionPercent)}%` } as CSSProperties}
                >
                    <div className={styles.badgeInner}>
                        <span className={styles.badgePercent}>{badgeText}</span>
                        <span className={styles.badgeLabel}>Smaller</span>
                    </div>
                </div>
            </div>

            <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>
                    {noReduction ? 'Compression Complete' : 'PDF Compressed'}
                </h3>
                <p className={styles.resultDesc}>
                    {noReduction
                        ? 'This PDF is already well-optimized'
                        : isNegligible
                            ? 'Limited compression available for this file'
                            : `Saved ${formatFileSize(originalSize - compressedSize)} of space`}
                </p>
            </div>

            <div className={styles.sizeCompare}>
                <div className={styles.sizeRow}>
                    <span className={styles.sizeRowLabel}>Original</span>
                    <div className={styles.sizeBarTrack}>
                        <div className={styles.sizeBarOriginal} style={{ width: '100%' }} />
                    </div>
                    <span className={styles.sizeRowValue}>{formatFileSize(originalSize)}</span>
                </div>
                <div className={styles.sizeRow}>
                    <span className={styles.sizeRowLabel}>Compressed</span>
                    <div className={styles.sizeBarTrack}>
                        <div className={styles.sizeBarCompressed} style={{ width: `${compressedBarWidth}%` }} />
                    </div>
                    <span className={`${styles.sizeRowValue} ${styles.sizeRowValueHighlight}`}>
                        {formatFileSize(compressedSize)}
                    </span>
                </div>
            </div>

            {(isNegligible || noReduction) && (
                <div className={styles.optimizedNotice}>
                    <i className="ti ti-info-circle" aria-hidden="true" />
                    <div className={styles.optimizedNoticeContent}>
                        <strong>Already Optimized</strong>
                        <p>
                            {noReduction
                                ? 'The original file has been preserved.'
                                : 'Further compression would require quality loss beyond the selected level.'}
                        </p>
                    </div>
                </div>
            )}

            <div className={styles.actionsRow}>
                <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
                    <i className="ti ti-download" aria-hidden="true" />
                    <span>Download Compressed PDF</span>
                </button>

                <button type="button" className={styles.startOverBtn} onClick={onStartOver}>
                    <i className="ti ti-refresh" aria-hidden="true" />
                    <span>Compress Another File</span>
                </button>
            </div>
        </div>
    );
}