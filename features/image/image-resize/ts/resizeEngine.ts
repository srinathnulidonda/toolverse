// features/image/image-resize/ts/resizeEngine.ts
import type { ResizeSettings, OutputFormat, QualityPreset } from "./resizeRules.config";
import { QUALITY_OPTIONS, RESIZE_PRESETS } from "./resizeRules.config";
import { loadImageElement, isAcceptedImageType } from "../../shared/ts/imageFileUtils";

export class ImageResizeError extends Error {
    constructor(
        public filename: string,
        public reason: "invalid" | "load-failed" | "too-large" | "encode-failed",
        message?: string
    ) {
        super(message || `Failed to resize image: ${filename}`);
        this.name = "ImageResizeError";
    }
}

export interface ResizeResult {
    blob: Blob;
    originalDimensions: { width: number; height: number };
    resizedDimensions: { width: number; height: number };
    originalSize: number;
    resizedSize: number;
    format: string;
    keptOriginal: boolean;
}

export interface ResizeResultWithError extends ResizeResult {
    id: string;
    filename: string;
    originalDataUrl: string | null;
    error?: string;
}

const MAX_CANVAS_DIMENSION = 16384;
const MAX_CANVAS_AREA = 268435456;

function getOutputMime(format: OutputFormat, originalMime: string): string {
    if (format === "original") return originalMime;
    switch (format) {
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "webp":
            return "image/webp";
        default:
            return originalMime;
    }
}

function getQualityValue(quality: QualityPreset): number {
    const option = QUALITY_OPTIONS.find((o) => o.id === quality);
    return option ? option.value : 0.85;
}

function isFormatLossy(mime: string): boolean {
    return mime === "image/jpeg" || mime === "image/webp";
}

function assertCanvasSize(filename: string, width: number, height: number) {
    if (
        width > MAX_CANVAS_DIMENSION ||
        height > MAX_CANVAS_DIMENSION ||
        width * height > MAX_CANVAS_AREA
    ) {
        throw new ImageResizeError(
            filename,
            "too-large",
            `Target size ${width}×${height} is too large to process in your browser.`
        );
    }
}

function computeTargetDimensions(
    filename: string,
    originalWidth: number,
    originalHeight: number,
    settings: ResizeSettings
): { width: number; height: number } {
    if (settings.mode === "percentage") {
        let percent = settings.percentage;
        if (!Number.isFinite(percent) || percent <= 0) percent = 100;
        if (!settings.upscale && percent > 100) percent = 100;
        const width = Math.max(1, Math.round((originalWidth * percent) / 100));
        const height = Math.max(1, Math.round((originalHeight * percent) / 100));
        return { width, height };
    }

    let targetWidth: number;
    let targetHeight: number;

    if (settings.mode === "preset") {
        const preset = RESIZE_PRESETS.find((p) => p.id === settings.presetId);
        if (!preset) {
            throw new ImageResizeError(filename, "invalid", "Invalid preset selected.");
        }
        targetWidth = preset.width;
        targetHeight = preset.height;
    } else {
        targetWidth = Math.round(settings.customWidth);
        targetHeight = Math.round(settings.customHeight);
        if (
            !Number.isFinite(targetWidth) ||
            !Number.isFinite(targetHeight) ||
            targetWidth < 1 ||
            targetHeight < 1
        ) {
            throw new ImageResizeError(filename, "invalid", "Enter valid custom width and height.");
        }
    }

    if (!settings.upscale && (targetWidth > originalWidth || targetHeight > originalHeight)) {
        const scale = Math.min(1, originalWidth / targetWidth, originalHeight / targetHeight);
        targetWidth = Math.max(1, Math.round(targetWidth * scale));
        targetHeight = Math.max(1, Math.round(targetHeight * scale));
    }

    return { width: targetWidth, height: targetHeight };
}

function getDrawDimensionsAndPosition(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    fitMethod: ResizeSettings["fitMethod"]
): { drawWidth: number; drawHeight: number; x: number; y: number } {
    if (fitMethod === "fill") {
        return { drawWidth: targetWidth, drawHeight: targetHeight, x: 0, y: 0 };
    }

    const originalAspect = originalWidth / originalHeight;
    const targetAspect = targetWidth / targetHeight;

    if (fitMethod === "contain") {
        if (originalAspect > targetAspect) {
            const drawWidth = targetWidth;
            const drawHeight = drawWidth / originalAspect;
            return { drawWidth, drawHeight, x: 0, y: (targetHeight - drawHeight) / 2 };
        }
        const drawHeight = targetHeight;
        const drawWidth = drawHeight * originalAspect;
        return { drawWidth, drawHeight, x: (targetWidth - drawWidth) / 2, y: 0 };
    }

    if (originalAspect > targetAspect) {
        const drawHeight = targetHeight;
        const drawWidth = drawHeight * originalAspect;
        return { drawWidth, drawHeight, x: (targetWidth - drawWidth) / 2, y: 0 };
    }
    const drawWidth = targetWidth;
    const drawHeight = drawWidth / originalAspect;
    return { drawWidth, drawHeight, x: 0, y: (targetHeight - drawHeight) / 2 };
}

export async function resizeImage(file: File, settings: ResizeSettings): Promise<ResizeResult> {
    if (!isAcceptedImageType(file)) {
        throw new ImageResizeError(file.name, "invalid", `"${file.name}" is not a supported image format.`);
    }

    let img: HTMLImageElement;
    try {
        img = await loadImageElement(file);
    } catch {
        throw new ImageResizeError(file.name, "load-failed", `Failed to load image: ${file.name}`);
    }

    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    assertCanvasSize(file.name, originalWidth, originalHeight);

    const target = computeTargetDimensions(file.name, originalWidth, originalHeight, settings);
    assertCanvasSize(file.name, target.width, target.height);

    const outputMime = getOutputMime(settings.outputFormat, file.type);

    if (
        target.width === originalWidth &&
        target.height === originalHeight &&
        outputMime === file.type &&
        settings.outputFormat === "original"
    ) {
        return {
            blob: file,
            originalDimensions: { width: originalWidth, height: originalHeight },
            resizedDimensions: { width: originalWidth, height: originalHeight },
            originalSize: file.size,
            resizedSize: file.size,
            format: file.type,
            keptOriginal: true,
        };
    }

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
        throw new ImageResizeError(file.name, "encode-failed", `Failed to create canvas context for ${file.name}`);
    }

    const backgroundColor = settings.backgroundColor;
    const isTransparent = backgroundColor === "transparent";
    if (!isTransparent && backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, target.width, target.height);
    } else if (outputMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, target.width, target.height);
    }

    const { drawWidth, drawHeight, x, y } = getDrawDimensionsAndPosition(
        originalWidth,
        originalHeight,
        target.width,
        target.height,
        settings.fitMethod
    );

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    const quality = isFormatLossy(outputMime) ? getQualityValue(settings.quality) : undefined;

    let blob: Blob;
    try {
        blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error("Canvas encoding returned null"))),
                outputMime,
                quality
            );
        });
    } catch {
        throw new ImageResizeError(file.name, "encode-failed", `Failed to encode image: ${file.name}`);
    }

    return {
        blob,
        originalDimensions: { width: originalWidth, height: originalHeight },
        resizedDimensions: { width: target.width, height: target.height },
        originalSize: file.size,
        resizedSize: blob.size,
        format: outputMime,
        keptOriginal: false,
    };
}