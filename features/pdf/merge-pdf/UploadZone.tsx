// features/pdf/merge-pdf/UploadZone.tsx
"use client";

import { useCallback, useRef, useState } from 'react';
import styles from './style/UploadZone.module.css';

type UploadZoneProps = {
    onFilesAdded: (files: File[]) => void;
    isProcessing: boolean;
};

export function UploadZone({ onFilesAdded, isProcessing }: UploadZoneProps) {
    const [dragOver, setDragOver] = useState(false);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const validateAndProcessFiles = useCallback((fileList: FileList) => {
        const files = Array.from(fileList);
        const validFiles: File[] = [];
        const rejected: string[] = [];

        files.forEach((file) => {
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                validFiles.push(file);
            } else {
                rejected.push(`${file.name} — not a PDF file`);
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

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isProcessing) return;
        dragCounter.current += 1;
        setDragOver(true);
    }, [isProcessing]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) {
            setDragOver(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        dragCounter.current = 0;
        setDragOver(false);

        if (isProcessing) return;

        validateAndProcessFiles(e.dataTransfer.files);
    }, [validateAndProcessFiles, isProcessing]);

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
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className={styles.uploadContent}>
                    <div className={styles.uploadIconWrapper}>
                        <i className={`ti ${dragOver ? 'ti-file-plus' : 'ti-upload'}`} aria-hidden="true" />
                    </div>

                    <h2 className={styles.mainHeading}>
                        {dragOver ? 'Drop your PDFs here' : 'Merge PDF Files'}
                    </h2>
                    <p className={styles.mainDescription}>
                        Combine multiple PDF documents into a single file. Drag &amp; drop your files here, or click to browse.
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
                        <span>Browse Files</span>
                    </button>

                    <div className={styles.formatRow}>
                        <span className={styles.formatChip}>
                            <i className="ti ti-file-type-pdf" aria-hidden="true" />
                            PDF only
                        </span>
                        <span className={styles.formatChip}>
                            <i className="ti ti-stack-2" aria-hidden="true" />
                            2+ files required
                        </span>
                    </div>

                    <p className={styles.uploadHint}>
                        Reorder pages after upload — everything happens locally in your browser
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
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