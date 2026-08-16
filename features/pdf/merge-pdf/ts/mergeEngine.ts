// features/pdf/merge-pdf/ts/mergeEngine.ts
import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '../../shared/ts/pdfFileUtils';

export type MergeStage = 'reading' | 'merging' | 'finalizing';

export type MergeProgress = {
    stage: MergeStage;
    done: number;
    total: number;
};

export class PdfMergeError extends Error {
    constructor(message: string, public cause?: Error) {
        super(message);
        this.name = 'PdfMergeError';
    }
}

const ENCRYPTED_HINTS = ['encrypted', 'password'];

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function isEncryptedError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return ENCRYPTED_HINTS.some((hint) => message.includes(hint));
}
class PdfMergeWorker {
    private worker: Worker | null = null;
    private resolveCallback: ((value: Blob) => void) | null = null;
    private rejectCallback: ((reason: any) => void) | null = null;

    constructor() {
        this.initializeWorker();
    }

    private initializeWorker() {
        const workerCode = `
            // Import pdf-lib in the worker
            importScripts('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.es.js');

            self.onmessage = async (e) => {
                try {
                    const { filesData } = e.data;

                    // Convert base64 data back to ArrayBuffers
                    const fileBuffers = filesData.map((fileData: any) => {
                        const binaryString = atob(fileData.data);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        return bytes.buffer;
                    });

                    const mergedPdf = await PDFLib.PDFDocument.create();

                    // Process each file
                    for (let i = 0; i < fileBuffers.length; i++) {
                        try {
                            const pdfBuffer = fileBuffers[i];
                            const pdf = await PDFLib.PDFDocument.load(pdfBuffer, { ignoreEncryption: false });
                            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                            pages.forEach((page) => mergedPdf.addPage(page));
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            if (errorMessage.toLowerCase().includes('encrypted') ||
                                errorMessage.toLowerCase().includes('password')) {
                                self.postMessage({
                                    type: 'error',
                                    error: 'Password-protected PDF detected'
                                });
                            } else {
                                self.postMessage({
                                    type: 'error',
                                    error: 'Failed to process PDF file'
                                });
                            }
                            return;
                        }
                    }

                    // Finalize and return result
                    const pdfBytes = await mergedPdf.save();
                    const base64String = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

                    self.postMessage({
                        type: 'result',
                        data: base64String
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    self.postMessage({
                        type: 'error',
                        error: errorMessage
                    });
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));

        this.worker.onmessage = (e) => {
            if (e.data.type === 'result') {
                const binaryString = atob(e.data.data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                if (this.resolveCallback) {
                    this.resolveCallback(new Blob([bytes.buffer], { type: 'application/pdf' }));
                }
            } else if (e.data.type === 'error') {
                if (this.rejectCallback) {
                    this.rejectCallback(new Error(e.data.error));
                }
            }
        };

        this.worker.onerror = (e) => {
            if (this.rejectCallback) {
                this.rejectCallback(new Error(`Worker error: ${e.message}`));
            }
        };
    }

    public merge(files: File[]): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.resolveCallback = resolve;
            this.rejectCallback = reject;

            // Prepare file data for transfer to worker
            const filesDataPromise = Promise.all(
                files.map(async (file) => {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                    return { data: base64, name: file.name, size: file.size };
                })
            );

            filesDataPromise.then((filesData) => {
                this.worker?.postMessage({ filesData });
            }).catch((error) => {
                reject(new Error(`Failed to prepare file data: ${error.message}`));
            });
        });
    }

    public terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// Singleton worker instance
let pdfMergeWorkerInstance: PdfMergeWorker | null = null;

function getPdfMergeWorker(): PdfMergeWorker {
    if (!pdfMergeWorkerInstance) {
        pdfMergeWorkerInstance = new PdfMergeWorker();
    }
    return pdfMergeWorkerInstance;
}

export async function mergePdfs(
    files: File[],
    onProgress?: (progress: MergeProgress) => void
): Promise<Blob> {
    if (files.length < 2) {
        throw new PdfMergeError('At least 2 PDF files are required for merging');
    }

    // For this implementation, we'll use the worker for the actual merging work
    // but keep progress reporting in the main thread for simplicity
    const total = files.length;

    // Reading phase (file loading)
    onProgress?.({ stage: 'reading', done: 0, total });

    // Simulate reading progress (in reality, this happens during file transfer to worker)
    for (let i = 0; i < files.length; i++) {
        // Small delay to simulate work, but don't block UI significantly
        await new Promise(resolve => setTimeout(resolve, 10));
        onProgress?.({ stage: 'reading', done: i + 1, total });
    }

    // Merging phase - offload to worker
    onProgress?.({ stage: 'merging', done: 0, total });

    try {
        const worker = getPdfMergeWorker();
        const resultBlob = await worker.merge(files);

        // Finalizing phase
        onProgress?.({ stage: 'finalizing', done: total, total });

        return resultBlob;
    } catch (error) {
        // Handle specific error types
        const typedError = error as Error;

        if (typedError.message.includes('password-protected')) {
            throw new PdfMergeError(
                `Password-protected PDF detected. Remove the password and try again.`,
                typedError
            );
        } else if (typedError.message.includes('Failed to process PDF file')) {
            throw new PdfMergeError(
                `Failed to process PDF file during merge. The file may be corrupted.`,
                typedError
            );
        } else {
            throw new PdfMergeError(
                'Failed to finalize the merged PDF. Please try again.',
                typedError
            );
        }
    }
}