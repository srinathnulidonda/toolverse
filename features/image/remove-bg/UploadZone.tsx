// features/image/remove-bg/UploadZone.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES } from "../shared/ts/imageFileUtils";
import { validateFile } from "./ts/removeBgEngine";
import styles from "./style/UploadZone.module.css";

type UploadZoneProps = {
    onFileSelected: (file: File) => void;
    isProcessing: boolean;
};

export function UploadZone({ onFileSelected, isProcessing }: UploadZoneProps) {
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndProcessFile = useCallback((fileList: FileList) => {
        const file = fileList[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
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
        e.target.value = "";
    }, [validateAndProcessFile]);

    return (
        <div className={styles.uploadContainer}>
            <div
                className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""} ${isProcessing ? styles.disabled : ""}`}
                onClick={openPicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                aria-label="Upload image for background removal"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPicker();
                    }
                }}
            >
                <div className={styles.uploadContent}>
                    <div className={styles.uploadIconWrapper}>
                        <i className={`ti ${dragOver ? "ti-photo-plus" : "ti-upload"}`} aria-hidden="true" />
                    </div>

                    <h2 className={styles.mainHeading}>
                        {dragOver ? "Drop your image here" : "Remove Background"}
                    </h2>
                    <p className={styles.mainDescription}>
                        Upload an image and we'll automatically remove the background using AI. Drag & drop, or click to browse.
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
                        <span>Browse Image</span>
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

                    <p className={styles.uploadHint}>Max file size: 12 MB · One image per request</p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    className={styles.hiddenInput}
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                />
            </div>

            {error && (
                <div className={styles.errorBox} role="alert">
                    <i className="ti ti-alert-circle" aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}