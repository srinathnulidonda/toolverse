// features/social/qr-generator/PreviewFab.tsx
"use client";

import type { QrStyle } from "./ts/types";
import QrPreview from "./QrPreview";
import styles from "./style/PreviewFab.module.css";

type PreviewFabProps = {
  data: string;
  style: QrStyle;
  slug: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: (thumbnail: string) => void;
};

export default function PreviewFab({
  data,
  style,
  slug,
  isOpen,
  onOpen,
  onClose,
  onSave,
}: PreviewFabProps) {
  if (!data) return null;

  return (
    <>
      <button
        className={styles.pfabBtn}
        onClick={onOpen}
        aria-label="View QR code preview"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.pfabBtnInner}>
          <i className={`ti ti-qrcode ${styles.pfabIcon}`} aria-hidden="true" />
          <span className={styles.pfabLabel}>View QR code</span>
        </span>
        <span className={styles.pfabArrow} aria-hidden="true">
          <i className="ti ti-chevron-up" />
        </span>
      </button>

      {isOpen && <div className={styles.pfabBackdrop} onClick={onClose} aria-hidden="true" />}

      <div
        className={`${styles.pfabSheet} ${isOpen ? styles.pfabSheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="QR code preview"
      >
        <button className={styles.pfabHandle} onClick={onClose} aria-label="Close preview">
          <span className={styles.pfabHandleBar} />
        </button>

        <div className={styles.pfabSheetHeader}>
          <div className={styles.pfabSheetTitleGroup}>
            <span className={styles.pfabSheetTitle}>Your QR Code</span>
            {data && (
              <span className={styles.pfabSheetLive}>
                <span className={styles.pfabLiveDot} aria-hidden="true" />
                Live preview
              </span>
            )}
          </div>
          <button className={styles.pfabSheetClose} onClick={onClose} aria-label="Close preview">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.pfabSheetBody}>
          <QrPreview data={data} style={style} slug={slug} onSave={onSave} />
        </div>
      </div>
    </>
  );
}