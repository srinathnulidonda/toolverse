// features/pdf/shared/ts/pdfThumbnail.ts

import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from './pdfFileUtils';
import { PdfLoadError } from './pdfErrors';
import { logger } from '@/lib/logger';

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfjsLib() {
    if (!pdfjsLibPromise) {
        pdfjsLibPromise = (async () => {
            const pdfjsLib = await import('pdfjs-dist');
            const localWorker = '/pdf.worker.min.mjs';

            try {
                const res = await fetch(localWorker, { method: 'HEAD' });
                pdfjsLib.GlobalWorkerOptions.workerSrc = res.ok
                    ? localWorker
                    : `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            } catch {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }

            return pdfjsLib;
        })();
    }
    return pdfjsLibPromise;
}

export async function loadPdfMeta(file: File): Promise<{ pageCount: number; thumbnailDataUrl: string }> {
    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        const thumbnailDataUrl = await generateThumbnail(arrayBuffer);

        return { pageCount, thumbnailDataUrl };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('encrypted') || error.message.includes('password')) {
                throw new PdfLoadError(file.name, 'encrypted', `${file.name} is password-protected and cannot be processed`);
            }
            if (error.message.includes('Invalid PDF')) {
                throw new PdfLoadError(file.name, 'invalid', `${file.name} is not a valid PDF file`);
            }
        }
        throw new PdfLoadError(file.name, 'corrupted', `${file.name} appears to be corrupted or malformed`);
    }
}

async function generateThumbnail(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
        const pdfjsLib = await getPdfjsLib();
        const bufferCopy = arrayBuffer.slice(0);

        const loadingTask = pdfjsLib.getDocument({ data: bufferCopy });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false })!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
            canvasContext: context,
            viewport,
            canvas
        }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        page.cleanup();

        return dataUrl;
    } catch (error) {
        logger.warn('Thumbnail generation failed', error);
        return getPlaceholderThumbnail();
    }
}

function getPlaceholderThumbnail(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgdmlld0JveD0iMCAwIDIwMCAyNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA4MEgxNDBWOTBINjBWODBaTTYwIDExMEgxNDBWMTIwSDYwVjExMFpNNjAgMTQwSDEyMFYxNTBINjBWMTQwWiIgZmlsbD0iIzlDQTNCNCIvPgo8cGF0aCBkPSJNMTAwIDUwQzEwNS41MjMgNTAgMTEwIDU0LjQ3NzIgMTEwIDYwQzExMCA2NS41MjI4IDEwNS41MjMgNzAgMTAwIDcwQzk0LjQ3NzIgNzAgOTAgNjUuNTIyOCA5MCA2MEM5MCA1NC40NzcyIDk0LjQ3NzIgNTAgMTAwIDUwWiIgZmlsbD0iI0VGNDQ0NCIvPgo8L3N2Zz4K';
}