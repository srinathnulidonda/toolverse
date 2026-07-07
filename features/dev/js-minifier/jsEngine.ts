// features/dev/js-minifier/jsEngine.ts

export type MinifyMode = "minify" | "compress" | "mangle";
export type QuoteStyle = "single" | "double" | "auto";

export interface MinifyOptions {
    mode: MinifyMode;
    removeComments: boolean;
    removeConsole: boolean;
    removeDebugger: boolean;
    collapseWhitespace: boolean;
    semicolons: boolean;
    quoteStyle: QuoteStyle;
    mangle: boolean;
    deadCodeElimination: boolean;
    inlineShortFunctions: boolean;
}

export interface MinifyResult {
    output: string;
    stats: JSStats;
    analysis: CodeAnalysis;
    issues: CodeIssue[];
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

export interface CodeAnalysis {
    hasESModules: boolean;
    hasCommonJS: boolean;
    hasAsyncAwait: boolean;
    hasArrowFunctions: boolean;
    hasClasses: boolean;
    hasDestructuring: boolean;
    hasTemplateLiterals: boolean;
    hasOptionalChaining: boolean;
    complexity: "low" | "medium" | "high";
    syntaxValid: boolean;
}

export interface CodeIssue {
    type: "error" | "warning" | "info";
    message: string;
    line?: number;
    column?: number;
    rule?: string;
}

export const DEFAULT_OPTIONS: MinifyOptions = {
    mode: "minify",
    removeComments: true,
    removeConsole: false,
    removeDebugger: true,
    collapseWhitespace: true,
    semicolons: true,
    quoteStyle: "auto",
    mangle: false,
    deadCodeElimination: false,
    inlineShortFunctions: false,
};

export const SAMPLE_TEMPLATES = {
    basic: {
        name: "Functions",
        description: "Basic JavaScript functions",
        code: `// Utility functions for e-commerce cart
function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const discount = item.discount || 0;
    const price = item.price * (1 - discount / 100);
    total += price * item.quantity;
  }

  return Math.round(total * 100) / 100;
}

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

function applyPromoCode(cart, code) {
  const promoCodes = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'HALFOFF': 0.50,
  };

  const discount = promoCodes[code.toUpperCase()];

  if (!discount) {
    return { success: false, message: 'Invalid promo code' };
  }

  const total = calculateTotal(cart);
  const savings = total * discount;

  return {
    success: true,
    originalTotal: total,
    discount: savings,
    finalTotal: total - savings,
    formattedTotal: formatCurrency(total - savings)
  };
}

export { calculateTotal, formatCurrency, applyPromoCode };`
    },
    class: {
        name: "ES6 Class",
        description: "Modern ES6 class example",
        code: `// EventEmitter implementation
class EventEmitter {
  constructor() {
    this._events = new Map();
    this._maxListeners = 10;
  }

  on(event, listener) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }

    const listeners = this._events.get(event);

    if (listeners.length >= this._maxListeners) {
      console.warn(\`MaxListenersExceededWarning: \${this._maxListeners} listeners added for event "\${event}"\`);
    }

    listeners.push(listener);
    return this;
  }

  off(event, listener) {
    if (!this._events.has(event)) return this;

    const listeners = this._events.get(event);
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    return this;
  }

  emit(event, ...args) {
    if (!this._events.has(event)) return false;

    const listeners = [...this._events.get(event)];
    listeners.forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(\`Error in event listener for "\${event}"\`, error);
      }
    });

    return true;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

export default EventEmitter;`
    },
    async: {
        name: "Async/Await",
        description: "Async/await with error handling",
        code: `// API service with retry logic
const API_BASE = 'https://api.example.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${getAuthToken()}\`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

function isRetryableError(error) {
  return error.message.includes('NetworkError') ||
    error.message.includes('fetch') ||
    error.status >= 500;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getUserData(userId) {
  const [user, posts, followers] = await Promise.all([
    fetchWithRetry(\`\${API_BASE}/users/\${userId}\`),
    fetchWithRetry(\`\${API_BASE}/users/\${userId}/posts\`),
    fetchWithRetry(\`\${API_BASE}/users/\${userId}/followers\`)
  ]);

  return { user, posts, followers };
}

export { fetchWithRetry, getUserData };`
    },
    algorithm: {
        name: "Algorithm",
        description: "Data structures and algorithms",
        code: `// Binary search tree implementation
class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
    this.size = 0;
  }

  insert(value) {
    const newNode = new BSTNode(value);

    if (!this.root) {
      this.root = newNode;
      this.size++;
      return this;
    }

    let current = this.root;

    while (true) {
      if (value === current.value) return this; // Duplicate

      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          this.size++;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          this.size++;
          return this;
        }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;

    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }

    return false;
  }

  inOrder(node = this.root, result = []) {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }
}

export { BSTNode, BinarySearchTree };`
    }
};

//  Core engine 

export function processJS(input: string, options: MinifyOptions = DEFAULT_OPTIONS): MinifyResult {
    const analysis = analyzeCode(input);
    const issues = lintCode(input);

    let output = input;

    switch (options.mode) {
        case "minify":
            output = minifyJS(input, options);
            break;
        case "compress":
            output = compressJS(input, options);
            break;
        case "mangle":
            output = mangleJS(input, options);
            break;
    }

    const stats = calculateStats(input, output);

    return { output, stats, analysis, issues };
}

function minifyJS(js: string, options: MinifyOptions): string {
    let result = js;

    // Remove debugger statements
    if (options.removeDebugger) {
        result = result.replace(/\bdebugger\s*;?/g, '');
    }

    // Remove console.* calls
    if (options.removeConsole) {
        result = result.replace(/console\.\w+\s*\([^)]*\)\s*;?/g, '');
    }

    // Remove multi-line comments (preserve license comments /*! ... */)
    if (options.removeComments) {
        result = result.replace(/\/\*(?!![\s\S]*?\*\/)([\s\S]*?)\*\//g, '');
        result = result.replace(/\/\/(?!.*@license).*$/gm, '');
    }

    // Collapse whitespace
    if (options.collapseWhitespace) {
        // Preserve strings
        const strings: string[] = [];
        result = result.replace(/(["'`])((?:\\\1|(?!\1)[\s\S])*?)\1/g, (match) => {
            strings.push(match);
            return `__STR${strings.length - 1}__`;
        });

        result = result
            .replace(/\n\s*\n/g, '\n')
            .replace(/^\s+/gm, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/\s*([{}();,=<>!&|+\-*/%?:[\]])\s*/g, '$1')
            .replace(/\s+/g, ' ');

        // Restore strings
        strings.forEach((str, i) => {
            result = result.replace(`__STR${i}__`, str);
        });
    }

    // Remove trailing semicolons before closing braces
    result = result.replace(/;}/g, '}');

    return result.trim();
}

function compressJS(js: string, options: MinifyOptions): string {
    let result = minifyJS(js, options);

    // Additional compressions
    // Shorten boolean literals
    result = result.replace(/\btrue\b/g, '!0');
    result = result.replace(/\bfalse\b/g, '!1');
    result = result.replace(/\bundefined\b/g, 'void 0');

    // Compress common patterns
    result = result.replace(/\breturn\s+/g, 'return ');

    return result;
}

function mangleJS(js: string, options: MinifyOptions): string {
    let result = compressJS(js, options);

    // Simple variable mangling (for local variables)
    const varNames = new Map<string, string>();
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let counter = 0;

    const getShortName = () => {
        let name = '';
        let n = counter++;
        do {
            name = chars[n % 26] + name;
            n = Math.floor(n / 26) - 1;
        } while (n >= 0);
        return name;
    };

    // Only mangle local variable declarations (simplified)
    result = result.replace(/\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (match, name) => {
        if (!varNames.has(name) && !isReservedWord(name)) {
            varNames.set(name, getShortName());
        }
        return `var ${varNames.get(name) || name}`;
    });

    return result;
}

function isReservedWord(word: string): boolean {
    const reserved = new Set([
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
        'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
        'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
        'let', 'new', 'null', 'return', 'static', 'super', 'switch', 'this',
        'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
        'yield', 'async', 'await', 'of'
    ]);
    return reserved.has(word);
}

export function analyzeCode(js: string): CodeAnalysis {
    const hasESModules = /\b(import|export)\b/.test(js);
    const hasCommonJS = /\b(require|module\.exports)\b/.test(js);
    const hasAsyncAwait = /\b(async|await)\b/.test(js);
    const hasArrowFunctions = /=>/.test(js);
    const hasClasses = /\bclass\b/.test(js);
    const hasDestructuring = /(?:const|let|var)\s*[{[]/.test(js);
    const hasTemplateLiterals = /`/.test(js);
    const hasOptionalChaining = /\?\./.test(js);

    const functionCount = (js.match(/\bfunction\b/g) || []).length;
    const classCount = (js.match(/\bclass\b/g) || []).length;
    const lines = js.split('\n').length;

    let complexity: "low" | "medium" | "high" = "low";
    if (lines > 200 || functionCount > 10 || classCount > 3) {
        complexity = "high";
    } else if (lines > 50 || functionCount > 3 || classCount > 1) {
        complexity = "medium";
    }

    let syntaxValid = true;
    try {
        // Basic syntax check
        const brackets = { '{': 0, '(': 0, '[': 0 };
        const pairs: Record<string, keyof typeof brackets> = { '}': '{', ')': '(', ']': '[' };

        for (const char of js) {
            if (char in brackets) {
                brackets[char as keyof typeof brackets]++;
            } else if (char in pairs) {
                const open = pairs[char];
                brackets[open]--;
                if (brackets[open] < 0) {
                    syntaxValid = false;
                    break;
                }
            }
        }

        if (Object.values(brackets).some(v => v !== 0)) {
            syntaxValid = false;
        }
    } catch {
        syntaxValid = false;
    }

    return {
        hasESModules,
        hasCommonJS,
        hasAsyncAwait,
        hasArrowFunctions,
        hasClasses,
        hasDestructuring,
        hasTemplateLiterals,
        hasOptionalChaining,
        complexity,
        syntaxValid
    };
}

export function lintCode(js: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = js.split('\n');

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        // Check for debugger statements
        if (/\bdebugger\b/.test(trimmed)) {
            issues.push({
                type: "warning",
                message: "Debugger statement found — remove before production",
                line: lineNum,
                rule: "no-debugger"
            });
        }

        // Check for console statements
        if (/\bconsole\.\w+/.test(trimmed)) {
            issues.push({
                type: "info",
                message: "Console statement — consider removing for production",
                line: lineNum,
                rule: "no-console"
            });
        }

        // Check for eval
        if (/\beval\s*\(/.test(trimmed)) {
            issues.push({
                type: "error",
                message: "eval() is dangerous and should be avoided",
                line: lineNum,
                rule: "no-eval"
            });
        }

        // Check for var (prefer const/let)
        if (/^\s*var\s+/.test(line)) {
            issues.push({
                type: "info",
                message: "Consider using 'const' or 'let' instead of 'var'",
                line: lineNum,
                rule: "no-var"
            });
        }

        // Check for == (prefer ===)
        if (/[^=!<>]==[^=]/.test(trimmed)) {
            issues.push({
                type: "warning",
                message: "Use '===' instead of '==' for strict equality",
                line: lineNum,
                rule: "eqeqeq"
            });
        }

        // Long lines
        if (line.length > 120) {
            issues.push({
                type: "info",
                message: `Line is ${line.length} characters — consider breaking it up`,
                line: lineNum,
                rule: "max-len"
            });
        }
    });

    return issues;
}

function calculateStats(original: string, processed: string): JSStats {
    const originalSize = new Blob([original]).size;
    const processedSize = new Blob([processed]).size;
    const savings = originalSize - processedSize;
    const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

    const functions = (original.match(/\bfunction\b/g) || []).length +
        (original.match(/=>/g) || []).length;
    const variables = (original.match(/\b(const|let|var)\s+\w+/g) || []).length;
    const comments = (original.match(/\/\/.*$|\/\*[\s\S]*?\*\//gm) || []).length;
    const strings = (original.match(/(["'`])((?:\\\1|(?!\1)[\s\S])*?)\1/g) || []).length;

    return {
        original: originalSize,
        minified: processedSize,
        savings,
        savingsPercent,
        originalLines: original.split('\n').length,
        minifiedLines: processed.split('\n').length,
        functions,
        variables,
        comments,
        strings
    };
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function formatNumber(n: number): string {
    return n.toLocaleString();
}

export function estimateGzipSize(input: string): number {
    // Rough estimate: gzip typically achieves 60-70% compression on JS
    return Math.round(new Blob([input]).size * 0.35);
}