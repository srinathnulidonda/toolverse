// features/dev/url-encoder/utils.ts

import {
  formatBytes as _formatBytes,
  copyToClipboard as _copyToClipboard,
  downloadAsFile as _downloadAsFile,
} from "@/utils";

export type Mode = "encode" | "decode";
export type EncodeMethod = "component" | "full" | "query";

export interface EncodingOptions {
  method: EncodeMethod;
  spaceAsPlus: boolean;
  preserveCase: boolean;
  encoding: "UTF-8" | "UTF-16" | "ISO-8859-1";
}

export interface UrlParts {
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  searchParams: [string, string][];
  hash: string;
  raw: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  security: SecurityScore;
}

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  message: string;
  position?: number;
}

export interface SecurityScore {
  score: number; // 0-100
  level: "safe" | "caution" | "warning" | "danger";
  risks: string[];
}

export interface DiffChar {
  char: string;
  changed: boolean;
  type?: "encoded" | "decoded";
}

/*  Sample data  */
export const SAMPLE_URLS = {
  search: {
    plain: "https://example.com/search?q=hello world&lang=en&price>100",
    encoded: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26price%3E100",
  },
  api: {
    plain: "https://api.example.com/v1/users?filter=name:João & role=admin",
    encoded:
      "https%3A%2F%2Fapi.example.com%2Fv1%2Fusers%3Ffilter%3Dname%3AJo%C3%A3o%20%26%20role%3Dadmin",
  },
  redirect: {
    plain:
      "https://auth.example.com/login?redirect=https://app.example.com/dashboard?tab=analytics",
    encoded:
      "https%3A%2F%2Fauth.example.com%2Flogin%3Fredirect%3Dhttps%3A%2F%2Fapp.example.com%2Fdashboard%3Ftab%3Danalytics",
  },
  social: {
    plain: "https://twitter.com/share?text=Check this out! 🚀&url=https://example.com",
    encoded:
      "https%3A%2F%2Ftwitter.com%2Fshare%3Ftext%3DCheck%20this%20out!%20%F0%9F%9A%80%26url%3Dhttps%3A%2F%2Fexample.com",
  },
};

export const ENCODE_METHODS = [
  {
    id: "component" as const,
    label: "Component",
    short: "URI",
    icon: "ti-brackets",
    desc: "encodeURIComponent — encodes everything including / and ?",
    example: "hello world → hello%20world",
  },
  {
    id: "full" as const,
    label: "Full URL",
    short: "URL",
    icon: "ti-world",
    desc: "Preserves URL structure (/, ?, &, =) — only unsafe chars encoded",
    example: "https://example.com/path → https://example.com/path",
  },
  {
    id: "query" as const,
    label: "Query String",
    short: "QS",
    icon: "ti-forms",
    desc: "Query-string safe — spaces become +",
    example: "hello world → hello+world",
  },
];

/*  Core encoding/decoding  */

export function encodeUrl(str: string, options: EncodingOptions): string {
  if (!str.trim()) return "";

  try {
    switch (options.method) {
      case "component":
        return encodeURIComponent(str);

      case "query": {
        let encoded = str.replace(/[^A-Za-z0-9 \-_.~]/g, (c) => encodeURIComponent(c));
        return options.spaceAsPlus ? encoded.replace(/ /g, "+") : encoded;
      }

      case "full": {
        // Preserve URL structure characters
        return str
          .split("")
          .map((c) => {
            if (/[A-Za-z0-9\-_.~:/?#[\]@!$&'()*+,;=%]/.test(c)) return c;
            return encodeURIComponent(c);
          })
          .join("");
      }
    }
  } catch (e) {
    throw new Error("Encoding failed: " + (e instanceof Error ? e.message : "Unknown error"));
  }
}

export function decodeUrl(
  str: string,
  options?: EncodingOptions
): { result: string; error?: string } {
  try {
    // Handle + as space if needed
    const input = options?.spaceAsPlus ? str.replace(/\+/g, " ") : str;
    const result = decodeURIComponent(input);
    return { result };
  } catch (e) {
    // Fallback to unescape for older encoding
    try {
      return { result: unescape(str) };
    } catch {
      return {
        result: "",
        error: "Invalid percent-encoded sequence",
      };
    }
  }
}

export function parseUrl(raw: string): UrlParts | null {
  try {
    // Add protocol if missing
    const urlString = raw.includes("://") ? raw : "https://" + raw;
    const u = new URL(urlString);

    const searchParams: [string, string][] = [];
    u.searchParams.forEach((value, key) => {
      searchParams.push([key, value]);
    });

    return {
      protocol: u.protocol.replace(":", ""),
      username: u.username,
      password: u.password,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      searchParams,
      hash: u.hash.replace("#", ""),
      raw: u.href,
    };
  } catch {
    return null;
  }
}

export function buildUrl(parts: Partial<UrlParts>): string {
  let url = "";

  // Protocol
  url += (parts.protocol || "https") + "://";

  // Auth
  if (parts.username) {
    url += parts.username;
    if (parts.password) url += ":" + parts.password;
    url += "@";
  }

  // Host
  url += parts.hostname || "example.com";

  // Port
  if (parts.port) url += ":" + parts.port;

  // Path
  url += parts.pathname || "/";

  // Query
  if (parts.searchParams && parts.searchParams.length > 0) {
    const qs = parts.searchParams.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    url += "?" + qs;
  }

  // Hash
  if (parts.hash) url += "#" + parts.hash;

  return url;
}

/*  Validation & Security  */

export function validateUrl(str: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const risks: string[] = [];

  if (!str.trim()) {
    return {
      valid: false,
      issues: [{ type: "error", message: "Empty input" }],
      security: { score: 0, level: "safe", risks: [] },
    };
  }

  // Check for valid URL structure and allowed protocols
  try {
    const url = new URL(str.includes("://") ? str : "https://" + str);
    if (!["http:", "https:", "ftp:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol");
    }
  } catch {
    issues.push({ type: "error", message: "Invalid URL structure or unsupported protocol" });
  }

  // Security checks
  const lower = str.toLowerCase();

  // XSS patterns
  if (/<script|javascript:|onerror=|onload=/i.test(str)) {
    risks.push("Potential XSS vulnerability detected");
    issues.push({ type: "warning", message: "Contains script-related patterns" });
  }

  // SQL injection patterns
  if (/(union\s+select|drop\s+table|insert\s+into)/i.test(str)) {
    risks.push("SQL injection pattern detected");
    issues.push({ type: "warning", message: "Contains SQL-like keywords" });
  }

  // Excessive encoding
  const percentCount = (str.match(/%/g) || []).length;
  if (percentCount > str.length * 0.5) {
    risks.push("Highly encoded - may obfuscate malicious content");
    issues.push({ type: "info", message: "Heavily percent-encoded" });
  }

  // Double encoding
  if (/%25/.test(str)) {
    risks.push("Double encoding detected");
    issues.push({ type: "warning", message: "Contains double-encoded characters" });
  }

  // Suspicious TLDs
  if (/\.(tk|ml|ga|cf|gq)\b/i.test(str)) {
    risks.push("Free TLD often used in phishing");
    issues.push({ type: "info", message: "Uses free top-level domain" });
  }

  // Data URLs
  if (/^data:/i.test(str)) {
    risks.push("Data URL detected");
    issues.push({ type: "info", message: "Data URL scheme" });
  }

  // Calculate security score
  let score = 100;
  score -= risks.length * 15;
  score = Math.max(0, score);

  const level: SecurityScore["level"] =
    score >= 90 ? "safe" : score >= 70 ? "caution" : score >= 50 ? "warning" : "danger";

  return {
    valid: issues.filter((i) => i.type === "error").length === 0,
    issues,
    security: { score, level, risks },
  };
}

/*  Comparison & Diff  */

export function diffChars(a: string, b: string): { input: DiffChar[]; output: DiffChar[] } {
  if (!a || !b) return { input: [], output: [] };

  const input: DiffChar[] = [];
  const output: DiffChar[] = [];
  const maxLen = Math.max(a.length, b.length);

  for (let i = 0; i < maxLen; i++) {
    const charA = a[i] ?? "";
    const charB = b[i] ?? "";
    const changed = charA !== charB;

    if (charA) {
      input.push({ char: charA, changed, type: "decoded" });
    }
    if (charB) {
      output.push({ char: charB, changed, type: "encoded" });
    }
  }

  return { input, output };
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.includes("://") ? url : "https://" + url);
    // Sort query parameters for consistent comparison
    const params = Array.from(u.searchParams.entries()).sort();
    u.search = "";
    params.forEach(([k, v]) => u.searchParams.append(k, v));
    return u.href;
  } catch {
    return url;
  }
}

/*  Stats & Analysis  */

export function analyzeUrl(
  input: string,
  output: string,
  mode: Mode
): {
  inputBytes: number;
  outputBytes: number;
  percentCount: number;
  ratio: number;
  delta: number;
  safety: SecurityScore;
} {
  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;
  const percentCount = (output.match(/%[0-9A-Fa-f]{2}/g) || []).length;
  const ratio = inputBytes > 0 ? Math.round((outputBytes / inputBytes) * 100) : 0;
  const delta = outputBytes - inputBytes;

  // Safety score
  const validation = validateUrl(mode === "encode" ? input : output);

  return {
    inputBytes,
    outputBytes,
    percentCount,
    ratio,
    delta,
    safety: validation.security,
  };
}

export function getCharacterDistribution(str: string): {
  letters: number;
  numbers: number;
  special: number;
  encoded: number;
  whitespace: number;
} {
  const dist = {
    letters: 0,
    numbers: 0,
    special: 0,
    encoded: 0,
    whitespace: 0,
  };

  for (const char of str) {
    if (/[a-zA-Z]/.test(char)) dist.letters++;
    else if (/[0-9]/.test(char)) dist.numbers++;
    else if (/\s/.test(char)) dist.whitespace++;
    else if (char === "%") dist.encoded++;
    else dist.special++;
  }

  return dist;
}

/*  Formatting  */

export function formatBytes(n: number): string {
  return _formatBytes(n);
}

/*  Export formats  */

export function exportAsJson(parts: UrlParts): string {
  return JSON.stringify(
    {
      protocol: parts.protocol,
      host: parts.hostname,
      port: parts.port || null,
      path: parts.pathname,
      query: Object.fromEntries(parts.searchParams),
      hash: parts.hash || null,
    },
    null,
    2
  );
}

export function exportAsCsv(params: [string, string][]): string {
  const rows = params.map(
    ([key, value]) => `"${key.replace(/"/g, '""')}","${value.replace(/"/g, '""')}"`
  );
  return ["Key,Value", ...rows].join("\n");
}

export function exportAsCurl(url: string): string {
  return `curl -X GET "${url}" \\\n  -H "Accept: application/json"`;
}

/*  Clipboard  */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await _copyToClipboard(text);
    return true;
  } catch {
    return false;
  }
}

/*  Download  */

export function downloadAsFile(content: string, filename: string, type = "text/plain") {
  _downloadAsFile(content, filename, type);
}
