// features/dev/css-minifier/ts/utils.ts

export interface MinifyOptions {
  removeComments: boolean;
  removeWhitespace: boolean;
  removeLastSemicolon: boolean;
  preserveImportant: boolean;
}

export interface MinifyStats {
  original: number;
  minified: number;
  savings: number;
  savingsPercent: number;
  rules: number;
  mediaQueries: number;
  keyframes: number;
}

export interface MinifyResult {
  output: string;
  stats: MinifyStats;
}

export interface CSSHistoryEntry {
  id: string;
  input: string;
  output: string;
  timestamp: number;
  stats?: MinifyStats;
}

export const DEFAULT_MINIFY_OPTIONS: MinifyOptions = {
  removeComments: true,
  removeWhitespace: true,
  removeLastSemicolon: true,
  preserveImportant: true,
};

export const MAX_STORED_TEXT_LENGTH = 20000;

export const SAMPLE_CSS = `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`;

export function minifyCSS(css: string, options: MinifyOptions = DEFAULT_MINIFY_OPTIONS): string {
  let result = css;

  if (options.removeComments) {
    if (options.preserveImportant) {
      const importantComments: string[] = [];
      result = result.replace(/\/\*![\s\S]*?\*\//g, (match) => {
        importantComments.push(match);
        return `___IMPORTANT_COMMENT_${importantComments.length - 1}___`;
      });

      result = result.replace(/\/\*[\s\S]*?\*\//g, "");

      importantComments.forEach((comment, index) => {
        result = result.replace(`___IMPORTANT_COMMENT_${index}___`, comment);
      });
    } else {
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    }
  }

  if (options.removeWhitespace) {
    result = result.replace(/\s+/g, " ");
    result = result.replace(/\s*([{}:;,>+~])\s*/g, "$1");
    result = result.replace(/\s*\(\s*/g, "(");
    result = result.replace(/\s*\)\s*/g, ")");
    result = result.replace(/\s*\[\s*/g, "[");
    result = result.replace(/\s*\]\s*/g, "]");
  }

  if (options.removeLastSemicolon) {
    result = result.replace(/;}/g, "}");
  }

  return result.trim();
}

export function processCSS(input: string, options: MinifyOptions = DEFAULT_MINIFY_OPTIONS): MinifyResult {
  const output = minifyCSS(input, options);

  const original = new Blob([input]).size;
  const minified = new Blob([output]).size;
  const savings = Math.max(0, original - minified);
  const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;

  const rules = (input.match(/\{/g) || []).length;
  const mediaQueries = (input.match(/@media/g) || []).length;
  const keyframes = (input.match(/@keyframes/g) || []).length;

  return {
    output,
    stats: { original, minified, savings, savingsPercent, rules, mediaQueries, keyframes },
  };
}

export function analyzeCSS(css: string, options: MinifyOptions = DEFAULT_MINIFY_OPTIONS): MinifyStats {
  return processCSS(css, options).stats;
}

export function validateCSS(css: string): { valid: boolean; error?: string } {
  if (!css.trim()) {
    return { valid: false, error: "Empty input" };
  }

  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    return {
      valid: false,
      error: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`,
    };
  }

  return { valid: true };
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function capText(text: string, max: number = MAX_STORED_TEXT_LENGTH): string {
  return text.length > max ? text.slice(0, max) : text;
}