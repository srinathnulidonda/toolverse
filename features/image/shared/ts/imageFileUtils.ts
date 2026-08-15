/* features/image/shared/ts/imageFileUtils.ts */

export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ImageFileInfo {
    file: File;
    id: string;
    dimensions: ImageDimensions | null;
    dataUrl: string | null;
    error?: string;
}

export async function loadImageDimensions(
    file: File
): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image: ${file.name}`));
        };

        img.src = url;
    });
}

export async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to read file as data URL"));
            }
        };

        reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };

        reader.readAsDataURL(file);
    });
}

export async function loadImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image: ${file.name}`));
        };

        img.src = url;
    });
}

export function isAcceptedImageType(file: File): boolean {
    return ACCEPTED_IMAGE_TYPES.includes(file.type as any);
}

export function getImageTypeError(file: File): string {
    return `"${file.name}" is not a supported image format. Please use JPG, PNG, or WebP files.`;
}

export async function processImageFile(file: File): Promise<ImageFileInfo> {
    const id = `${file.name}-${file.size}-${Date.now()}`;

    if (!isAcceptedImageType(file)) {
        return {
            file,
            id,
            dimensions: null,
            dataUrl: null,
            error: getImageTypeError(file),
        };
    }

    try {
        const [dimensions, dataUrl] = await Promise.all([
            loadImageDimensions(file),
            readFileAsDataUrl(file),
        ]);

        return {
            file,
            id,
            dimensions,
            dataUrl,
        };
    } catch (error) {
        return {
            file,
            id,
            dimensions: null,
            dataUrl: null,
            error:
                error instanceof Error
                    ? error.message
                    : `Failed to process "${file.name}"`,
        };
    }
}

export async function downscaleImageIfNeeded(
    dataUrl: string,
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.85
): Promise<string> {
    const needsResize = originalWidth > maxWidth || originalHeight > maxHeight;

    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (needsResize) {
        const scaleX = maxWidth / originalWidth;
        const scaleY = maxHeight / originalHeight;
        const scale = Math.min(scaleX, scaleY);

        targetWidth = Math.floor(originalWidth * scale);
        targetHeight = Math.floor(originalHeight * scale);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext("2d", {
                    alpha: false,
                });

                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedDataUrl);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error("Failed to load image for downscaling"));
        };

        img.src = dataUrl;
    });
}

export function formatDimensions(dimensions: ImageDimensions | null): string {
    if (!dimensions) return "Unknown";
    return `${dimensions.width} × ${dimensions.height}`;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}