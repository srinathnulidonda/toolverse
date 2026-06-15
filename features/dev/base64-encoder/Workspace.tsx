// features/dev/base64-encoder/Workspace.tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools";
import {
    SAMPLE_BASE64,
    SAMPLE_TEXT,
    decodeBase64,
    decodeBase64ToBytes,
    detectMime,
    downloadBlob,
    encodeBase64,
    extensionForMime,
    formatBytes,
    looksBinary,
    readFileAsBase64,
    stripDataUri,
    toUrlSafe,
    wrapLines,
    type InputSource,
    type Mode,
} from "./utils";

type FileState = {
    name: string;
    mime: string;
    size: number;
    base64: string;
};

function Toggle({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="b64-toggle" title={hint}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                aria-label={hint ? `${label} — ${hint}` : label}
            />
            <span className="b64-toggle-track" aria-hidden="true">
                <span className="b64-toggle-thumb" />
            </span>
            <span className="b64-toggle-label">{label}</span>
        </label>
    );
}

export default function Base64Workspace({ tool: _tool }: { tool: Tool }) {
    const [mode, setMode] = useState<Mode>("encode");
    const [source, setSource] = useState<InputSource>("text");
    const [input, setInput] = useState("");
    const [file, setFile] = useState<FileState | null>(null);

    const [urlSafe, setUrlSafe] = useState(false);
    const [wrapOutput, setWrapOutput] = useState(false);
    const [asDataUri, setAsDataUri] = useState(false);

    const [detectedUriMime, setDetectedUriMime] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [mobileView, setMobileView] = useState<"input" | "output">("input");

    const fileRef = useRef<HTMLInputElement>(null);

    const rawEncoded = useMemo(() => {
        if (mode !== "encode") return "";
        if (source === "file") return file?.base64 ?? "";
        if (!input) return "";
        return encodeBase64(input);
    }, [mode, source, file, input]);

    const decodeResult = useMemo(() => {
        if (mode !== "decode" || !input.trim()) return { text: "" };
        return decodeBase64(input);
    }, [mode, input]);

    const decodeError = decodeResult.error ?? "";

    const decodeImageInfo = useMemo(() => {
        if (mode !== "decode" || !input.trim() || decodeError) return null;
        return detectMime(input);
    }, [mode, input, decodeError]);

    const output = useMemo(() => {
        if (mode === "decode") return decodeResult.text;
        if (!rawEncoded) return "";
        if (asDataUri && source === "file" && file) {
            return `data:${file.mime};base64,${rawEncoded}`;
        }
        let out = urlSafe ? toUrlSafe(rawEncoded) : rawEncoded;
        if (wrapOutput) out = wrapLines(out);
        return out;
    }, [mode, decodeResult, rawEncoded, urlSafe, wrapOutput, asDataUri, source, file]);

    const isBinaryOutput = useMemo(() => {
        if (mode !== "decode" || decodeError || decodeImageInfo) return false;
        return looksBinary(output);
    }, [mode, decodeError, decodeImageInfo, output]);

    const inputBytes = useMemo(() => {
        if (mode === "encode" && source === "file") return file?.size ?? 0;
        return new Blob([input]).size;
    }, [mode, source, file, input]);

    const outputBytes = useMemo(() => new Blob([output]).size, [output]);

    const ratio =
        inputBytes > 0 && outputBytes > 0
            ? Math.round((outputBytes / inputBytes) * 100)
            : null;

    const hasContent = mode === "encode" ? (source === "file" ? !!file : !!input) : !!input;

    const switchMode = useCallback((m: Mode) => {
        setMode(m);
        setSource("text");
        setInput("");
        setFile(null);
        setDetectedUriMime(null);
        setAsDataUri(false);
        setMobileView("input");
    }, []);

    const handleInputChange = useCallback(
        (val: string) => {
            if (mode === "decode") {
                const stripped = stripDataUri(val);
                if (stripped) {
                    setDetectedUriMime(stripped.mime);
                    setInput(stripped.data);
                    return;
                }
            }
            setDetectedUriMime(null);
            setInput(val);
        },
        [mode]
    );

    const handleFile = useCallback(async (f: File) => {
        const base64 = await readFileAsBase64(f);
        setFile({ name: f.name, mime: f.type || "application/octet-stream", size: f.size, base64 });
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) { setSource("file"); handleFile(f); }
        },
        [handleFile]
    );

    const handleCopy = useCallback(async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* silent */ }
    }, [output]);

    const handlePasteFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                if (mode === "encode") setSource("text");
                handleInputChange(text);
            }
        } catch { /* silent */ }
    }, [mode, handleInputChange]);

    const handleSample = useCallback(() => {
        setSource("text");
        setFile(null);
        setDetectedUriMime(null);
        setInput(mode === "encode" ? SAMPLE_TEXT : SAMPLE_BASE64);
    }, [mode]);

    const handleSwap = useCallback(() => {
        if (!output) return;
        if (mode === "encode") {
            setMode("decode");
            setSource("text");
            setFile(null);
            setAsDataUri(false);
            setInput(asDataUri ? rawEncoded : output);
        } else {
            setMode("encode");
            setSource("text");
            setInput(output);
        }
        setDetectedUriMime(null);
        setMobileView("output");
    }, [mode, output, asDataUri, rawEncoded]);

    const handleClear = useCallback(() => {
        setInput("");
        setFile(null);
        setDetectedUriMime(null);
    }, []);

    const handleDownload = useCallback(() => {
        if (!output) return;
        if (mode === "decode") {
            if (decodeImageInfo) {
                const bytes = decodeBase64ToBytes(input);
                downloadBlob(new Blob([bytes], { type: decodeImageInfo.mime }), `decoded.${decodeImageInfo.ext}`);
                return;
            }
            if (isBinaryOutput) {
                const bytes = decodeBase64ToBytes(input);
                downloadBlob(new Blob([bytes]), "decoded.bin");
                return;
            }
            downloadBlob(new Blob([output], { type: "text/plain" }), "decoded.txt");
            return;
        }
        downloadBlob(
            new Blob([output], { type: "text/plain" }),
            asDataUri ? "encoded-data-uri.txt" : "encoded-base64.txt"
        );
    }, [mode, output, input, decodeImageInfo, isBinaryOutput, asDataUri]);

    return (
        <>
            <div className="b64">

                {/* ── Toolbar ── */}
                <div className="b64-toolbar">
                    <div className="b64-toolbar-row">
                        <div className="b64-seg" role="tablist" aria-label="Conversion mode">
                            <button
                                type="button" role="tab"
                                aria-selected={mode === "encode"}
                                className={`b64-seg-btn${mode === "encode" ? " is-active" : ""}`}
                                onClick={() => switchMode("encode")}
                            >
                                <i className="ti ti-lock" aria-hidden="true" />
                                Encode
                            </button>
                            <button
                                type="button" role="tab"
                                aria-selected={mode === "decode"}
                                className={`b64-seg-btn${mode === "decode" ? " is-active" : ""}`}
                                onClick={() => switchMode("decode")}
                            >
                                <i className="ti ti-lock-open" aria-hidden="true" />
                                Decode
                            </button>
                        </div>

                        {mode === "encode" && (
                            <div className="b64-seg b64-seg--ghost" role="tablist" aria-label="Input source">
                                <button
                                    type="button" role="tab"
                                    aria-selected={source === "text"}
                                    className={`b64-seg-btn${source === "text" ? " is-active" : ""}`}
                                    onClick={() => { setSource("text"); setFile(null); setAsDataUri(false); }}
                                >
                                    <i className="ti ti-typography" aria-hidden="true" />
                                    Text
                                </button>
                                <button
                                    type="button" role="tab"
                                    aria-selected={source === "file"}
                                    className={`b64-seg-btn${source === "file" ? " is-active" : ""}`}
                                    onClick={() => { setSource("file"); setInput(""); }}
                                >
                                    <i className="ti ti-paperclip" aria-hidden="true" />
                                    File
                                </button>
                            </div>
                        )}

                        <div className="b64-spacer" />

                        <button type="button" className="b64-btn" onClick={handleSample}>
                            <i className="ti ti-wand" aria-hidden="true" />
                            <span className="b64-btn-label">Try sample</span>
                        </button>

                        <button
                            type="button" className="b64-btn b64-btn--icon"
                            onClick={handleSwap} disabled={!output}
                            title="Swap input and output" aria-label="Swap input and output"
                        >
                            <i className="ti ti-arrows-right-left" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="b64-toolbar-row b64-toolbar-row--options">
                        {mode === "encode" && !(source === "file" && asDataUri) && (
                            <>
                                <Toggle label="URL-safe" hint="Use - and _ instead of + and /" checked={urlSafe} onChange={setUrlSafe} />
                                <Toggle label="76-char lines" hint="Wrap output every 76 characters (MIME style)" checked={wrapOutput} onChange={setWrapOutput} />
                            </>
                        )}
                        {mode === "encode" && source === "file" && (
                            <Toggle label="Data URI" hint="Prefix the output with data:<type>;base64," checked={asDataUri} onChange={setAsDataUri} />
                        )}
                        {mode === "decode" && (
                            <span className="b64-inline-hint">
                                <i className="ti ti-info-circle" aria-hidden="true" />
                                Line breaks, whitespace, URL-safe chars and data URI prefixes are handled automatically.
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Panels (top) ── */}
                <div className="b64-body">

                    {/* Input panel */}
                    <section className="b64-panel" data-active={mobileView === "input"}>
                        <header className="b64-panel-head">
                            <span className="b64-panel-label">
                                <i className="ti ti-pencil" aria-hidden="true" />
                                Input
                            </span>
                            <div className="b64-panel-actions">
                                <button
                                    type="button" className="b64-icon-btn"
                                    onClick={handlePasteFromClipboard}
                                    title="Paste from clipboard" aria-label="Paste from clipboard"
                                >
                                    <i className="ti ti-clipboard" aria-hidden="true" />
                                </button>
                                <button
                                    type="button" className="b64-icon-btn b64-icon-btn--danger"
                                    onClick={handleClear} disabled={!hasContent}
                                    title="Clear input" aria-label="Clear input"
                                >
                                    <i className="ti ti-trash" aria-hidden="true" />
                                </button>
                            </div>
                        </header>

                        <div className="b64-panel-body">
                            {mode === "encode" && source === "file" ? (
                                <div
                                    className={`b64-dropzone${dragOver ? " is-drag" : ""}${file ? " has-file" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileRef.current?.click()}
                                    role="button" tabIndex={0}
                                    aria-label="Drop a file here or click to browse"
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
                                >
                                    <input
                                        ref={fileRef} type="file" className="b64-file-input"
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                        aria-hidden="true" tabIndex={-1}
                                    />
                                    {file ? (
                                        <div className="b64-file-card">
                                            {file.mime.startsWith("image/") ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={`data:${file.mime};base64,${file.base64}`} alt="" className="b64-file-thumb" />
                                            ) : (
                                                <div className="b64-file-icon">
                                                    <i className="ti ti-file-check" aria-hidden="true" />
                                                </div>
                                            )}
                                            <div className="b64-file-meta">
                                                <span className="b64-file-name">{file.name}</span>
                                                <span className="b64-file-sub">{formatBytes(file.size)} · {file.mime}</span>
                                            </div>
                                            <button
                                                type="button" className="b64-icon-btn"
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                aria-label="Remove file"
                                            >
                                                <i className="ti ti-x" aria-hidden="true" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="b64-drop-empty">
                                            <div className="b64-drop-icon">
                                                <i className="ti ti-cloud-upload" aria-hidden="true" />
                                            </div>
                                            <p className="b64-drop-title">Drop a file here</p>
                                            <p className="b64-drop-sub">or click to browse — any file type, any size</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    className="b64-textarea"
                                    value={input}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder={mode === "encode" ? "Type or paste text to encode…" : "Paste a Base64 string to decode…"}
                                    spellCheck={false} autoCorrect="off" autoCapitalize="off"
                                    aria-label={mode === "encode" ? "Text to encode" : "Base64 to decode"}
                                    aria-invalid={!!decodeError}
                                />
                            )}
                        </div>
                    </section>

                    {/* Divider / swap */}
                    <div className="b64-divider">
                        <button
                            type="button" className="b64-divider-btn"
                            onClick={handleSwap} disabled={!output}
                            aria-label="Swap input and output" title="Swap input and output"
                        >
                            <i className="ti ti-arrows-right-left" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Output panel */}
                    <section className="b64-panel" data-active={mobileView === "output"}>
                        <header className="b64-panel-head">
                            <span className="b64-panel-label">
                                <i className="ti ti-eye" aria-hidden="true" />
                                Output
                            </span>
                            <div className="b64-panel-actions">
                                <button
                                    type="button"
                                    className={`b64-btn b64-btn--sm${copied ? " is-success" : ""}`}
                                    onClick={handleCopy} disabled={!output}
                                >
                                    <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                    {copied ? "Copied" : "Copy"}
                                </button>
                                <button
                                    type="button" className="b64-icon-btn"
                                    onClick={handleDownload} disabled={!output}
                                    title="Download" aria-label="Download output"
                                >
                                    <i className="ti ti-download" aria-hidden="true" />
                                </button>
                            </div>
                        </header>

                        <div className="b64-panel-body">
                            {decodeError ? (
                                <div className="b64-state b64-state--error">
                                    <div className="b64-state-icon">
                                        <i className="ti ti-alert-triangle" aria-hidden="true" />
                                    </div>
                                    <p className="b64-state-title">Can&rsquo;t decode this string</p>
                                    <p className="b64-state-desc">{decodeError}</p>
                                    <ul className="b64-state-list">
                                        <li>Only A–Z, a–z, 0–9, +, /, -, _ and = padding are valid</li>
                                        <li>Check that nothing was cut off when copying</li>
                                    </ul>
                                </div>
                            ) : !output ? (
                                <div className="b64-state">
                                    <div className="b64-state-icon">
                                        <i className="ti ti-arrow-big-right-lines" aria-hidden="true" />
                                    </div>
                                    <p className="b64-state-title">
                                        {mode === "encode"
                                            ? source === "file" ? "Choose a file to encode" : "Output appears here"
                                            : "Output appears here"}
                                    </p>
                                    <p className="b64-state-desc">
                                        {mode === "encode"
                                            ? source === "file"
                                                ? "Drop a file on the left and its Base64 will show up here instantly."
                                                : "Start typing on the left, or"
                                            : "Paste a Base64 string on the left, or"}{" "}
                                        {!(mode === "encode" && source === "file") && (
                                            <button type="button" className="b64-state-link" onClick={handleSample}>
                                                try a sample
                                            </button>
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {mode === "decode" && decodeImageInfo && (
                                        <div className="b64-preview">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`data:${decodeImageInfo.mime};base64,${input.replace(/\s/g, "")}`}
                                                alt="Decoded preview" className="b64-preview-img"
                                            />
                                            <span className="b64-preview-label">
                                                Image preview · {decodeImageInfo.mime} · .{extensionForMime(decodeImageInfo.mime)}
                                            </span>
                                        </div>
                                    )}
                                    {mode === "encode" && source === "file" && file?.mime.startsWith("image/") && !asDataUri && (
                                        <div className="b64-preview">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`data:${file.mime};base64,${file.base64}`}
                                                alt="Source file preview" className="b64-preview-img"
                                            />
                                            <span className="b64-preview-label">Source preview · {file.mime}</span>
                                        </div>
                                    )}
                                    {mode === "decode" && isBinaryOutput && !decodeImageInfo ? (
                                        <div className="b64-state">
                                            <div className="b64-state-icon">
                                                <i className="ti ti-binary" aria-hidden="true" />
                                            </div>
                                            <p className="b64-state-title">Binary data decoded</p>
                                            <p className="b64-state-desc">
                                                This doesn&rsquo;t look like readable text — download it as a raw file.
                                            </p>
                                        </div>
                                    ) : (
                                        <pre className="b64-output" aria-label="Result">{output}</pre>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>

                {/* ── Mobile tab bar ── */}
                <div className="b64-mobile-tabs" role="tablist" aria-label="View">
                    <button
                        type="button" role="tab"
                        aria-selected={mobileView === "input"}
                        className={`b64-mobile-tab${mobileView === "input" ? " is-active" : ""}`}
                        onClick={() => setMobileView("input")}
                    >
                        <i className="ti ti-pencil" aria-hidden="true" />
                        Input
                    </button>
                    <button
                        type="button" className="b64-mobile-swap"
                        onClick={handleSwap} disabled={!output} aria-label="Swap input and output"
                    >
                        <i className="ti ti-arrows-right-left" aria-hidden="true" />
                    </button>
                    <button
                        type="button" role="tab"
                        aria-selected={mobileView === "output"}
                        className={`b64-mobile-tab${mobileView === "output" ? " is-active" : ""}`}
                        onClick={() => setMobileView("output")}
                    >
                        <i className="ti ti-eye" aria-hidden="true" />
                        Output
                        {output && <span className="b64-mobile-dot" aria-hidden="true" />}
                    </button>
                </div>

                {/* ── Status / stats bar (bottom) ── */}
                <div className="b64-status" aria-live="polite">
                    <div className="b64-status-badges">
                        {decodeError && (
                            <span className="b64-badge b64-badge--error">
                                <i className="ti ti-alert-triangle" aria-hidden="true" />
                                {decodeError}
                            </span>
                        )}
                        {!decodeError && detectedUriMime && (
                            <span className="b64-badge b64-badge--info">
                                <i className="ti ti-link" aria-hidden="true" />
                                Detected data URI · {detectedUriMime}
                            </span>
                        )}
                        {!decodeError && !detectedUriMime && decodeImageInfo && (
                            <span className="b64-badge b64-badge--brand">
                                <i className="ti ti-photo" aria-hidden="true" />
                                {decodeImageInfo.mime}
                            </span>
                        )}
                        {!decodeError && !detectedUriMime && !decodeImageInfo && isBinaryOutput && (
                            <span className="b64-badge">
                                <i className="ti ti-binary" aria-hidden="true" />
                                Binary data
                            </span>
                        )}
                        {!decodeError && !detectedUriMime && !decodeImageInfo && !isBinaryOutput && hasContent && (
                            <span className="b64-badge b64-badge--neutral">
                                <i className="ti ti-check" aria-hidden="true" />
                                Ready
                            </span>
                        )}
                    </div>

                    {hasContent && (
                        <div className="b64-stats">
                            <span className="b64-stat">
                                <span className="b64-stat-value">{formatBytes(inputBytes)}</span>
                                <span className="b64-stat-label">in</span>
                            </span>
                            <i className="ti ti-arrow-right b64-stat-arrow" aria-hidden="true" />
                            <span className="b64-stat">
                                <span className="b64-stat-value">{formatBytes(outputBytes)}</span>
                                <span className="b64-stat-label">out</span>
                            </span>
                            {ratio !== null && <span className="b64-ratio">{ratio}%</span>}
                        </div>
                    )}
                </div>

            </div>

            <style>{`
        .b64 {
          --b64-1: 4px;
          --b64-2: 8px;
          --b64-3: 12px;
          --b64-4: 16px;
          --b64-5: 20px;
          --b64-6: 24px;

          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        /* ── Toolbar ── */
        .b64-toolbar {
          display: flex;
          flex-direction: column;
          gap: var(--b64-3);
          padding: var(--b64-3) var(--b64-4);
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }
        .b64-toolbar-row {
          display: flex;
          align-items: center;
          gap: var(--b64-2);
          flex-wrap: wrap;
        }
        .b64-toolbar-row--options { gap: var(--b64-4); }

        .b64-seg {
          display: inline-flex;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 2px;
          gap: 2px;
        }
        .b64-seg--ghost { background: transparent; border-color: var(--border-faint); }

        .b64-seg-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 30px;
          padding: 0 var(--b64-3);
          border: none;
          border-radius: calc(var(--radius-md) - 2px);
          background: transparent;
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
          white-space: nowrap;
        }
        .b64-seg-btn i { font-size: 13px; }
        .b64-seg-btn:hover { color: var(--text); }
        .b64-seg-btn.is-active { background: var(--brand-light); color: var(--brand-text); }

        .b64-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 30px;
          padding: 0 var(--b64-3);
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
          white-space: nowrap;
        }
        .b64-btn i { font-size: 13px; }
        .b64-btn:hover:not(:disabled) { background: var(--bg-surface); color: var(--text); border-color: var(--text-disabled); }
        .b64-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .b64-btn.is-success { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }
        .b64-btn--sm { height: 28px; padding: 0 10px; font-size: 12px; }
        .b64-btn--icon { width: 30px; padding: 0; justify-content: center; }

        .b64-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          border: 0.5px solid transparent;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
          flex-shrink: 0;
        }
        .b64-icon-btn:hover:not(:disabled) { background: var(--bg-card); color: var(--text); border-color: var(--border); }
        .b64-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .b64-icon-btn--danger:hover:not(:disabled) { color: #B91C1C; border-color: #E8B8B8; background: var(--error-bg); }
        @media (prefers-color-scheme: dark) {
          .b64-icon-btn--danger:hover:not(:disabled) { color: #F87171; border-color: #5A2A2A; }
        }

        .b64-spacer { flex: 1; }

        .b64-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          user-select: none;
        }
        .b64-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
        .b64-toggle-track {
          width: 28px;
          height: 16px;
          background: var(--border);
          border-radius: 99px;
          position: relative;
          transition: background 0.15s ease;
          flex-shrink: 0;
        }
        .b64-toggle input:checked + .b64-toggle-track { background: var(--brand); }
        .b64-toggle-thumb {
          position: absolute;
          top: 2px; left: 2px;
          width: 12px; height: 12px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.15s ease;
        }
        .b64-toggle input:checked + .b64-toggle-track .b64-toggle-thumb { transform: translateX(12px); }
        .b64-toggle-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
        }
        .b64-toggle:focus-within .b64-toggle-track { outline: 2px solid var(--brand); outline-offset: 2px; }

        .b64-inline-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          line-height: 1.5;
        }
        .b64-inline-hint i { font-size: 14px; flex-shrink: 0; color: var(--text-disabled); }

        /* ── Panels ── */
        .b64-body {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          flex: 1;
          min-height: 460px;
          border-bottom: 0.5px solid var(--border);
        }

        .b64-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          min-width: 0;
        }

        .b64-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--b64-2);
          height: 40px;
          padding: 0 var(--b64-4);
          border-bottom: 0.5px solid var(--border-faint);
        }
        .b64-panel-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }
        .b64-panel-label i { font-size: 12px; }
        .b64-panel-actions { display: flex; align-items: center; gap: var(--b64-2); }

        .b64-panel-body { flex: 1; display: flex; min-height: 0; }

        /* Divider / swap */
        .b64-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1px;
          background: var(--border);
          position: relative;
        }
        .b64-divider-btn {
          position: absolute;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.12s ease, border-color 0.12s ease, transform 0.15s ease;
        }
        .b64-divider-btn:hover:not(:disabled) { color: var(--brand); border-color: var(--brand-border); transform: scale(1.06); }
        .b64-divider-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .b64-textarea {
          flex: 1;
          padding: var(--b64-4);
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: none;
          tab-size: 2;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .b64-textarea::placeholder { color: var(--text-disabled); font-family: var(--font-sans); font-size: 13px; }

        .b64-output {
          flex: 1;
          margin: 0;
          padding: var(--b64-4);
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.7;
          color: var(--text);
          background: transparent;
          border: none;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .b64-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: var(--b64-2);
          padding: var(--b64-6) var(--b64-5);
        }
        .b64-state-icon {
          width: 44px; height: 44px;
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          color: var(--text-tertiary);
          margin-bottom: 2px;
        }
        .b64-state--error .b64-state-icon { color: #B91C1C; background: var(--error-bg); border-color: #F3D2D2; }
        @media (prefers-color-scheme: dark) {
          .b64-state--error .b64-state-icon { color: #F87171; border-color: #5A2A2A; }
        }
        .b64-state-title { font-size: 14px; font-weight: 600; color: var(--text); margin: 0; font-family: var(--font-sans); letter-spacing: -0.2px; }
        .b64-state-desc { font-size: 12.5px; color: var(--text-secondary); margin: 0; line-height: 1.6; max-width: 300px; font-family: var(--font-sans); }
        .b64-state-list { margin: var(--b64-1) 0 0; padding-left: 1.1em; font-size: 12px; color: var(--text-tertiary); text-align: left; line-height: 1.7; }
        .b64-state-link { background: none; border: none; padding: 0; color: var(--brand); font-size: 12.5px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; }
        .b64-state-link:hover { text-decoration: underline; }

        .b64-preview {
          padding: var(--b64-4);
          border-bottom: 0.5px solid var(--border-faint);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--b64-2);
          background: var(--bg-surface);
          flex-shrink: 0;
        }
        .b64-preview-img { max-height: 140px; max-width: 100%; border-radius: var(--radius-md); object-fit: contain; border: 0.5px solid var(--border); background: var(--bg-card); }
        .b64-preview-label { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); }

        .b64-dropzone {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: var(--b64-4);
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .b64-dropzone:hover, .b64-dropzone.is-drag { border-color: var(--brand); background: var(--brand-light); }
        .b64-dropzone.has-file { border-style: solid; border-color: var(--brand-border); cursor: default; }
        .b64-file-input { display: none; }

        .b64-drop-empty { display: flex; flex-direction: column; align-items: center; gap: var(--b64-1); padding: var(--b64-6); text-align: center; pointer-events: none; }
        .b64-drop-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); background: var(--bg-surface); border: 0.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 19px; color: var(--text-tertiary); margin-bottom: var(--b64-1); }
        .b64-drop-title { font-size: 14px; font-weight: 600; color: var(--text); margin: 0; font-family: var(--font-sans); letter-spacing: -0.2px; }
        .b64-drop-sub { font-size: 12px; color: var(--text-tertiary); margin: 0; font-family: var(--font-sans); }

        .b64-file-card { display: flex; align-items: center; gap: var(--b64-3); padding: var(--b64-3) var(--b64-4); width: 100%; }
        .b64-file-thumb { width: 40px; height: 40px; border-radius: var(--radius-md); object-fit: cover; border: 0.5px solid var(--border); flex-shrink: 0; }
        .b64-file-icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--brand-light); border: 0.5px solid var(--brand-border); display: flex; align-items: center; justify-content: center; font-size: 17px; color: var(--brand); flex-shrink: 0; }
        .b64-file-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .b64-file-name { font-size: 13px; font-weight: 600; color: var(--text); font-family: var(--font-sans); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .b64-file-sub { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* ── Mobile tab bar ── */
        .b64-mobile-tabs { display: none; }

        /* ── Status / stats bar (bottom) ── */
        .b64-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--b64-3);
          min-height: 42px;
          padding: 0 var(--b64-4);
          background: var(--bg-surface);
          font-family: var(--font-sans);
          flex-wrap: wrap;
        }
        .b64-status-badges { display: flex; align-items: center; gap: var(--b64-2); padding: var(--b64-2) 0; flex-wrap: wrap; }

        .b64-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          padding: 4px 10px;
          border-radius: 99px;
        }
        .b64-badge i { font-size: 13px; }
        .b64-badge--error { color: #B91C1C; background: var(--error-bg); border-color: #F3D2D2; }
        .b64-badge--info { color: var(--text); background: var(--bg-surface); border-color: var(--border); }
        .b64-badge--brand { color: var(--brand-text); background: var(--brand-light); border-color: var(--brand-border); }
        .b64-badge--neutral { color: var(--text-tertiary); background: transparent; border-color: var(--border-faint); }
        @media (prefers-color-scheme: dark) {
          .b64-badge--error { color: #F87171; border-color: #5A2A2A; }
        }

        .b64-stats {
          display: flex;
          align-items: center;
          gap: var(--b64-2);
          font-size: 12px;
          color: var(--text-secondary);
          padding: var(--b64-2) 0;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .b64-stat { display: inline-flex; align-items: baseline; gap: 4px; }
        .b64-stat-value { font-weight: 600; color: var(--text); font-family: var(--font-mono); font-size: 11.5px; }
        .b64-stat-label { font-size: 10.5px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; }
        .b64-stat-arrow { font-size: 11px; color: var(--text-disabled); }
        .b64-ratio {
          font-size: 11px;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--brand-text);
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          padding: 2px 8px;
          border-radius: 99px;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .b64-body { min-height: 420px; }
        }

        @media (max-width: 768px) {
          .b64-toolbar { padding: var(--b64-3); gap: var(--b64-2); }
          .b64-toolbar-row { gap: var(--b64-2); }
          .b64-toolbar-row--options { gap: var(--b64-3); flex-wrap: wrap; }
          .b64-btn-label { display: none; }
          .b64-btn { padding: 0 9px; }
          .b64-inline-hint { font-size: 11.5px; }

          .b64-body {
            grid-template-columns: 1fr;
            min-height: 0;
          }
          .b64-divider { display: none; }
          .b64-panel { display: none; }
          .b64-panel[data-active="true"] { display: flex; min-height: 320px; }
          .b64-panel-head { padding: 0 var(--b64-3); }
          .b64-textarea, .b64-output { padding: var(--b64-3); font-size: 12.5px; }

          .b64-mobile-tabs {
            display: flex;
            align-items: center;
            gap: var(--b64-2);
            padding: var(--b64-2) var(--b64-3);
            border-top: 0.5px solid var(--border);
            border-bottom: 0.5px solid var(--border);
            background: var(--bg-surface);
          }
          .b64-mobile-tab {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 38px;
            border-radius: var(--radius-md);
            border: 0.5px solid var(--border);
            background: var(--bg-card);
            color: var(--text-secondary);
            font-size: 12.5px;
            font-weight: 600;
            font-family: var(--font-sans);
            position: relative;
            cursor: pointer;
            transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
          }
          .b64-mobile-tab i { font-size: 14px; }
          .b64-mobile-tab.is-active { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }
          .b64-mobile-dot { position: absolute; top: 6px; right: 8px; width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
          .b64-mobile-tab.is-active .b64-mobile-dot { display: none; }
          .b64-mobile-swap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 38px; height: 38px;
            border-radius: var(--radius-md);
            border: 0.5px solid var(--border);
            background: var(--bg-card);
            color: var(--text-secondary);
            font-size: 14px;
            cursor: pointer;
            flex-shrink: 0;
            transition: color 0.12s ease, border-color 0.12s ease;
          }
          .b64-mobile-swap:hover:not(:disabled) { color: var(--brand); border-color: var(--brand-border); }
          .b64-mobile-swap:disabled { opacity: 0.4; cursor: not-allowed; }

          .b64-status { padding: var(--b64-2) var(--b64-3); min-height: 38px; }
          .b64-stats { font-size: 11px; }
          .b64-stat-value { font-size: 11px; }
        }

        @media (max-width: 480px) {
          .b64-seg-btn { padding: 0 var(--b64-2); font-size: 12px; }
          .b64-seg-btn i { display: none; }
          .b64-stats { gap: 6px; }
          .b64-stat-label { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .b64-seg-btn, .b64-btn, .b64-icon-btn, .b64-toggle-track,
          .b64-toggle-thumb, .b64-dropzone, .b64-divider-btn,
          .b64-mobile-tab, .b64-mobile-swap {
            transition: none;
          }
        }
      `}</style>
        </>
    );
}