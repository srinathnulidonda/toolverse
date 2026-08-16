// features/dev/slug-generator/ts/utils.ts
export { formatBytes, downloadText } from "@/utils";

export type Separator = "-" | "_" | "." | "";
export type CaseStyle =
  "lowercase" | "uppercase" | "preserve" | "title" | "camel" | "pascal" | "snake";
export type TransliterateMode = "auto" | "latin" | "none";

export interface SlugOptions {
  separator: Separator;
  caseStyle: CaseStyle;
  removeSpecial: boolean;
  removeDiacritics: boolean;
  removeStopWords: boolean;
  transliterate: TransliterateMode;
  maxLength: number | null;
  smartTruncate: boolean;
  preserveNumbers: boolean;
  customReplacements: Record<string, string>;
  allowedChars: string;
}

export interface SlugAnalysis {
  score: number; // 0-100
  length: number;
  wordCount: number;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  readability: "excellent" | "good" | "fair" | "poor";
  seoIssues: string[];
  suggestions: string[];
  keywords: Array<{ word: string; count: number }>;
}

export const DEFAULT_OPTIONS: SlugOptions = {
  separator: "-",
  caseStyle: "lowercase",
  removeSpecial: true,
  removeDiacritics: true,
  removeStopWords: false,
  transliterate: "auto",
  maxLength: null,
  smartTruncate: true,
  preserveNumbers: true,
  customReplacements: {},
  allowedChars: "",
};

export const SAMPLE_SLUGS = [
  { id: "blog", label: "Blog Post", text: "How to Build a Modern Web Application in 2024" },
  { id: "product", label: "Product", text: "MacBook Pro 16-inch (M3 Max, 2024 Model)" },
  { id: "unicode", label: "Unicode", text: "Café façade: naïve résumé étude" },
  {
    id: "technical",
    label: "Technical",
    text: "Understanding React's useEffect() Hook & Dependencies",
  },
  { id: "multilang", label: "Russian", text: "Привет мир! Hello World 2024" },
  { id: "special", label: "Special Chars", text: "Hello@World! #awesome $100 & more..." },
];

// Common stop words (English)
const STOP_WORDS_EN = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "you",
  "your",
  "this",
  "but",
  "or",
]);

// Transliteration mappings
const TRANSLITERATION_MAP: Record<string, string> = {
  // Cyrillic
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Е: "E",
  Ё: "Yo",
  Ж: "Zh",
  З: "Z",
  И: "I",
  Й: "Y",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  У: "U",
  Ф: "F",
  Х: "H",
  Ц: "Ts",
  Ч: "Ch",
  Ш: "Sh",
  Щ: "Sch",
  Ъ: "",
  Ы: "Y",
  Ь: "",
  Э: "E",
  Ю: "Yu",
  Я: "Ya",
  // Greek
  α: "a",
  β: "b",
  γ: "g",
  δ: "d",
  ε: "e",
  ζ: "z",
  η: "i",
  θ: "th",
  ι: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "ks",
  ο: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "y",
  φ: "f",
  χ: "ch",
  ψ: "ps",
  ω: "o",
  // German
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  // Scandinavian
  å: "aa",
  Å: "Aa",
  æ: "ae",
  Æ: "Ae",
  ø: "o",
  Ø: "O",
  // Polish
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
  Ą: "A",
  Ć: "C",
  Ę: "E",
  Ł: "L",
  Ń: "N",
  Ó: "O",
  Ś: "S",
  Ź: "Z",
  Ż: "Z",
  // Turkish
  ç: "c",
  ğ: "g",
  ı: "i",
  ş: "s",
  Ç: "C",
  Ğ: "G",
  İ: "I",
  Ş: "S",
  // Czech
  č: "c",
  ď: "d",
  ě: "e",
  ň: "n",
  ř: "r",
  š: "s",
  ť: "t",
  ů: "u",
  ý: "y",
  ž: "z",
  Č: "C",
  Ď: "D",
  Ě: "E",
  Ň: "N",
  Ř: "R",
  Š: "S",
  Ť: "T",
  Ů: "U",
  Ý: "Y",
  Ž: "Z",
};

/*  Core Functions  */

export function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function transliterate(str: string): string {
  let result = "";
  for (const char of str) {
    result += TRANSLITERATION_MAP[char] ?? char;
  }
  return result;
}

export function removeStopWords(str: string, separator: string): string {
  const words = str.split(new RegExp(`\\${separator}+`));
  return words.filter((word) => !STOP_WORDS_EN.has(word.toLowerCase())).join(separator);
}

export function applyCaseStyle(str: string, style: CaseStyle, separator: Separator): string {
  switch (style) {
    case "lowercase":
      return str.toLowerCase();
    case "uppercase":
      return str.toUpperCase();
    case "preserve":
      return str;
    case "title":
      return str
        .split(new RegExp(`\\${separator}+`))
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(separator);
    case "camel":
      const words = str.split(new RegExp(`\\${separator}+`));
      return (
        words[0].toLowerCase() +
        words
          .slice(1)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("")
      );
    case "pascal":
      return str
        .split(new RegExp(`\\${separator}+`))
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    case "snake":
      return str.toLowerCase();
    default:
      return str;
  }
}

export function smartTruncate(str: string, maxLength: number, separator: Separator): string {
  if (str.length <= maxLength) return str;

  const truncated = str.substring(0, maxLength);
  const lastSeparator = truncated.lastIndexOf(separator);

  // If we find a separator within the last 20% of the string, cut there
  if (lastSeparator > maxLength * 0.8) {
    return truncated.substring(0, lastSeparator);
  }

  // Otherwise just truncate and remove trailing separator
  return truncated.replace(new RegExp(`\\${separator}+$`), "");
}

export function generateSlug(text: string, options: SlugOptions): string {
  if (!text) return "";

  let slug = text.trim();

  // Apply custom replacements first
  for (const [find, replace] of Object.entries(options.customReplacements)) {
    slug = slug.replace(new RegExp(find, "gi"), replace);
  }

  // Transliteration
  if (options.transliterate === "auto" || options.transliterate === "latin") {
    slug = transliterate(slug);
  }

  // Remove diacritics
  if (options.removeDiacritics) {
    slug = removeDiacritics(slug);
  }

  // Remove special characters (but preserve allowed ones)
  if (options.removeSpecial) {
    const allowedPattern = options.allowedChars
      ? `[^\\w\\s${options.separator}${options.allowedChars.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&")}]`
      : `[^\\w\\s${options.separator}]`;
    slug = slug.replace(new RegExp(allowedPattern, "g"), "");
  }

  // Preserve or remove numbers
  if (!options.preserveNumbers) {
    slug = slug.replace(/\d+/g, "");
  }

  // Replace spaces with separator
  slug = slug.replace(/\s+/g, options.separator || "-");

  // Remove multiple consecutive separators
  if (options.separator) {
    const separatorRegex = new RegExp(`\\${options.separator}+`, "g");
    slug = slug.replace(separatorRegex, options.separator);
  }

  // Remove leading/trailing separators
  if (options.separator) {
    const trimRegex = new RegExp(`^\\${options.separator}+|\\${options.separator}+$`, "g");
    slug = slug.replace(trimRegex, "");
  }

  // Apply case style
  slug = applyCaseStyle(slug, options.caseStyle, options.separator);

  // Remove stop words
  if (options.removeStopWords && options.separator) {
    slug = removeStopWords(slug, options.separator);
  }

  // Truncate to max length
  if (options.maxLength && slug.length > options.maxLength) {
    slug =
      options.smartTruncate && options.separator
        ? smartTruncate(slug, options.maxLength, options.separator)
        : slug.substring(0, options.maxLength);

    // Clean up after truncation
    if (options.separator) {
      slug = slug.replace(new RegExp(`\\${options.separator}+$`), "");
    }
  }

  return slug;
}

export function analyzeSlug(slug: string, originalText: string): SlugAnalysis {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Length analysis
  if (slug.length < 3) {
    issues.push("Slug is too short (< 3 characters)");
    suggestions.push("Use more descriptive text");
    score -= 30;
  } else if (slug.length > 60) {
    issues.push("Slug is too long (> 60 characters)");
    suggestions.push("Consider shortening for better SEO");
    score -= 15;
  } else if (slug.length > 50) {
    suggestions.push("Consider keeping under 50 characters for optimal SEO");
    score -= 5;
  }

  // Word count
  const wordCount = slug.split(/[-_.]/).filter(Boolean).length;
  if (wordCount < 2) {
    suggestions.push("Multi-word slugs are better for SEO");
    score -= 10;
  } else if (wordCount > 8) {
    issues.push("Too many words - may be hard to read");
    score -= 10;
  }

  // Special characters
  const hasNumbers = /\d/.test(slug);
  const hasSpecialChars = /[^a-z0-9-_.]/.test(slug);

  if (hasSpecialChars) {
    issues.push("Contains special characters");
    score -= 20;
  }

  // Consecutive separators
  if (/[-_]{2,}/.test(slug)) {
    issues.push("Contains consecutive separators");
    suggestions.push("Remove duplicate separators");
    score -= 15;
  }

  // Starts or ends with separator
  if (/^[-_.]|[-_.]$/.test(slug)) {
    issues.push("Starts or ends with separator");
    score -= 10;
  }

  // Readability
  let readability: SlugAnalysis["readability"];
  if (score >= 90) readability = "excellent";
  else if (score >= 70) readability = "good";
  else if (score >= 50) readability = "fair";
  else readability = "poor";

  // Keyword extraction
  const words = slug.toLowerCase().split(/[-_.]/).filter(Boolean);
  const wordFreq = new Map<string, number>();
  words.forEach((word) => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));
  const keywords = Array.from(wordFreq.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    score: Math.max(0, Math.min(100, score)),
    length: slug.length,
    wordCount,
    hasNumbers,
    hasSpecialChars,
    readability,
    seoIssues: issues,
    suggestions,
    keywords,
  };
}

export function generateAlternatives(text: string, baseOptions: SlugOptions): string[] {
  const alternatives: string[] = [];

  // Different separators
  (["-", "_", "."] as Separator[]).forEach((sep) => {
    if (sep !== baseOptions.separator) {
      alternatives.push(generateSlug(text, { ...baseOptions, separator: sep }));
    }
  });

  // Without stop words
  if (!baseOptions.removeStopWords) {
    alternatives.push(generateSlug(text, { ...baseOptions, removeStopWords: true }));
  }

  // Different case styles
  (["lowercase", "title"] as CaseStyle[]).forEach((style) => {
    if (style !== baseOptions.caseStyle) {
      alternatives.push(generateSlug(text, { ...baseOptions, caseStyle: style }));
    }
  });

  // Shortened version
  if (!baseOptions.maxLength) {
    alternatives.push(generateSlug(text, { ...baseOptions, maxLength: 30 }));
  }

  // Remove duplicates and empty strings
  return Array.from(new Set(alternatives.filter(Boolean)));
}

export function extractSlugFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    // Not a valid URL, try to extract last segment
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
}

export function validateSlug(slug: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!slug) {
    errors.push("Slug cannot be empty");
    return { valid: false, errors };
  }

  if (slug.length < 1) {
    errors.push("Slug is too short");
  }

  if (slug.length > 200) {
    errors.push("Slug is too long (max 200 characters)");
  }

  if (/^[-_.]/.test(slug)) {
    errors.push("Slug cannot start with a separator");
  }

  if (/[-_.]$/.test(slug)) {
    errors.push("Slug cannot end with a separator");
  }

  if (/\s/.test(slug)) {
    errors.push("Slug cannot contain spaces");
  }

  if (/[^a-zA-Z0-9-_.]/.test(slug)) {
    errors.push("Slug contains invalid characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
