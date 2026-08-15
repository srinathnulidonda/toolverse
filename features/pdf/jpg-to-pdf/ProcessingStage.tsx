/* features/pdf/jpg-to-pdf/ProcessingStage.tsx */
"use client";

import styles from './style/ProcessingStage.module.css';

export type BuildStage = 'preparing' | 'rendering' | 'encoding' | 'finalizing';

type ProcessingStageProps = {
    stage: BuildStage;
    done: number;
    total: number;
};

const STAGE_ORDER: BuildStage[] = ['preparing', 'rendering', 'encoding', 'finalizing'];

const STAGE_META: Record<BuildStage, { label: string; icon: string }> = {
    preparing: { label: 'Preparing images', icon: 'ti-photo-search' },
    rendering: { label: 'Rendering pages', icon: 'ti-layout-grid' },
    encoding: { label: 'Encoding PDF', icon: 'ti-file-type-pdf' },
    finalizing: { label: 'Finalizing', icon: 'ti-sparkles' },
};

export function ProcessingStage({ stage, done, total }: ProcessingStageProps) {
    const currentIndex = STAGE_ORDER.indexOf(stage);
    const meta = STAGE_META[stage];
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const showDetail = (stage === 'rendering' || stage === 'encoding') && total > 0;
    const stageFraction = showDetail ? percent / 100 : 1;
    const overallPercent = Math.min(100, (currentIndex + stageFraction) * 25);

    return (
        <div className={styles.processContainer} role="status" aria-live="polite">
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} aria-hidden="true" />
                <i className={`ti ${meta.icon} ${styles.spinnerIcon}`} aria-hidden="true" />
            </div>

            <div className={styles.stageInfo}>
                <h3 className={styles.stageTitle}>{meta.label}</h3>
                {showDetail && (
                    <p className={styles.stageDetail}>{done} of {total} images</p>
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