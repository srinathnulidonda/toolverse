// features/image/image-resize/ProcessingStage.tsx
"use client";

import styles from "./style/ProcessingStage.module.css";

type ProcessingStageProps = {
    current: number;
    total: number;
    currentFileName?: string;
};

export function ProcessingStage({ current, total, currentFileName }: ProcessingStageProps) {
    const safeTotal = total > 0 ? total : 1;
    const percent = Math.min(100, Math.round((current / safeTotal) * 100));

    return (
        <div className={styles.processContainer} role="status" aria-live="polite">
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} aria-hidden="true" />
                <i className={`ti ti-crop ${styles.spinnerIcon}`} aria-hidden="true" />
            </div>

            <div className={styles.stageInfo}>
                <h3 className={styles.stageTitle}>Resizing your images</h3>
                <p className={styles.stageDetail}>
                    {Math.min(current, total)} of {total} done
                    {currentFileName ? ` · ${currentFileName}` : ""}
                </p>
            </div>

            <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>

            <span className={styles.progressPercent}>{percent}%</span>

            <p className={styles.hint}>
                <i className="ti ti-shield-lock" aria-hidden="true" />
                Everything is processed locally in your browser
            </p>
        </div>
    );
}