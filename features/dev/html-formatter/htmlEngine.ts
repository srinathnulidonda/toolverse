// features/dev/html-formatter/htmlEngine.ts
export type FormattingMode = "format" | "minify" | "compress";
export type IndentStyle = "2-spaces" | "4-spaces" | "tabs";
export type LineBreakStyle = "lf" | "crlf" | "cr";

export interface FormattingOptions {
    mode: FormattingMode;
    indentStyle: IndentStyle;
    lineBreakStyle: LineBreakStyle;
    preserveNewlines: boolean;
    wrapAttributes: boolean;
    wrapLineLength: number;
    sortAttributes: boolean;
    removeComments: boolean;
    removeOptionalTags: boolean;
    collapseWhitespace: boolean;
    preserveInlineElements: boolean;
}

export interface ProcessResult {
    output: string;
    stats: HTMLStats;
    validation: ValidationResult;
    metadata: HTMLMetadata;
}

export interface HTMLStats {
    original: number;
    processed: number;
    savings: number;
    savingsPercent: number;
    elements: number;
    attributes: number;
    textNodes: number;
    comments: number;
    lines: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: string[];
}

export interface ValidationError {
    type: "syntax" | "nesting" | "attribute" | "missing";
    message: string;
    line?: number;
    column?: number;
    element?: string;
}

export interface ValidationWarning {
    type: "accessibility" | "seo" | "performance" | "best-practice";
    message: string;
    severity: "low" | "medium" | "high";
    element?: string;
}

export interface HTMLMetadata {
    doctype: string | null;
    language: string | null;
    charset: string | null;
    viewport: string | null;
    title: string | null;
    metaTags: number;
    linkTags: number;
    scriptTags: number;
    styleTags: number;
    hasSemanticHTML: boolean;
    accessibilityScore: number;
}

export const DEFAULT_OPTIONS: FormattingOptions = {
    mode: "format",
    indentStyle: "2-spaces",
    lineBreakStyle: "lf",
    preserveNewlines: false,
    wrapAttributes: false,
    wrapLineLength: 120,
    sortAttributes: false,
    removeComments: false,
    removeOptionalTags: false,
    collapseWhitespace: true,
    preserveInlineElements: true,
};

export const SAMPLE_TEMPLATES = {
    basic: {
        name: "Basic HTML5",
        description: "Simple HTML5 boilerplate",
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>My Page</title></head><body><header><h1>Welcome</h1><nav><a href="#home">Home</a><a href="#about">About</a></nav></header><main><section><h2>Section Title</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></section></main><footer><p>&copy; 2024 My Website</p></footer></body></html>`
    },
    form: {
        name: "HTML Form",
        description: "Complete form with validation",
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Contact Form</title></head><body><form action="/submit" method="post"><fieldset><legend>Contact Information</legend><label for="name">Name:</label><input type="text" id="name" name="name" required><label for="email">Email:</label><input type="email" id="email" name="email" required><label for="message">Message:</label><textarea id="message" name="message" rows="4" required></textarea></fieldset><button type="submit">Send</button></form></body></html>`
    },
    semantic: {
        name: "Semantic HTML",
        description: "Semantic HTML5 structure",
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Article Page</title></head><body><header><h1>Site Title</h1></header><nav><ul><li><a href="#home">Home</a></li><li><a href="#articles">Articles</a></li></ul></nav><main><article><header><h2>Article Title</h2><p><time datetime="2024-01-15">January 15, 2024</time></p></header><section><h3>Introduction</h3><p>Article content here...</p></section><aside><h3>Related</h3><p>Related content...</p></aside></article></main><footer><p>Copyright notice</p></footer></body></html>`
    },
    table: {
        name: "Data Table",
        description: "Accessible data table",
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Data Table</title></head><body><table><caption>Monthly Sales Report</caption><thead><tr><th scope="col">Month</th><th scope="col">Sales</th><th scope="col">Growth</th></tr></thead><tbody><tr><td>January</td><td>$10,000</td><td>+5%</td></tr><tr><td>February</td><td>$12,000</td><td>+20%</td></tr><tr><td>March</td><td>$15,000</td><td>+25%</td></tr></tbody><tfoot><tr><td>Total</td><td>$37,000</td><td>+17%</td></tr></tfoot></table></body></html>`
    }
};

const INLINE_ELEMENTS = new Set([
    'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code',
    'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'q',
    'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup',
    'textarea', 'time', 'tt', 'var'
]);

const SELF_CLOSING_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
    'param', 'source', 'track', 'wbr'
]);

const OPTIONAL_CLOSING_TAGS = new Set([
    'html', 'head', 'body', 'p', 'dt', 'dd', 'li', 'option', 'thead', 'th',
    'tbody', 'tr', 'td', 'tfoot', 'colgroup'
]);

export function processHTML(input: string, options: FormattingOptions = DEFAULT_OPTIONS): ProcessResult {
    let output = input;
    
    // Process based on mode
    switch (options.mode) {
        case "format":
            output = formatHTML(input, options);
            break;
        case "minify":
            output = minifyHTML(input, options);
            break;
        case "compress":
            output = compressHTML(input, options);
            break;
    }
    
    const stats = calculateStats(input, output);
    const validation = validateHTML(input);
    const metadata = extractMetadata(input);
    
    return { output, stats, validation, metadata };
}

function formatHTML(html: string, options: FormattingOptions): string {
    let formatted = html;
    
    // Remove comments if option is set
    if (options.removeComments) {
        formatted = formatted.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    // Normalize whitespace
    if (options.collapseWhitespace) {
        formatted = formatted.replace(/\s+/g, ' ');
    }
    
    let result = '';
    let indent = 0;
    const indentChar = getIndentString(options.indentStyle);
    const lineBreak = getLineBreak(options.lineBreakStyle);
    
    // Tokenize HTML
    const tokens = tokenizeHTML(formatted);
    let inInlineContext = false;
    let lineLength = 0;
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const trimmed = token.trim();
        
        if (!trimmed) continue;
        
        // Closing tag
        if (trimmed.match(/^<\/(\w+)>/)) {
            const tagName = trimmed.match(/^<\/(\w+)>/)![1].toLowerCase();
            const isInline = INLINE_ELEMENTS.has(tagName);
            
            if (!isInline && !inInlineContext) {
                indent = Math.max(0, indent - 1);
                result += lineBreak + indentChar.repeat(indent) + trimmed;
                lineLength = indent * indentChar.length + trimmed.length;
            } else {
                result += trimmed;
                lineLength += trimmed.length;
            }
            
            if (isInline && inInlineContext) {
                inInlineContext = false;
            }
        }
        // Self-closing tag
        else if (trimmed.match(/\/>$/) || SELF_CLOSING_TAGS.has(getTagName(trimmed))) {
            result += lineBreak + indentChar.repeat(indent) + trimmed;
            lineLength = indent * indentChar.length + trimmed.length;
        }
        // Opening tag
        else if (trimmed.match(/^<(\w+)/)) {
            const tagName = getTagName(trimmed);
            const isInline = INLINE_ELEMENTS.has(tagName);
            
            if (!isInline && !inInlineContext) {
                result += lineBreak + indentChar.repeat(indent) + trimmed;
                lineLength = indent * indentChar.length + trimmed.length;
                indent++;
            } else {
                result += trimmed;
                lineLength += trimmed.length;
                if (isInline && options.preserveInlineElements) {
                    inInlineContext = true;
                }
            }
        }
        // Text content
        else {
            const text = trimmed;
            if (inInlineContext || (i > 0 && INLINE_ELEMENTS.has(getTagName(tokens[i - 1])))) {
                result += text;
                lineLength += text.length;
            } else {
                result += lineBreak + indentChar.repeat(indent) + text;
                lineLength = indent * indentChar.length + text.length;
            }
        }
        
        // Wrap long lines if option is set
        if (options.wrapAttributes && lineLength > options.wrapLineLength) {
            result = wrapLongLines(result, options.wrapLineLength, indentChar);
        }
    }
    
    return result.trim();
}

function minifyHTML(html: string, options: FormattingOptions): string {
    let minified = html;
    
    // Remove comments
    if (options.removeComments) {
        minified = minified.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    // Collapse whitespace
    minified = minified
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/\s+>/g, '>')
        .replace(/>\s+/g, '>');
    
    // Remove optional tags if option is set
    if (options.removeOptionalTags) {
        minified = removeOptionalTags(minified);
    }
    
    return minified.trim();
}

function compressHTML(html: string, options: FormattingOptions): string {
    let compressed = minifyHTML(html, options);
    
    // Additional compression: remove quotes from attributes where possible
    compressed = compressed.replace(/\s+(\w+)="([^"\s]+)"/g, ' $1=$2');
    
    // Remove spaces around = in attributes
    compressed = compressed.replace(/\s*=\s*/g, '=');
    
    // Remove boolean attribute values
    compressed = compressed.replace(/\s+(\w+)="\1"/g, ' $1');
    
    return compressed;
}

function tokenizeHTML(html: string): string[] {
    const tokens: string[] = [];
    const regex = /(<[^>]+>|[^<]+)/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        tokens.push(match[0]);
    }
    
    return tokens;
}

function getTagName(token: string): string {
    const match = token.match(/<\/?(\w+)/);
    return match ? match[1].toLowerCase() : '';
}

function getIndentString(style: IndentStyle): string {
    switch (style) {
        case "2-spaces": return "  ";
        case "4-spaces": return "    ";
        case "tabs": return "\t";
    }
}

function getLineBreak(style: LineBreakStyle): string {
    switch (style) {
        case "lf": return "\n";
        case "crlf": return "\r\n";
        case "cr": return "\r";
    }
}

function wrapLongLines(html: string, maxLength: number, indent: string): string {
    // Simplified line wrapping for attributes
    return html.replace(/<([a-z]+)([^>]+)>/gi, (match, tagName, attrs) => {
        if (match.length <= maxLength) return match;
        
        const wrappedAttrs = attrs.trim().split(/\s+/).join('\n' + indent + '  ');
        return `<${tagName}\n${indent}  ${wrappedAttrs}>`;
    });
}

function removeOptionalTags(html: string): string {
    // Simplified optional tag removal
    return html
        .replace(/<\/p>\s*<p>/gi, '<p>')
        .replace(/<\/li>\s*<li>/gi, '<li>')
        .replace(/<\/option>\s*<option>/gi, '<option>');
}

function calculateStats(original: string, processed: string): HTMLStats {
    const originalSize = new Blob([original]).size;
    const processedSize = new Blob([processed]).size;
    const savings = originalSize - processedSize;
    const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;
    
    // Count elements
    const elements = (original.match(/<[^\/!][^>]*>/g) || []).length;
    const attributes = (original.match(/\s+\w+=/g) || []).length;
    const textNodes = (original.match(/>[^<]+</g) || []).length;
    const comments = (original.match(/<!--[\s\S]*?-->/g) || []).length;
    const lines = processed.split('\n').length;
    
    return {
        original: originalSize,
        processed: processedSize,
        savings,
        savingsPercent,
        elements,
        attributes,
        textNodes,
        comments,
        lines
    };
}

export function validateHTML(html: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];
    
    // Check for balanced tags
    const openTags: string[] = [];
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    let match;
    
    while ((match = tagRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        
        if (fullTag.startsWith('</')) {
            // Closing tag
            if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                if (!OPTIONAL_CLOSING_TAGS.has(tagName)) {
                    errors.push({
                        type: "nesting",
                        message: `Unexpected closing tag </${tagName}>`,
                        element: tagName
                    });
                }
            } else {
                openTags.pop();
            }
        } else if (!SELF_CLOSING_TAGS.has(tagName) && !fullTag.endsWith('/>')) {
            // Opening tag
            openTags.push(tagName);
        }
    }
    
    // Check for unclosed tags
    openTags.forEach(tag => {
        if (!OPTIONAL_CLOSING_TAGS.has(tag)) {
            errors.push({
                type: "nesting",
                message: `Unclosed tag <${tag}>`,
                element: tag
            });
        }
    });
    
    // Check for DOCTYPE
    if (!html.toLowerCase().includes('<!doctype')) {
        warnings.push({
            type: "best-practice",
            message: "Missing DOCTYPE declaration",
            severity: "medium"
        });
        suggestions.push("Add <!DOCTYPE html> at the beginning of the document");
    }
    
    // Check for lang attribute
    if (!html.match(/<html[^>]*\slang=/i)) {
        warnings.push({
            type: "accessibility",
            message: "Missing lang attribute on <html> element",
            severity: "medium"
        });
        suggestions.push('Add lang attribute to <html> tag, e.g., <html lang="en">');
    }
    
    // Check for charset
    if (!html.match(/<meta[^>]*charset=/i)) {
        warnings.push({
            type: "best-practice",
            message: "Missing charset declaration",
            severity: "medium"
        });
        suggestions.push('Add <meta charset="UTF-8"> in the <head> section');
    }
    
    // Check for viewport
    if (!html.match(/<meta[^>]*name="viewport"/i)) {
        warnings.push({
            type: "best-practice",
            message: "Missing viewport meta tag",
            severity: "low"
        });
        suggestions.push('Add <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }
    
    // Check for images without alt
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    imgTags.forEach(img => {
        if (!img.match(/alt=/i)) {
            warnings.push({
                type: "accessibility",
                message: "Image missing alt attribute",
                severity: "high",
                element: "img"
            });
        }
    });
    
    // Check for headings order
    const headings = html.match(/<h[1-6][^>]*>/gi) || [];
    if (headings.length > 0) {
        const levels = headings.map(h => parseInt(h.match(/<h([1-6])/i)![1]));
        let prevLevel = 0;
        levels.forEach(level => {
            if (level - prevLevel > 1) {
                warnings.push({
                    type: "accessibility",
                    message: `Heading levels should not be skipped (found h${level} after h${prevLevel})`,
                    severity: "medium"
                });
            }
            prevLevel = level;
        });
    }
    
    const isValid = errors.length === 0;
    
    return { isValid, errors, warnings, suggestions };
}

export function extractMetadata(html: string): HTMLMetadata {
    const doctypeMatch = html.match(/<!DOCTYPE[^>]*>/i);
    const langMatch = html.match(/<html[^>]*\slang="([^"]*)"/i);
    const charsetMatch = html.match(/<meta[^>]*charset="?([^"\s>]+)"?/i);
    const viewportMatch = html.match(/<meta[^>]*name="viewport"[^>]*content="([^"]*)"/i);
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    
    const metaTags = (html.match(/<meta[^>]*>/gi) || []).length;
    const linkTags = (html.match(/<link[^>]*>/gi) || []).length;
    const scriptTags = (html.match(/<script[^>]*>/gi) || []).length;
    const styleTags = (html.match(/<style[^>]*>/gi) || []).length;
    
    // Check for semantic HTML5 elements
    const semanticElements = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    const hasSemanticHTML = semanticElements.some(elem => 
        html.toLowerCase().includes(`<${elem}>`) || html.toLowerCase().includes(`<${elem} `)
    );
    
    // Calculate accessibility score (0-100)
    let accessibilityScore = 100;
    const validation = validateHTML(html);
    
    // Deduct points for accessibility warnings
    validation.warnings.forEach(warning => {
        if (warning.type === "accessibility") {
            accessibilityScore -= warning.severity === "high" ? 10 : warning.severity === "medium" ? 5 : 2;
        }
    });
    
    accessibilityScore = Math.max(0, Math.min(100, accessibilityScore));
    
    return {
        doctype: doctypeMatch ? doctypeMatch[0] : null,
        language: langMatch ? langMatch[1] : null,
        charset: charsetMatch ? charsetMatch[1] : null,
        viewport: viewportMatch ? viewportMatch[1] : null,
        title: titleMatch ? titleMatch[1] : null,
        metaTags,
        linkTags,
        scriptTags,
        styleTags,
        hasSemanticHTML,
        accessibilityScore
    };
}

export function convertToMarkdown(html: string): string {
    let markdown = html;
    
    // Convert headings
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
    
    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    
    // Convert links
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Convert images
    markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)');
    
    // Convert bold and italic
    markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');
    markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');
    
    // Convert code
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\\s\\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');
    
    // Convert lists
    markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    markdown = markdown.replace(/<\/?[uo]l[^>]*>/gi, '\n');
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    markdown = markdown
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
    
    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
    
    return markdown;
}

export function convertToPlainText(html: string): string {
    // Remove script and style elements
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Add newlines for block elements
    text = text.replace(/<\/?(div|p|br|h[1-6]|li|tr)[^>]*>/gi, '\n');
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
    
    // Clean up whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    
    return text.trim();
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}