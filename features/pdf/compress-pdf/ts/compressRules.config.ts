/* features/pdf/compress-pdf/ts/compressRules.config.ts */

export type CompressionLevel = 'low' | 'medium' | 'high';

export type CompressionLevelConfig = {
    id: CompressionLevel;
    label: string;
    description: string;
};

export const COMPRESSION_LEVELS: Record<CompressionLevel, CompressionLevelConfig> = {
    low: {
        id: 'low',
        label: 'Low',
        description: 'Largest file size, minimal quality loss',
    },
    medium: {
        id: 'medium',
        label: 'Medium',
        description: 'Balanced — noticeable size reduction, minor quality tradeoff',
    },
    high: {
        id: 'high',
        label: 'High',
        description: 'Smallest file size, visible quality reduction on images',
    },
};

export const COMPRESSION_LEVEL_ORDER: CompressionLevel[] = ['low', 'medium', 'high'];

export const NEGLIGIBLE_REDUCTION_THRESHOLD_PERCENT = 5;

export const LARGE_FILE_WARNING_BYTES = 50 * 1024 * 1024;