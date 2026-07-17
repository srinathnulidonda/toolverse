// features/dev/random-string-generator/utils.ts
import { formatBytes } from "@/utils";

export type CharsetType = "uppercase" | "lowercase" | "numbers" | "symbols" | "hex" | "binary";
export type PresetType = "password" | "apikey" | "token" | "pin" | "uuid" | "hex" | "custom";

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  hex: boolean;
  binary: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customChars: string;
  prefix: string;
  suffix: string;
  separator: string;
  separatorInterval: number;
}

export interface Pattern {
  pattern: string;
  description: string;
}

export interface GeneratedString {
  id: string;
  value: string;
  timestamp: number;
  options: GeneratorOptions;
  entropy: number;
  strength: StrengthLevel;
}

export type StrengthLevel = "weak" | "fair" | "good" | "strong" | "excellent";

/*  Character Sets  */
export const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/~`",
  hex: "0123456789ABCDEF",
  binary: "01",
  similar: "il1Lo0O",
  ambiguous: "{}[]()/\\'\"`~,;:.<>",
} as const;

/*  Presets  */
export const PRESETS: Record<
  PresetType,
  { label: string; icon: string; options: Partial<GeneratorOptions> }
> = {
  password: {
    label: "Strong Password",
    icon: "ti-key",
    options: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true,
      excludeAmbiguous: false,
    },
  },
  apikey: {
    label: "API Key",
    icon: "ti-api",
    options: {
      length: 32,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeSimilar: false,
    },
  },
  token: {
    label: "Access Token",
    icon: "ti-shield-lock",
    options: {
      length: 64,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      hex: false,
    },
  },
  pin: {
    label: "PIN Code",
    icon: "ti-123",
    options: {
      length: 6,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      excludeSimilar: true,
    },
  },
  uuid: {
    label: "UUID-like",
    icon: "ti-id",
    options: {
      length: 32,
      hex: true,
      separator: "-",
      separatorInterval: 8,
    },
  },
  hex: {
    label: "Hex String",
    icon: "ti-hexagon",
    options: {
      length: 32,
      hex: true,
    },
  },
  custom: {
    label: "Custom",
    icon: "ti-adjustments",
    options: {},
  },
};

/*  Pattern Templates  */
export const PATTERN_TEMPLATES: Pattern[] = [
  { pattern: "XXXX-XXXX-XXXX-XXXX", description: "Product Key (4-4-4-4)" },
  { pattern: "AAA-NNN-AAA", description: "License Code (Letter-Number-Letter)" },
  { pattern: "NNNNNNNN", description: "8-digit Number" },
  { pattern: "aaaa-nnnn-AAAA", description: "Mixed Case with Numbers" },
  { pattern: "HH:HH:HH:HH:HH:HH", description: "MAC Address" },
];

/*  Default Options  */
export const DEFAULT_OPTIONS: GeneratorOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
  hex: false,
  binary: false,
  excludeSimilar: false,
  excludeAmbiguous: false,
  customChars: "",
  prefix: "",
  suffix: "",
  separator: "",
  separatorInterval: 0,
};

/*  Core Generation  */

/**
 * Build character set from options
 */
function buildCharset(options: GeneratorOptions): string {
  if (options.customChars) {
    return options.customChars;
  }

  let charset = "";

  if (options.hex) {
    charset = CHARSETS.hex;
  } else if (options.binary) {
    charset = CHARSETS.binary;
  } else {
    if (options.uppercase) charset += CHARSETS.uppercase;
    if (options.lowercase) charset += CHARSETS.lowercase;
    if (options.numbers) charset += CHARSETS.numbers;
    if (options.symbols) charset += CHARSETS.symbols;
  }

  if (options.excludeSimilar && !options.customChars) {
    charset = charset
      .split("")
      .filter((char) => !CHARSETS.similar.includes(char))
      .join("");
  }

  if (options.excludeAmbiguous && !options.customChars) {
    charset = charset
      .split("")
      .filter((char) => !CHARSETS.ambiguous.includes(char))
      .join("");
  }

  return charset;
}

/**
 * Generate a cryptographically secure random string
 */
export function generateString(options: GeneratorOptions): string {
  const charset = buildCharset(options);

  if (!charset) return "";

  // Generate base string
  let result = "";
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    result += charset[array[i] % charset.length];
  }

  // Apply separator
  if (options.separator && options.separatorInterval > 0) {
    const parts: string[] = [];
    for (let i = 0; i < result.length; i += options.separatorInterval) {
      parts.push(result.slice(i, i + options.separatorInterval));
    }
    result = parts.join(options.separator);
  }

  // Apply prefix/suffix
  if (options.prefix) result = options.prefix + result;
  if (options.suffix) result = result + options.suffix;

  return result;
}

/**
 * Generate from pattern (X=uppercase, x=lowercase, N=number, A=alphanumeric, H=hex, *=any)
 */
export function generateFromPattern(pattern: string): string {
  let result = "";
  const array = new Uint32Array(pattern.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const rand = array[i];

    switch (char) {
      case "X":
        result += CHARSETS.uppercase[rand % CHARSETS.uppercase.length];
        break;
      case "x":
        result += CHARSETS.lowercase[rand % CHARSETS.lowercase.length];
        break;
      case "N":
      case "n":
        result += CHARSETS.numbers[rand % CHARSETS.numbers.length];
        break;
      case "A":
        const upperSet = CHARSETS.uppercase + CHARSETS.numbers;
        result += upperSet[rand % upperSet.length];
        break;
      case "a":
        const lowerSet = CHARSETS.lowercase + CHARSETS.numbers;
        result += lowerSet[rand % lowerSet.length];
        break;
      case "H":
      case "h":
        result += CHARSETS.hex[rand % CHARSETS.hex.length];
        break;
      case "*":
        const allSet = CHARSETS.uppercase + CHARSETS.lowercase + CHARSETS.numbers;
        result += allSet[rand % allSet.length];
        break;
      default:
        result += char; // Literal character
    }
  }

  return result;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/*  Analysis  */

/**
 * Calculate Shannon entropy in bits
 */
export function calculateEntropy(options: GeneratorOptions): number {
  const charset = buildCharset(options);
  const charsetSize = new Set(charset).size;

  if (charsetSize === 0) return 0;

  const effectiveLength = options.length;
  return Math.log2(Math.pow(charsetSize, effectiveLength));
}

/**
 * Determine strength level from entropy
 */
export function getStrengthLevel(entropy: number): StrengthLevel {
  if (entropy < 28) return "weak"; // < 28 bits (< 8 characters with 62 charset)
  if (entropy < 50) return "fair"; // 28-50 bits
  if (entropy < 80) return "good"; // 50-80 bits
  if (entropy < 120) return "strong"; // 80-120 bits
  return "excellent"; // 120+ bits
}

/**
 * Estimate time to crack using brute force
 */
export function estimateCrackTime(entropy: number): string {
  // Assume 1 billion attempts per second
  const attemptsPerSecond = 1e9;
  const totalCombinations = Math.pow(2, entropy);
  const secondsToCrack = totalCombinations / (2 * attemptsPerSecond); // Average case

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365.25;
  const century = year * 100;

  if (secondsToCrack < 1) return "Instant";
  if (secondsToCrack < minute) return `${Math.ceil(secondsToCrack)} seconds`;
  if (secondsToCrack < hour) return `${Math.ceil(secondsToCrack / minute)} minutes`;
  if (secondsToCrack < day) return `${Math.ceil(secondsToCrack / hour)} hours`;
  if (secondsToCrack < year) return `${Math.ceil(secondsToCrack / day)} days`;
  if (secondsToCrack < century) return `${Math.ceil(secondsToCrack / year)} years`;
  if (secondsToCrack < century * 1000) return `${Math.ceil(secondsToCrack / century)} centuries`;
  return "Practically unbreakable";
}

/**
 * Analyze character distribution
 */
export function analyzeString(str: string): {
  length: number;
  uppercase: number;
  lowercase: number;
  numbers: number;
  symbols: number;
  unique: number;
  hasRepeats: boolean;
  hasSequential: boolean;
} {
  const chars = str.split("");
  const unique = new Set(chars).size;

  let uppercase = 0,
    lowercase = 0,
    numbers = 0,
    symbols = 0;

  for (const char of chars) {
    if (/[A-Z]/.test(char)) uppercase++;
    else if (/[a-z]/.test(char)) lowercase++;
    else if (/[0-9]/.test(char)) numbers++;
    else symbols++;
  }

  // Check for repeated characters (same char 3+ times in a row)
  const hasRepeats = /(.)\1{2,}/.test(str);

  // Check for sequential patterns (abc, 123, etc.)
  let hasSequential = false;
  for (let i = 0; i < str.length - 2; i++) {
    const a = str.charCodeAt(i);
    const b = str.charCodeAt(i + 1);
    const c = str.charCodeAt(i + 2);
    if (b === a + 1 && c === b + 1) {
      hasSequential = true;
      break;
    }
  }

  return {
    length: str.length,
    uppercase,
    lowercase,
    numbers,
    symbols,
    unique,
    hasRepeats,
    hasSequential,
  };
}

/*  Export Utilities  */

export function exportToCSV(strings: GeneratedString[]): string {
  const header = "Value,Length,Entropy (bits),Strength,Generated At\n";
  const rows = strings.map(
    (s) =>
      `"${s.value}",${s.value.length},${s.entropy.toFixed(1)},${s.strength},${new Date(s.timestamp).toISOString()}`
  );
  return header + rows.join("\n");
}

export function exportToJSON(strings: GeneratedString[]): string {
  return JSON.stringify(strings, null, 2);
}

export function exportToText(strings: GeneratedString[]): string {
  return strings.map((s) => s.value).join("\n");
}

/*  Validation  */

export function validateOptions(options: GeneratorOptions): { valid: boolean; error?: string } {
  if (options.length < 1 || options.length > 10000) {
    return { valid: false, error: "Length must be between 1 and 10,000" };
  }

  const charset = buildCharset(options);
  if (!charset) {
    return { valid: false, error: "At least one character set must be selected" };
  }

  if (charset.length < 2 && options.length > 20) {
    return { valid: false, error: "Character set too small for requested length" };
  }

  return { valid: true };
}

/*  Formatting  */

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
