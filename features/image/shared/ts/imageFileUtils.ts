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

// Worker-based image downscaling using OffscreenCanvas to avoid blocking main thread
let imageDownscaleWorker: Worker | null = null;

function getImageDownscaleWorker(): Worker {
    if (!imageDownscaleWorker) {
        const workerCode = `
            self.onmessage = async (e) => {
                try {
                    const { dataUrl, originalWidth, originalHeight, maxWidth, maxHeight, quality } = e.data;

                    // Parse the data URL to get the binary data
                    const matches = dataUrl.match(/^data:image\\/([^;]+);base64,(.+)$/);
                    if (!matches) {
                        throw new Error('Invalid data URL format');
                    }

                    const base64Data = matches[2];
                    const binaryString = atob(base64Data);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // Create an ImageBitmap from the binary data
                    const blob = new Blob([bytes], { type: \`image/\${matches[1]}\` });
                    const imgBitmap = await createImageBitmap(blob);

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

                    // Use OffscreenCanvas for image processing in worker
                    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
                    const ctx = offscreen.getContext('2d', { alpha: false });

                    if (!ctx) {
                        throw new Error('Failed to get OffscreenCanvas context');
                    }

                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetWidth, targetHeight);

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    ctx.drawImage(imgBitmap, 0, 0, imgBitmap.width, imgBitmap.height, 0, 0, targetWidth, targetHeight);

                    // Convert to data URL
                    const dataUrl = offscreen.convertToBlob({ type: 'image/jpeg', quality })
                        .then(blob => {
                            return new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
                                reader.readAsDataURL(blob);
                            });
                        });

                    const finalDataUrl = await dataUrl;

                    // Extract the base64 part for transfer
                    const matches = finalDataUrl.match(/^data:image\\/([^;]+);base64,(.+)$/);
                    if (matches) {
                        self.postMessage({
                            type: 'result',
                            data: matches[2] // Just the base64 data
                        });
                    } else {
                        throw new Error('Unexpected data URL format from canvas');
                    }
                } catch (error) {
                    self.postMessage({
                        type: 'error',
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        imageDownscaleWorker = new Worker(URL.createObjectURL(blob));
    }

    return imageDownscaleWorker;
}

export async function downscaleImageIfNeeded(
    dataUrl: string,
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.85
): Promise<string> {
    // For small images, process on main thread to avoid worker overhead
    const imageSize = originalWidth * originalHeight;
    const useWorkerThreshold = 500 * 500; // 250k pixels

    if (imageSize <= useWorkerThreshold) {
        // Process on main thread for small images
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                try {
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

    // For larger images, use worker
    return new Promise((resolve, reject) => {
        const worker = getImageDownscaleWorker();

        // Handle messages from the worker
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'result') {
                // Reconstruct the data URL from the base64 data
                const dataUrl = `data:image/jpeg;base64,${event.data.data}`;
                resolve(dataUrl);
                // Clean up the event listener after we get a response
                worker.removeEventListener('message', handleMessage);
            } else if (event.data.type === 'error') {
                reject(new Error(event.data.error));
                // Clean up the event listener after we get a response
                worker.removeEventListener('message', handleMessage);
            }
        };

        worker.addEventListener('message', handleMessage);

        // Also handle worker errors
        const handleError = (event: ErrorEvent) => {
            reject(new Error(`Worker error: ${event.message}`));
            worker.removeEventListener('error', handleError);
            worker.removeEventListener('message', handleMessage);
        };

        worker.addEventListener('error', handleError);

        // Post the data to the worker
        worker.postMessage({
            dataUrl,
            originalWidth,
            originalHeight,
            maxWidth,
            maxHeight,
            quality
        });
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