/* features/pdf/jpg-to-pdf/ResultPreview.tsx */
"use client";

import { useMemo, useState } from 'react';
import { formatFileSize, downloadBlob } from '../shared/ts/pdfFileUtils';
import styles from './style/ResultPreview.module.css';

type ResultPreviewProps = {
    pdfBlob: Blob;
    pageCount: number;
    originalFilenames: string[];
    previewThumbnails?: string[];
    partialFailureCount?: number;
    onStartOver: () => void;
};

export function getResultFilename(originalFilenames: string[]): string {
    if (originalFilenames.length === 1) {
        const dotIndex = originalFilenames[0].lastIndexOf('.');
        const baseName = dotIndex > 0 ? originalFilenames[0].slice(0, dotIndex) : originalFilenames[0];
        return `${baseName}.pdf`;
    }
    return `converted-images-${originalFilenames.length}-pages.pdf`;
}

export function ResultPreview({
    pdfBlob,
    pageCount,
    originalFilenames,
    previewThumbnails = [],
    partialFailureCount = 0,
    onStartOver
}: ResultPreviewProps) {
    const [showFileList, setShowFileList] = useState(false);

    const pdfFilename = useMemo(
        () => getResultFilename(originalFilenames),
        [originalFilenames]
    );

    const stackThumbnails = previewThumbnails.slice(0, 3);

    const handleDownload = () => {
        downloadBlob(pdfBlob, pdfFilename);
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
                    {originalFilenames.length} image{originalFilenames.length !== 1 ? 's' : ''} converted to a {pageCount}-page PDF
                </p>
            </div>

            {partialFailureCount > 0 && (
                <div className={styles.partialWarning}>
                    <i className="ti ti-alert-triangle" aria-hidden="true" />
                    <span>
                        {partialFailureCount} image{partialFailureCount !== 1 ? 's' : ''} could not be added and {partialFailureCount !== 1 ? 'were' : 'was'} skipped
                    </span>
                </div>
            )}

            <div className={styles.filePreviewCard}>
                <div className={styles.fileIconBox}>
                    <i className="ti ti-file-type-pdf" aria-hidden="true" />
                </div>

                <div className={styles.filePreviewInfo}>
                    <span className={styles.filePreviewName} title={pdfFilename}>
                        {pdfFilename}
                    </span>
                    <div className={styles.metaRow}>
                        <span className={styles.metaItem}>
                            <i className="ti ti-files" aria-hidden="true" />
                            {pageCount} page{pageCount !== 1 ? 's' : ''}
                        </span>
                        <span className={styles.metaDivider} />
                        <span className={styles.metaItem}>
                            <i className="ti ti-database" aria-hidden="true" />
                            {formatFileSize(pdfBlob.size)}
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
                <span>Download PDF</span>
            </button>

            <div className={styles.secondaryActions}>
                <button
                    type="button"
                    className={styles.filesToggle}
                    onClick={() => setShowFileList(v => !v)}
                    aria-expanded={showFileList}
                >
                    <i className={`ti ti-chevron-${showFileList ? 'up' : 'down'}`} aria-hidden="true" />
                    <span>{showFileList ? 'Hide' : 'View'} source images ({originalFilenames.length})</span>
                </button>

                <button
                    type="button"
                    className={styles.startOverBtn}
                    onClick={onStartOver}
                >
                    <i className="ti ti-refresh" aria-hidden="true" />
                    <span>Convert More Images</span>
                </button>
            </div>

            {showFileList && (
                <div className={styles.fileListDetails}>
                    {originalFilenames.map((name, index) => (
                        <div key={`${name}-${index}`} className={styles.fileListItem}>
                            <span className={styles.fileListOrder}>{index + 1}</span>
                            <i className="ti ti-photo" aria-hidden="true" />
                            <span className={styles.fileListName} title={name}>{name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}