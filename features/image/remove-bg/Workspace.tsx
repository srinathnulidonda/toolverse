// features/image/remove-bg/Workspace.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import { formatFileSize } from "../shared/ts/imageFileUtils";
import {
    removeBackground,
    RemoveBgError,
    type RemoveBgPhase,
} from "./ts/removeBgEngine";
import { UploadZone } from "./UploadZone";
import { ProcessingStage } from "./ProcessingStage";
import { ResultPreview } from "./ResultPreview";
import styles from "./style/Workspace.module.css";

type MobilePanel = "input" | "output";

interface Props {
    tool: Tool;
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
    });
}

export default function RemoveBgWorkspace({ tool }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>("input");

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<{ phase: RemoveBgPhase; percent: number } | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState("");

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!previewUrl) {
            setDimensions(null);
            return;
        }
        let cancelled = false;
        getImageDimensions(previewUrl)
            .then((dims) => {
                if (!cancelled) setDimensions(dims);
            })
            .catch(() => {
                if (!cancelled) setDimensions(null);
            });
        return () => {
            cancelled = true;
        };
    }, [previewUrl]);

    const hasResult = !!resultBlob;

    const handleFileSelected = useCallback((selected: File) => {
        setFile(selected);
        setResultBlob(null);
        setError("");
        setMobilePanel("input");
    }, []);

    const handleRemoveImage = useCallback(() => {
        setFile(null);
        setResultBlob(null);
        setError("");
    }, []);

    const handleRemoveBackground = useCallback(async () => {
        if (!file || isProcessing) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsProcessing(true);
        setError("");
        setResultBlob(null);
        setProgress({ phase: "uploading", percent: 0 });
        setMobilePanel("output");

        try {
            const blob = await removeBackground(
                file,
                (event) => setProgress(event),
                controller.signal
            );
            setResultBlob(blob);
        } catch (err) {
            if (err instanceof RemoveBgError && err.reason === "aborted") {
                setMobilePanel("input");
            } else {
                const message = err instanceof RemoveBgError
                    ? err.message
                    : "Failed to remove background. Please try again.";
                setError(message);
                setMobilePanel("input");
            }
        } finally {
            setIsProcessing(false);
            setProgress(null);
            abortControllerRef.current = null;
        }
    }, [file, isProcessing]);

    const handleCancel = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    const handleStartOver = useCallback(() => {
        setFile(null);
        setResultBlob(null);
        setError("");
        setProgress(null);
        setIsProcessing(false);
        setMobilePanel("input");
    }, []);

    const handleReset = useCallback(() => {
        if (isProcessing) return;
        handleStartOver();
    }, [isProcessing, handleStartOver]);

    return (
        <div className={styles.workspace} role="main" aria-label="Remove Background Tool">
            <div className={styles.chrome}>
                <div className={styles.chromeLeft}>
                    <div className={styles.title}>
                        <i className="ti ti-eraser" aria-hidden="true" />
                        <span>Remove Background</span>
                    </div>
                    {file && (
                        <div className={styles.fileBadge} title={file.name}>
                            <i className="ti ti-photo" aria-hidden="true" />
                            {file.name}
                        </div>
                    )}
                </div>

                <div className={styles.chromeRight}>
                    <button
                        type="button"
                        className={styles.btn}
                        onClick={handleReset}
                        disabled={(!file && !hasResult) || isProcessing}
                    >
                        <i className="ti ti-refresh" aria-hidden="true" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className={styles.mobileTabs} role="tablist" aria-label="Panel selector">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === "input"}
                    className={`${styles.mobileTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
                    onClick={() => setMobilePanel("input")}
                >
                    Setup
                    {file && (
                        <span className={`${styles.mobileBadge} ${styles.valid}`} aria-label="Ready">
                            <i className="ti ti-check" aria-hidden="true" />
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobilePanel === "output"}
                    className={`${styles.mobileTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
                    onClick={() => setMobilePanel("output")}
                >
                    Result
                    {(isProcessing || hasResult) && <span className={styles.mobileDot} />}
                </button>
            </div>

            <div className={styles.body}>
                <div className={`${styles.panel} ${mobilePanel === "input" ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-photo" aria-hidden="true" />
                            Setup
                        </div>
                        {file && (
                            <span className={`${styles.statusPill} ${styles.valid}`}>
                                <i className="ti ti-check" aria-hidden="true" />
                                Ready
                            </span>
                        )}
                    </div>

                    <div className={styles.panelContent}>
                        {error && (
                            <div className={styles.globalError} role="alert">
                                <i className="ti ti-alert-circle" aria-hidden="true" />
                                <span>{error}</span>
                            </div>
                        )}

                        {!file ? (
                            <div className={styles.uploadWrap}>
                                <UploadZone onFileSelected={handleFileSelected} isProcessing={isProcessing} />
                            </div>
                        ) : (
                            <div className={styles.setupStage}>
                                <div className={styles.previewCardWrapper}>
                                    <div className={styles.previewCard}>
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={handleRemoveImage}
                                            disabled={isProcessing}
                                            aria-label="Remove image"
                                        >
                                            <i className="ti ti-x" aria-hidden="true" />
                                        </button>

                                        <div className={styles.previewImageArea}>
                                            {previewUrl && (
                                                <img src={previewUrl} alt="Selected preview" className={styles.previewImage} />
                                            )}
                                        </div>

                                        <div className={styles.fileMetaBar}>
                                            <span className={styles.fileMetaName} title={file.name}>
                                                {file.name}
                                            </span>
                                            <div className={styles.fileMetaChips}>
                                                {dimensions && (
                                                    <span className={styles.metaChip}>
                                                        <i className="ti ti-photo" aria-hidden="true" />
                                                        {dimensions.width}×{dimensions.height}
                                                    </span>
                                                )}
                                                <span className={styles.metaChip}>
                                                    <i className="ti ti-file" aria-hidden="true" />
                                                    {formatFileSize(file.size)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actionFooter}>
                                    <button
                                        type="button"
                                        className={styles.removeBgButton}
                                        onClick={handleRemoveBackground}
                                        disabled={isProcessing}
                                    >
                                        <i className="ti ti-eraser" aria-hidden="true" />
                                        <span>Remove Background</span>
                                    </button>
                                    <p className={styles.actionHint}>
                                        <i className="ti ti-shield-lock" aria-hidden="true" />
                                        Processed securely, never stored
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.divider} aria-hidden="true" />

                <div className={`${styles.panel} ${mobilePanel === "output" ? styles.mobileVisible : styles.mobileHidden}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <i className="ti ti-report-analytics" aria-hidden="true" />
                            Result
                        </div>
                        {hasResult && (
                            <span className={`${styles.statusPill} ${styles.valid}`}>
                                <i className="ti ti-check" aria-hidden="true" />
                                Done
                            </span>
                        )}
                    </div>

                    <div className={styles.panelContent}>
                        {isProcessing && progress ? (
                            <ProcessingStage
                                phase={progress.phase}
                                percent={progress.percent}
                                fileName={file?.name}
                                onCancel={handleCancel}
                            />
                        ) : hasResult && file && resultBlob ? (
                            <ResultPreview
                                originalFile={file}
                                resultBlob={resultBlob}
                                onStartOver={handleStartOver}
                            />
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <i className="ti ti-eraser" aria-hidden="true" />
                                </div>
                                <h3 className={styles.emptyTitle}>No Result Yet</h3>
                                <p className={styles.emptyText}>
                                    {file
                                        ? "Click Remove Background to process your image"
                                        : "Upload an image to get started"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <span className={styles.srOnly} role="status" aria-live="polite">
                {isProcessing && progress ? `${progress.phase}: ${progress.percent}%` : ""}
                {hasResult ? "Background removal complete" : ""}
            </span>
        </div>
    );
}