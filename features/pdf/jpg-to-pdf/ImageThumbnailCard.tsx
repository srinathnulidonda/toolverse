/* features/pdf/jpg-to-pdf/ImageThumbnailCard.tsx */
"use client";

import { formatFileSize } from '@/features/pdf/shared/ts/pdfFileUtils';
import { formatDimensions, type ImageFileInfo } from '@/features/image/shared/ts/imageFileUtils';
import styles from './style/ImageThumbnailCard.module.css';

type ImageThumbnailCardProps = {
    image: ImageFileInfo;
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

export function ImageThumbnailCard({
    image,
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
}: ImageThumbnailCardProps) {
    const isLoading = !image.dataUrl && !image.error;
    const isError = !!image.error;
    const isReady = !!image.dataUrl && !isError;

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
                {isReady && (
                    <span className={styles.orderBadge}>{index + 1}</span>
                )}

                <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={onRemove}
                    disabled={disabled || isLoading}
                    aria-label={`Remove ${image.file.name}`}
                >
                    <i className="ti ti-x" aria-hidden="true" />
                </button>

                <div className={styles.imageWrap}>
                    {isLoading && (
                        <div className={styles.loadingBox}>
                            <i className={`ti ti-loader-2 ${styles.spin}`} aria-hidden="true" />
                            <span>Loading…</span>
                        </div>
                    )}

                    {isError && (
                        <div className={styles.errorBox}>
                            <i className="ti ti-photo-off" aria-hidden="true" />
                        </div>
                    )}

                    {isReady && (
                        <>
                            <img
                                src={image.dataUrl!}
                                alt={`${image.file.name} preview`}
                                className={styles.image}
                            />
                            <div className={styles.scrim} aria-hidden="true" />
                            <div className={styles.infoOverlay}>
                                <span className={styles.fileName} title={image.file.name}>
                                    {image.file.name}
                                </span>
                                {image.dimensions && (
                                    <span className={styles.fileMeta}>
                                        {formatDimensions(image.dimensions)} · {formatFileSize(image.file.size)}
                                    </span>
                                )}
                            </div>

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

            {isError && (
                <div className={styles.errorBelow}>
                    <i className="ti ti-alert-circle" aria-hidden="true" />
                    <span>{image.error}</span>
                </div>
            )}
        </div>
    );
}