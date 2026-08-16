/* features/pdf/compress-pdf/ts/ilovepdf/iLovePdfConfig.ts */

import type { ILovePdfCompressionLevel } from './iLovePdfClient';
import type { CompressionLevel } from '../compressRules.config';

export const COMPRESSION_LEVEL_MAP: Record<CompressionLevel, ILovePdfCompressionLevel> = {
    low: 'low',
    medium: 'recommended',
    high: 'extreme',
};

export function getILovePdfPublicKey(): string | null {
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY || null;
    }
    return null;
}

export function isILovePdfAvailable(): boolean {
    const key = getILovePdfPublicKey();
    return key !== null && key.length > 0;
}