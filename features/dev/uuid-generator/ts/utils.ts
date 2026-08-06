// features/dev/uuid-generator/ts/utils.ts

export type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v6" | "v7" | "nil";
export type UuidFormat = "standard" | "no-hyphens" | "braces" | "urn" | "base64" | "hex";
export type UuidCase = "lowercase" | "uppercase" | "mixed";

export interface UuidGenerateOptions {
  version: UuidVersion;
  format: UuidFormat;
  case: UuidCase;
  namespace?: string;
  name?: string;
}

export interface UuidAnalysis {
  version: number | null;
  variant: string;
  timestamp?: number;
  timestampDate?: string;
  clockSequence?: number;
  node?: string;
  isValid: boolean;
  format: UuidFormat;
  errors: string[];
}

/*  RFC 4122 Namespaces  */
export const NAMESPACES = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
} as const;

/*  Version metadata  */
export const VERSION_INFO: Record<
  UuidVersion,
  {
    label: string;
    desc: string;
    useCase: string;
    sortable: boolean;
  }
> = {
  v1: {
    label: "v1",
    desc: "Time-based with MAC address",
    useCase: "Legacy systems, sortable by time",
    sortable: true,
  },
  v3: {
    label: "v3",
    desc: "Namespace + MD5 hash",
    useCase: "Deterministic IDs from names (legacy)",
    sortable: false,
  },
  v4: {
    label: "v4",
    desc: "Random",
    useCase: "Most common, crypto-random",
    sortable: false,
  },
  v5: {
    label: "v5",
    desc: "Namespace + SHA-1 hash",
    useCase: "Deterministic IDs from names",
    sortable: false,
  },
  v6: {
    label: "v6",
    desc: "Reordered time-based",
    useCase: "Database-friendly v1 (sortable)",
    sortable: true,
  },
  v7: {
    label: "v7",
    desc: "Unix timestamp + random",
    useCase: "Modern sortable UUIDs (recommended)",
    sortable: true,
  },
  nil: {
    label: "Nil",
    desc: "All zeros",
    useCase: "Null/empty sentinel value",
    sortable: false,
  },
};

/*  Generation  */

export function generateV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateV1(): string {
  const now = Date.now();
  const ticks = now * 10000 + 0x01b21dd213814000; // UUID epoch offset

  const timeLow = (ticks & 0xffffffff).toString(16).padStart(8, "0");
  const timeMid = ((ticks / 0x100000000) & 0xffff).toString(16).padStart(4, "0");
  const timeHi = (((ticks / 0x1000000000000) & 0x0fff) | 0x1000).toString(16).padStart(4, "0");

  const clockSeq = ((Math.random() * 0x4000) | 0x8000).toString(16).padStart(4, "0");
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");

  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
}

export function generateV6(): string {
  const now = Date.now();
  const ticks = now * 10000 + 0x01b21dd213814000;

  const timeHi = ((ticks / 0x1000000000000) & 0x0fff).toString(16).padStart(3, "0");
  const timeMid = ((ticks / 0x100000000) & 0xffff).toString(16).padStart(4, "0");
  const timeLow = (ticks & 0xffffffff).toString(16).padStart(8, "0");

  const version = "6";
  const clockSeq = ((Math.random() * 0x4000) | 0x8000).toString(16).padStart(4, "0");
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");

  return `${timeMid}${timeHi}-${timeLow.slice(0, 4)}-${version}${timeLow.slice(4)}-${clockSeq}-${node}`;
}

export function generateV7(): string {
  const now = Date.now();
  const msHex = now.toString(16).padStart(12, "0");

  const rand12 = Math.floor(Math.random() * 0x1000)
    .toString(16)
    .padStart(3, "0");
  const rand62 = Array.from({ length: 15 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    ""
  );

  const variant = ((parseInt(rand62[0], 16) & 0x3) | 0x8).toString(16);

  return `${msHex.slice(0, 8)}-${msHex.slice(8, 12)}-7${rand12}-${variant}${rand62.slice(1, 4)}-${rand62.slice(4)}`;
}

async function generateV3(namespace: string, name: string): Promise<string> {
  return generateNamespaceUuid(namespace, name, "MD5", 3);
}

async function generateV5(namespace: string, name: string): Promise<string> {
  return generateNamespaceUuid(namespace, name, "SHA-1", 5);
}

async function generateNamespaceUuid(
  namespace: string,
  name: string,
  algorithm: "MD5" | "SHA-1",
  version: 3 | 5
): Promise<string> {
  const nsBytes = uuidToBytes(normalizeUuid(namespace));
  const nameBytes = new TextEncoder().encode(name);
  const combined = new Uint8Array(nsBytes.length + nameBytes.length);
  combined.set(nsBytes);
  combined.set(nameBytes, nsBytes.length);

  const hashAlgo = algorithm === "MD5" ? "MD5" : "SHA-1";
  let hashBuffer: ArrayBuffer;

  if (typeof crypto !== "undefined" && crypto.subtle) {
    hashBuffer = await crypto.subtle.digest(hashAlgo, combined);
  } else {
    // Fallback for environments without crypto.subtle
    throw new Error(`${hashAlgo} not available in this environment`);
  }

  const hashArray = new Uint8Array(hashBuffer);
  const hash = Array.from(hashArray.slice(0, 16));

  // Set version and variant bits
  hash[6] = (hash[6] & 0x0f) | (version << 4);
  hash[8] = (hash[8] & 0x3f) | 0x80;

  return bytesToUuid(new Uint8Array(hash));
}

export function generateNil(): string {
  return "00000000-0000-0000-0000-000000000000";
}

export async function generate(options: UuidGenerateOptions): Promise<string> {
  let uuid: string;

  switch (options.version) {
    case "v1":
      uuid = generateV1();
      break;
    case "v3":
      if (!options.namespace || !options.name) {
        throw new Error("v3 requires namespace and name");
      }
      uuid = await generateV3(options.namespace, options.name);
      break;
    case "v4":
      uuid = generateV4();
      break;
    case "v5":
      if (!options.namespace || !options.name) {
        throw new Error("v5 requires namespace and name");
      }
      uuid = await generateV5(options.namespace, options.name);
      break;
    case "v6":
      uuid = generateV6();
      break;
    case "v7":
      uuid = generateV7();
      break;
    case "nil":
      uuid = generateNil();
      break;
    default:
      uuid = generateV4();
  }

  return formatUuid(uuid, options.format, options.case);
}

/*  Formatting  */

export function normalizeUuid(uuid: string): string {
  let clean = uuid.trim();

  // Remove common prefixes/wrappers
  if (clean.startsWith("urn:uuid:")) {
    clean = clean.slice(9);
  }
  if (clean.startsWith("{") && clean.endsWith("}")) {
    clean = clean.slice(1, -1);
  }

  // Remove hyphens
  clean = clean.replace(/-/g, "");

  // Validate length
  if (clean.length !== 32) {
    throw new Error("Invalid UUID length");
  }

  // Add hyphens back
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
}

export function formatUuid(
  uuid: string,
  format: UuidFormat,
  uuidCase: UuidCase = "lowercase"
): string {
  const normalized = normalizeUuid(uuid);
  let formatted: string;

  switch (format) {
    case "standard":
      formatted = normalized;
      break;
    case "no-hyphens":
      formatted = normalized.replace(/-/g, "");
      break;
    case "braces":
      formatted = `{${normalized}}`;
      break;
    case "urn":
      formatted = `urn:uuid:${normalized}`;
      break;
    case "base64":
      const bytes = uuidToBytes(normalized);
      formatted = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      break;
    case "hex":
      formatted = `0x${normalized.replace(/-/g, "")}`;
      break;
    default:
      formatted = normalized;
  }

  return applyCase(formatted, uuidCase);
}

function applyCase(uuid: string, uuidCase: UuidCase): string {
  if (uuidCase === "uppercase") return uuid.toUpperCase();
  if (uuidCase === "lowercase") return uuid.toLowerCase();
  return uuid; // mixed - keep as is
}

/*  Parsing & Analysis  */

export function analyzeUuid(input: string): UuidAnalysis {
  const errors: string[] = [];
  let normalized: string;
  let detectedFormat: UuidFormat = "standard";

  try {
    // Detect format
    if (input.startsWith("urn:uuid:")) {
      detectedFormat = "urn";
    } else if (input.startsWith("{") && input.endsWith("}")) {
      detectedFormat = "braces";
    } else if (input.includes("-")) {
      detectedFormat = "standard";
    } else if (/^[0-9a-fA-F]{32}$/.test(input)) {
      detectedFormat = "no-hyphens";
    } else if (input.startsWith("0x")) {
      detectedFormat = "hex";
    }

    normalized = normalizeUuid(input);
  } catch (err) {
    return {
      version: null,
      variant: "Invalid",
      isValid: false,
      format: "standard",
      errors: ["Invalid UUID format"],
    };
  }

  const parts = normalized.split("-");
  if (parts.length !== 5) {
    errors.push("Invalid UUID structure");
  }

  // Extract version
  const versionNibble = parseInt(parts[2][0], 16);
  const version = versionNibble >= 1 && versionNibble <= 7 ? versionNibble : null;

  if (!version && normalized !== generateNil()) {
    errors.push("Unknown version");
  }

  // Extract variant
  const variantByte = parseInt(parts[3].slice(0, 2), 16);
  let variant = "Unknown";
  if ((variantByte & 0x80) === 0x00) {
    variant = "NCS";
  } else if ((variantByte & 0xc0) === 0x80) {
    variant = "RFC 4122";
  } else if ((variantByte & 0xe0) === 0xc0) {
    variant = "Microsoft";
  } else {
    variant = "Reserved";
  }

  const analysis: UuidAnalysis = {
    version,
    variant,
    isValid: errors.length === 0,
    format: detectedFormat,
    errors,
  };

  // Version-specific parsing
  if (version === 1 || version === 6) {
    try {
      const { timestamp, clockSequence, node } = parseV1orV6(normalized, version);
      analysis.timestamp = timestamp;
      analysis.timestampDate = new Date(timestamp).toISOString();
      analysis.clockSequence = clockSequence;
      analysis.node = node;
    } catch {
      errors.push("Failed to parse timestamp");
    }
  } else if (version === 7) {
    try {
      const timestamp = parseV7Timestamp(normalized);
      analysis.timestamp = timestamp;
      analysis.timestampDate = new Date(timestamp).toISOString();
    } catch {
      errors.push("Failed to parse timestamp");
    }
  }

  return analysis;
}

function parseV1orV6(
  uuid: string,
  version: 1 | 6
): {
  timestamp: number;
  clockSequence: number;
  node: string;
} {
  const parts = uuid.split("-");

  let ticks: number;
  if (version === 1) {
    const timeLow = parseInt(parts[0], 16);
    const timeMid = parseInt(parts[1], 16);
    const timeHi = parseInt(parts[2].slice(1), 16);
    ticks = timeHi * 0x1000000000000 + timeMid * 0x100000000 + timeLow;
  } else {
    // v6 has reordered time fields
    const timeHi = parseInt(parts[0] + parts[1].slice(0, 1), 16);
    const timeMid = parseInt(parts[1].slice(1), 16);
    const timeLow = parseInt(parts[2].slice(1) + parts[3].slice(0, 4), 16);
    ticks = timeHi * 0x1000000000000 + timeMid * 0x100000000 + timeLow;
  }

  const timestamp = (ticks - 0x01b21dd213814000) / 10000;
  const clockSequence = parseInt(parts[3].slice(0, 4), 16) & 0x3fff;
  const node = parts[4];

  return { timestamp, clockSequence, node };
}

function parseV7Timestamp(uuid: string): number {
  const parts = uuid.split("-");
  const msHex = parts[0] + parts[1];
  return parseInt(msHex, 16);
}

export function validateUuid(input: string): { valid: boolean; error?: string } {
  try {
    const analysis = analyzeUuid(input);
    if (!analysis.isValid) {
      return { valid: false, error: analysis.errors[0] || "Invalid UUID" };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Invalid UUID" };
  }
}

/*  Conversion helpers  */

function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/*  Statistics  */

export function calculateCollisionProbability(count: number, version: UuidVersion): string {
  if (version === "nil") return "100% (all identical)";
  if (version === "v3" || version === "v5") return "Deterministic (same input = same UUID)";

  // For random UUIDs (v4) - 122 bits of randomness
  // For time-based (v1, v6, v7) - less collision risk due to time component
  const bits = version === "v4" ? 122 : 74; // Rough approximation
  const probability = 1 - Math.exp(-(count * (count - 1)) / (2 * Math.pow(2, bits)));

  if (probability < 1e-15) {
    return "~0% (practically impossible)";
  }
  return `${(probability * 100).toExponential(2)}%`;
}

export function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;

  if (Math.abs(diff) < 1000) return "Just now";
  if (Math.abs(diff) < 60000) return `${Math.floor(Math.abs(diff) / 1000)}s ago`;
  if (Math.abs(diff) < 3600000) return `${Math.floor(Math.abs(diff) / 60000)}m ago`;
  if (Math.abs(diff) < 86400000) return `${Math.floor(Math.abs(diff) / 3600000)}h ago`;

  return date.toLocaleString();
}

/*  Export helpers  */

export function exportAsJson(uuids: string[]): string {
  return JSON.stringify(uuids, null, 2);
}

export function exportAsCsv(uuids: string[], includeHeader = true): string {
  const lines: string[] = [];
  if (includeHeader) {
    lines.push("uuid,index,generated_at");
  }
  uuids.forEach((uuid, i) => {
    lines.push(`${uuid},${i + 1},${new Date().toISOString()}`);
  });
  return lines.join("\n");
}

export function exportAsSql(uuids: string[], tableName = "uuids", columnName = "id"): string {
  const lines = uuids.map((uuid) => `INSERT INTO ${tableName} (${columnName}) VALUES ('${uuid}');`);
  return lines.join("\n");
}

export function exportAsArray(uuids: string[], language: "js" | "python" | "go" | "java"): string {
  switch (language) {
    case "js":
      return `const uuids = [\n${uuids.map((u) => `  "${u}"`).join(",\n")}\n];`;
    case "python":
      return `uuids = [\n${uuids.map((u) => `    "${u}"`).join(",\n")}\n]`;
    case "go":
      return `uuids := []string{\n${uuids.map((u) => `    "${u}"`).join(",\n")}\n}`;
    case "java":
      return `String[] uuids = {\n${uuids.map((u) => `    "${u}"`).join(",\n")}\n};`;
    default:
      return exportAsJson(uuids);
  }
}
