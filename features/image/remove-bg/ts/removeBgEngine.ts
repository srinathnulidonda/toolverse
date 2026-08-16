// features/image/remove-bg/ts/removeBgEngine.ts
import { ACCEPTED_IMAGE_TYPES } from "../../shared/ts/imageFileUtils";

export class RemoveBgError extends Error {
    constructor(
        public filename: string,
        public reason:
            | "invalid"
            | "upload-failed"
            | "processing-failed"
            | "download-failed"
            | "too-large"
            | "unsupported"
            | "timeout"
            | "aborted",
        message?: string
    ) {
        super(message || `Failed to remove background: ${filename}`);
        this.name = "RemoveBgError";
    }
}

export type RemoveBgPhase = "uploading" | "processing" | "finalizing";

export interface RemoveBgProgressEvent {
    phase: RemoveBgPhase;
    percent: number;
}

export const MAX_FILE_SIZE = 12 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 90000;
const FALLBACK_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function isAcceptedFile(file: File): boolean {
    if (file.type && (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        return true;
    }
    const lowerName = file.name.toLowerCase();
    return FALLBACK_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function validateFile(file: File): string | null {
    if (!isAcceptedFile(file)) {
        return `${file.name} is not a supported image format.`;
    }
    if (file.size > MAX_FILE_SIZE) {
        return `${file.name} is too large. Maximum size is 12 MB.`;
    }
    return null;
}

export function removeBackground(
    file: File,
    onProgress?: (event: RemoveBgProgressEvent) => void,
    signal?: AbortSignal
): Promise<Blob> {
    const validationError = validateFile(file);
    if (validationError) {
        return Promise.reject(new RemoveBgError(file.name, "invalid", validationError));
    }

    const formData = new FormData();
    formData.append("image", file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let trickleInterval: ReturnType<typeof setInterval> | null = null;
        let settled = false;

        const clearTrickle = () => {
            if (trickleInterval) {
                clearInterval(trickleInterval);
                trickleInterval = null;
            }
        };

        const cleanup = () => {
            clearTrickle();
            if (signal) signal.removeEventListener("abort", onAbort);
        };

        const settleReject = (error: RemoveBgError) => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(error);
        };

        const settleResolve = (blob: Blob) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(blob);
        };

        const onAbort = () => {
            xhr.abort();
            settleReject(new RemoveBgError(file.name, "aborted", "Operation cancelled."));
        };

        if (signal) {
            if (signal.aborted) {
                onAbort();
                return;
            }
            signal.addEventListener("abort", onAbort);
        }

        xhr.open("POST", "/api/remove-bg", true);
        xhr.responseType = "blob";
        xhr.timeout = REQUEST_TIMEOUT_MS;

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable || !onProgress) return;
            const percent = Math.round((event.loaded / event.total) * 40);
            onProgress({ phase: "uploading", percent });
        };

        xhr.upload.onload = () => {
            if (settled) return;
            onProgress?.({ phase: "processing", percent: 42 });

            let simulated = 42;
            trickleInterval = setInterval(() => {
                const remaining = 97 - simulated;
                const step = Math.max(0.3, remaining * 0.06);
                simulated = Math.min(simulated + step, 97);
                onProgress?.({ phase: "processing", percent: Math.round(simulated) });
            }, 400);
        };

        xhr.onload = () => {
            if (settled) return;

            if (xhr.status >= 200 && xhr.status < 300) {
                const blob = xhr.response as Blob;
                if (blob && blob.size > 0) {
                    onProgress?.({ phase: "finalizing", percent: 100 });
                    settleResolve(blob);
                } else {
                    settleReject(new RemoveBgError(file.name, "download-failed", "Received an empty response from the server."));
                }
                return;
            }

            const status = xhr.status;
            const finish = (errorMessage: string) => {
                const reason = status === 504 ? "timeout" : "processing-failed";
                settleReject(new RemoveBgError(file.name, reason, errorMessage));
            };

            const responseBlob = xhr.response;
            if (responseBlob instanceof Blob && responseBlob.size > 0) {
                const reader = new FileReader();
                reader.onload = () => {
                    let message = "Failed to process image.";
                    try {
                        const data = JSON.parse(reader.result as string);
                        message = data.error || message;
                    } catch {
                        message = `Failed to process image (status ${status}).`;
                    }
                    finish(message);
                };
                reader.onerror = () => finish(`Failed to process image (status ${status}).`);
                reader.readAsText(responseBlob);
            } else {
                finish(`Failed to process image (status ${status}).`);
            }
        };

        xhr.onerror = () => {
            settleReject(new RemoveBgError(file.name, "upload-failed", "Network error during upload. Check your connection and try again."));
        };

        xhr.ontimeout = () => {
            settleReject(new RemoveBgError(file.name, "timeout", "This is taking longer than expected. Please try again."));
        };

        xhr.send(formData);
    });
}