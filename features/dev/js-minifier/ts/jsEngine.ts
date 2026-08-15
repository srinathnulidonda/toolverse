// features/dev/js-minifier/ts/jsEngine.ts
export type MinifyMode = "minify" | "compress" | "mangle";

export interface MinifyOptions {
  mode: MinifyMode;
  removeComments: boolean;
  removeConsole: boolean;
  removeDebugger: boolean;
  collapseWhitespace: boolean;
  mangle: boolean;
  deadCodeElimination: boolean;
}

export interface JSStats {
  original: number;
  minified: number;
  savings: number;
  savingsPercent: number;
  originalLines: number;
  minifiedLines: number;
  functions: number;
  variables: number;
  comments: number;
  strings: number;
}

export interface CodeIssue {
  type: "error" | "warning" | "info";
  message: string;
  line?: number;
  rule?: string;
}

export interface CodeAnalysis {
  syntaxValid: boolean;
  complexity: "low" | "medium" | "high";
  hasESModules: boolean;
  hasCommonJS: boolean;
  hasAsyncAwait: boolean;
  hasArrowFunctions: boolean;
  hasClasses: boolean;
  hasDestructuring: boolean;
  hasTemplateLiterals: boolean;
  hasOptionalChaining: boolean;
}

export interface MinifyResult {
  output: string;
  stats: JSStats;
  analysis: CodeAnalysis;
  issues: CodeIssue[];
}

export const DEFAULT_OPTIONS: MinifyOptions = {
  mode: "minify",
  removeComments: true,
  removeConsole: false,
  removeDebugger: true,
  collapseWhitespace: true,
  mangle: false,
  deadCodeElimination: false,
};

export const SAMPLE_TEMPLATES = {
  utility: {
    name: "Utility",
    description: "Common utility functions",
    code: `// Utility Functions Library
function debounce(func, wait, immediate) {
  var timeout;
  return function executedFunction() {
    var context = this;
    var args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function truncate(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

module.exports = { debounce, throttle, deepClone, formatCurrency, truncate };`,
  },
  es6class: {
    name: "ES6 Class",
    description: "Modern ES6+ class example",
    code: `// Modern ES6+ EventEmitter Class
class EventEmitter {
  #listeners = new Map();
  #maxListeners = 10;

  constructor(options = {}) {
    this.#maxListeners = options.maxListeners ?? 10;
  }

  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    const listeners = this.#listeners.get(event);
    if (listeners.length >= this.#maxListeners) {
      console.warn(\`MaxListenersExceededWarning: \${event}\`);
    }
    listeners.push({ fn: listener, once: false });
    return this;
  }

  once(event, listener) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push({ fn: listener, once: true });
    return this;
  }

  off(event, listener) {
    if (!this.#listeners.has(event)) return this;
    const filtered = this.#listeners
      .get(event)
      .filter(({ fn }) => fn !== listener);
    this.#listeners.set(event, filtered);
    return this;
  }

  emit(event, ...args) {
    if (!this.#listeners.has(event)) return false;
    const listeners = [...this.#listeners.get(event)];
    const remaining = [];
    for (const entry of listeners) {
      entry.fn.apply(this, args);
      if (!entry.once) remaining.push(entry);
    }
    this.#listeners.set(event, remaining);
    return true;
  }

  removeAllListeners(event) {
    if (event) {
      this.#listeners.delete(event);
    } else {
      this.#listeners.clear();
    }
    return this;
  }

  listenerCount(event) {
    return this.#listeners.get(event)?.length ?? 0;
  }
}

export default EventEmitter;`,
  },
  async: {
    name: "Async",
    description: "Async/await patterns",
    code: `// Async Data Fetching Utilities
const BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(\`Request timed out after \${timeout}ms\`);
    }
    throw error;
  }
}

async function retry(fn, retries = 3, delay = 300, backoff = 2) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * backoff, backoff);
  }
}

async function fetchUsers(page = 1, limit = 20) {
  debugger;
  const url = \`\${BASE_URL}/users?page=\${page}&limit=\${limit}\`;
  return retry(() => fetchWithTimeout(url));
}

async function batchFetch(urls, concurrency = 3) {
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(url => fetchWithTimeout(url))
    );
    results.push(...batchResults);
  }
  return results;
}

export { fetchWithTimeout, retry, fetchUsers, batchFetch };`,
  },
} as const;

function countPattern(code: string, pattern: RegExp): number {
  return (code.match(pattern) ?? []).length;
}

function removeBlockComments(code: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = "";
  let inTemplateLiteral = false;
  let templateDepth = 0;

  while (i < code.length) {
    if (!inString && !inTemplateLiteral) {
      if (code[i] === "`") {
        inTemplateLiteral = true;
        templateDepth = 1;
        result += code[i++];
        continue;
      }
      if (code[i] === "/" && code[i + 1] === "*") {
        i += 2;
        while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
          i++;
        }
        i += 2;
        continue;
      }
      if (code[i] === "/" && code[i + 1] === "/") {
        while (i < code.length && code[i] !== "\n") {
          i++;
        }
        continue;
      }
      if (code[i] === '"' || code[i] === "'") {
        inString = true;
        stringChar = code[i];
        result += code[i++];
        continue;
      }
    } else if (inString) {
      if (code[i] === "\\" && i + 1 < code.length) {
        result += code[i] + code[i + 1];
        i += 2;
        continue;
      }
      if (code[i] === stringChar) {
        inString = false;
        stringChar = "";
      }
    } else if (inTemplateLiteral) {
      if (code[i] === "\\" && i + 1 < code.length) {
        result += code[i] + code[i + 1];
        i += 2;
        continue;
      }
      if (code[i] === "`") {
        templateDepth--;
        if (templateDepth === 0) {
          inTemplateLiteral = false;
        }
      }
    }

    result += code[i++];
  }

  return result;
}

function removeLineComments(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    let inString = false;
    let stringChar = "";
    let output = "";
    let i = 0;

    while (i < line.length) {
      if (!inString) {
        if (
          line[i] === "/" &&
          line[i + 1] === "/" &&
          !isInsideRegex(line, i)
        ) {
          break;
        }
        if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
          inString = true;
          stringChar = line[i];
        }
      } else {
        if (line[i] === "\\" && i + 1 < line.length) {
          output += line[i] + line[i + 1];
          i += 2;
          continue;
        }
        if (line[i] === stringChar) {
          inString = false;
          stringChar = "";
        }
      }
      output += line[i++];
    }

    result.push(output);
  }

  return result.join("\n");
}

function isInsideRegex(line: string, pos: number): boolean {
  const before = line.slice(0, pos).trimEnd();
  return /[=(:,\[!&|?+\-*%^~]$/.test(before);
}

function collapseWhitespace(code: string): string {
  const lines = code.split("\n");
  const nonEmpty = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let result = nonEmpty.join(" ");

  result = result
    .replace(/\s*([{}();,=+\-*/%&|^~<>!?:])\s*/g, "$1")
    .replace(/\s*\.\s*/g, ".")
    .replace(/\[\s*/g, "[")
    .replace(/\s*\]/g, "]")
    .replace(/\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .replace(/,\s*/g, ",")
    .replace(/;\s*/g, ";")
    .replace(/\s+/g, " ")
    .trim();

  return result;
}

function removeConsoleStatements(code: string): string {
  return code.replace(
    /console\s*\.\s*(?:log|warn|error|info|debug|trace|dir|table|group|groupEnd|time|timeEnd|assert|count|clear)\s*\([^)]*(?:\([^)]*\)[^)]*)*\)\s*;?/g,
    ""
  );
}

function removeDebuggerStatements(code: string): string {
  return code.replace(/\bdebugger\s*;?/g, "");
}

function eliminateDeadCode(code: string): string {
  let result = code;

  result = result.replace(/if\s*\(\s*false\s*\)\s*\{[^}]*\}/g, "");
  result = result.replace(/if\s*\(\s*true\s*\)\s*\{([^}]*)\}/g, "$1");
  result = result.replace(/while\s*\(\s*false\s*\)\s*\{[^}]*\}/g, "");
  result = result.replace(
    /\/\*\s*@__PURE__\s*\*\/\s*(?:[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*;?)/g,
    ""
  );

  return result;
}

const MANGLE_MAP: Record<string, string> = {};
let mangleCounter = 0;

function resetMangleMap(): void {
  Object.keys(MANGLE_MAP).forEach((k) => delete MANGLE_MAP[k]);
  mangleCounter = 0;
}

function generateMangledName(index: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const base = chars.length;
  let name = "";
  let n = index;

  do {
    name = chars[n % base] + name;
    n = Math.floor(n / base) - 1;
  } while (n >= 0);

  return name;
}

function mangleVariables(code: string): string {
  resetMangleMap();

  const RESERVED = new Set([
    "break", "case", "catch", "continue", "debugger", "default", "delete",
    "do", "else", "finally", "for", "function", "if", "in", "instanceof",
    "new", "return", "switch", "this", "throw", "try", "typeof", "var",
    "void", "while", "with", "class", "const", "enum", "export", "extends",
    "import", "super", "implements", "interface", "let", "package", "private",
    "protected", "public", "static", "yield", "null", "true", "false",
    "undefined", "NaN", "Infinity", "window", "document", "global",
    "console", "process", "require", "module", "exports", "Promise",
    "Array", "Object", "String", "Number", "Boolean", "Symbol", "Map",
    "Set", "WeakMap", "WeakSet", "Error", "Math", "JSON", "Date",
    "RegExp", "Function", "arguments", "prototype", "__proto__",
    "constructor", "toString", "valueOf", "hasOwnProperty",
  ]);

  const varPattern =
    /\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const funcPattern =
    /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const paramPattern =
    /\bfunction\s*(?:[a-zA-Z_$][a-zA-Z0-9_$]*)?\s*\(([^)]*)\)/g;

  const identifiers = new Set<string>();

  let m: RegExpExecArray | null;

  varPattern.lastIndex = 0;
  while ((m = varPattern.exec(code)) !== null) {
    if (!RESERVED.has(m[1])) identifiers.add(m[1]);
  }

  funcPattern.lastIndex = 0;
  while ((m = funcPattern.exec(code)) !== null) {
    if (!RESERVED.has(m[1])) identifiers.add(m[1]);
  }

  paramPattern.lastIndex = 0;
  while ((m = paramPattern.exec(code)) !== null) {
    const params = m[1].split(",").map((p) => p.trim().split("=")[0].trim());
    for (const p of params) {
      if (p && !RESERVED.has(p) && /^[a-zA-Z_$]/.test(p)) {
        identifiers.add(p);
      }
    }
  }

  for (const id of identifiers) {
    if (!MANGLE_MAP[id]) {
      let candidate = generateMangledName(mangleCounter++);
      while (RESERVED.has(candidate)) {
        candidate = generateMangledName(mangleCounter++);
      }
      MANGLE_MAP[id] = candidate;
    }
  }

  let result = code;
  for (const [original, mangled] of Object.entries(MANGLE_MAP)) {
    result = result.replace(
      new RegExp(`\\b${original}\\b`, "g"),
      mangled
    );
  }

  return result;
}

function analyzeCode(code: string): CodeAnalysis {
  let syntaxValid = true;

  try {
    const trimmed = code.trim();
    const openBraces = (trimmed.match(/\{/g) ?? []).length;
    const closeBraces = (trimmed.match(/\}/g) ?? []).length;
    const openParens = (trimmed.match(/\(/g) ?? []).length;
    const closeParens = (trimmed.match(/\)/g) ?? []).length;
    const openBrackets = (trimmed.match(/\[/g) ?? []).length;
    const closeBrackets = (trimmed.match(/\]/g) ?? []).length;

    if (
      Math.abs(openBraces - closeBraces) > 2 ||
      Math.abs(openParens - closeParens) > 2 ||
      Math.abs(openBrackets - closeBrackets) > 2
    ) {
      syntaxValid = false;
    }

    const unclosedStrings = code.match(/(?<![\\])["'`][^"'`\n]*$/m);
    if (unclosedStrings) syntaxValid = false;
  } catch {
    syntaxValid = false;
  }

  const functionCount = countPattern(
    code,
    /\bfunction\b|\=>\s*[\{(]|=>\s*[a-zA-Z_$\d]/g
  );
  const classCount = countPattern(code, /\bclass\b/g);
  const ifCount = countPattern(code, /\bif\s*\(/g);
  const loopCount = countPattern(
    code,
    /\b(?:for|while|do)\s*\(/g
  );
  const complexityScore = functionCount + classCount * 2 + ifCount + loopCount;

  return {
    syntaxValid,
    complexity:
      complexityScore < 5 ? "low" : complexityScore < 15 ? "medium" : "high",
    hasESModules:
      /\b(?:import|export)\s+(?:default|{|\*|[a-zA-Z_$])/.test(code),
    hasCommonJS:
      /\b(?:require\s*\(|module\.exports|exports\.)/
        .test(code),
    hasAsyncAwait: /\b(?:async\s+function|async\s+\(|await\s+)/.test(code),
    hasArrowFunctions: /=>\s*[\{(a-zA-Z_$\d]/.test(code),
    hasClasses: /\bclass\s+[A-Z]/.test(code),
    hasDestructuring:
      /(?:const|let|var)\s*[\[{]|function[^(]*\([^)]*[\[{]/.test(code),
    hasTemplateLiterals: /`[^`]*`/.test(code),
    hasOptionalChaining: /\?\.[a-zA-Z_$\[]/.test(code),
  };
}

function detectIssues(code: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (/\beval\s*\(/.test(trimmed)) {
      issues.push({
        type: "error",
        message: "Use of eval() is dangerous and should be avoided.",
        line: lineNum,
        rule: "no-eval",
      });
    }

    if (/\bwith\s*\(/.test(trimmed)) {
      issues.push({
        type: "error",
        message:
          "The with statement is deprecated and creates scoping issues.",
        line: lineNum,
        rule: "no-with",
      });
    }

    if (/\bdocument\.write\s*\(/.test(trimmed)) {
      issues.push({
        type: "warning",
        message:
          "document.write() blocks parsing and should not be used in production.",
        line: lineNum,
        rule: "no-document-write",
      });
    }

    if (/\bconsole\s*\./.test(trimmed)) {
      issues.push({
        type: "info",
        message: "console statement found. Remove before production deployment.",
        line: lineNum,
        rule: "no-console",
      });
    }

    if (/\bdebugger\b/.test(trimmed)) {
      issues.push({
        type: "error",
        message: "debugger statement found. Must be removed before production.",
        line: lineNum,
        rule: "no-debugger",
      });
    }

    if (/\bnew Array\s*\(\d+\)/.test(trimmed) === false && /\bnew Array\s*\(/.test(trimmed)) {
      issues.push({
        type: "warning",
        message: "Prefer array literals [] over new Array() constructor.",
        line: lineNum,
        rule: "no-array-constructor",
      });
    }

    if (/==(?!=)/.test(trimmed) && !/[!=><]=/.test(trimmed.replace(/==/g, ""))) {
      issues.push({
        type: "warning",
        message: "Use strict equality (===) instead of loose equality (==).",
        line: lineNum,
        rule: "eqeqeq",
      });
    }

    if (/\bvar\s+/.test(trimmed)) {
      issues.push({
        type: "info",
        message:
          "Consider using const or let instead of var for better scoping.",
        line: lineNum,
        rule: "no-var",
      });
    }

    if (line.length > 120) {
      issues.push({
        type: "info",
        message: `Line length (${line.length}) exceeds 120 characters.`,
        line: lineNum,
        rule: "max-len",
      });
    }
  });

  const allCode = code;

  if (/\bnew\s+Object\s*\(\)/.test(allCode)) {
    issues.push({
      type: "info",
      message: "Prefer object literals {} over new Object().",
      rule: "no-new-object",
    });
  }

  if (!/['"]use strict['"]/.test(allCode) && !/\btype\s*=\s*['"]module['"]/.test(allCode)) {
    const hasModuleSyntax =
      /\b(?:import|export)\s+/.test(allCode) ||
      /\bmodule\.exports\b/.test(allCode);
    if (!hasModuleSyntax) {
      issues.push({
        type: "info",
        message:
          "Consider adding 'use strict' directive for safer JavaScript execution.",
        rule: "strict",
      });
    }
  }

  return issues;
}

function countComments(code: string): number {
  const blockComments = (code.match(/\/\*[\s\S]*?\*\//g) ?? []).length;
  const lineComments = (code.match(/\/\/[^\n]*/g) ?? []).length;
  return blockComments + lineComments;
}

function countStrings(code: string): number {
  const doubleQuoted = (code.match(/"(?:[^"\\]|\\.)*"/g) ?? []).length;
  const singleQuoted = (code.match(/'(?:[^'\\]|\\.)*'/g) ?? []).length;
  const templateLiterals = (code.match(/`(?:[^`\\]|\\.)*`/g) ?? []).length;
  return doubleQuoted + singleQuoted + templateLiterals;
}

function countFunctions(code: string): number {
  const namedFunctions = (code.match(/\bfunction\s+[a-zA-Z_$]/g) ?? []).length;
  const anonymousFunctions = (code.match(/\bfunction\s*\(/g) ?? []).length;
  const arrowFunctions = (
    code.match(/(?:=>)\s*[\{([a-zA-Z_$\d`"']/g) ?? []
  ).length;
  const methodShorthands = (
    code.match(/(?:^|\s)[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{/gm) ?? []
  ).length;
  return namedFunctions + anonymousFunctions + arrowFunctions + Math.max(0, methodShorthands - namedFunctions - anonymousFunctions);
}

function countVariables(code: string): number {
  const varDecls = (code.match(/\bvar\s+[a-zA-Z_$]/g) ?? []).length;
  const letDecls = (code.match(/\blet\s+[a-zA-Z_$]/g) ?? []).length;
  const constDecls = (code.match(/\bconst\s+[a-zA-Z_$]/g) ?? []).length;
  return varDecls + letDecls + constDecls;
}

export function processJS(
  code: string,
  options: MinifyOptions
): MinifyResult {
  if (!code || !code.trim()) {
    throw new Error("No code provided");
  }

  const analysis = analyzeCode(code);
  const issues = detectIssues(code);

  let output = code;

  if (options.removeDebugger) {
    output = removeDebuggerStatements(output);
  }

  if (options.removeConsole) {
    output = removeConsoleStatements(output);
  }

  if (options.deadCodeElimination) {
    output = eliminateDeadCode(output);
  }

  if (options.removeComments) {
    output = removeBlockComments(output);
    output = removeLineComments(output);
  }

  switch (options.mode) {
    case "minify": {
      if (options.collapseWhitespace) {
        output = collapseWhitespace(output);
      } else {
        output = output
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
          .join("\n");
      }
      break;
    }
    case "compress": {
      output = collapseWhitespace(output);

      output = output
        .replace(/\breturn\s+true\b/g, "return!0")
        .replace(/\breturn\s+false\b/g, "return!1")
        .replace(/===\s*true\b/g, "===!0")
        .replace(/===\s*false\b/g, "===!1")
        .replace(/!==\s*true\b/g, "!==!0")
        .replace(/!==\s*false\b/g, "!==!1")
        .replace(/\bvoid\s+0\b/g, "void 0")
        .replace(/\bundefined\b/g, "void 0")
        .replace(/\{\s*\}/g, "{}")
        .replace(/;\s*}/g, "}")
        .replace(/,\s*\]/g, "]")
        .replace(/,\s*\)/g, ")");
      break;
    }
    case "mangle": {
      output = collapseWhitespace(output);
      if (options.mangle) {
        output = mangleVariables(output);
      }
      output = output
        .replace(/\breturn\s+true\b/g, "return!0")
        .replace(/\breturn\s+false\b/g, "return!1")
        .replace(/\bundefined\b/g, "void 0");
      break;
    }
  }

  if (options.mangle && options.mode !== "mangle") {
    output = mangleVariables(output);
  }

  output = output.trim();

  const originalBytes = new TextEncoder().encode(code).length;
  const minifiedBytes = new TextEncoder().encode(output).length;
  const savings = Math.max(0, originalBytes - minifiedBytes);
  const savingsPercent =
    originalBytes > 0
      ? Math.round((savings / originalBytes) * 100)
      : 0;

  const stats: JSStats = {
    original: originalBytes,
    minified: minifiedBytes,
    savings,
    savingsPercent,
    originalLines: code.split("\n").length,
    minifiedLines: output.split("\n").length,
    functions: countFunctions(code),
    variables: countVariables(code),
    comments: countComments(code),
    strings: countStrings(code),
  };

  return { output, stats, analysis, issues };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const index = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[index]}`;
}

export function estimateGzipSize(code: string): number {
  if (!code) return 0;
  const bytes = new TextEncoder().encode(code).length;

  const uniqueChars = new Set(code).size;
  const entropy = uniqueChars / 95;
  const repetitionFactor = 1 - (code.length - new Set(code.split("")).size) / code.length;

  const ratio = 0.25 + entropy * 0.2 + repetitionFactor * 0.15;
  return Math.max(1, Math.round(bytes * Math.min(0.85, ratio)));
}