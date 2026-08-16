// features/image/image-compress/ts/compressEngine.ts

import type { CompressionQuality, OutputFormat } from "./compressRules.config";
import { QUALITY_PRESETS } from "./compressRules.config";
import { loadImageElement, isAcceptedImageType } from "../../shared/ts/imageFileUtils";

export class ImageCompressError extends Error {
    constructor(
        public filename: string,
        public reason: "invalid" | "load-failed" | "too-large" | "encode-failed",
        message?: string
    ) {
        super(message || `Failed to compress image: ${filename}`);
        this.name = "ImageCompressError";
    }
}

export interface CompressSettings {
    quality: CompressionQuality;
    outputFormat: OutputFormat;
}

export interface CompressResult {
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    format: string;
    keptOriginal: boolean;
    originalDimensions: { width: number; height: number };
}

export interface CompressResultWithError extends CompressResult {
    id: string;
    filename: string;
    originalDataUrl?: string | null;
    error?: string;
}

const MAX_CANVAS_DIMENSION = 16384;
const MAX_CANVAS_AREA = 268435456;
const KEEP_ORIGINAL_THRESHOLD = 0.02;

function getEffectiveOutputFormat(
    originalMime: string,
    settings: CompressSettings
): "jpeg" | "png" | "webp" {
    if (settings.outputFormat === "original") {
        if (originalMime === "image/jpeg") return "jpeg";
        if (originalMime === "image/webp") return "webp";
        return "png";
    }
    return settings.outputFormat;
}

function getMimeType(format: "jpeg" | "png" | "webp"): string {
    if (format === "jpeg") return "image/jpeg";
    if (format === "webp") return "image/webp";
    return "image/png";
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    format: "jpeg" | "png" | "webp",
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas encoding returned null"));
            },
            getMimeType(format),
            format === "png" ? undefined : quality
        );
    });
}

export async function compressImage(
    file: File,
    settings: CompressSettings
): Promise<CompressResult> {
    if (!isAcceptedImageType(file)) {
        throw new ImageCompressError(
            file.name,
            "invalid",
            `"${file.name}" is not a supported image format.`
        );
    }

    let img: HTMLImageElement;
    try {
        img = await loadImageElement(file);
    } catch {
        throw new ImageCompressError(
            file.name,
            "load-failed",
            `Failed to load image: ${file.name}`
        );
    }

    const width = img.naturalWidth;
    const height = img.naturalHeight;

    if (!width || !height) {
        throw new ImageCompressError(
            file.name,
            "load-failed",
            `"${file.name}" appears to be corrupted or empty.`
        );
    }

    if (
        width > MAX_CANVAS_DIMENSION ||
        height > MAX_CANVAS_DIMENSION ||
        width * height > MAX_CANVAS_AREA
    ) {
        throw new ImageCompressError(
            file.name,
            "too-large",
            `"${file.name}" is too large to process in your browser.`
        );
    }

    const outputFormat = getEffectiveOutputFormat(file.type, settings);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: outputFormat !== "jpeg" });
    if (!ctx) {
        throw new ImageCompressError(
            file.name,
            "encode-failed",
            `Failed to create canvas context for ${file.name}`
        );
    }

    if (outputFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    const preset = QUALITY_PRESETS[settings.quality];
    let quality = 1;
    if (outputFormat === "jpeg") quality = preset.jpegQuality;
    else if (outputFormat === "webp") quality = preset.webpQuality;

    let blob: Blob;
    try {
        blob = await canvasToBlob(canvas, outputFormat, quality);
    } catch {
        throw new ImageCompressError(
            file.name,
            "encode-failed",
            `Failed to encode image: ${file.name}`
        );
    }

    const compressedSize = blob.size;
    const originalSize = file.size;

    const outputMime = getMimeType(outputFormat);
    const isRealFormatChange = file.type !== outputMime;

    const sizeIncreaseFraction = (compressedSize - originalSize) / originalSize;
    const keptOriginal = !isRealFormatChange && sizeIncreaseFraction > KEEP_ORIGINAL_THRESHOLD;

    const finalBlob = keptOriginal ? file : blob;
    const finalSize = keptOriginal ? originalSize : compressedSize;
    const finalFormat = keptOriginal ? file.type : outputMime;

    return {
        blob: finalBlob,
        originalSize,
        compressedSize: finalSize,
        format: finalFormat,
        keptOriginal,
        originalDimensions: { width, height },
    };
}