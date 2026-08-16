// features/pdf/merge-pdf/ProcessingStage.tsx
"use client";

import type { MergeStage } from './ts/mergeEngine';
import styles from './style/ProcessingStage.module.css';

type ProcessingStageProps = {
    stage: MergeStage;
    done: number;
    total: number;
};

const STAGE_ORDER: MergeStage[] = ['reading', 'merging', 'finalizing'];

const STAGE_META: Record<MergeStage, { label: string; icon: string }> = {
    reading: { label: 'Reading files', icon: 'ti-file-search' },
    merging: { label: 'Merging pages', icon: 'ti-stack-2' },
    finalizing: { label: 'Finalizing PDF', icon: 'ti-sparkles' },
};

export function ProcessingStage({ stage, done, total }: ProcessingStageProps) {
    const currentIndex = STAGE_ORDER.indexOf(stage);
    const meta = STAGE_META[stage];
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const showDetail = stage === 'merging' && total > 0;
    const overallPercent = total > 0 ? Math.round(((currentIndex + (showDetail ? percent / 100 : 1)) / STAGE_ORDER.length) * 100) : 0;

    return (
        <div className={styles.processContainer} role="status" aria-live="polite">
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} aria-hidden="true" />
                <i className={`ti ${meta.icon} ${styles.spinnerIcon}`} aria-hidden="true" />
            </div>

            <div className={styles.stageInfo}>
                <h3 className={styles.stageTitle}>{meta.label}</h3>
                {showDetail ? (
                    <p className={styles.stageDetail}>{done} of {total} files processed</p>
                ) : (
                    <p className={styles.stageDetail}>Step {currentIndex + 1} of {STAGE_ORDER.length}</p>
                )}
            </div>

            <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${overallPercent}%` }} />
            </div>

            <div className={styles.stepsRow}>
                {STAGE_ORDER.map((stageId, index) => {
                    const stepState = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';
                    return (
                        <div key={stageId} className={`${styles.step} ${styles[stepState]}`}>
                            <span className={styles.stepDot}>
                                {stepState === 'done' && <i className="ti ti-check" aria-hidden="true" />}
                            </span>
                            <span className={styles.stepLabel}>{STAGE_META[stageId].label}</span>
                        </div>
                    );
                })}
            </div>

            <p className={styles.hint}>
                <i className="ti ti-shield-lock" aria-hidden="true" />
                Everything is processed locally in your browser
            </p>
        </div>
    );
}