/* features/pdf/compress-pdf/ts/ilovepdf/iLovePdfClient.ts */

import { logger } from '@/lib/logger';

export type ILovePdfRegion = 'eu' | 'us' | 'fr' | 'de' | 'pl' | 'in' | 'sg';

export type ILovePdfCompressionLevel = 'extreme' | 'recommended' | 'low';

export type ILovePdfAuthResponse = {
    token: string;
};

export type ILovePdfStartResponse = {
    server: string;
    task: string;
    remaining_credits: number;
};

export type ILovePdfUploadResponse = {
    server_filename: string;
};

export type ILovePdfProcessResponse = {
    download_filename: string;
    filesize: number;
    output_filesize: number;
    output_filenumber: number;
    output_extensions: string[];
    timer: string;
    status: string;
};

export type ILovePdfTaskFile = {
    server_filename: string;
    filename: string;
};

export type ILovePdfProcessParams = {
    task: string;
    tool: string;
    files: ILovePdfTaskFile[];
    compression_level?: ILovePdfCompressionLevel;
    ignore_errors?: boolean;
    try_pdf_repair?: boolean;
};

export class ILovePdfError extends Error {
    constructor(
        message: string,
        public code?: string,
        public cause?: Error
    ) {
        super(message);
        this.name = 'ILovePdfError';
    }
}

export class ILovePdfClient {
    private publicKey: string;
    private token: string | null = null;
    private tokenExpiry: number = 0;
    private baseUrl = 'https://api.ilovepdf.com/v1';

    constructor(publicKey: string) {
        if (!publicKey) {
            throw new ILovePdfError('iLovePDF public key is required');
        }
        this.publicKey = publicKey;
    }

    private async getToken(): Promise<string> {
        const now = Date.now();

        if (this.token && this.tokenExpiry > now + 5 * 60 * 1000) {
            return this.token;
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    public_key: this.publicKey,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new ILovePdfError(
                    error.error?.message || 'Authentication failed',
                    error.error?.type
                );
            }

            const data: ILovePdfAuthResponse = await response.json();
            this.token = data.token;
            this.tokenExpiry = now + 60 * 60 * 1000;

            logger.info('iLovePDF authentication successful');
            return this.token;
        } catch (error) {
            logger.error('iLovePDF authentication failed', error);
            if (error instanceof ILovePdfError) throw error;
            throw new ILovePdfError(
                'Failed to authenticate with iLovePDF API',
                'AUTH_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }

    async startTask(
        tool: string = 'compress',
        region: ILovePdfRegion = 'eu'
    ): Promise<ILovePdfStartResponse> {
        const token = await this.getToken();

        try {
            const response = await fetch(
                `${this.baseUrl}/start/${tool}/${region}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new ILovePdfError(
                    error.error?.message || 'Failed to start task',
                    error.error?.type
                );
            }

            const data: ILovePdfStartResponse = await response.json();
            logger.info(`iLovePDF task started: ${data.task}, server: ${data.server}`);
            return data;
        } catch (error) {
            logger.error('iLovePDF start task failed', error);
            if (error instanceof ILovePdfError) throw error;
            throw new ILovePdfError(
                'Failed to start compression task',
                'START_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }

    async uploadFile(
        server: string,
        taskId: string,
        file: File
    ): Promise<ILovePdfUploadResponse> {
        const token = await this.getToken();

        try {
            const formData = new FormData();
            formData.append('task', taskId);
            formData.append('file', file);

            const response = await fetch(`https://${server}/v1/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new ILovePdfError(
                    error.error?.message || 'Failed to upload file',
                    error.error?.type
                );
            }

            const data: ILovePdfUploadResponse = await response.json();
            logger.info(`File uploaded: ${data.server_filename}`);
            return data;
        } catch (error) {
            logger.error('iLovePDF file upload failed', error);
            if (error instanceof ILovePdfError) throw error;
            throw new ILovePdfError(
                'Failed to upload file to iLovePDF',
                'UPLOAD_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }

    async processTask(
        server: string,
        params: ILovePdfProcessParams
    ): Promise<ILovePdfProcessResponse> {
        const token = await this.getToken();

        try {
            const response = await fetch(`https://${server}/v1/process`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new ILovePdfError(
                    error.error?.message || 'Failed to process files',
                    error.error?.type
                );
            }

            const data: ILovePdfProcessResponse = await response.json();
            logger.info(`Task processed successfully: ${data.download_filename}`);
            return data;
        } catch (error) {
            logger.error('iLovePDF process task failed', error);
            if (error instanceof ILovePdfError) throw error;
            throw new ILovePdfError(
                'Failed to process PDF compression',
                'PROCESS_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }

    async downloadFile(
        server: string,
        taskId: string
    ): Promise<Blob> {
        const token = await this.getToken();

        try {
            const response = await fetch(
                `https://${server}/v1/download/${taskId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new ILovePdfError(
                    error.error?.message || 'Failed to download file',
                    error.error?.type
                );
            }

            const blob = await response.blob();
            logger.info(`File downloaded successfully, size: ${blob.size}`);
            return blob;
        } catch (error) {
            logger.error('iLovePDF file download failed', error);
            if (error instanceof ILovePdfError) throw error;
            throw new ILovePdfError(
                'Failed to download compressed file',
                'DOWNLOAD_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }
}