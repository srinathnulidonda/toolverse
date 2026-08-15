// features/pdf/shared/ts/pdfErrors.ts

export class PdfLoadError extends Error {
    constructor(
        public filename: string,
        public reason: 'encrypted' | 'corrupted' | 'invalid',
        message?: string
    ) {
        super(message || `Failed to load PDF: ${filename}`);
        this.name = 'PdfLoadError';
    }
}