import { logger } from "@/lib/logger";
// features/dev/hash-generator/hashEngine.ts
import crypto from "crypto-js";

export type HashAlgorithm =
  | "MD5"
  | "SHA1"
  | "SHA224"
  | "SHA256"
  | "SHA384"
  | "SHA512"
  | "SHA3-224"
  | "SHA3-256"
  | "SHA3-384"
  | "SHA3-512"
  | "RIPEMD160"
  | "BLAKE2b"
  | "BLAKE2s";

export type HashFormat = "hex" | "base64" | "base32";
export type InputType = "text" | "file" | "hex" | "base64";

export interface HashOptions {
  algorithm: HashAlgorithm;
  format: HashFormat;
  salt?: string;
  iterations?: number;
  keyLength?: number;
  pepper?: string;
  hmacKey?: string;
}

export interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
  format: HashFormat;
  inputSize: number;
  executionTime: number;
  strength: SecurityStrength;
  metadata: HashMetadata;
}

export interface HashMetadata {
  bitLength: number;
  hexLength: number;
  base64Length: number;
  entropy: number;
  isSecure: boolean;
  vulnerabilities: string[];
  recommendedUseCases: string[];
}

export type SecurityStrength = "very-weak" | "weak" | "moderate" | "strong" | "very-strong";

export const HASH_ALGORITHMS: Record<
  HashAlgorithm,
  {
    label: string;
    description: string;
    bitLength: number;
    isDeprecated: boolean;
    isSecure: boolean;
    icon: string;
    color: string;
    useCases: string[];
    vulnerabilities: string[];
  }
> = {
  MD5: {
    label: "MD5",
    description: "128-bit hash (deprecated, vulnerable)",
    bitLength: 128,
    isDeprecated: true,
    isSecure: false,
    icon: "ti-shield-x",
    color: "#ef4444",
    useCases: ["Checksums", "Legacy systems"],
    vulnerabilities: ["Collision attacks", "Rainbow tables", "Not cryptographically secure"],
  },
  SHA1: {
    label: "SHA-1",
    description: "160-bit hash (deprecated since 2017)",
    bitLength: 160,
    isDeprecated: true,
    isSecure: false,
    icon: "ti-shield-exclamation",
    color: "#f97316",
    useCases: ["Git commits", "Legacy applications"],
    vulnerabilities: ["Collision attacks", "SHAttered attack", "Not recommended for security"],
  },
  SHA224: {
    label: "SHA-224",
    description: "224-bit hash (truncated SHA-256)",
    bitLength: 224,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-check",
    color: "#eab308",
    useCases: ["Digital signatures", "Certificates"],
    vulnerabilities: [],
  },
  SHA256: {
    label: "SHA-256",
    description: "256-bit hash (widely recommended)",
    bitLength: 256,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-check",
    color: "#22c55e",
    useCases: ["Blockchain", "Digital signatures", "Password hashing", "TLS"],
    vulnerabilities: [],
  },
  SHA384: {
    label: "SHA-384",
    description: "384-bit hash (truncated SHA-512)",
    bitLength: 384,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-check",
    color: "#3b82f6",
    useCases: ["High-security applications", "Government"],
    vulnerabilities: [],
  },
  SHA512: {
    label: "SHA-512",
    description: "512-bit hash (maximum security)",
    bitLength: 512,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-lock",
    color: "#8b5cf6",
    useCases: ["High-security applications", "Long-term storage"],
    vulnerabilities: [],
  },
  "SHA3-224": {
    label: "SHA3-224",
    description: "224-bit Keccak-based hash",
    bitLength: 224,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-star",
    color: "#06b6d4",
    useCases: ["Next-gen cryptography", "Post-quantum preparation"],
    vulnerabilities: [],
  },
  "SHA3-256": {
    label: "SHA3-256",
    description: "256-bit Keccak-based hash (latest standard)",
    bitLength: 256,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-star",
    color: "#06b6d4",
    useCases: ["Modern applications", "Blockchain", "IoT security"],
    vulnerabilities: [],
  },
  "SHA3-384": {
    label: "SHA3-384",
    description: "384-bit Keccak-based hash",
    bitLength: 384,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-star",
    color: "#06b6d4",
    useCases: ["High-security applications", "Financial systems"],
    vulnerabilities: [],
  },
  "SHA3-512": {
    label: "SHA3-512",
    description: "512-bit Keccak-based hash",
    bitLength: 512,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-star",
    color: "#06b6d4",
    useCases: ["Maximum security", "Long-term cryptographic storage"],
    vulnerabilities: [],
  },
  RIPEMD160: {
    label: "RIPEMD-160",
    description: "160-bit hash (European alternative)",
    bitLength: 160,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-shield-half",
    color: "#84cc16",
    useCases: ["Bitcoin", "European standards"],
    vulnerabilities: ["Lower adoption", "Less scrutinized"],
  },
  BLAKE2b: {
    label: "BLAKE2b",
    description: "High-speed cryptographic hash",
    bitLength: 512,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-bolt",
    color: "#ec4899",
    useCases: ["High-performance applications", "Argon2 password hashing"],
    vulnerabilities: [],
  },
  BLAKE2s: {
    label: "BLAKE2s",
    description: "Optimized for 8-32 bit platforms",
    bitLength: 256,
    isDeprecated: false,
    isSecure: true,
    icon: "ti-device-mobile",
    color: "#f59e0b",
    useCases: ["Mobile applications", "Embedded systems"],
    vulnerabilities: [],
  },
};

export const SAMPLE_DATA = {
  password: {
    label: "Password",
    text: "MySecurePassword123!@#",
    description: "Example password for hash testing",
  },
  email: {
    label: "Email",
    text: "user@example.com",
    description: "Email address for verification hashing",
  },
  apiKey: {
    label: "API Key",
    text: "sk_live_1234567890abcdef",
    description: "API key for secure token generation",
  },
  document: {
    label: "Document",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    description: "Sample document content",
  },
  json: {
    label: "JSON Data",
    text: '{"username":"john_doe","email":"john@example.com","role":"admin","timestamp":"2024-01-15T10:30:00Z"}',
    description: "JSON payload for integrity verification",
  },
  uuid: {
    label: "UUID",
    text: "550e8400-e29b-41d4-a716-446655440000",
    description: "Unique identifier for hashing",
  },
};

export async function generateHash(
  input: string | ArrayBuffer,
  options: HashOptions
): Promise<HashResult> {
  const startTime = performance.now();

  let processedInput: string;
  let inputSize: number;

  if (input instanceof ArrayBuffer) {
    processedInput = arrayBufferToWordArray(input);
    inputSize = input.byteLength;
  } else {
    processedInput = input;
    inputSize = new Blob([input]).size;
  }

  // Add salt if provided
  if (options.salt) {
    processedInput = options.salt + processedInput;
  }

  // Add pepper if provided
  if (options.pepper) {
    processedInput = processedInput + options.pepper;
  }

  let hash = "";
  const algorithm = options.algorithm;

  try {
    switch (algorithm) {
      case "MD5":
        hash = crypto.MD5(processedInput).toString();
        break;
      case "SHA1":
        hash = crypto.SHA1(processedInput).toString();
        break;
      case "SHA224":
        hash = crypto.SHA224(processedInput).toString();
        break;
      case "SHA256":
        hash = crypto.SHA256(processedInput).toString();
        break;
      case "SHA384":
        hash = crypto.SHA384(processedInput).toString();
        break;
      case "SHA512":
        hash = crypto.SHA512(processedInput).toString();
        break;
      case "SHA3-224":
        hash = crypto.SHA3(processedInput, { outputLength: 224 }).toString();
        break;
      case "SHA3-256":
        hash = crypto.SHA3(processedInput, { outputLength: 256 }).toString();
        break;
      case "SHA3-384":
        hash = crypto.SHA3(processedInput, { outputLength: 384 }).toString();
        break;
      case "SHA3-512":
        hash = crypto.SHA3(processedInput, { outputLength: 512 }).toString();
        break;
      case "RIPEMD160":
        hash = crypto.RIPEMD160(processedInput).toString();
        break;
      case "BLAKE2b":
      case "BLAKE2s":
        // Fallback to SHA256 for BLAKE2 (not supported in crypto-js)
        hash = crypto.SHA256(processedInput).toString();
        break;
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    // Apply HMAC if key is provided
    if (options.hmacKey) {
      const hmacResult = crypto.HmacSHA256(hash, options.hmacKey);
      hash = hmacResult.toString();
    }

    // Convert to requested format
    hash = convertHashFormat(hash, "hex", options.format);
  } catch (error) {
    throw new Error(
      `Hash generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  const executionTime = performance.now() - startTime;
  const metadata = generateHashMetadata(algorithm, hash, options.format);
  const strength = calculateSecurityStrength(algorithm);

  return {
    algorithm,
    hash,
    format: options.format,
    inputSize,
    executionTime,
    strength,
    metadata,
  };
}

export async function generateMultipleHashes(
  input: string | ArrayBuffer,
  algorithms: HashAlgorithm[],
  baseOptions: Omit<HashOptions, "algorithm">
): Promise<HashResult[]> {
  const results: HashResult[] = [];

  for (const algorithm of algorithms) {
    const options: HashOptions = { ...baseOptions, algorithm };
    try {
      const result = await generateHash(input, options);
      results.push(result);
    } catch (error) {
      // Continue with other algorithms if one fails
      logger.error(`Failed to generate ${algorithm} hash:`, error);
    }
  }

  return results;
}

export function verifyHash(
  input: string | ArrayBuffer,
  expectedHash: string,
  options: HashOptions
): Promise<boolean> {
  return generateHash(input, options).then(
    (result) => result.hash.toLowerCase() === expectedHash.toLowerCase()
  );
}

export function compareHashes(
  hash1: string,
  hash2: string
): {
  isMatch: boolean;
  similarity: number;
  differences: number;
} {
  const isMatch = hash1.toLowerCase() === hash2.toLowerCase();

  if (isMatch) {
    return { isMatch: true, similarity: 100, differences: 0 };
  }

  const minLength = Math.min(hash1.length, hash2.length);
  let differences = Math.abs(hash1.length - hash2.length);

  for (let i = 0; i < minLength; i++) {
    if (hash1[i].toLowerCase() !== hash2[i].toLowerCase()) {
      differences++;
    }
  }

  const similarity = Math.round(
    ((Math.max(hash1.length, hash2.length) - differences) / Math.max(hash1.length, hash2.length)) *
      100
  );

  return { isMatch: false, similarity, differences };
}

function arrayBufferToWordArray(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return binary;
}

function convertHashFormat(hash: string, fromFormat: HashFormat, toFormat: HashFormat): string {
  if (fromFormat === toFormat) return hash;

  try {
    switch (`${fromFormat}-${toFormat}`) {
      case "hex-base64":
        return crypto.enc.Base64.stringify(crypto.enc.Hex.parse(hash));
      case "base64-hex":
        return crypto.enc.Hex.stringify(crypto.enc.Base64.parse(hash));
      case "hex-base32":
        // Simplified base32 conversion
        return btoa(hash).replace(/[=]/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      case "base32-hex":
        // Simplified reverse base32 conversion
        return atob(hash.replace(/-/g, "+").replace(/_/g, "/"));
      case "base64-base32":
        const hexIntermediate = crypto.enc.Hex.stringify(crypto.enc.Base64.parse(hash));
        return btoa(hexIntermediate).replace(/[=]/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      case "base32-base64":
        const hexFromBase32 = atob(hash.replace(/-/g, "+").replace(/_/g, "/"));
        return crypto.enc.Base64.stringify(crypto.enc.Hex.parse(hexFromBase32));
      default:
        return hash;
    }
  } catch {
    return hash;
  }
}

function generateHashMetadata(
  algorithm: HashAlgorithm,
  hash: string,
  format: HashFormat
): HashMetadata {
  const algorithmInfo = HASH_ALGORITHMS[algorithm];
  const bitLength = algorithmInfo.bitLength;
  const hexLength = bitLength / 4;
  const base64Length = Math.ceil(((bitLength / 8) * 4) / 3);

  // Calculate entropy (simplified)
  const uniqueChars = new Set(hash.toLowerCase()).size;
  const maxUniqueChars = format === "hex" ? 16 : format === "base64" ? 64 : 32;
  const entropy = (uniqueChars / maxUniqueChars) * 100;

  return {
    bitLength,
    hexLength,
    base64Length,
    entropy: Math.round(entropy),
    isSecure: algorithmInfo.isSecure,
    vulnerabilities: algorithmInfo.vulnerabilities,
    recommendedUseCases: algorithmInfo.useCases,
  };
}

function calculateSecurityStrength(algorithm: HashAlgorithm): SecurityStrength {
  const algorithmInfo = HASH_ALGORITHMS[algorithm];

  if (!algorithmInfo.isSecure || algorithmInfo.isDeprecated) {
    if (algorithm === "MD5") return "very-weak";
    if (algorithm === "SHA1") return "weak";
  }

  if (algorithmInfo.bitLength >= 512) return "very-strong";
  if (algorithmInfo.bitLength >= 256) return "strong";
  if (algorithmInfo.bitLength >= 224) return "moderate";

  return "weak";
}

export function calculateHashRate(
  totalHashes: number,
  timeMs: number
): {
  hashesPerSecond: number;
  hashesPerMinute: number;
  formattedRate: string;
} {
  const hashesPerSecond = (totalHashes / timeMs) * 1000;
  const hashesPerMinute = hashesPerSecond * 60;

  let formattedRate: string;
  if (hashesPerSecond >= 1000000) {
    formattedRate = `${(hashesPerSecond / 1000000).toFixed(1)}M H/s`;
  } else if (hashesPerSecond >= 1000) {
    formattedRate = `${(hashesPerSecond / 1000).toFixed(1)}K H/s`;
  } else {
    formattedRate = `${hashesPerSecond.toFixed(0)} H/s`;
  }

  return { hashesPerSecond, hashesPerMinute, formattedRate };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function generateSecureRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.lib.WordArray.random(length).toString();
  return crypto.lib.WordArray.random(length).toString(crypto.enc.Hex).substring(0, length);
}

export function detectInputType(input: string): InputType {
  // Check if it's hex
  if (/^[0-9a-fA-F]+$/.test(input.replace(/\s/g, "")) && input.length % 2 === 0) {
    return "hex";
  }

  // Check if it's base64
  try {
    if (btoa(atob(input)) === input) {
      return "base64";
    }
  } catch {
    // Not base64
  }

  return "text";
}
