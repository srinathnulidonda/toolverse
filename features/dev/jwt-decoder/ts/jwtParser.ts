// features/dev/jwt-decoder/ts/jwtParser.ts

export interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  jku?: string;
  x5u?: string;
  x5t?: string;
  x5c?: string[];
  cty?: string;
  crit?: string[];
  [key: string]: unknown;
}

export interface JwtPayload {
  // Registered claims
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  exp?: number; // Expiration Time
  nbf?: number; // Not Before
  iat?: number; // Issued At
  jti?: string; // JWT ID

  // Common claims
  name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;

  // Authorization
  scope?: string;
  roles?: string[];
  permissions?: string[];
  groups?: string[];

  [key: string]: unknown;
}

export interface DecodedToken {
  raw: string;
  parts: {
    header: string;
    payload: string;
    signature: string;
  };
  decoded: {
    header: JwtHeader;
    payload: JwtPayload;
  };
  metadata: {
    isValid: boolean;
    algorithm: string;
    type: string;
    issuedAt?: Date;
    expiresAt?: Date;
    notBefore?: Date;
    age?: number;
    timeToExpiry?: number;
    isExpired: boolean;
    isNotYetValid: boolean;
    hasStandardStructure: boolean;
  };
}

export interface ParseError {
  type: "structure" | "encoding" | "json" | "unknown";
  message: string;
  details?: string;
  position?: number;
}

export type ParseResult =
  { success: true; token: DecodedToken } | { success: false; error: ParseError };

/**
 * Decode Base64URL encoded string
 */
function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error("Invalid base64url string");
      base64 += "=".repeat(4 - pad);
    }
    const decoded = atob(base64);
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (e) {
    throw new Error(`Base64URL decode failed: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
}

/**
 * Validate JWT structure
 */
function validateStructure(token: string): { valid: boolean; parts?: string[]; error?: string } {
  const trimmed = token.trim();

  if (!trimmed) {
    return { valid: false, error: "Empty token" };
  }

  const tokenWithoutBearer = trimmed.replace(/^Bearer\s+/i, "");
  const parts = tokenWithoutBearer.split(".");

  if (parts.length !== 3) {
    return {
      valid: false,
      error: `Invalid JWT structure. Expected 3 parts (header.payload.signature), got ${parts.length}`,
    };
  }

  if (parts.some((part) => !part)) {
    return { valid: false, error: "JWT contains empty parts" };
  }

  return { valid: true, parts };
}

/**
 * Calculate token metadata
 */
function calculateMetadata(header: JwtHeader, payload: JwtPayload): DecodedToken["metadata"] {
  const now = Math.floor(Date.now() / 1000);

  const issuedAt = payload.iat ? new Date(payload.iat * 1000) : undefined;
  const expiresAt = payload.exp ? new Date(payload.exp * 1000) : undefined;
  const notBefore = payload.nbf ? new Date(payload.nbf * 1000) : undefined;

  const age = payload.iat ? now - payload.iat : undefined;
  const timeToExpiry = payload.exp ? payload.exp - now : undefined;

  const isExpired = payload.exp ? now > payload.exp : false;
  const isNotYetValid = payload.nbf ? now < payload.nbf : false;

  const hasStandardStructure = !!(
    header.alg &&
    header.typ &&
    (payload.iss || payload.sub || payload.aud || payload.exp || payload.iat)
  );

  return {
    isValid: true,
    algorithm: header.alg || "none",
    type: header.typ || "JWT",
    issuedAt,
    expiresAt,
    notBefore,
    age,
    timeToExpiry,
    isExpired,
    isNotYetValid,
    hasStandardStructure,
  };
}

/**
 * Main JWT parser
 */
export function parseJWT(token: string): ParseResult {
  try {
    const structureCheck = validateStructure(token);
    if (!structureCheck.valid) {
      return {
        success: false,
        error: {
          type: "structure",
          message: structureCheck.error || "Invalid JWT structure",
        },
      };
    }

    const parts = structureCheck.parts!;
    const [headerPart, payloadPart, signaturePart] = parts;

    let header: JwtHeader;
    try {
      const headerJson = base64UrlDecode(headerPart);
      header = JSON.parse(headerJson);
    } catch (e) {
      return {
        success: false,
        error: {
          type: "encoding",
          message: "Failed to decode header",
          details: e instanceof Error ? e.message : "Unknown error",
        },
      };
    }

    let payload: JwtPayload;
    try {
      const payloadJson = base64UrlDecode(payloadPart);
      payload = JSON.parse(payloadJson);
    } catch (e) {
      return {
        success: false,
        error: {
          type: "encoding",
          message: "Failed to decode payload",
          details: e instanceof Error ? e.message : "Unknown error",
        },
      };
    }

    const metadata = calculateMetadata(header, payload);

    return {
      success: true,
      token: {
        raw: token.trim().replace(/^Bearer\s+/i, ""),
        parts: {
          header: headerPart,
          payload: payloadPart,
          signature: signaturePart,
        },
        decoded: {
          header,
          payload,
        },
        metadata,
      },
    };
  } catch (e) {
    return {
      success: false,
      error: {
        type: "unknown",
        message: "Unexpected error while parsing JWT",
        details: e instanceof Error ? e.message : "Unknown error",
      },
    };
  }
}

/**
 * Get claim metadata
 */
export interface ClaimMetadata {
  name: string;
  type: "registered" | "public" | "private";
  description: string;
  valueType: "string" | "number" | "boolean" | "array" | "object" | "timestamp";
  category?: "identity" | "authorization" | "temporal" | "metadata" | "custom";
}

/**
 * Registered JWT Header Parameters (RFC 7515, 7516, 7519)
 */
export const REGISTERED_HEADER_PARAMS: Record<string, ClaimMetadata> = {
  alg: {
    name: "Algorithm",
    type: "registered",
    description: "Cryptographic algorithm used to secure the JWT",
    valueType: "string",
    category: "metadata",
  },
  typ: {
    name: "Type",
    type: "registered",
    description: 'Media type of this complete JWT (typically "JWT")',
    valueType: "string",
    category: "metadata",
  },
  cty: {
    name: "Content Type",
    type: "registered",
    description: "Media type of the secured content (payload)",
    valueType: "string",
    category: "metadata",
  },
  kid: {
    name: "Key ID",
    type: "registered",
    description: "Hint indicating which key was used to secure the JWT",
    valueType: "string",
    category: "metadata",
  },
  jku: {
    name: "JWK Set URL",
    type: "registered",
    description: "URI that refers to a resource for a set of JSON-encoded public keys",
    valueType: "string",
    category: "metadata",
  },
  jwk: {
    name: "JSON Web Key",
    type: "registered",
    description: "Public key that corresponds to the key used to digitally sign the JWS",
    valueType: "object",
    category: "metadata",
  },
  x5u: {
    name: "X.509 URL",
    type: "registered",
    description: "URI that refers to a resource for the X.509 public key certificate",
    valueType: "string",
    category: "metadata",
  },
  x5c: {
    name: "X.509 Certificate Chain",
    type: "registered",
    description: "Chain of one or more PKIX certificates",
    valueType: "array",
    category: "metadata",
  },
  x5t: {
    name: "X.509 Certificate SHA-1 Thumbprint",
    type: "registered",
    description: "Base64url-encoded SHA-1 thumbprint of the X.509 certificate",
    valueType: "string",
    category: "metadata",
  },
  "x5t#S256": {
    name: "X.509 Certificate SHA-256 Thumbprint",
    type: "registered",
    description: "Base64url-encoded SHA-256 thumbprint of the X.509 certificate",
    valueType: "string",
    category: "metadata",
  },
  crit: {
    name: "Critical",
    type: "registered",
    description: "Extensions that must be understood and processed",
    valueType: "array",
    category: "metadata",
  },
};

/**
 * Registered JWT Claims (RFC 7519)
 */
export const REGISTERED_CLAIMS: Record<string, ClaimMetadata> = {
  iss: {
    name: "Issuer",
    type: "registered",
    description: "Principal that issued the JWT",
    valueType: "string",
    category: "metadata",
  },
  sub: {
    name: "Subject",
    type: "registered",
    description: "Principal that is the subject of the JWT",
    valueType: "string",
    category: "identity",
  },
  aud: {
    name: "Audience",
    type: "registered",
    description: "Recipients that the JWT is intended for",
    valueType: "string",
    category: "metadata",
  },
  exp: {
    name: "Expiration Time",
    type: "registered",
    description: "Expiration time on or after which the JWT must not be accepted",
    valueType: "timestamp",
    category: "temporal",
  },
  nbf: {
    name: "Not Before",
    type: "registered",
    description: "Time before which the JWT must not be accepted for processing",
    valueType: "timestamp",
    category: "temporal",
  },
  iat: {
    name: "Issued At",
    type: "registered",
    description: "Time at which the JWT was issued",
    valueType: "timestamp",
    category: "temporal",
  },
  jti: {
    name: "JWT ID",
    type: "registered",
    description: "Unique identifier for the JWT",
    valueType: "string",
    category: "metadata",
  },
};

/**
 * Common Public Claims (OpenID Connect, OAuth, etc.)
 */
export const COMMON_CLAIMS: Record<string, ClaimMetadata> = {
  // OpenID Connect Standard Claims
  name: {
    name: "Full Name",
    type: "public",
    description: "End-user's full name in displayable form",
    valueType: "string",
    category: "identity",
  },
  given_name: {
    name: "Given Name",
    type: "public",
    description: "Given name(s) or first name(s)",
    valueType: "string",
    category: "identity",
  },
  family_name: {
    name: "Family Name",
    type: "public",
    description: "Surname(s) or last name(s)",
    valueType: "string",
    category: "identity",
  },
  middle_name: {
    name: "Middle Name",
    type: "public",
    description: "Middle name(s)",
    valueType: "string",
    category: "identity",
  },
  nickname: {
    name: "Nickname",
    type: "public",
    description: "Casual name",
    valueType: "string",
    category: "identity",
  },
  preferred_username: {
    name: "Preferred Username",
    type: "public",
    description: "Shorthand name by which the user wishes to be referred to",
    valueType: "string",
    category: "identity",
  },
  profile: {
    name: "Profile Page URL",
    type: "public",
    description: "URL of the profile page",
    valueType: "string",
    category: "identity",
  },
  picture: {
    name: "Profile Picture URL",
    type: "public",
    description: "URL of the profile picture",
    valueType: "string",
    category: "identity",
  },
  website: {
    name: "Website URL",
    type: "public",
    description: "URL of the web page or blog",
    valueType: "string",
    category: "identity",
  },
  email: {
    name: "Email Address",
    type: "public",
    description: "Preferred email address",
    valueType: "string",
    category: "identity",
  },
  email_verified: {
    name: "Email Verified",
    type: "public",
    description: "True if the email address has been verified",
    valueType: "boolean",
    category: "identity",
  },
  gender: {
    name: "Gender",
    type: "public",
    description: "Gender",
    valueType: "string",
    category: "identity",
  },
  birthdate: {
    name: "Birth Date",
    type: "public",
    description: "Birthday in YYYY-MM-DD format",
    valueType: "string",
    category: "identity",
  },
  zoneinfo: {
    name: "Time Zone",
    type: "public",
    description: "Time zone (e.g., Europe/Paris)",
    valueType: "string",
    category: "identity",
  },
  locale: {
    name: "Locale",
    type: "public",
    description: "Locale (e.g., en-US)",
    valueType: "string",
    category: "identity",
  },
  phone_number: {
    name: "Phone Number",
    type: "public",
    description: "Preferred telephone number",
    valueType: "string",
    category: "identity",
  },
  phone_number_verified: {
    name: "Phone Number Verified",
    type: "public",
    description: "True if the phone number has been verified",
    valueType: "boolean",
    category: "identity",
  },
  address: {
    name: "Address",
    type: "public",
    description: "Preferred postal address",
    valueType: "object",
    category: "identity",
  },
  updated_at: {
    name: "Updated At",
    type: "public",
    description: "Time the information was last updated",
    valueType: "timestamp",
    category: "temporal",
  },

  // Authorization Claims
  azp: {
    name: "Authorized Party",
    type: "public",
    description: "Party to which the ID Token was issued",
    valueType: "string",
    category: "authorization",
  },
  scope: {
    name: "OAuth Scope",
    type: "public",
    description: "Space-separated list of scope values",
    valueType: "string",
    category: "authorization",
  },
  roles: {
    name: "User Roles",
    type: "public",
    description: "User roles for role-based access control",
    valueType: "array",
    category: "authorization",
  },
  permissions: {
    name: "Permissions",
    type: "public",
    description: "User permissions",
    valueType: "array",
    category: "authorization",
  },
  groups: {
    name: "Groups",
    type: "public",
    description: "Groups the user belongs to",
    valueType: "array",
    category: "authorization",
  },

  // Session Claims
  sid: {
    name: "Session ID",
    type: "public",
    description: "Session identifier",
    valueType: "string",
    category: "metadata",
  },
  auth_time: {
    name: "Authentication Time",
    type: "public",
    description: "Time when the authentication occurred",
    valueType: "timestamp",
    category: "temporal",
  },
  acr: {
    name: "Authentication Context Class Reference",
    type: "public",
    description: "Authentication context class that the authentication performed satisfied",
    valueType: "string",
    category: "metadata",
  },
  amr: {
    name: "Authentication Methods References",
    type: "public",
    description: "Authentication methods used",
    valueType: "array",
    category: "metadata",
  },
  nonce: {
    name: "Nonce",
    type: "public",
    description: "Value used to associate a Client session with an ID Token",
    valueType: "string",
    category: "metadata",
  },
};

/**
 * Get metadata for any claim (header or payload)
 */
export function getClaimMetadata(key: string): ClaimMetadata {
  // Check registered header parameters first
  if (REGISTERED_HEADER_PARAMS[key]) {
    return REGISTERED_HEADER_PARAMS[key];
  }

  // Check registered claims
  if (REGISTERED_CLAIMS[key]) {
    return REGISTERED_CLAIMS[key];
  }

  // Check common public claims
  if (COMMON_CLAIMS[key]) {
    return COMMON_CLAIMS[key];
  }

  // Default for custom/private claims
  return {
    name: key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    type: "private",
    description: "Custom claim specific to this application",
    valueType: "string",
    category: "custom",
  };
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Format duration
 */
export function formatDuration(seconds: number): string {
  const abs = Math.abs(seconds);
  const sign = seconds < 0 ? "-" : "";

  if (abs < 60) return `${sign}${abs}s`;
  if (abs < 3600) return `${sign}${Math.floor(abs / 60)}m ${abs % 60}s`;
  if (abs < 86400) return `${sign}${Math.floor(abs / 3600)}h ${Math.floor((abs % 3600) / 60)}m`;
  return `${sign}${Math.floor(abs / 86400)}d ${Math.floor((abs % 86400) / 3600)}h`;
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  if (absDiff < 60) {
    return diff > 0 ? "in a few seconds" : "a few seconds ago";
  }

  const duration = formatDuration(diff);
  return diff > 0 ? `in ${duration}` : `${duration} ago`;
}
