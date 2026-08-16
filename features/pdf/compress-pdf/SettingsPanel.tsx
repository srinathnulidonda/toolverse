/* features/pdf/compress-pdf/SettingsPanel.tsx */
"use client";

import { COMPRESSION_LEVELS, COMPRESSION_LEVEL_ORDER, type CompressionLevel } from './ts/compressRules.config';
import styles from './style/SettingsPanel.module.css';

type SettingsPanelProps = {
    selectedLevel: CompressionLevel;
    onLevelChange: (level: CompressionLevel) => void;
    disabled?: boolean;
};

const LEVEL_ICONS = ['ti-feather', 'ti-adjustments-horizontal', 'ti-compress', 'ti-flame'];

export function SettingsPanel({
    selectedLevel,
    onLevelChange,
    disabled = false
}: SettingsPanelProps) {
    const recommendedIndex = Math.floor((COMPRESSION_LEVEL_ORDER.length - 1) / 2);

    return (
        <div className={styles.settingsPanel}>
            <div className={styles.settingsHead}>
                <h3 className={styles.settingsHeading}>
                    <i className="ti ti-adjustments" aria-hidden="true" />
                    Compression Level
                </h3>
                <p className={styles.settingsDesc}>
                    Choose your quality vs. file size tradeoff
                </p>
            </div>

            <div className={styles.levelGrid} role="radiogroup" aria-label="Compression level">
                {COMPRESSION_LEVEL_ORDER.map((levelId, index) => {
                    const level = COMPRESSION_LEVELS[levelId];
                    const isSelected = selectedLevel === levelId;
                    const icon = LEVEL_ICONS[index] ?? 'ti-settings';

                    return (
                        <button
                            key={levelId}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`${styles.levelCard}${isSelected ? ` ${styles.levelCardSelected}` : ''}`}
                            onClick={() => onLevelChange(levelId)}
                            disabled={disabled}
                        >
                            {index === recommendedIndex && (
                                <span className={styles.recommendedBadge}>Recommended</span>
                            )}

                            <span className={styles.levelIconCircle}>
                                <i className={`ti ${icon}`} aria-hidden="true" />
                            </span>

                            <span className={styles.levelLabel}>{level.label}</span>
                            <p className={styles.levelDesc}>{level.description}</p>

                            <span className={styles.levelCheck}>
                                <i className="ti ti-check" aria-hidden="true" />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}