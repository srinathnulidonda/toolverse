// features/pdf/merge-pdf/FileThumbnailCard.tsx
"use client";

import { formatFileSize } from '../shared/ts/pdfFileUtils';
import styles from './style/FileThumbnailCard.module.css';

export type PdfFileInfo = {
    id: string;
    file: File;
    pageCount: number;
    thumbnailDataUrl: string;
    error?: string;
    loading?: boolean;
};

type FileThumbnailCardProps = {
    fileInfo: PdfFileInfo;
    index: number;
    total: number;
    isDragging: boolean;
    isDragOver: boolean;
    disabled?: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function FileThumbnailCard({
    fileInfo,
    index,
    total,
    isDragging,
    isDragOver,
    disabled = false,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onRemove,
    onMoveUp,
    onMoveDown,
}: FileThumbnailCardProps) {
    const isLoading = !!fileInfo.loading;
    const isError = !!fileInfo.error;
    const isReady = !isLoading && !isError;

    return (
        <div className={styles.wrapper}>
            <div
                className={[
                    styles.card,
                    isDragging ? styles.dragging : '',
                    isDragOver ? styles.dragOver : '',
                    isError ? styles.cardError : '',
                    isLoading ? styles.cardLoading : '',
                ].filter(Boolean).join(' ')}
                draggable={isReady && !disabled}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {isReady && <span className={styles.orderBadge}>{index + 1}</span>}

                <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={onRemove}
                    disabled={disabled || isLoading}
                    aria-label={`Remove ${fileInfo.file.name}`}
                >
                    <i className="ti ti-x" aria-hidden="true" />
                </button>

                <div className={styles.thumbWrap}>
                    {isLoading && (
                        <div className={styles.loadingBox}>
                            <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                            <span>Loading…</span>
                        </div>
                    )}

                    {isError && (
                        <div className={styles.errorBox}>
                            <i className="ti ti-file-alert" aria-hidden="true" />
                        </div>
                    )}

                    {isReady && (
                        <>
                            <img
                                src={fileInfo.thumbnailDataUrl}
                                alt={`${fileInfo.file.name} preview`}
                                className={styles.thumbImage}
                            />
                            <span className={styles.pageBadge}>
                                <i className="ti ti-files" aria-hidden="true" />
                                {fileInfo.pageCount}
                            </span>

                            <button
                                type="button"
                                className={`${styles.moveBtn} ${styles.moveBtnLeft}`}
                                onClick={onMoveUp}
                                disabled={disabled || index === 0}
                                aria-label="Move earlier"
                            >
                                <i className="ti ti-chevron-left" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                className={`${styles.moveBtn} ${styles.moveBtnRight}`}
                                onClick={onMoveDown}
                                disabled={disabled || index === total - 1}
                                aria-label="Move later"
                            >
                                <i className="ti ti-chevron-right" aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.meta}>
                <span className={styles.fileName} title={fileInfo.file.name}>
                    {fileInfo.file.name}
                </span>
                {isReady && (
                    <span className={styles.fileSize}>{formatFileSize(fileInfo.file.size)}</span>
                )}
            </div>

            {isError && (
                <div className={styles.errorBelow}>
                    <i className="ti ti-alert-circle" aria-hidden="true" />
                    <span>{fileInfo.error}</span>
                </div>
            )}
        </div>
    );
}