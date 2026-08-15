// features/image/image-resize/ts/resizeRules.config.ts
export type ResizeMode = "preset" | "custom" | "percentage";
export type ResizeFit = "contain" | "cover" | "fill";
export type OutputFormat = "original" | "jpeg" | "png" | "webp";
export type QualityPreset = "low" | "medium" | "high";

export interface ResizePreset {
    id: string;
    label: string;
    width: number;
    height: number;
    category: string;
}

export interface QualityOption {
    id: QualityPreset;
    label: string;
    shortLabel: string;
    value: number;
    description: string;
}

export interface ResizeSettings {
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
}

export const RESIZE_PRESETS: ResizePreset[] = [
    { id: "icon-16", label: "16×16", width: 16, height: 16, category: "Icons" },
    { id: "icon-32", label: "32×32", width: 32, height: 32, category: "Icons" },
    { id: "icon-64", label: "64×64", width: 64, height: 64, category: "Icons" },
    { id: "icon-128", label: "128×128", width: 128, height: 128, category: "Icons" },
    { id: "icon-256", label: "256×256", width: 256, height: 256, category: "Icons" },
    { id: "icon-512", label: "512×512", width: 512, height: 512, category: "Icons" },
    { id: "social-avatar-256", label: "256×256", width: 256, height: 256, category: "Social" },
    { id: "social-post-1080", label: "1080×1080", width: 1080, height: 1080, category: "Social" },
    { id: "social-story-1080x1920", label: "1080×1920", width: 1080, height: 1920, category: "Social" },
    { id: "screen-1920x1080", label: "1920×1080", width: 1920, height: 1080, category: "Screens" },
    { id: "screen-800x600", label: "800×600", width: 800, height: 600, category: "Screens" },
    { id: "thumbnail-300x200", label: "300×200", width: 300, height: 200, category: "Thumbnails" },
];

export const PRESET_CATEGORIES: string[] = Array.from(
    new Set(RESIZE_PRESETS.map((p) => p.category))
);

export const QUALITY_OPTIONS: QualityOption[] = [
    { id: "low", label: "Low", shortLabel: "50%", value: 0.5, description: "Smallest file size" },
    { id: "medium", label: "Medium", shortLabel: "70%", value: 0.7, description: "Balanced quality" },
    { id: "high", label: "High", shortLabel: "85%", value: 0.85, description: "Best quality" },
];

export const OUTPUT_FORMAT_OPTIONS: { value: OutputFormat; label: string; description: string }[] = [
    { value: "original", label: "Original", description: "Preserve original format" },
    { value: "jpeg", label: "JPEG", description: "Lossy, no transparency" },
    { value: "png", label: "PNG", description: "Lossless, supports transparency" },
    { value: "webp", label: "WebP", description: "Best compression, modern" },
];

export const FIT_METHOD_OPTIONS: { value: ResizeFit; label: string; description: string; icon: string }[] = [
    { value: "contain", label: "Contain", description: "Fit inside, keep full image", icon: "ti-aspect-ratio" },
    { value: "cover", label: "Cover", description: "Fill box, crop excess", icon: "ti-crop" },
    { value: "fill", label: "Fill", description: "Stretch to exact size", icon: "ti-arrows-maximize" },
];

export const PERCENTAGE_QUICK_VALUES: number[] = [25, 50, 75, 150, 200];

export const MIN_CUSTOM_DIMENSION = 1;
export const MAX_CUSTOM_DIMENSION = 10000;
export const MIN_PERCENTAGE = 1;
export const MAX_PERCENTAGE = 1000;

export const LARGE_BATCH_WARNING_BYTES = 60 * 1024 * 1024;

export const DEFAULT_SETTINGS: ResizeSettings = {
    mode: "preset",
    presetId: "social-avatar-256",
    customWidth: 800,
    customHeight: 600,
    percentage: 50,
    fitMethod: "contain",
    outputFormat: "original",
    quality: "medium",
    backgroundColor: "#ffffff",
    upscale: false,
};