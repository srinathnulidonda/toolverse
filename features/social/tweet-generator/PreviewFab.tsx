// features/social/tweet-generator/PreviewFab.tsx
"use client";

import type { TweetData, TweetStyle } from "./ts/types";
import TweetPreview from "./TweetPreview";
import styles from "./style/PreviewFab.module.css";

type PreviewFabProps = {
  tweetData: TweetData;
  style: TweetStyle;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: (thumbnail: string) => void;
};

export default function PreviewFab({
  tweetData,
  style,
  isOpen,
  onOpen,
  onClose,
  onSave,
}: PreviewFabProps) {
  const hasContent = tweetData.content.text.trim().length > 0;

  if (!hasContent) return null;

  return (
    <>
      <button
        className={styles.pfabBtn}
        onClick={onOpen}
        aria-label="View tweet preview"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.pfabBtnInner}>
          <i className={`ti ti-eye ${styles.pfabIcon}`} aria-hidden="true" />
          <span className={styles.pfabLabel}>View Preview</span>
        </span>
        <span className={styles.pfabArrow} aria-hidden="true">
          <i className="ti ti-chevron-up" />
        </span>
      </button>

      {isOpen && <div className={styles.pfabBackdrop} onClick={onClose} aria-hidden="true" />}

      <div
        className={`${styles.pfabSheet}${isOpen ? ` ${styles.pfabSheetOpen}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Tweet preview"
      >
        <button className={styles.pfabHandle} onClick={onClose} aria-label="Close preview">
          <span className={styles.pfabHandleBar} />
        </button>

        <div className={styles.pfabSheetHeader}>
          <div className={styles.pfabSheetTitleGroup}>
            <span className={styles.pfabSheetTitle}>Tweet Preview</span>
            <span className={styles.pfabSheetLive}>
              <span className={styles.pfabLiveDot} aria-hidden="true" />
              Live
            </span>
          </div>
          <button className={styles.pfabSheetClose} onClick={onClose} aria-label="Close preview">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.pfabSheetBody}>
          <TweetPreview tweetData={tweetData} style={style} onSave={onSave} />
        </div>
      </div>
    </>
  );
}