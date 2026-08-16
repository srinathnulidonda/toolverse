// features/image/image-resize/SettingsPanel.tsx
"use client";

import { useMemo, useState } from "react";
import type { ResizeMode, ResizeFit, OutputFormat, QualityPreset } from "./ts/resizeRules.config";
import {
    RESIZE_PRESETS,
    PRESET_CATEGORIES,
    QUALITY_OPTIONS,
    OUTPUT_FORMAT_OPTIONS,
    FIT_METHOD_OPTIONS,
    PERCENTAGE_QUICK_VALUES,
    MIN_CUSTOM_DIMENSION,
    MAX_CUSTOM_DIMENSION,
    MIN_PERCENTAGE,
    MAX_PERCENTAGE,
} from "./ts/resizeRules.config";
import styles from "./style/SettingsPanel.module.css";

type SettingsPanelProps = {
    mode: ResizeMode;
    presetId: string;
    customWidth: number;
    customHeight: number;
    percentage: number;
    fitMethod: ResizeFit;
    outputFormat: OutputFormat;
    quality: QualityPreset;
    backgroundColor: string;
    upscale: boolean;
    hasPng: boolean;
    hasLossy: boolean;
    onModeChange: (mode: ResizeMode) => void;
    onPresetChange: (id: string) => void;
    onCustomWidthChange: (w: number) => void;
    onCustomHeightChange: (h: number) => void;
    onPercentageChange: (p: number) => void;
    onFitMethodChange: (f: ResizeFit) => void;
    onOutputFormatChange: (f: OutputFormat) => void;
    onQualityChange: (q: QualityPreset) => void;
    onBackgroundColorChange: (c: string) => void;
    onUpscaleChange: (u: boolean) => void;
    disabled?: boolean;
};

const MODE_LABELS: Record<ResizeMode, { label: string; icon: string }> = {
    preset: { label: "Presets", icon: "ti-layout-grid" },
    custom: { label: "Custom", icon: "ti-ruler-2" },
    percentage: { label: "Percentage", icon: "ti-percentage" },
};

const FORMAT_ICONS: Record<OutputFormat, string> = {
    original: "ti-photo",
    jpeg: "ti-file-type-jpg",
    png: "ti-file-type-png",
    webp: "ti-webhook",
};

const FIT_ICONS: Record<ResizeFit, string> = {
    contain: "ti-aspect-ratio",
    cover: "ti-crop",
    fill: "ti-arrows-maximize",
};

function isValidDimension(value: number): boolean {
    return Number.isFinite(value) && value >= MIN_CUSTOM_DIMENSION && value <= MAX_CUSTOM_DIMENSION;
}

function isValidPercentage(value: number): boolean {
    return Number.isFinite(value) && value >= MIN_PERCENTAGE && value <= MAX_PERCENTAGE;
}

export function SettingsPanel({
    mode,
    presetId,
    customWidth,
    customHeight,
    percentage,
    fitMethod,
    outputFormat,
    quality,
    backgroundColor,
    upscale,
    hasPng,
    hasLossy,
    onModeChange,
    onPresetChange,
    onCustomWidthChange,
    onCustomHeightChange,
    onPercentageChange,
    onFitMethodChange,
    onOutputFormatChange,
    onQualityChange,
    onBackgroundColorChange,
    onUpscaleChange,
    disabled = false,
}: SettingsPanelProps) {
    const [aspectLocked, setAspectLocked] = useState(false);
    const [showCustomColor, setShowCustomColor] = useState(false);

    const widthValid = isValidDimension(customWidth);
    const heightValid = isValidDimension(customHeight);
    const percentageValid = isValidPercentage(percentage);

    const targetsPngOnly = useMemo(
        () => outputFormat === "png" || (outputFormat === "original" && hasPng && !hasLossy),
        [outputFormat, hasPng, hasLossy]
    );
    const isQualityDisabled = disabled || targetsPngOnly;
    const showMixedNote = outputFormat === "original" && hasPng && hasLossy && !disabled;
    const showQualityNote = isQualityDisabled || showMixedNote;

    const showBackgroundSection = hasPng || outputFormat === "jpeg" || outputFormat === "original";

    const toggleAspectLock = () => {
        if (!widthValid || !heightValid) return;
        setAspectLocked((prev) => !prev);
    };

    const handleWidthChange = (raw: string) => {
        const value = raw === "" ? NaN : Number(raw);
        if (aspectLocked && widthValid && heightValid && Number.isFinite(value) && customWidth > 0) {
            const ratio = customHeight / customWidth;
            onCustomWidthChange(value);
            onCustomHeightChange(Math.round(value * ratio));
        } else {
            onCustomWidthChange(value);
        }
    };

    const handleHeightChange = (raw: string) => {
        const value = raw === "" ? NaN : Number(raw);
        if (aspectLocked && widthValid && heightValid && Number.isFinite(value) && customHeight > 0) {
            const ratio = customWidth / customHeight;
            onCustomHeightChange(value);
            onCustomWidthChange(Math.round(value * ratio));
        } else {
            onCustomHeightChange(value);
        }
    };

    return (
        <div className={styles.panel} role="region" aria-label="Resize settings">
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                        <i className="ti ti-resize" aria-hidden="true" />
                        Resize Mode
                    </span>
                </div>

                <div className={styles.segmented} role="tablist" aria-label="Resize mode">
                    {(Object.keys(MODE_LABELS) as ResizeMode[]).map((m) => (
                        <button
                            key={m}
                            type="button"
                            role="tab"
                            aria-selected={mode === m}
                            className={`${styles.segmentBtn}${mode === m ? ` ${styles.segmentBtnActive}` : ""}`}
                            onClick={() => onModeChange(m)}
                            disabled={disabled}
                        >
                            {MODE_LABELS[m].label}
                        </button>
                    ))}
                </div>

                {mode === "preset" && (
                    <div className={styles.presetCategory}>
                        {PRESET_CATEGORIES.map((category) => (
                            <div key={category} className={styles.presetCategory}>
                                <span className={styles.presetCategoryLabel}>{category}</span>
                                <div className={styles.presetGrid}>
                                    {RESIZE_PRESETS.filter((p) => p.category === category).map((preset) => {
                                        const isSelected = presetId === preset.id;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                className={`${styles.presetChip}${isSelected ? ` ${styles.presetChipActive}` : ""}`}
                                                onClick={() => onPresetChange(preset.id)}
                                                disabled={disabled}
                                                aria-pressed={isSelected}
                                            >
                                                <span className={styles.presetChipLabel}>{preset.label}</span>
                                                <span className={styles.presetChipDims}>{preset.width}×{preset.height}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {mode === "custom" && (
                    <>
                        <div className={styles.customGrid}>
                            <div className={styles.dimensionField}>
                                <span className={styles.dimensionLabel}>Width</span>
                                <div className={styles.inputWrap}>
                                    <input
                                        type="number"
                                        min={MIN_CUSTOM_DIMENSION}
                                        max={MAX_CUSTOM_DIMENSION}
                                        value={Number.isFinite(customWidth) ? customWidth : ""}
                                        onChange={(e) => handleWidthChange(e.target.value)}
                                        disabled={disabled}
                                        className={styles.dimensionInput}
                                        aria-invalid={!widthValid}
                                    />
                                    <span className={styles.dimensionUnit}>px</span>
                                </div>
                            </div>

                            <span className={styles.dimensionSeparator}>
                                <i className="ti ti-x" aria-hidden="true" />
                            </span>

                            <div className={styles.dimensionField}>
                                <span className={styles.dimensionLabel}>Height</span>
                                <div className={styles.inputWrap}>
                                    <input
                                        type="number"
                                        min={MIN_CUSTOM_DIMENSION}
                                        max={MAX_CUSTOM_DIMENSION}
                                        value={Number.isFinite(customHeight) ? customHeight : ""}
                                        onChange={(e) => handleHeightChange(e.target.value)}
                                        disabled={disabled}
                                        className={styles.dimensionInput}
                                        aria-invalid={!heightValid}
                                    />
                                    <span className={styles.dimensionUnit}>px</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`${styles.aspectLockBtn}${aspectLocked ? ` ${styles.aspectLockBtnActive}` : ""}`}
                                onClick={toggleAspectLock}
                                disabled={disabled || !widthValid || !heightValid}
                                title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                                aria-pressed={aspectLocked}
                                aria-label="Toggle aspect ratio lock"
                            >
                                <i className={`ti ${aspectLocked ? "ti-lock" : "ti-lock-open"}`} aria-hidden="true" />
                            </button>
                        </div>

                        {(!widthValid || !heightValid) && (
                            <span className={styles.fieldError}>
                                <i className="ti ti-alert-circle" aria-hidden="true" />
                                Enter values between {MIN_CUSTOM_DIMENSION} and {MAX_CUSTOM_DIMENSION}px
                            </span>
                        )}
                    </>
                )}

                {mode === "percentage" && (
                    <>
                        <div className={styles.percentageGrid}>
                            <div className={styles.percentageSliderRow}>
                                <input
                                    type="range"
                                    min={10}
                                    max={upscale ? 400 : 100}
                                    step={5}
                                    value={Number.isFinite(percentage) ? Math.min(percentage, upscale ? 400 : 100) : 100}
                                    onChange={(e) => onPercentageChange(Number(e.target.value))}
                                    disabled={disabled}
                                    className={styles.percentageSlider}
                                    aria-label="Resize percentage"
                                />
                                <div className={styles.percentageInputWrap}>
                                    <input
                                        type="number"
                                        min={MIN_PERCENTAGE}
                                        max={MAX_PERCENTAGE}
                                        value={Number.isFinite(percentage) ? percentage : ""}
                                        onChange={(e) => onPercentageChange(Number(e.target.value))}
                                        disabled={disabled}
                                        className={styles.percentageInput}
                                        aria-invalid={!percentageValid}
                                    />
                                    <span className={styles.percentageSuffix}>%</span>
                                </div>
                            </div>

                            <div className={styles.percentagePresets}>
                                {PERCENTAGE_QUICK_VALUES.filter((v) => upscale || v <= 100).map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        className={`${styles.percentageChip}${percentage === v ? ` ${styles.percentageChipActive}` : ""}`}
                                        onClick={() => onPercentageChange(v)}
                                        disabled={disabled}
                                    >
                                        {v}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!percentageValid && (
                            <span className={styles.fieldError}>
                                <i className="ti ti-alert-circle" aria-hidden="true" />
                                Enter a value between {MIN_PERCENTAGE} and {MAX_PERCENTAGE}%
                            </span>
                        )}
                    </>
                )}
            </div>

            {mode !== "percentage" && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>
                            <i className="ti ti-fit-screen" aria-hidden="true" />
                            Fit Method
                        </span>
                    </div>
                    <div className={styles.fitGrid} role="radiogroup" aria-label="Fit method">
                        {FIT_METHOD_OPTIONS.map((opt) => {
                            const isSelected = fitMethod === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    className={`${styles.fitOption}${isSelected ? ` ${styles.fitOptionActive}` : ""}`}
                                    onClick={() => onFitMethodChange(opt.value)}
                                    disabled={disabled}
                                    title={opt.description}
                                >
                                    <span className={styles.fitIconWrap}>
                                        <i className={`ti ${FIT_ICONS[opt.value]}`} aria-hidden="true" />
                                    </span>
                                    <span className={styles.fitLabel}>{opt.label}</span>
                                    <span className={styles.fitDesc}>{opt.description}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                        <i className="ti ti-file-type" aria-hidden="true" />
                        Output Format
                    </span>
                </div>
                <div className={styles.formatRow} role="radiogroup" aria-label="Output format">
                    {OUTPUT_FORMAT_OPTIONS.map((opt) => {
                        const isSelected = outputFormat === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                className={`${styles.formatBtn}${isSelected ? ` ${styles.formatBtnActive}` : ""}`}
                                onClick={() => onOutputFormatChange(opt.value)}
                                disabled={disabled}
                                title={opt.description}
                            >
                                <i className={`ti ${FORMAT_ICONS[opt.value]}`} aria-hidden="true" />
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                        <i className="ti ti-adjustments" aria-hidden="true" />
                        Quality
                    </span>
                </div>
                <div
                    className={`${styles.qualityRow}${isQualityDisabled ? ` ${styles.rowDisabled}` : ""}`}
                    role="radiogroup"
                    aria-label="Output quality"
                >
                    {QUALITY_OPTIONS.map((opt) => {
                        const isSelected = quality === opt.id && !isQualityDisabled;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                className={`${styles.qualityBtn}${isSelected ? ` ${styles.qualityBtnActive}` : ""}`}
                                onClick={() => onQualityChange(opt.id)}
                                disabled={isQualityDisabled}
                                title={opt.description}
                            >
                                <span className={styles.qualityLabel}>{opt.label}</span>
                                <span className={styles.qualityPercent}>{opt.shortLabel}</span>
                            </button>
                        );
                    })}
                </div>
                {showQualityNote && (
                    <p className={styles.infoNote}>
                        <i className="ti ti-info-circle" aria-hidden="true" />
                        {targetsPngOnly
                            ? "PNG is lossless — quality settings won't change these images."
                            : "Quality only applies to JPEG and WebP images in this batch."}
                    </p>
                )}
            </div>

            {showBackgroundSection && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>
                            <i className="ti ti-palette" aria-hidden="true" />
                            Background
                        </span>
                    </div>
                    <div className={styles.colorGrid}>
                        <button
                            type="button"
                            className={`${styles.colorSwatch} ${styles.colorSwatchTransparent}${backgroundColor === "transparent" ? ` ${styles.colorSwatchActive}` : ""}`}
                            onClick={() => onBackgroundColorChange("transparent")}
                            disabled={disabled || outputFormat === "jpeg"}
                            aria-label="Transparent background"
                            aria-pressed={backgroundColor === "transparent"}
                        />
                        <button
                            type="button"
                            className={`${styles.colorSwatch}${backgroundColor === "#ffffff" ? ` ${styles.colorSwatchActive}` : ""}`}
                            style={{ background: "#ffffff" }}
                            onClick={() => onBackgroundColorChange("#ffffff")}
                            disabled={disabled}
                            aria-label="White background"
                            aria-pressed={backgroundColor === "#ffffff"}
                        />
                        <button
                            type="button"
                            className={`${styles.colorSwatch}${backgroundColor === "#000000" ? ` ${styles.colorSwatchActive}` : ""}`}
                            style={{ background: "#000000" }}
                            onClick={() => onBackgroundColorChange("#000000")}
                            disabled={disabled}
                            aria-label="Black background"
                            aria-pressed={backgroundColor === "#000000"}
                        />
                        <button
                            type="button"
                            className={styles.colorCustomTrigger}
                            onClick={() => setShowCustomColor((prev) => !prev)}
                            disabled={disabled}
                            aria-expanded={showCustomColor}
                        >
                            <i className="ti ti-color-picker" aria-hidden="true" />
                            Custom
                        </button>
                    </div>

                    {showCustomColor && (
                        <div className={styles.colorHexRow}>
                            <input
                                type="color"
                                value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
                                onChange={(e) => onBackgroundColorChange(e.target.value)}
                                className={styles.colorInput}
                                disabled={disabled}
                                aria-label="Custom background color picker"
                            />
                            <input
                                type="text"
                                value={backgroundColor === "transparent" ? "" : backgroundColor}
                                onChange={(e) => onBackgroundColorChange(e.target.value)}
                                placeholder="#RRGGBB"
                                className={styles.colorHexInput}
                                disabled={disabled}
                                aria-label="Custom background hex value"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className={styles.section}>
                <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                        <span className={styles.toggleTitle}>Allow Upscaling</span>
                        <span className={styles.toggleDesc}>Enlarge images beyond their original size</span>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={upscale}
                            onChange={(e) => onUpscaleChange(e.target.checked)}
                            disabled={disabled}
                            aria-label="Allow upscaling"
                        />
                        <span className={styles.switchTrack} aria-hidden="true" />
                        <span className={styles.switchThumb} aria-hidden="true" />
                    </label>
                </div>
            </div>
        </div>
    );
}