// features\dev\base64-encoder\ts\utils.ts
export type Mode = "encode" | "decode";
export type InputSource = "text" | "file";
export type Charset = "UTF-8" | "UTF-16" | "ASCII" | "ISO-8859-1";

export interface EncodingOptions {
  urlSafe: boolean;
  wrapLines: boolean;
  lineWidth: number;
  asDataUri: boolean;
  charset: Charset;
  padding: boolean;
}

// Added for history
export interface HistoryEntry {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  timestamp: number;
  options: EncodingOptions;
}

/*  Sample data  */
export const SAMPLE_TEXT =
  "Toolverse turns everyday file tasks into one click — right in your browser. ✨";

export const SAMPLE_BASE64 =
  "VG9vbHZlcnNlIHR1cm5zIGV2ZXJ5ZGF5IGZpbGUgdGF0cmVwaW5n4oCUIHJpZ2h0IGluIHlvdXJicm93c2VyLiDigJw=";

/*  Core encode / decode  */

/**
 * Convert a string to a byte array according to the specified charset.
 */
function stringToBytes(str: string, charset: Charset): Uint8Array {
  if (charset === "UTF-8") {
    return new TextEncoder().encode(str);
  }
  if (charset === "UTF-16") {
    // UTF-16LE without BOM
    const codeUnits = new Uint16Array(str.length);
    for (let i = 0; i < str.length; i++) {
      codeUnits[i] = str.charCodeAt(i);
    }
    // Convert UTF-16 code units to bytes (little endian: low byte first)
    const bytes = new Uint8Array(codeUnits.length * 2);
    for (let i = 0; i < codeUnits.length; i++) {
      const codeUnit = codeUnits[i];
      bytes[i * 2] = codeUnit & 0xff; // LSB
      bytes[i * 2 + 1] = (codeUnit >> 8) & 0xff; // MSB
    }
    return bytes;
  }
  if (charset === "ASCII") {
    // Remove non-ASCII characters (code point > 127) and convert to bytes
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code <= 0x7f) {
        bytes.push(code);
      }
      // else skip (as per original behavior)
    }
    return new Uint8Array(bytes);
  }
  // ISO-8859-1 (Latin-1)
  // Map each character to its low 8 bits (lossy for characters above U+00FF)
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Convert a byte array to a string according to the specified charset.
 */
function bytesToString(bytes: Uint8Array, charset: Charset): string {
  if (charset === "UTF-8") {
    return new TextDecoder().decode(bytes);
  }
  if (charset === "UTF-16") {
    // Convert bytes to UTF-16 code units (little endian)
    const codeUnits = new Uint16Array(bytes.length / 2);
    for (let i = 0; i < codeUnits.length; i++) {
      const lsb = bytes[i * 2];
      const msb = bytes[i * 2 + 1];
      codeUnits[i] = lsb | (msb << 8);
    }
    // Convert UTF-16 code units to string
    return String.fromCharCode(...codeUnits);
  }
  if (charset === "ASCII") {
    // For ASCII, we only accept bytes 0-127; otherwise replace with '?' (U+FFFD)
    let chars = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b <= 0x7f) {
        chars += String.fromCharCode(b);
      } else {
        // Replace non-ASCII byte with unicode replacement character
        chars += "�";
      }
    }
    return chars;
  }
  // ISO-8859.1 (Latin-1)
  return new TextDecoder("iso-8859-1").decode(bytes);
}

export function encodeBase64(input: string | File, options: EncodingOptions): string {
  if (input instanceof File) {
    // File encoding is handled separately in the component via readFileAsBase64
    // This function should not be called for File input; return empty string as placeholder.
    return "";
  }

  try {
    // Convert string to bytes according to charset
    const bytes = stringToBytes(input, options.charset);
    // Convert bytes to a string where each char code is the byte value
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let encoded = btoa(binary);

    if (options.urlSafe) {
      encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_");
    }

    if (!options.padding) {
      encoded = encoded.replace(/=+$/, "");
    }

    if (options.wrapLines) {
      encoded = wrapLines(encoded, options.lineWidth);
    }

    return encoded;
  } catch (e) {
    // Fallback to UTF-8 encoding in case of unexpected error
    try {
      const bytes = new TextEncoder().encode(input);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] && (binary += String.fromCharCode(bytes[i]));
      }
      let encoded = btoa(binary);
      if (options.urlSafe) {
        encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_");
      }
      if (!options.padding) {
        encoded = encoded.replace(/=+$/, "");
      }
      if (options.wrapLines) {
        encoded = wrapLines(encoded, options.lineWidth);
      }
      return encoded;
    } catch (e2) {
      // Last resort: return empty string
      return "";
    }
  }
}

export function encodeFile(file: File, options: EncodingOptions): string {
  // This would need to be async in real implementation
  // For now, return empty string - actual implementation in component
  return "";
}

export function normalizeBase64(str: string): string {
  let s = str.replace(/\s/g, "");

  // Accept URL-safe alphabets transparently
  if (s.includes("-") || s.includes("_")) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
  }

  // Add padding if needed
  while (s.length % 4 !== 0) s += "=";

  return s;
}

export function decodeBase64(
  str: string,
  options: EncodingOptions
): { text: string; error?: string; bytes?: Uint8Array } {
  try {
    let data = str;

    // Handle data URI prefix if option is enabled
    if (options.asDataUri) {
      const dataUriMatch = data.match(/^data:([\w.+-]+\/[\w.+-]+)(?:;[\w-]+=[\w-]*)*;base64,/i);
      if (dataUriMatch) {
        data = data.slice(dataUriMatch[0].length);
      }
    }

    // Handle URL-safe encoding if option is enabled
    if (options.urlSafe) {
      data = data.replace(/-/g, "+").replace(/_/g, "/");
    }

    // Handle line wrapping if option is enabled
    if (options.wrapLines) {
      data = data.replace(/\s/g, "");
    }

    // Normalize (handles padding and ensures valid base64 characters)
    const normalized = normalizeBase64(data);
    const binary = atob(normalized); // string where each char code is a byte

    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert bytes to string according to charset
    const text = bytesToString(bytes, options.charset);

    return { text, bytes };
  } catch (e) {
    return {
      text: "",
      error: "Invalid Base64 string",
    };
  }
}

/*  Formatting helpers  */

export function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function fromUrlSafe(b64: string): string {
  return b64.replace(/-/g, "+").replace(/_/g, "/");
}

export function wrapLines(b64: string, width = 76): string {
  const clean = b64.replace(/\s/g, "");
  const lines: string[] = [];
  for (let i = 0; i < clean.length; i += width) {
    lines.push(clean.slice(i, i + width));
  }
  return lines.join("\n");
}

// Import shared utilities
import { formatBytes, copyToClipboard, downloadBlob } from "@/utils";

/*  Detection  */

const MIME_SIGNATURES: { prefix: string; mime: string; ext: string }[] = [
  { prefix: "/9j/", mime: "image/jpeg", ext: "jpg" },
  { prefix: "iVBORw0KGgo", mime: "image/png", ext: "png" },
  { prefix: "R0lGOD", mime: "image/gif", ext: "gif" },
  { prefix: "UklGR", mime: "image/webp", ext: "webp" },
  { prefix: "PHN2Z", mime: "image/svg+xml", ext: "svg" },
  { prefix: "JVBERi0", mime: "application/pdf", ext: "pdf" },
  { prefix: "UEsDB", mime: "application/zip", ext: "zip" },
  { prefix: "PD94bWw", mime: "application/xml", ext: "xml" },
  { prefix: "e1xydGYx", mime: "application/rtf", ext: "rtf" },
];

export function detectMime(b64: string): { mime: string; ext: string } | null {
  const clean = b64.replace(/\s/g, "");
  for (const sig of MIME_SIGNATURES) {
    if (clean.startsWith(sig.prefix)) return { mime: sig.mime, ext: sig.ext };
  }
  return null;
}

export function stripDataUri(input: string): { mime: string; data: string } | null {
  const DATA_URI_RE = /^data:([\w.+-]+\/[\w.+-]+)(?:;[\w-]+=[\w-]*)*;base64,/i;
  const trimmed = input.trim();
  const match = trimmed.match(DATA_URI_RE);
  if (!match) return null;
  return { mime: match[1], data: trimmed.slice(match[0].length) };
}

export function looksBinary(str: string): boolean {
  if (!str) return false;
  const len = Math.min(str.length, 2000);
  let nonPrintable = 0;
  for (let i = 0; i < len; i++) {
    const c = str.charCodeAt(i);
    if (c === 0xfffd) nonPrintable++;
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
    "application/pdf": "pdf",
    "application/zip": "zip",
    "text/plain": "txt",
    "text/html": "html",
    "application/json": "json",
  };
  return map[mime] ?? "bin";
}

/*  File I/O  */

export async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target?.result as string) ?? "";
      // Extract base64 part (after comma)
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/*  Validation  */

export function validateBase64(str: string): { valid: boolean; error?: string } {
  const cleaned = str.replace(/\s/g, "");

  if (!cleaned) {
    return { valid: false, error: "Empty input" };
  }

  // Check for valid characters
  if (!/^[A-Za-z0-9+/\-_]*={0,2}$/.test(cleaned)) {
    return { valid: false, error: "Contains invalid characters" };
  }

  // Check length (must be multiple of 4 when padded)
  const withoutPadding = cleaned.replace(/=/g, "");
  const paddingNeeded = (4 - (withoutPadding.length % 4)) % 4;
  const padded = withoutPadding + "=".repeat(paddingNeeded);

  if (padded.length % 4 !== 0) {
    return { valid: false, error: "Invalid length" };
  }

  try {
    atob(normalizeBase64(cleaned));
    return { valid: true };
  } catch {
    return { valid: false, error: "Failed to decode" };
  }
}

/*  Chunking for large files  */

export function* chunkString(str: string, size: number): Generator<string> {
  for (let i = 0; i < str.length; i += size) {
    yield str.slice(i, i + size);
  }
}

export async function encodeFileInChunks(
  file: File,
  chunkSize: number = 1024 * 1024, // 1MB chunks
  onProgress?: (progress: number) => void
): Promise<string> {
  const chunks: string[] = [];
  let offset = 0;

  while (offset < file.size) {
    const blob = file.slice(offset, offset + chunkSize);
    const base64 = await readFileAsBase64(new File([blob], "chunk"));
    chunks.push(base64);

    offset += chunkSize;
    if (onProgress) {
      onProgress((offset / file.size) * 100);
    }
  }

  return chunks.join("");
}