// features/dev/base64-encoder/utils.ts

export type Mode = "encode" | "decode";
export type InputSource = "text" | "file";

export const SAMPLE_TEXT =
    "Toolverse turns everyday file tasks into one click — right in your browser. ✨";

export const SAMPLE_BASE64 =
    "VG9vbHZlcnNlIHR1cm5zIGV2ZXJ5ZGF5IGZpbGUgdGFza3MgaW50byBvbmUgY2xpY2sg4oCUIHJpZ2h0IGluIHlvdXIgYnJvd3Nlci4g4pyo";

/* ── Core encode / decode ─────────────────────────────────────── */

export function encodeBase64(str: string): string {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch {
        return btoa(str);
    }
}

function normalizeBase64(str: string): string {
    let s = str.replace(/\s/g, "");
    // Accept URL-safe alphabets transparently.
    if (s.includes("-") || s.includes("_")) {
        s = s.replace(/-/g, "+").replace(/_/g, "/");
    }
    while (s.length % 4 !== 0) s += "=";
    return s;
}

export function decodeBase64(str: string): { text: string; error?: string } {
    try {
        const normalized = normalizeBase64(str);
        const decoded = atob(normalized);
        try {
            return { text: decodeURIComponent(escape(decoded)) };
        } catch {
            return { text: decoded };
        }
    } catch {
        return {
            text: "",
            error: "This doesn't look like valid Base64.",
        };
    }
}

export function decodeBase64ToBytes(str: string): Uint8Array {
    const normalized = normalizeBase64(str);
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

/* ── Formatting helpers ───────────────────────────────────────── */

export function toUrlSafe(b64: string): string {
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function wrapLines(b64: string, width = 76): string {
    const clean = b64.replace(/\s/g, "");
    const lines: string[] = [];
    for (let i = 0; i < clean.length; i += width) {
        lines.push(clean.slice(i, i + width));
    }
    return lines.join("\n");
}

export function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/* ── Detection ─────────────────────────────────────────────────── */

const MIME_SIGNATURES: { prefix: string; mime: string; ext: string }[] = [
    { prefix: "/9j/", mime: "image/jpeg", ext: "jpg" },
    { prefix: "iVBORw0KGgo", mime: "image/png", ext: "png" },
    { prefix: "R0lGOD", mime: "image/gif", ext: "gif" },
    { prefix: "UklGR", mime: "image/webp", ext: "webp" },
    { prefix: "PHN2Z", mime: "image/svg+xml", ext: "svg" },
    { prefix: "JVBERi0", mime: "application/pdf", ext: "pdf" },
];

export function detectMime(b64: string): { mime: string; ext: string } | null {
    const clean = b64.replace(/\s/g, "");
    for (const sig of MIME_SIGNATURES) {
        if (clean.startsWith(sig.prefix)) return { mime: sig.mime, ext: sig.ext };
    }
    return null;
}

const DATA_URI_RE = /^data:([\w.+-]+\/[\w.+-]+)(?:;[\w-]+=[\w-]*)*;base64,/i;

/** Detects a `data:<mime>;base64,<payload>` string and splits it. */
export function stripDataUri(input: string): { mime: string; data: string } | null {
    const trimmed = input.trim();
    const match = trimmed.match(DATA_URI_RE);
    if (!match) return null;
    return { mime: match[1], data: trimmed.slice(match[0].length) };
}

/** Heuristic: does decoded text look like binary data rather than readable text? */
export function looksBinary(str: string): boolean {
    if (!str) return false;
    const len = Math.min(str.length, 2000);
    let nonPrintable = 0;
    for (let i = 0; i < len; i++) {
        const c = str.charCodeAt(i);
        if (c === 0xfffd) nonPrintable++; // replacement char from bad UTF-8
        else if (c < 32 && c !== 9 && c !== 10 && c !== 13) nonPrintable++;
    }
    return nonPrintable / len > 0.05;
}

export function extensionForMime(mime: string): string {
    const map: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "application/pdf": "pdf",
    };
    return map[mime] ?? "bin";
}

/* ── File I/O ──────────────────────────────────────────────────── */

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = (e.target?.result as string) ?? "";
            resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}