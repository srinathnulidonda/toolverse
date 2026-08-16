/* features/pdf/jpg-to-pdf/SettingsPanel.tsx */
"use client";

import {
    PAGE_SIZE_OPTIONS,
    ORIENTATION_OPTIONS,
    MARGIN_OPTIONS,
    IMAGE_FIT_OPTIONS,
} from "./ts/jpgToPdfConfig";
import type { PageSize, Orientation, Margin, ImageFit } from "./ts/jpgToPdfEngine";
import styles from "./style/SettingsPanel.module.css";

interface SettingsPanelProps {
    pageSize: PageSize;
    orientation: Orientation;
    margin: Margin;
    imageFit: ImageFit;
    onPageSizeChange: (value: PageSize) => void;
    onOrientationChange: (value: Orientation) => void;
    onMarginChange: (value: Margin) => void;
    onImageFitChange: (value: ImageFit) => void;
    disabled?: boolean;
}

const PAGE_SIZE_ICONS: Record<PageSize, string> = {
    a4: 'ti-file-text',
    letter: 'ti-file-description',
    'fit-to-image': 'ti-photo',
};

const ORIENTATION_ICONS: Record<Orientation, string> = {
    auto: 'ti-wand',
    portrait: 'ti-crop-portrait',
    landscape: 'ti-crop-landscape',
};

const MARGIN_ICONS: Record<Margin, string> = {
    none: 'ti-square',
    small: 'ti-square-rounded',
    large: 'ti-square-rounded-plus',
};

const IMAGE_FIT_ICONS: Record<ImageFit, string> = {
    fit: 'ti-aspect-ratio',
    fill: 'ti-arrows-maximize',
};

export function SettingsPanel({
    pageSize,
    orientation,
    margin,
    imageFit,
    onPageSizeChange,
    onOrientationChange,
    onMarginChange,
    onImageFitChange,
    disabled = false,
}: SettingsPanelProps) {
    return (
        <div className={styles.settingsPanel} role="region" aria-label="PDF Layout Settings">
            <div className={styles.settingsSection}>
                <h3 className={styles.settingsHeading}>
                    <i className="ti ti-layout" aria-hidden="true" />
                    Page Size
                </h3>
                <div className={styles.cardGrid} role="radiogroup" aria-label="Page size">
                    {PAGE_SIZE_OPTIONS.map((option) => {
                        const isSelected = pageSize === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                className={`${styles.optionCard}${isSelected ? ` ${styles.optionCardSelected}` : ''}`}
                                onClick={() => onPageSizeChange(option.value)}
                                disabled={disabled}
                            >
                                <span className={styles.optionIcon}>
                                    <i className={`ti ${PAGE_SIZE_ICONS[option.value]}`} aria-hidden="true" />
                                </span>
                                <span className={styles.optionLabel}>{option.label}</span>
                                <span className={styles.optionDesc}>{option.description}</span>
                                <span className={styles.optionCheck}>
                                    <i className="ti ti-check" aria-hidden="true" />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.settingsSection}>
                <h3 className={styles.settingsHeading}>
                    <i className="ti ti-rotate-2" aria-hidden="true" />
                    Orientation
                </h3>
                <div className={styles.cardGrid} role="radiogroup" aria-label="Orientation">
                    {ORIENTATION_OPTIONS.map((option) => {
                        const isSelected = orientation === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                className={`${styles.optionCard}${isSelected ? ` ${styles.optionCardSelected}` : ''}`}
                                onClick={() => onOrientationChange(option.value)}
                                disabled={disabled}
                            >
                                <span className={styles.optionIcon}>
                                    <i className={`ti ${ORIENTATION_ICONS[option.value]}`} aria-hidden="true" />
                                </span>
                                <span className={styles.optionLabel}>{option.label}</span>
                                <span className={styles.optionDesc}>{option.description}</span>
                                <span className={styles.optionCheck}>
                                    <i className="ti ti-check" aria-hidden="true" />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.settingsGrid}>
                <div className={styles.settingsSection}>
                    <h3 className={styles.settingsHeading}>
                        <i className="ti ti-spacing-horizontal" aria-hidden="true" />
                        Margin
                    </h3>
                    <div className={styles.listGroup} role="radiogroup" aria-label="Margin">
                        {MARGIN_OPTIONS.map((option) => {
                            const isSelected = margin === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    className={`${styles.listItem}${isSelected ? ` ${styles.listItemSelected}` : ''}`}
                                    onClick={() => onMarginChange(option.value)}
                                    disabled={disabled}
                                >
                                    <span className={styles.listIcon}>
                                        <i className={`ti ${MARGIN_ICONS[option.value]}`} aria-hidden="true" />
                                    </span>
                                    <span className={styles.listText}>
                                        <strong>{option.label}</strong>
                                        <span>{option.description}</span>
                                    </span>
                                    <span className={styles.listCheck}>
                                        <i className="ti ti-check" aria-hidden="true" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.settingsSection}>
                    <h3 className={styles.settingsHeading}>
                        <i className="ti ti-aspect-ratio" aria-hidden="true" />
                        Image Fit
                    </h3>
                    <div className={styles.listGroup} role="radiogroup" aria-label="Image fit">
                        {IMAGE_FIT_OPTIONS.map((option) => {
                            const isSelected = imageFit === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    className={`${styles.listItem}${isSelected ? ` ${styles.listItemSelected}` : ''}`}
                                    onClick={() => onImageFitChange(option.value)}
                                    disabled={disabled}
                                >
                                    <span className={styles.listIcon}>
                                        <i className={`ti ${IMAGE_FIT_ICONS[option.value]}`} aria-hidden="true" />
                                    </span>
                                    <span className={styles.listText}>
                                        <strong>{option.label}</strong>
                                        <span>{option.description}</span>
                                    </span>
                                    <span className={styles.listCheck}>
                                        <i className="ti ti-check" aria-hidden="true" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}