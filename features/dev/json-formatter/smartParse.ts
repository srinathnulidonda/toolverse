import { logger } from "@/lib/logger";
// features/dev/json-formatter/smartParse.ts
export type ParseResult =
  { ok: true; value: unknown; normalized: string; hint?: string } | { ok: false; error: string };

/** Fix common JSON issues progressively */
export function smartParse(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Empty input" };

  // 1. Try native parse first
  try {
    const value = JSON.parse(trimmed);
    return { ok: true, value, normalized: trimmed };
  } catch (_) {
    // continue to fixups
  }

  let fixed = trimmed;

  // 2. Strip JS/TS single-line comments
  fixed = fixed.replace(/\/\/.*$/gm, "");
  // Strip block comments
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, "");

  // 3. Remove trailing commas before } or ]
  fixed = fixed.replace(/,\s*([}\]])/g, "$1");

  // 4. Convert single-quoted strings to double-quoted
  fixed = fixed.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (_, inner) => {
    const escaped = inner.replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  // 5. Quote unquoted object keys  (word: or word-with-dash: etc.)
  fixed = fixed.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$-]*)(\s*:)/g, '$1"$2"$3');

  // 6. Try after basic fixups
  try {
    const value = JSON.parse(fixed);
    return { ok: true, value, normalized: fixed, hint: "Auto-fixed formatting issues" };
  } catch (_) {
    logger.warn(`JSON parse still failed after basic fixups`, _);
    /* continue */
  }

  // 7. Attempt key=value / INI style  (key = value pairs, one per line)
  const kvResult = tryKeyValue(trimmed);
  if (kvResult.ok) return kvResult;

  // 8. Attempt YAML-like (simple key: value, no quotes)
  const yamlResult = tryYaml(trimmed);
  if (yamlResult.ok) return yamlResult;

  // 9. Attempt CSV (first line is header)
  const csvResult = tryCsv(trimmed);
  if (csvResult.ok) return csvResult;

  // 10. Wrap bare primitive
  const bare = tryBare(trimmed);
  if (bare.ok) return bare;

  // Return a meaningful error from JSON.parse on the lightly-fixed version
  try {
    JSON.parse(fixed);
  } catch (err) {
    logger.warn(`Failed to parse JSON after fixups:`, err);
    return { ok: false, error: describeError(fixed, err) };
  }
  return { ok: false, error: "Could not parse input" };
}

function tryKeyValue(input: string): ParseResult {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  // Every line must match key = value or key: value
  const kvRe = /^([A-Za-z_$][A-Za-z0-9_$.\s-]*?)\s*[=:]\s*(.+)$/;
  const obj: Record<string, unknown> = {};
  let matched = 0;
  for (const line of lines) {
    const m = line.match(kvRe);
    if (m) {
      obj[m[1].trim()] = coerce(m[2].trim());
      matched++;
    }
  }
  if (matched > 0 && matched === lines.length) {
    const normalized = JSON.stringify(obj, null, 2);
    return { ok: true, value: obj, normalized, hint: "Converted key=value pairs to JSON" };
  }
  return { ok: false, error: "" };
}

function tryYaml(input: string): ParseResult {
  // Very simple YAML: indented key: value, no anchors/aliases
  try {
    const obj = parseSimpleYaml(input);
    if (obj !== null && typeof obj === "object") {
      const normalized = JSON.stringify(obj, null, 2);
      return { ok: true, value: obj, normalized, hint: "Converted YAML-like format to JSON" };
    }
  } catch (_) {
    logger.warn(`YAML parsing failed`, _);
  }
  return { ok: false, error: "" };
}

function tryCsv(input: string): ParseResult {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { ok: false, error: "" };
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitCsv(lines[0], sep);
  if (headers.length < 2) return { ok: false, error: "" };
  const rows = lines.slice(1).map((line) => {
    const cols = splitCsv(line, sep);
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      row[h] = coerce(cols[i] ?? "");
    });
    return row;
  });
  const normalized = JSON.stringify(rows, null, 2);
  return { ok: true, value: rows, normalized, hint: "Converted CSV to JSON array" };
}

function tryBare(input: string): ParseResult {
  // bare string or number
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(input)) {
    const v = Number(input);
    return { ok: true, value: v, normalized: String(v) };
  }
  if (input === "true") return { ok: true, value: true, normalized: "true" };
  if (input === "false") return { ok: true, value: false, normalized: "false" };
  if (input === "null") return { ok: true, value: null, normalized: "null" };
  return { ok: false, error: "" };
}

// ── helpers ──

function coerce(v: string): unknown {
  if (v === "null" || v === "~") return null;
  if (v === "true" || v === "yes") return true;
  if (v === "false" || v === "no") return false;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v)) return Number(v);
  // strip surrounding quotes
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function splitCsv(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === sep && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseSimpleYaml(input: string): unknown {
  const lines = input.split("\n");
  const stack: Array<{ indent: number; obj: Record<string, unknown> | unknown[] }> = [];
  const root: Record<string, unknown> = {};
  stack.push({ indent: -1, obj: root });

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.search(/\S/);
    const line = rawLine.trim();

    // List item
    if (line.startsWith("- ")) {
      const val = coerce(line.slice(2).trim());
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].obj;
      if (Array.isArray(parent)) {
        parent.push(val);
      }
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;

    if (rest === "" || rest === "|" || rest === ">") {
      // nested object or list
      const child: Record<string, unknown> = {};
      if (!Array.isArray(parent)) (parent as Record<string, unknown>)[key] = child;
      stack.push({ indent, obj: child });
    } else if (rest.startsWith("[")) {
      try {
        (parent as Record<string, unknown>)[key] = JSON.parse(rest.replace(/'/g, '"'));
      } catch (err) {
        logger.warn(`Failed to parse YAML array value:`, err);
        (parent as Record<string, unknown>)[key] = rest;
      }
    } else {
      if (!Array.isArray(parent)) (parent as Record<string, unknown>)[key] = coerce(rest);
    }
  }
  return root;
}

function describeError(input: string, err: unknown): string {
  const message = err instanceof Error ? err.message : "Invalid JSON";
  const match = message.match(/position (\d+)/);
  if (match) {
    const pos = Number(match[1]);
    const lines = input.slice(0, pos).split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return `${message} — line ${line}, col ${col}`;
  }
  return message;
}
