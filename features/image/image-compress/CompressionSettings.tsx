// features/image/image-compress/CompressionSettings.tsx
"use client";

import { useMemo } from "react";
import {
    QUALITY_PRESETS,
    QUALITY_ORDER,
    OUTPUT_FORMAT_OPTIONS,
    type CompressionQuality,
    type OutputFormat,
} from "./ts/compressRules.config";
import styles from "./style/CompressionSettings.module.css";

type CompressionSettingsProps = {
    hasPng: boolean;
    hasLossy: boolean;
    quality: CompressionQuality;
    outputFormat: OutputFormat;
    onQualityChange: (quality: CompressionQuality) => void;
    onOutputFormatChange: (format: OutputFormat) => void;
    disabled?: boolean;
};

const FORMAT_ICONS: Record<OutputFormat, string> = {
    original: "ti-photo",
    jpeg: "ti-file-type-jpg",
    png: "ti-file-type-png",
    webp: "ti-webhook",
};

const FORMAT_SHORT_LABELS: Record<OutputFormat, string> = {
    original: "Original",
    jpeg: "JPEG",
    png: "PNG",
    webp: "WebP",
};

export function CompressionSettings({
    hasPng,
    hasLossy,
    quality,
    outputFormat,
    onQualityChange,
    onOutputFormatChange,
    disabled = false,
}: CompressionSettingsProps) {
    const targetsPngOnly = useMemo(
        () => outputFormat === "png" || (outputFormat === "original" && hasPng && !hasLossy),
        [outputFormat, hasPng, hasLossy]
    );
    const isQualityDisabled = disabled || targetsPngOnly;
    const showMixedNote = outputFormat === "original" && hasPng && hasLossy && !disabled;
    const showNote = isQualityDisabled || showMixedNote;

    return (
        <div className={styles.panel} role="region" aria-label="Compression settings">
            <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Quality</span>

                <div
                    className={`${styles.qualityRow}${isQualityDisabled ? ` ${styles.rowDisabled}` : ""}`}
                    role="radiogroup"
                    aria-label="Compression quality"
                >
                    {QUALITY_ORDER.map((q) => {
                        const preset = QUALITY_PRESETS[q];
                        const isSelected = quality === q && !isQualityDisabled;

                        return (
                            <button
                                key={q}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={`${preset.label} quality — ${preset.shortLabel}`}
                                title={preset.description}
                                className={`${styles.qualityBtn}${isSelected ? ` ${styles.qualityBtnActive}` : ""}`}
                                onClick={() => onQualityChange(q)}
                                disabled={isQualityDisabled}
                            >
                                <span className={styles.qualityLabel}>{preset.label}</span>
                                <span className={styles.qualityPercent}>{preset.shortLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Output Format</span>

                <div className={styles.formatRow} role="radiogroup" aria-label="Output format">
                    {OUTPUT_FORMAT_OPTIONS.map((opt) => {
                        const isSelected = outputFormat === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={`${opt.label} — ${opt.description}`}
                                title={opt.description}
                                className={`${styles.formatBtn}${isSelected ? ` ${styles.formatBtnActive}` : ""}`}
                                onClick={() => onOutputFormatChange(opt.value)}
                                disabled={disabled}
                            >
                                <i className={`ti ${FORMAT_ICONS[opt.value]}`} aria-hidden="true" />
                                <span>{FORMAT_SHORT_LABELS[opt.value]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showNote && (
                <p className={styles.infoNote}>
                    <i className="ti ti-info-circle" aria-hidden="true" />
                    {targetsPngOnly
                        ? "PNG is lossless — quality settings won't change these images."
                        : "Quality only applies to JPEG and WebP images in this batch."}
                </p>
            )}
        </div>
    );
}