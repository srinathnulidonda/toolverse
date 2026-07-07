// features/dev/css-minifier/utils.ts
import { formatBytes } from '@/utils';

export interface MinifyOptions {
    removeComments: boolean;
    removeWhitespace: boolean;
    removeLastSemicolon: boolean;
    preserveImportant: boolean;
}

export interface MinifyResult {
    output: string;
    stats: {
        original: number;
        minified: number;
        savings: number;
        savingsPercent: number;
        rules: number;
        mediaQueries: number;
        keyframes: number;
    };
}

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

export function minifyCSS(css: string, options: MinifyOptions = {
    removeComments: true,
    removeWhitespace: true,
    removeLastSemicolon: true,
    preserveImportant: true,
}): string {
    let result = css;

    // Remove comments (but preserve /*! important comments */ if option is set)
    if (options.removeComments) {
        if (options.preserveImportant) {
            // Temporarily replace important comments
            const importantComments: string[] = [];
            result = result.replace(/\/\*![\s\S]*?\*\//g, (match) => {
                importantComments.push(match);
                return `___IMPORTANT_COMMENT_${importantComments.length - 1}___`;
            });
            
            // Remove regular comments
            result = result.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Restore important comments
            importantComments.forEach((comment, index) => {
                result = result.replace(`___IMPORTANT_COMMENT_${index}___`, comment);
            });
        } else {
            result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        }
    }

    if (options.removeWhitespace) {
        // Collapse whitespace
        result = result.replace(/\s+/g, ' ');
        
        // Remove space around delimiters
        result = result.replace(/\s*([{}:;,>+~])\s*/g, '$1');
        
        // Remove space after opening and before closing brackets
        result = result.replace(/\s*\(\s*/g, '(');
        result = result.replace(/\s*\)\s*/g, ')');
        result = result.replace(/\s*\[\s*/g, '[');
        result = result.replace(/\s*\]\s*/g, ']');
    }

    if (options.removeLastSemicolon) {
        // Remove last semicolon before closing brace
        result = result.replace(/;}/g, '}');
    }

    // Remove leading/trailing whitespace
    result = result.trim();

    return result;
}

export function analyzeCSS(css: string): MinifyResult['stats'] {
    const original = new Blob([css]).size;
    const minified = new Blob([minifyCSS(css)]).size;
    const savings = original - minified;
    const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;
    
    const rules = (css.match(/\{/g) || []).length;
    const mediaQueries = (css.match(/@media/g) || []).length;
    const keyframes = (css.match(/@keyframes/g) || []).length;

    return {
        original,
        minified,
        savings,
        savingsPercent,
        rules,
        mediaQueries,
        keyframes,
    };
}

export function processCSS(input: string, options?: MinifyOptions): MinifyResult {
    const output = minifyCSS(input, options);
    const stats = analyzeCSS(input);

    return { output, stats };
}

export function validateCSS(css: string): { valid: boolean; error?: string } {
    if (!css.trim()) {
        return { valid: false, error: "Empty input" };
    }

    // Basic validation: check for balanced braces
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