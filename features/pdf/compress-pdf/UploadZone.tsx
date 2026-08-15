/* features/pdf/compress-pdf/UploadZone.tsx */
"use client";

import { useCallback, useRef, useState } from 'react';
import styles from './style/UploadZone.module.css';

type UploadZoneProps = {
    onFileSelected: (file: File) => void;
    isProcessing: boolean;
};

export function UploadZone({ onFileSelected, isProcessing }: UploadZoneProps) {
    const [dragOver, setDragOver] = useState(false);
    const [rejectionError, setRejectionError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndProcessFile = useCallback((fileList: FileList) => {
        if (fileList.length === 0) return;

        if (fileList.length > 1) {
            setRejectionError('Please upload only one PDF file at a time');
            return;
        }

        const file = fileList[0];
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            setRejectionError(`${file.name} is not a PDF file`);
            return;
        }

        setRejectionError('');
        onFileSelected(file);
    }, [onFileSelected]);

    const openPicker = useCallback(() => {
        if (!isProcessing) fileInputRef.current?.click();
    }, [isProcessing]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        if (isProcessing) return;

        validateAndProcessFile(e.dataTransfer.files);
    }, [validateAndProcessFile, isProcessing]);

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
            validateAndProcessFile(e.target.files);
        }
        e.target.value = '';
    }, [validateAndProcessFile]);

    return (
        <div className={styles.uploadContainer}>
            {/*
              This container is intentionally NOT a focusable/role="button" element.
              It contains a real <button> (Browse File) below, which is the single
              accessible control for keyboard/screen-reader users — avoiding an
              invalid "interactive control nested inside an interactive control"
              pattern. Mouse/touch users can still tap anywhere in the zone, and
              drag & drop works regardless of focusability.
            */}
            <div
                className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''} ${isProcessing ? styles.disabled : ''}`}
                onClick={openPicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className={styles.uploadContent}>
                    <div className={styles.uploadIconWrapper}>
                        <i className={`ti ${dragOver ? 'ti-file-import' : 'ti-upload'}`} aria-hidden="true" />
                    </div>

                    <h2 className={styles.mainHeading}>
                        {dragOver ? 'Drop your PDF here' : 'Compress PDF File'}
                    </h2>
                    <p className={styles.mainDescription}>
                        Reduce PDF file size while maintaining quality. Drag & drop your file here, or click to browse.
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
                        <span>Browse File</span>
                    </button>

                    <div className={styles.formatRow}>
                        <span className={styles.formatChip}>
                            <i className="ti ti-file-type-pdf" aria-hidden="true" />
                            PDF only
                        </span>
                    </div>

                    <p className={styles.uploadHint}>
                        Select a single PDF file to compress
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className={styles.hiddenInput}
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                />
            </div>

            {rejectionError && (
                <div className={styles.errorBox} role="alert">
                    <i className="ti ti-alert-circle" aria-hidden="true" />
                    <span>{rejectionError}</span>
                </div>
            )}
        </div>
    );
}