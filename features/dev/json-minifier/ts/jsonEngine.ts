// features/dev/json-minifier/ts/jsonEngine.ts

import { logger } from "@/lib/logger";
export type ProcessMode = "minify" | "beautify" | "sort" | "validate";
export type IndentStyle = "2-spaces" | "4-spaces" | "tabs";
export type SortOrder = "asc" | "desc";

export interface ProcessOptions {
  mode: ProcessMode;
  indentStyle: IndentStyle;
  sortKeys: boolean;
  sortOrder: SortOrder;
  removeNulls: boolean;
  removeEmptyStrings: boolean;
  removeEmptyArrays: boolean;
  removeEmptyObjects: boolean;
  escapedUnicode: boolean;
}

export interface ProcessResult {
  output: string;
  stats: JSONStats;
  analysis: JSONAnalysis;
  issues: JSONIssue[];
}

export interface JSONStats {
  original: number;
  processed: number;
  savings: number;
  savingsPercent: number;
  keys: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  totalValues: number;
}

export interface JSONAnalysis {
  isValid: boolean;
  rootType: "object" | "array" | "string" | "number" | "boolean" | "null" | "unknown";
  hasNestedObjects: boolean;
  hasArrays: boolean;
  hasNulls: boolean;
  hasMixedTypes: boolean;
  schema: SchemaNode;
  duplicateKeys: string[];
  largestArray: number;
  deepestPath: string;
}

export interface SchemaNode {
  type: string;
  children?: Record<string, SchemaNode>;
  items?: SchemaNode;
  count?: number;
}

export interface JSONIssue {
  type: "error" | "warning" | "info";
  message: string;
  path?: string;
  rule?: string;
}

export const DEFAULT_OPTIONS: ProcessOptions = {
  mode: "minify",
  indentStyle: "2-spaces",
  sortKeys: false,
  sortOrder: "asc",
  removeNulls: false,
  removeEmptyStrings: false,
  removeEmptyArrays: false,
  removeEmptyObjects: false,
  escapedUnicode: false,
};

export const SAMPLE_TEMPLATES = {
  user: {
    name: "User Profile",
    description: "User profile with nested data",
    json: `{
  "id": "usr_01HZQK3P8M",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "age": 28,
  "isActive": true,
  "isPremium": false,
  "score": 98.6,
  "roles": ["user", "editor", "moderator"],
  "address": {
    "street": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "US",
    "coordinates": {
      "lat": 39.7817,
      "lng": -89.6501
    }
  },
  "preferences": {
    "theme": "dark",
    "language": "en-US",
    "notifications": {
      "email": true,
      "push": false,
      "sms": null
    }
  },
  "tags": ["power-user", "beta-tester"],
  "metadata": {
    "createdAt": "2023-06-15T09:24:00Z",
    "updatedAt": "2024-01-20T14:37:22Z",
    "lastLogin": "2024-01-20T14:37:22Z",
    "loginCount": 142
  }
}`,
  },
  products: {
    name: "Product List",
    description: "E-commerce product array",
    json: `{
  "page": 1,
  "limit": 3,
  "total": 128,
  "products": [
    {
      "id": "prod_001",
      "name": "Wireless Noise-Cancelling Headphones",
      "brand": "AudioTech",
      "price": 299.99,
      "currency": "USD",
      "inStock": true,
      "stock": 42,
      "rating": 4.7,
      "reviewCount": 1284,
      "categories": ["electronics", "audio", "premium"],
      "variants": [
        { "color": "Midnight Black", "sku": "AH-001-BLK" },
        { "color": "Arctic White", "sku": "AH-001-WHT" }
      ],
      "specs": {
        "batteryLife": "30h",
        "connectivity": "Bluetooth 5.3",
        "weight": "250g"
      }
    },
    {
      "id": "prod_002",
      "name": "Mechanical Keyboard TKL",
      "brand": "KeyForge",
      "price": 149.00,
      "currency": "USD",
      "inStock": false,
      "stock": 0,
      "rating": 4.9,
      "reviewCount": 892,
      "categories": ["peripherals", "keyboards"],
      "variants": [],
      "specs": {
        "switches": "Cherry MX Red",
        "layout": "TKL",
        "backlight": "RGB"
      }
    }
  ]
}`,
  },
  api: {
    name: "API Response",
    description: "REST API response structure",
    json: `{
  "success": true,
  "status": 200,
  "message": "Data retrieved successfully",
  "timestamp": "2024-01-20T14:37:22.419Z",
  "requestId": "req_8f3kd92l",
  "data": {
    "users": [
      { "id": 1, "name": "Alice Chen",   "role": "admin",  "active": true  },
      { "id": 2, "name": "Bob Martin",   "role": "user",   "active": true  },
      { "id": 3, "name": "Carol White",  "role": "user",   "active": false },
      { "id": 4, "name": "David Brown",  "role": "editor", "active": true  }
    ],
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 4,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "meta": {
    "version": "2.1.0",
    "deprecation": null,
    "rateLimit": {
      "limit": 1000,
      "remaining": 987,
      "resetAt": "2024-01-20T15:00:00Z"
    }
  }
}`,
  },
  config: {
    name: "App Config",
    description: "Application configuration",
    json: `{
  "app": {
    "name": "MyApp",
    "version": "3.2.1",
    "environment": "production",
    "debug": false,
    "port": 8080,
    "baseUrl": "https://api.myapp.com"
  },
  "database": {
    "host": "db.myapp.com",
    "port": 5432,
    "name": "myapp_prod",
    "poolSize": 10,
    "ssl": true,
    "timeout": 30000
  },
  "cache": {
    "driver": "redis",
    "host": "cache.myapp.com",
    "port": 6379,
    "ttl": 3600,
    "prefix": "myapp:"
  },
  "auth": {
    "jwtSecret": "***",
    "tokenExpiry": "7d",
    "refreshExpiry": "30d",
    "allowedOrigins": [
      "https://myapp.com",
      "https://admin.myapp.com"
    ]
  },
  "features": {
    "darkMode": true,
    "betaFeatures": false,
    "analytics": true,
    "maintenance": false
  }
}`,
  },
};

//  Core engine

export function processJSON(
  input: string,
  options: ProcessOptions = DEFAULT_OPTIONS
): ProcessResult {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    logger.warn(`Failed to parse JSON input:`, err);
    // Return a default ProcessResult indicating error
    return {
      output: "",
      stats: {
        original: new Blob([input]).size,
        processed: 0,
        savings: new Blob([input]).size,
        savingsPercent: 100,
        keys: 0,
        depth: 0,
        arrays: 0,
        objects: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0,
        totalValues: 0,
      },
      analysis: {
        isValid: false,
        rootType: "unknown",
        hasNestedObjects: false,
        hasArrays: false,
        hasNulls: false,
        hasMixedTypes: false,
        schema: { type: "unknown" },
        duplicateKeys: [],
        largestArray: 0,
        deepestPath: "",
      },
      issues: [
        {
          type: "error",
          message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
          rule: "json-parsing-error",
        },
      ],
    };
  }
  const issues = analyzeIssues(parsed, input);
  const analysis = analyzeJSON(parsed);

  let processed = parsed;

  if (options.removeNulls) processed = removeNullValues(processed);
  if (options.removeEmptyStrings) processed = removeEmpty(processed, "string");
  if (options.removeEmptyArrays) processed = removeEmpty(processed, "array");
  if (options.removeEmptyObjects) processed = removeEmpty(processed, "object");
  if (options.sortKeys) processed = sortObjectKeys(processed, options.sortOrder);

  const indent = getIndent(options.indentStyle);
  let output: string;

  switch (options.mode) {
    case "minify":
      output = JSON.stringify(processed);
      break;
    case "beautify":
    case "validate":
      output = JSON.stringify(processed, null, indent);
      break;
    case "sort":
      output = JSON.stringify(sortObjectKeys(processed, options.sortOrder), null, indent);
      break;
    default:
      output = JSON.stringify(processed, null, indent);
  }

  if (options.escapedUnicode) {
    output = escapeUnicode(output);
  }

  const stats = calculateStats(input, output, parsed);

  return { output, stats, analysis, issues };
}

function getIndent(style: IndentStyle): string | number {
  switch (style) {
    case "2-spaces":
      return 2;
    case "4-spaces":
      return 4;
    case "tabs":
      return "\t";
  }
}

function removeNullValues(obj: any): any {
  if (Array.isArray(obj)) return obj.filter((v) => v !== null).map(removeNullValues);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, removeNullValues(v)])
    );
  }
  return obj;
}

function removeEmpty(obj: any, type: "string" | "array" | "object"): any {
  if (Array.isArray(obj)) {
    const filtered = obj
      .map((v) => removeEmpty(v, type))
      .filter((v) => !(type === "array" && Array.isArray(v) && v.length === 0));
    return filtered;
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, removeEmpty(v, type)])
        .filter(([, v]) => {
          if (type === "string" && typeof v === "string" && v === "") return false;
          if (
            type === "object" &&
            v &&
            typeof v === "object" &&
            !Array.isArray(v) &&
            Object.keys(v).length === 0
          )
            return false;
          return true;
        })
    );
  }
  return obj;
}

function sortObjectKeys(obj: any, order: SortOrder): any {
  if (Array.isArray(obj)) return obj.map((v) => sortObjectKeys(v, order));
  if (obj && typeof obj === "object") {
    const sorted = Object.keys(obj).sort((a, b) =>
      order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
    return Object.fromEntries(sorted.map((k) => [k, sortObjectKeys(obj[k], order)]));
  }
  return obj;
}

function escapeUnicode(str: string): string {
  return str.replace(
    /[\u0080-\uFFFF]/g,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

export function analyzeJSON(data: any): JSONAnalysis {
  const rootType = getRootType(data);
  const duplicateKeys: string[] = [];
  let largestArray = 0;
  let deepestPath = "";
  let currentDeepest = 0;

  function traverse(obj: any, path = "", depth = 0): void {
    if (depth > currentDeepest) {
      currentDeepest = depth;
      deepestPath = path;
    }

    if (Array.isArray(obj)) {
      if (obj.length > largestArray) largestArray = obj.length;
      obj.forEach((item, i) => traverse(item, `${path}[${i}]`, depth + 1));
    } else if (obj && typeof obj === "object") {
      const keys = Object.keys(obj);
      const seen = new Set<string>();
      keys.forEach((k) => {
        if (seen.has(k) && !duplicateKeys.includes(k)) duplicateKeys.push(k);
        seen.add(k);
        traverse(obj[k], path ? `${path}.${k}` : k, depth + 1);
      });
    }
  }

  traverse(data);

  const schema = buildSchema(data);

  return {
    isValid: true,
    rootType,
    hasNestedObjects: containsType(data, "object"),
    hasArrays: containsType(data, "array"),
    hasNulls: containsType(data, "null"),
    hasMixedTypes: checkMixedTypes(data),
    schema,
    duplicateKeys,
    largestArray,
    deepestPath,
  };
}

function getRootType(data: any): JSONAnalysis["rootType"] {
  if (data === null) return "null";
  if (Array.isArray(data)) return "array";
  if (typeof data === "object") return "object";
  if (typeof data === "string") return "string";
  if (typeof data === "number") return "number";
  if (typeof data === "boolean") return "boolean";
  return "unknown";
}

function containsType(obj: any, type: string): boolean {
  if (type === "null" && obj === null) return true;
  if (type === "array" && Array.isArray(obj)) return true;
  if (type === "object" && obj && typeof obj === "object" && !Array.isArray(obj)) return true;

  if (Array.isArray(obj)) return obj.some((v) => containsType(v, type));
  if (obj && typeof obj === "object") return Object.values(obj).some((v) => containsType(v, type));
  return false;
}

function checkMixedTypes(obj: any): boolean {
  if (Array.isArray(obj) && obj.length > 1) {
    const types = new Set(obj.map((v) => (Array.isArray(v) ? "array" : typeof v)));
    if (types.size > 1) return true;
  }
  if (obj && typeof obj === "object") {
    return Object.values(obj).some((v) => checkMixedTypes(v));
  }
  return false;
}

function buildSchema(data: any, depth = 0): SchemaNode {
  if (depth > 4) return { type: "..." };
  if (data === null) return { type: "null" };
  if (Array.isArray(data)) {
    return {
      type: "array",
      count: data.length,
      items: data.length > 0 ? buildSchema(data[0], depth + 1) : { type: "unknown" },
    };
  }
  if (typeof data === "object") {
    return {
      type: "object",
      children: Object.fromEntries(
        Object.entries(data)
          .slice(0, 10)
          .map(([k, v]) => [k, buildSchema(v, depth + 1)])
      ),
    };
  }
  return { type: typeof data };
}

export function analyzeIssues(data: any, raw: string): JSONIssue[] {
  const issues: JSONIssue[] = [];

  function traverse(obj: any, path: string): void {
    if (obj === null) {
      issues.push({
        type: "info",
        message: `Null value at "${path}"`,
        path,
        rule: "no-null",
      });
      return;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        issues.push({
          type: "info",
          message: `Empty array at "${path}"`,
          path,
          rule: "no-empty-array",
        });
      }
      // Check for mixed types in arrays
      if (obj.length > 1) {
        const types = new Set(obj.map((v: any) => (Array.isArray(v) ? "array" : typeof v)));
        if (types.size > 1) {
          issues.push({
            type: "warning",
            message: `Mixed types in array at "${path}"`,
            path,
            rule: "consistent-array-types",
          });
        }
      }
      obj.forEach((item: any, i: number) => traverse(item, `${path}[${i}]`));
      return;
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        issues.push({
          type: "info",
          message: `Empty object at "${path}"`,
          path,
          rule: "no-empty-object",
        });
      }
      keys.forEach((k) => {
        if (k !== k.trim()) {
          issues.push({
            type: "warning",
            message: `Key "${k}" has leading/trailing whitespace`,
            path: `${path}.${k}`,
            rule: "no-whitespace-keys",
          });
        }
        traverse(obj[k], path ? `${path}.${k}` : k);
      });
      return;
    }

    if (typeof obj === "string" && obj === "") {
      issues.push({
        type: "info",
        message: `Empty string at "${path}"`,
        path,
        rule: "no-empty-string",
      });
    }

    if (typeof obj === "number" && !isFinite(obj)) {
      issues.push({
        type: "error",
        message: `Non-finite number at "${path}"`,
        path,
        rule: "no-non-finite",
      });
    }
  }

  traverse(data, "$");

  // Check for very large file
  if (new Blob([raw]).size > 100 * 1024) {
    issues.push({
      type: "warning",
      message: "File is larger than 100KB — consider splitting",
      rule: "max-size",
    });
  }

  return issues;
}

function calculateStats(original: string, processed: string, parsed: any): JSONStats {
  const originalSize = new Blob([original]).size;
  const processedSize = new Blob([processed]).size;
  const savings = originalSize - processedSize;
  const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

  let keys = 0,
    arrays = 0,
    objects = 0,
    strings = 0,
    numbers = 0,
    booleans = 0,
    nulls = 0,
    depth = 0;

  function traverse(obj: any, d = 0): void {
    if (d > depth) depth = d;
    if (obj === null) {
      nulls++;
      return;
    }
    if (typeof obj === "string") {
      strings++;
      return;
    }
    if (typeof obj === "number") {
      numbers++;
      return;
    }
    if (typeof obj === "boolean") {
      booleans++;
      return;
    }
    if (Array.isArray(obj)) {
      arrays++;
      obj.forEach((v) => traverse(v, d + 1));
      return;
    }
    if (obj && typeof obj === "object") {
      objects++;
      const ks = Object.keys(obj);
      keys += ks.length;
      ks.forEach((k) => traverse(obj[k], d + 1));
    }
  }

  traverse(parsed);

  return {
    original: originalSize,
    processed: processedSize,
    savings,
    savingsPercent,
    keys,
    depth,
    arrays,
    objects,
    strings,
    numbers,
    booleans,
    nulls,
    totalValues: strings + numbers + booleans + nulls + arrays + objects,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (Math.abs(bytes) < 1024) return `${bytes} B`;
  if (Math.abs(bytes) < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function convertToCSV(data: any): string {
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length || typeof arr[0] !== "object") return "";

  const headers = [...new Set(arr.flatMap((obj) => Object.keys(obj || {})))];
  const rows = arr.map((obj) =>
    headers
      .map((h) => {
        const val = obj?.[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return JSON.stringify(val).replace(/"/g, '""');
        return String(val).replace(/"/g, '""');
      })
      .map((v) => `"${v}"`)
      .join(",")
  );

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
}

export function convertToYAML(data: any, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (data === null) return "null";
  if (typeof data === "boolean") return String(data);
  if (typeof data === "number") return String(data);
  if (typeof data === "string") {
    if (/[:\n#{}[\],&*?|<>=!%@`]/.test(data) || data === "") {
      return `"${data.replace(/"/g, '\\"')}"`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return "[]";
    return data.map((item) => `${pad}- ${convertToYAML(item, indent + 1)}`).join("\n");
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) return "{}";
    return keys
      .map((k) => {
        const val = data[k];
        if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(val).length > 0) {
          return `${pad}${k}:\n${convertToYAML(val, indent + 1)}`;
        }
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
          return `${pad}${k}:\n${convertToYAML(val, indent + 1)}`;
        }
        return `${pad}${k}: ${convertToYAML(val, indent + 1)}`;
      })
      .join("\n");
  }

  return String(data);
}

export function jsonPathQuery(data: any, path: string): any {
  try {
    const parts = path
      .replace(/^\$\.?/, "")
      .split(/\.|\[(\d+)\]/)
      .filter(Boolean);
    let current = data;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      const key = isNaN(Number(part)) ? part : Number(part);
      current = current[key];
    }
    return current;
  } catch {
    return undefined;
  }
}
