// features/pdf/merge-pdf/ResultPreview.tsx
"use client";

import { useMemo, useState } from 'react';
import { formatFileSize, downloadBlob } from '../shared/ts/pdfFileUtils';
import styles from './style/ResultPreview.module.css';

type ResultPreviewProps = {
    mergedBlob: Blob;
    totalPages: number;
    originalFilenames: string[];
    previewThumbnails?: string[];
    onStartOver: () => void;
};

const MAX_FILENAME_LENGTH = 60;

export function getMergedFilename(originalFilenames: string[]): string {
    if (originalFilenames.length === 0) return 'merged.pdf';

    const stripExtension = (name: string) => {
        const dotIndex = name.lastIndexOf('.');
        return dotIndex > 0 ? name.slice(0, dotIndex) : name;
    };

    if (originalFilenames.length <= 2) {
        const combined = originalFilenames.map(stripExtension).join('-');
        if (combined.length <= MAX_FILENAME_LENGTH) {
            return `${combined}.pdf`;
        }
    }

    return `merged-${originalFilenames.length}-files.pdf`;
}

export function ResultPreview({
    mergedBlob,
    totalPages,
    originalFilenames,
    previewThumbnails = [],
    onStartOver,
}: ResultPreviewProps) {
    const [showFileList, setShowFileList] = useState(false);

    const mergedFilename = useMemo(
        () => getMergedFilename(originalFilenames),
        [originalFilenames]
    );

    const stackThumbnails = previewThumbnails.slice(0, 3);

    const handleDownload = () => {
        downloadBlob(mergedBlob, mergedFilename);
    };

    return (
        <div className={styles.resultContainer} role="status" aria-live="polite">
            {stackThumbnails.length > 0 ? (
                <div className={styles.thumbStack}>
                    {stackThumbnails.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt=""
                            className={styles.thumbStackImage}
                            style={{ '--i': i } as React.CSSProperties}
                        />
                    ))}
                    <span className={styles.thumbStackBadge}>
                        <i className="ti ti-check" aria-hidden="true" />
                    </span>
                </div>
            ) : (
                <div className={styles.successIconWrapper}>
                    <div className={styles.successRing} />
                    <div className={styles.resultIcon}>
                        <i className="ti ti-check" aria-hidden="true" />
                    </div>
                </div>
            )}

            <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>Your PDF is ready</h3>
                <p className={styles.resultDesc}>
                    {originalFilenames.length} files combined into a {totalPages}-page document
                </p>
            </div>

            <div className={styles.filePreviewCard}>
                <div className={styles.fileIconBox}>
                    <i className="ti ti-file-type-pdf" aria-hidden="true" />
                </div>

                <div className={styles.filePreviewInfo}>
                    <span className={styles.filePreviewName} title={mergedFilename}>
                        {mergedFilename}
                    </span>
                    <div className={styles.metaRow}>
                        <span className={styles.metaItem}>
                            <i className="ti ti-files" aria-hidden="true" />
                            {totalPages} page{totalPages !== 1 ? 's' : ''}
                        </span>
                        <span className={styles.metaDivider} />
                        <span className={styles.metaItem}>
                            <i className="ti ti-database" aria-hidden="true" />
                            {formatFileSize(mergedBlob.size)}
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className={styles.downloadBtn}
                onClick={handleDownload}
            >
                <i className="ti ti-download" aria-hidden="true" />
                <span>Download Merged PDF</span>
            </button>

            <div className={styles.secondaryActions}>
                <button
                    type="button"
                    className={styles.filesToggle}
                    onClick={() => setShowFileList((v) => !v)}
                    aria-expanded={showFileList}
                >
                    <i className={`ti ti-chevron-${showFileList ? 'up' : 'down'}`} aria-hidden="true" />
                    <span>{showFileList ? 'Hide' : 'View'} merged files ({originalFilenames.length})</span>
                </button>

                <button
                    type="button"
                    className={styles.startOverBtn}
                    onClick={onStartOver}
                >
                    <i className="ti ti-refresh" aria-hidden="true" />
                    <span>Merge More Files</span>
                </button>
            </div>

            {showFileList && (
                <div className={styles.fileListDetails}>
                    {originalFilenames.map((name, index) => (
                        <div key={`${name}-${index}`} className={styles.fileListItem}>
                            <span className={styles.fileListOrder}>{index + 1}</span>
                            <i className="ti ti-file-type-pdf" aria-hidden="true" />
                            <span className={styles.fileListName} title={name}>{name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}