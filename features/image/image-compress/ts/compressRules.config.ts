// features/image/image-compress/ts/compressRules.config.ts

export type CompressionQuality = "low" | "medium" | "high";

export type OutputFormat = "original" | "jpeg" | "png" | "webp";

export interface QualityPreset {
    id: CompressionQuality;
    label: string;
    shortLabel: string;
    description: string;
    jpegQuality: number;
    webpQuality: number;
}

export const QUALITY_PRESETS: Record<CompressionQuality, QualityPreset> = {
    low: {
        id: "low",
        label: "Low",
        shortLabel: "50% quality",
        description: "Smallest file size, visible quality loss",
        jpegQuality: 0.5,
        webpQuality: 0.5,
    },
    medium: {
        id: "medium",
        label: "Medium",
        shortLabel: "70% quality",
        description: "Balanced quality and file size",
        jpegQuality: 0.7,
        webpQuality: 0.7,
    },
    high: {
        id: "high",
        label: "High",
        shortLabel: "85% quality",
        description: "Larger file size, minimal quality loss",
        jpegQuality: 0.85,
        webpQuality: 0.85,
    },
};

export const QUALITY_ORDER: CompressionQuality[] = ["low", "medium", "high"];

export interface OutputFormatOption {
    value: OutputFormat;
    label: string;
    description: string;
}

export const OUTPUT_FORMAT_OPTIONS: OutputFormatOption[] = [
    { value: "original", label: "Keep Original", description: "Preserve original format" },
    { value: "jpeg", label: "JPEG", description: "Lossy, no transparency" },
    { value: "png", label: "PNG", description: "Lossless, supports transparency" },
    { value: "webp", label: "WebP", description: "Best compression, modern browsers" },
];

export const DEFAULT_SETTINGS = {
    quality: "medium" as CompressionQuality,
    outputFormat: "original" as OutputFormat,
};

export const LARGE_BATCH_WARNING_BYTES = 50 * 1024 * 1024;