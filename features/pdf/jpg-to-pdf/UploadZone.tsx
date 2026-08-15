/* features/pdf/jpg-to-pdf/UploadZone.tsx */
"use client";

import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES } from '@/features/image/shared/ts/imageFileUtils';
import styles from './style/UploadZone.module.css';

type UploadZoneProps = {
    onFilesAdded: (files: File[]) => void;
    isProcessing: boolean;
};

const FALLBACK_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function isAcceptedImageFile(file: File): boolean {
    if (file.type && (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        return true;
    }
    const lowerName = file.name.toLowerCase();
    return FALLBACK_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function UploadZone({ onFilesAdded, isProcessing }: UploadZoneProps) {
    const [dragOver, setDragOver] = useState(false);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndProcessFiles = useCallback((fileList: FileList) => {
        const files = Array.from(fileList);
        const validFiles: File[] = [];
        const rejected: string[] = [];

        files.forEach((file) => {
            if (isAcceptedImageFile(file)) {
                validFiles.push(file);
            } else {
                rejected.push(`${file.name} — not a supported image format`);
            }
        });

        setRejectedFiles(rejected);

        if (validFiles.length > 0) {
            onFilesAdded(validFiles);
        }
    }, [onFilesAdded]);

    const openPicker = useCallback(() => {
        if (!isProcessing) fileInputRef.current?.click();
    }, [isProcessing]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        if (isProcessing) return;

        validateAndProcessFiles(e.dataTransfer.files);
    }, [validateAndProcessFiles, isProcessing]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const relatedTarget = e.relatedTarget as Node | null;
        if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
            setDragOver(false);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            validateAndProcessFiles(e.target.files);
        }
        e.target.value = '';
    }, [validateAndProcessFiles]);

    return (
        <div className={styles.uploadContainer}>
            <div
                className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''} ${isProcessing ? styles.disabled : ''}`}
                onClick={openPicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className={styles.uploadContent}>
                    <div className={styles.uploadIconWrapper}>
                        <i className={`ti ${dragOver ? 'ti-photo-plus' : 'ti-upload'}`} aria-hidden="true" />
                    </div>

                    <h2 className={styles.mainHeading}>
                        {dragOver ? 'Drop your images here' : 'Convert Images to PDF'}
                    </h2>
                    <p className={styles.mainDescription}>
                        Transform your JPG, PNG, or WebP images into a professional PDF document. Drag & drop your files here, or click to browse.
                    </p>

                    <button
                        type="button"
                        className={styles.browseButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            openPicker();
                        }}
                        disabled={isProcessing}
                    >
                        <i className="ti ti-folder-open" aria-hidden="true" />
                        <span>Browse Images</span>
                    </button>

                    <div className={styles.formatRow}>
                        <span className={styles.formatChip}>
                            <i className="ti ti-file-type-jpg" aria-hidden="true" />
                            JPG
                        </span>
                        <span className={styles.formatChip}>
                            <i className="ti ti-file-type-png" aria-hidden="true" />
                            PNG
                        </span>
                        <span className={styles.formatChip}>
                            <i className="ti ti-photo" aria-hidden="true" />
                            WebP
                        </span>
                    </div>

                    <p className={styles.uploadHint}>
                        Multiple files supported — reorder pages after upload
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    multiple
                    className={styles.hiddenInput}
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                />
            </div>

            {rejectedFiles.length > 0 && (
                <div className={styles.errorList} role="alert">
                    <div className={styles.errorHeader}>
                        <i className="ti ti-alert-circle" aria-hidden="true" />
                        <span>Some files were rejected</span>
                    </div>
                    {rejectedFiles.map((error, index) => (
                        <div key={index} className={styles.errorItem}>
                            <i className="ti ti-x" aria-hidden="true" />
                            <span>{error}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}