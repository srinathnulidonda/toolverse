/* features/pdf/compress-pdf/ts/compressEngine.ts */

import { PdfLoadError } from '../../shared/ts/pdfErrors';
import { type CompressionLevel } from './compressRules.config';
import { ILovePdfClient, ILovePdfError } from './ilovepdf/iLovePdfClient';
import { COMPRESSION_LEVEL_MAP, getILovePdfPublicKey } from './ilovepdf/iLovePdfConfig';
import { logger } from '@/lib/logger';

export class PdfCompressError extends Error {
    constructor(message: string, public cause?: Error) {
        super(message);
        this.name = 'PdfCompressError';
    }
}

export type CompressProgress = {
    stage: 'loading' | 'uploading' | 'processing' | 'downloading' | 'finalizing';
    done: number;
    total: number;
};

export type CompressResult = {
    blob: Blob;
    originalSize: number;
    compressedSize: number;
};

export async function compressPdf(
    file: File,
    level: CompressionLevel,
    onProgress?: (progress: CompressProgress) => void
): Promise<CompressResult> {
    const publicKey = getILovePdfPublicKey();

    if (!publicKey) {
        throw new PdfCompressError('Service temporarily unavailable. Please contact support.');
    }

    const client = new ILovePdfClient(publicKey);
    const apiLevel = COMPRESSION_LEVEL_MAP[level];
    const originalSize = file.size;

    try {
        onProgress?.({ stage: 'loading', done: 0, total: 1 });

        const { server, task } = await client.startTask('compress', 'eu');
        onProgress?.({ stage: 'loading', done: 1, total: 1 });

        onProgress?.({ stage: 'uploading', done: 0, total: 1 });
        const { server_filename } = await client.uploadFile(server, task, file);
        onProgress?.({ stage: 'uploading', done: 1, total: 1 });

        onProgress?.({ stage: 'processing', done: 0, total: 1 });
        const processResult = await client.processTask(server, {
            task,
            tool: 'compress',
            files: [{ server_filename, filename: file.name }],
            compression_level: apiLevel,
            ignore_errors: true,
            try_pdf_repair: true,
        });
        onProgress?.({ stage: 'processing', done: 1, total: 1 });

        onProgress?.({ stage: 'downloading', done: 0, total: 1 });
        const blob = await client.downloadFile(server, task);
        onProgress?.({ stage: 'downloading', done: 1, total: 1 });

        onProgress?.({ stage: 'finalizing', done: 1, total: 1 });

        const compressedSize = processResult.output_filesize || blob.size;

        logger.info(`PDF compressed: ${originalSize} → ${compressedSize} bytes`);

        return {
            blob,
            originalSize: processResult.filesize || originalSize,
            compressedSize,
        };
    } catch (error) {
        logger.error('Compression failed', error);

        if (error instanceof ILovePdfError) {
            if (error.message.toLowerCase().includes('password') || error.message.toLowerCase().includes('encrypted')) {
                throw new PdfLoadError(file.name, 'encrypted', `${file.name} is password-protected and cannot be compressed`);
            }

            if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('corrupted')) {
                throw new PdfLoadError(file.name, 'corrupted', `${file.name} appears to be corrupted or invalid`);
            }

            throw new PdfCompressError('Unable to compress this PDF. Please try again or contact support.', error.cause);
        }

        throw new PdfCompressError('Failed to compress PDF. Please try again.', error instanceof Error ? error : undefined);
    }
}