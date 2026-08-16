// features/image/remove-bg/ProcessingStage.tsx
"use client";

import styles from "./style/ProcessingStage.module.css";
import type { RemoveBgPhase } from "./ts/removeBgEngine";

type ProcessingStageProps = {
    phase: RemoveBgPhase;
    percent: number;
    fileName?: string;
    onCancel: () => void;
};

const PHASES: { id: RemoveBgPhase; label: string; icon: string }[] = [
    { id: "uploading", label: "Upload", icon: "ti-upload" },
    { id: "processing", label: "AI Process", icon: "ti-sparkles" },
    { id: "finalizing", label: "Finalize", icon: "ti-check" },
];

const PHASE_TITLES: Record<RemoveBgPhase, string> = {
    uploading: "Uploading your image",
    processing: "Removing the background",
    finalizing: "Almost done",
};

export function ProcessingStage({ phase, percent, fileName, onCancel }: ProcessingStageProps) {
    const phaseIndex = PHASES.findIndex((p) => p.id === phase);

    return (
        <div className={styles.processContainer} role="status" aria-live="polite">
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} aria-hidden="true" />
                <i className={`ti ti-eraser ${styles.spinnerIcon}`} aria-hidden="true" />
            </div>

            <div className={styles.stageInfo}>
                <h3 className={styles.stageTitle}>{PHASE_TITLES[phase]}</h3>
                {fileName && <p className={styles.stageDetail}>{fileName}</p>}
            </div>

            <div className={styles.phaseSteps}>
                {PHASES.map((p, i) => (
                    <div key={p.id} style={{ display: "contents" }}>
                        <div
                            className={`${styles.phaseStep}${i === phaseIndex ? ` ${styles.phaseStepActive}` : ""}${i < phaseIndex ? ` ${styles.phaseStepDone}` : ""}`}
                        >
                            <div className={styles.phaseDot}>
                                <i className={`ti ${i < phaseIndex ? "ti-check" : p.icon}`} aria-hidden="true" />
                            </div>
                            <span className={styles.phaseLabel}>{p.label}</span>
                        </div>
                        {i < PHASES.length - 1 && (
                            <div className={`${styles.phaseLine}${i < phaseIndex ? ` ${styles.phaseLineDone}` : ""}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>

            <span className={styles.progressPercent}>{percent}%</span>

            <p className={styles.hint}>
                <i className="ti ti-shield-lock" aria-hidden="true" />
                Your image is processed securely
            </p>

            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                <i className="ti ti-x" aria-hidden="true" />
                Cancel
            </button>
        </div>
    );
}