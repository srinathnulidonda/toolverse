/* features/pdf/compress-pdf/FileThumbnailCard.tsx */
"use client";

import { formatFileSize } from '../shared/ts/pdfFileUtils';
import styles from './style/FileThumbnailCard.module.css';

type FileThumbnailCardProps = {
  fileName: string;
  fileSize: number;
  pageCount: number;
  thumbnailDataUrl: string;
  onRemove: () => void;
  disabled?: boolean;
  isCompressed?: boolean;
  compressedSize?: number;
};

export function FileThumbnailCard({
  fileName,
  fileSize,
  pageCount,
  thumbnailDataUrl,
  onRemove,
  disabled = false,
  isCompressed = false,
  compressedSize,
}: FileThumbnailCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.thumbnailStack}>
        <span className={styles.stackLayer} aria-hidden="true" />

        <div className={styles.thumbnail}>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${fileName}`}
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>

          <div className={styles.imageWrap}>
            <img
              src={thumbnailDataUrl}
              alt={`${fileName} preview`}
              className={styles.image}
              loading="lazy"
              draggable={false}
            />
            <span className={styles.cornerFold} aria-hidden="true" />
            <div className={styles.pageBadgeScrim} aria-hidden="true" />
            <span
              className={styles.pageBadge}
              title={`${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`}
            >
              <i className="ti ti-files" aria-hidden="true" />
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.pdfIconBadge}>
            <i className="ti ti-file-type-pdf" aria-hidden="true" />
          </span>
          <span className={styles.fileName} title={fileName}>
            {fileName}
          </span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <i className="ti ti-database" aria-hidden="true" />
            {formatFileSize(fileSize)}
          </span>

          {isCompressed && compressedSize ? (
            <>
              <span className={styles.metaDivider} aria-hidden="true">
                →
              </span>
              <span className={`${styles.metaItem} ${styles.compressedSize}`}>
                <i className="ti ti-database" aria-hidden="true" />
                {formatFileSize(compressedSize)}
              </span>
            </>
          ) : null}

          <span className={styles.spacer} aria-hidden="true" />

          {isCompressed ? (
            <span className={styles.compressedTag}>
              <i className="ti ti-circle-check" aria-hidden="true" />
              Compressed
            </span>
          ) : (
            <span className={styles.readyTag}>
              <i className="ti ti-sparkles" aria-hidden="true" />
              Ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
}