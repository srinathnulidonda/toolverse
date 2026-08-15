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

export async function mergePdfs(
    files: File[],
    onProgress?: (progress: MergeProgress) => void
): Promise<Blob> {
    if (files.length < 2) {
        throw new PdfMergeError('At least 2 PDF files are required for merging');
    }

    const total = files.length;
    const mergedPdf = await PDFDocument.create();

    onProgress?.({ stage: 'reading', done: 0, total });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach((page) => mergedPdf.addPage(page));
            onProgress?.({ stage: 'merging', done: i + 1, total });
        } catch (error) {
            if (isEncryptedError(error)) {
                throw new PdfMergeError(
                    `"${file.name}" is password-protected. Remove the password and try again.`,
                    error instanceof Error ? error : undefined
                );
            }
            throw new PdfMergeError(
                `Failed to process "${file.name}" during merge. The file may be corrupted.`,
                error instanceof Error ? error : undefined
            );
        }
    }

    onProgress?.({ stage: 'finalizing', done: total, total });

    try {
        const pdfBytes = await mergedPdf.save();
        return new Blob([toArrayBuffer(pdfBytes)], { type: 'application/pdf' });
    } catch (error) {
        throw new PdfMergeError(
            'Failed to finalize the merged PDF. Please try again.',
            error instanceof Error ? error : undefined
        );
    }
}