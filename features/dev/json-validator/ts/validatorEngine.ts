// features/dev/json-validator/ts/validatorEngine.ts

export type ValidationMode = "standard" | "strict" | "permissive" | "schema";
export type JSONDataType = "string" | "number" | "boolean" | "null" | "array" | "object";

export interface ValidationOptions {
  mode: ValidationMode;
  allowComments: boolean;
  allowTrailingCommas: boolean;
  allowSingleQuotes: boolean;
  allowUnquotedKeys: boolean;
  checkDuplicateKeys: boolean;
  maxDepth: number;
  maxSize: number; // in bytes
  requireTopLevelObject: boolean;
  schemaValidation?: JSONSchema;
}

export interface ValidationResult {
  valid: boolean;
  repaired?: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: JSONStats;
  metadata: JSONMetadata;
  securityIssues: SecurityIssue[];
  suggestions: string[];
}

export interface ValidationError {
  type: "syntax" | "schema" | "depth" | "size" | "duplicate-key" | "type";
  message: string;
  line?: number;
  column?: number;
  path?: string;
  severity: "error" | "critical";
}

export interface ValidationWarning {
  type: "best-practice" | "performance" | "security" | "compatibility";
  message: string;
  severity: "low" | "medium" | "high";
  path?: string;
}

export interface JSONStats {
  size: number;
  lines: number;
  depth: number;
  keys: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  duplicateKeys: number;
}

export interface JSONMetadata {
  topLevelType: JSONDataType;
  hasCircularRefs: boolean;
  hasLargeNumbers: boolean;
  hasSpecialFloats: boolean; // NaN, Infinity
  encoding: string;
  lineEndings: "LF" | "CRLF" | "CR" | "mixed";
  indentStyle: "spaces" | "tabs" | "mixed" | "none";
  indentSize?: number;
}

export interface SecurityIssue {
  type: "injection" | "large-payload" | "deep-nesting" | "suspicious-pattern";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  path?: string;
}

export interface JSONSchema {
  $schema?: string;
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  enum?: any[];
  const?: any;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  [key: string]: any;
}

export const DEFAULT_OPTIONS: ValidationOptions = {
  mode: "standard",
  allowComments: false,
  allowTrailingCommas: false,
  allowSingleQuotes: false,
  allowUnquotedKeys: false,
  checkDuplicateKeys: true,
  maxDepth: 100,
  maxSize: 10 * 1024 * 1024, // 10MB
  requireTopLevelObject: false,
};

export const SAMPLE_TEMPLATES = {
  valid: {
    name: "Valid JSON",
    description: "Well-formed JSON object",
    json: `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "roles": ["user", "admin"],
  "metadata": {
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-01-20T15:45:00Z",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}`,
  },
  invalid: {
    name: "Invalid JSON",
    description: "JSON with syntax errors",
    json: `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "roles": ["user", "admin"],
  "metadata": {
    "createdAt": "2024-01-15",
    "lastLogin": "2024-01-20",
  }
}`,
  },
  array: {
    name: "Array Data",
    description: "Top-level array",
    json: `[
  { "id": 1, "name": "Item 1", "price": 19.99 },
  { "id": 2, "name": "Item 2", "price": 29.99 },
  { "id": 3, "name": "Item 3", "price": 39.99 }
]`,
  },
  nested: {
    name: "Deeply Nested",
    description: "Complex nested structure",
    json: `{
  "company": {
    "name": "TechCorp",
    "departments": [
      {
        "name": "Engineering",
        "teams": [
          {
            "name": "Frontend",
            "members": [
              { "name": "Alice", "role": "Lead" },
              { "name": "Bob", "role": "Developer" }
            ]
          }
        ]
      }
    ]
  }
}`,
  },
};

export function validateJSON(
  input: string,
  options: ValidationOptions = DEFAULT_OPTIONS
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const securityIssues: SecurityIssue[] = [];
  const suggestions: string[] = [];

  if (!input.trim()) {
    return {
      valid: false,
      errors: [{ type: "syntax", message: "Input is empty", severity: "error" }],
      warnings: [],
      stats: getEmptyStats(),
      metadata: getDefaultMetadata(),
      securityIssues: [],
      suggestions: ["Add JSON content to validate"],
    };
  }

  // Check size
  const size = new Blob([input]).size;
  if (size > options.maxSize) {
    errors.push({
      type: "size",
      message: `Input size (${formatBytes(size)}) exceeds maximum (${formatBytes(options.maxSize)})`,
      severity: "critical",
    });
  }

  // Detect metadata
  const metadata = analyzeMetadata(input);

  // Try to parse
  let parsed: any;
  let repaired: string | undefined;

  try {
    parsed = JSON.parse(input);
  } catch (e: any) {
    // Try smart repair
    const repairResult = attemptRepair(input, options);
    if (repairResult.success && repairResult.repaired) {
      parsed = repairResult.parsed;
      repaired = repairResult.repaired;
      warnings.push({
        type: "best-practice",
        message: "JSON was auto-repaired. Review the suggested fixes.",
        severity: "medium",
      });
    } else {
      errors.push(parseError(e, input));
      return {
        valid: false,
        errors,
        warnings,
        stats: getEmptyStats(),
        metadata,
        securityIssues,
        suggestions: getSyntaxSuggestions(input),
      };
    }
  }

  // Check top-level type
  if (options.requireTopLevelObject && !isObject(parsed)) {
    errors.push({
      type: "type",
      message: "Top-level value must be an object",
      severity: "error",
    });
  }

  // Calculate stats
  const stats = calculateStats(parsed, input);

  // Check depth
  if (stats.depth > options.maxDepth) {
    errors.push({
      type: "depth",
      message: `Nesting depth (${stats.depth}) exceeds maximum (${options.maxDepth})`,
      severity: "error",
    });
    securityIssues.push({
      type: "deep-nesting",
      message: "Deeply nested structures can cause stack overflow",
      severity: "high",
    });
  }

  // Check for duplicate keys
  if (options.checkDuplicateKeys) {
    const duplicates = findDuplicateKeys(input);
    duplicates.forEach((dup) => {
      errors.push({
        type: "duplicate-key",
        message: `Duplicate key "${dup.key}" at path ${dup.path}`,
        line: dup.line,
        severity: "error",
        path: dup.path,
      });
    });
    stats.duplicateKeys = duplicates.length;
  }

  // Schema validation
  if (options.schemaValidation) {
    const schemaErrors = validateAgainstSchema(parsed, options.schemaValidation);
    errors.push(...schemaErrors);
  }

  // Security checks
  securityIssues.push(...detectSecurityIssues(parsed, stats));

  // Best practice warnings
  warnings.push(...checkBestPractices(parsed, metadata));

  // Suggestions
  if (errors.length === 0) {
    suggestions.push(...generateSuggestions(parsed, metadata, stats));
  }

  return {
    valid: errors.length === 0,
    repaired,
    errors,
    warnings,
    stats,
    metadata,
    securityIssues,
    suggestions,
  };
}

function parseError(e: any, input: string): ValidationError {
  const message = e.message;
  const match = message.match(/position (\d+)/);

  if (match) {
    const position = parseInt(match[1]);
    const upToError = input.substring(0, position);
    const line = upToError.split("\n").length;
    const column = upToError.split("\n").pop()?.length || 0;

    return {
      type: "syntax",
      message: message
        .replace(/JSON\.parse: /, "")
        .replace(/in JSON at position \d+/, "")
        .trim(),
      line,
      column,
      severity: "error",
    };
  }

  return {
    type: "syntax",
    message: message.replace(/JSON\.parse: /, "").trim(),
    severity: "error",
  };
}

function attemptRepair(
  input: string,
  options: ValidationOptions
): { success: boolean; repaired?: string; parsed?: any } {
  let repaired = input;

  // Remove comments if allowed
  if (options.allowComments) {
    repaired = repaired.replace(/\/\/.*$/gm, "");
    repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  // Remove trailing commas
  if (options.allowTrailingCommas) {
    repaired = repaired.replace(/,(\s*[}\]])/g, "$1");
  }

  // Convert single quotes to double quotes
  if (options.allowSingleQuotes) {
    repaired = repaired.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
  }

  // Quote unquoted keys
  if (options.allowUnquotedKeys) {
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');
  }

  try {
    const parsed = JSON.parse(repaired);
    return { success: true, repaired, parsed };
  } catch {
    return { success: false };
  }
}

function calculateStats(value: any, rawInput: string): JSONStats {
  const lines = rawInput.split("\n").length;
  const size = new Blob([rawInput]).size;

  const analysis = analyzeValue(value);

  return {
    size,
    lines,
    ...analysis,
    duplicateKeys: 0, // Set separately
  };
}

function analyzeValue(value: any, depth = 1): Omit<JSONStats, "size" | "lines" | "duplicateKeys"> {
  const stats = {
    depth,
    keys: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
  };

  if (value === null) {
    stats.nulls = 1;
    return stats;
  }

  switch (typeof value) {
    case "string":
      stats.strings = 1;
      return stats;
    case "number":
      stats.numbers = 1;
      return stats;
    case "boolean":
      stats.booleans = 1;
      return stats;
  }

  if (Array.isArray(value)) {
    stats.arrays = 1;
    value.forEach((item) => {
      const childStats = analyzeValue(item, depth + 1);
      stats.depth = Math.max(stats.depth, childStats.depth);
      stats.keys += childStats.keys;
      stats.arrays += childStats.arrays;
      stats.objects += childStats.objects;
      stats.strings += childStats.strings;
      stats.numbers += childStats.numbers;
      stats.booleans += childStats.booleans;
      stats.nulls += childStats.nulls;
    });
    return stats;
  }

  if (typeof value === "object") {
    stats.objects = 1;
    const entries = Object.entries(value);
    stats.keys = entries.length;

    entries.forEach(([, val]) => {
      const childStats = analyzeValue(val, depth + 1);
      stats.depth = Math.max(stats.depth, childStats.depth);
      stats.keys += childStats.keys;
      stats.arrays += childStats.arrays;
      stats.objects += childStats.objects;
      stats.strings += childStats.strings;
      stats.numbers += childStats.numbers;
      stats.booleans += childStats.booleans;
      stats.nulls += childStats.nulls;
    });
    return stats;
  }

  return stats;
}

function analyzeMetadata(input: string): JSONMetadata {
  const hasLF = input.includes("\n") && !input.includes("\r\n");
  const hasCRLF = input.includes("\r\n");
  const hasCR = input.includes("\r") && !input.includes("\r\n");

  let lineEndings: "LF" | "CRLF" | "CR" | "mixed" = "LF";
  if (hasCRLF && (hasLF || hasCR)) lineEndings = "mixed";
  else if (hasCRLF) lineEndings = "CRLF";
  else if (hasCR) lineEndings = "CR";

  const hasSpaces = /^\s+/m.test(input);
  const hasTabs = /^\t+/m.test(input);
  let indentStyle: "spaces" | "tabs" | "mixed" | "none" = "none";
  let indentSize: number | undefined;

  if (hasSpaces && hasTabs) indentStyle = "mixed";
  else if (hasTabs) indentStyle = "tabs";
  else if (hasSpaces) {
    indentStyle = "spaces";
    const match = input.match(/^(\s+)/m);
    if (match) indentSize = match[1].length;
  }

  let topLevelType: JSONDataType = "object";
  const trimmed = input.trim();
  if (trimmed.startsWith("[")) topLevelType = "array";
  else if (trimmed.startsWith('"')) topLevelType = "string";
  else if (trimmed === "null") topLevelType = "null";
  else if (trimmed === "true" || trimmed === "false") topLevelType = "boolean";
  else if (/^-?\d/.test(trimmed)) topLevelType = "number";

  return {
    topLevelType,
    hasCircularRefs: false,
    hasLargeNumbers: /\d{16,}/.test(input),
    hasSpecialFloats: /\b(NaN|Infinity|-Infinity)\b/.test(input),
    encoding: "UTF-8",
    lineEndings,
    indentStyle,
    indentSize,
  };
}

function findDuplicateKeys(input: string): Array<{ key: string; path: string; line: number }> {
  const duplicates: Array<{ key: string; path: string; line: number }> = [];
  const lines = input.split("\n");

  // Simplified duplicate detection
  const keyPattern = /"([^"]+)"\s*:/g;
  const seen = new Map<string, number>();

  let match;
  while ((match = keyPattern.exec(input)) !== null) {
    const key = match[1];
    const position = match.index;
    const line = input.substring(0, position).split("\n").length;

    if (seen.has(key)) {
      duplicates.push({
        key,
        path: `$["${key}"]`,
        line,
      });
    }
    seen.set(key, line);
  }

  return duplicates;
}

function validateAgainstSchema(value: any, schema: JSONSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  // Simple schema validation (in production, use ajv or similar)
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actualType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;

    if (!types.includes(actualType)) {
      errors.push({
        type: "schema",
        message: `Expected type ${types.join(" or ")}, got ${actualType}`,
        severity: "error",
      });
    }
  }

  if (schema.required && typeof value === "object" && value !== null && !Array.isArray(value)) {
    schema.required.forEach((key) => {
      if (!(key in value)) {
        errors.push({
          type: "schema",
          message: `Missing required property: ${key}`,
          path: `$.${key}`,
          severity: "error",
        });
      }
    });
  }

  return errors;
}

function detectSecurityIssues(value: any, stats: JSONStats): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  if (stats.size > 1024 * 1024) {
    // 1MB
    issues.push({
      type: "large-payload",
      message: "Large JSON payload may cause performance issues",
      severity: "medium",
    });
  }

  if (stats.depth > 50) {
    issues.push({
      type: "deep-nesting",
      message: "Deep nesting may indicate a security risk",
      severity: "high",
    });
  }

  // Check for suspicious patterns
  const stringified = JSON.stringify(value);
  if (/<script|javascript:|onerror=/i.test(stringified)) {
    issues.push({
      type: "injection",
      message: "Potential XSS injection detected",
      severity: "critical",
    });
  }

  return issues;
}

function checkBestPractices(value: any, metadata: JSONMetadata): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (metadata.indentStyle === "mixed") {
    warnings.push({
      type: "best-practice",
      message: "Mixed indentation style detected",
      severity: "low",
    });
  }

  if (metadata.hasLargeNumbers) {
    warnings.push({
      type: "compatibility",
      message: "Large numbers may lose precision in JavaScript",
      severity: "medium",
    });
  }

  if (metadata.lineEndings === "mixed") {
    warnings.push({
      type: "best-practice",
      message: "Mixed line endings detected",
      severity: "low",
    });
  }

  return warnings;
}

function generateSuggestions(value: any, metadata: JSONMetadata, stats: JSONStats): string[] {
  const suggestions: string[] = [];

  if (stats.depth > 10) {
    suggestions.push("Consider flattening the structure for better performance");
  }

  if (stats.keys > 100) {
    suggestions.push("Consider splitting into smaller objects for maintainability");
  }

  if (metadata.indentStyle === "none") {
    suggestions.push("Add indentation for better readability");
  }

  return suggestions;
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getEmptyStats(): JSONStats {
  return {
    size: 0,
    lines: 0,
    depth: 0,
    keys: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    duplicateKeys: 0,
  };
}

function getDefaultMetadata(): JSONMetadata {
  return {
    topLevelType: "object",
    hasCircularRefs: false,
    hasLargeNumbers: false,
    hasSpecialFloats: false,
    encoding: "UTF-8",
    lineEndings: "LF",
    indentStyle: "none",
  };
}

function getSyntaxSuggestions(input: string): string[] {
  const suggestions: string[] = [];

  if (input.includes("'")) {
    suggestions.push("Replace single quotes with double quotes");
  }

  if (/,\s*[}\]]/.test(input)) {
    suggestions.push("Remove trailing commas");
  }

  if (/[{,]\s*[a-zA-Z_$]/.test(input)) {
    suggestions.push("Quote all object keys");
  }

  return suggestions;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function generateSchemaFromJSON(value: any): JSONSchema {
  if (value === null) return { type: "null" };

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: "array", items: {} };
    }
    return {
      type: "array",
      items: generateSchemaFromJSON(value[0]),
    };
  }

  if (typeof value === "object") {
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];

    Object.entries(value).forEach(([key, val]) => {
      properties[key] = generateSchemaFromJSON(val);
      required.push(key);
    });

    return {
      type: "object",
      properties,
      required,
      additionalProperties: false,
    };
  }

  return { type: typeof value as any };
}
