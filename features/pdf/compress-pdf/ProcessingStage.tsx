/* features/pdf/compress-pdf/ProcessingStage.tsx */
"use client";

import type { CompressProgress } from './ts/compressEngine';
import styles from './style/ProcessingStage.module.css';

type ProcessingStageProps = {
    progress: CompressProgress | null;
    fileName: string;
};

type StageId = CompressProgress['stage'];

const STAGE_ORDER: StageId[] = ['loading', 'uploading', 'processing', 'downloading', 'finalizing'];

const STAGE_META: Record<StageId, { label: string; icon: string; percent: number }> = {
    loading: { label: 'Preparing file', icon: 'ti-file-search', percent: 15 },
    uploading: { label: 'Uploading', icon: 'ti-cloud-upload', percent: 40 },
    processing: { label: 'Compressing', icon: 'ti-file-zip', percent: 75 },
    downloading: { label: 'Downloading result', icon: 'ti-cloud-download', percent: 92 },
    finalizing: { label: 'Finalizing', icon: 'ti-sparkles', percent: 100 },
};

export function ProcessingStage({ progress, fileName }: ProcessingStageProps) {
    if (!progress) return null;

    const currentIndex = STAGE_ORDER.indexOf(progress.stage);
    const meta = STAGE_META[progress.stage];
    const showDetail = progress.total > 1;

    return (
        <div className={styles.processContainer} role="status" aria-live="polite">
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} aria-hidden="true" />
                <i className={`ti ${meta.icon} ${styles.spinnerIcon}`} aria-hidden="true" />
            </div>

            <div className={styles.stageInfo}>
                <h3 className={styles.stageTitle}>{meta.label}</h3>
                <p className={styles.fileLabel} title={fileName}>{fileName}</p>
                {showDetail && (
                    <p className={styles.stageDetail}>{progress.done} of {progress.total}</p>
                )}
            </div>

            <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${meta.percent}%` }} />
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
                Your file is processed securely and never stored
            </p>
        </div>
    );
}