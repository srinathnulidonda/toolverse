// features/dev/case-converter/utils.ts
export type CaseType =
    | "camel"
    | "pascal"
    | "snake"
    | "kebab"
    | "constant"
    | "title"
    | "sentence"
    | "lower"
    | "upper"
    | "dot"
    | "path"
    | "param"
    | "header";

export interface CaseFormat {
    id: CaseType;
    label: string;
    icon: string;
    example: string;
    description: string;
}

export const CASE_FORMATS: CaseFormat[] = [
    {
        id: "camel",
        label: "camelCase",
        icon: "ti-letter-case",
        example: "helloWorldExample",
        description: "First word lowercase, rest capitalized, no spaces",
    },
    {
        id: "pascal",
        label: "PascalCase",
        icon: "ti-letter-case-upper",
        example: "HelloWorldExample",
        description: "All words capitalized, no spaces (UpperCamelCase)",
    },
    {
        id: "snake",
        label: "snake_case",
        icon: "ti-underline",
        example: "hello_world_example",
        description: "All lowercase, words separated by underscores",
    },
    {
        id: "kebab",
        label: "kebab-case",
        icon: "ti-minus",
        example: "hello-world-example",
        description: "All lowercase, words separated by hyphens",
    },
    {
        id: "constant",
        label: "CONSTANT_CASE",
        icon: "ti-text-size",
        example: "HELLO_WORLD_EXAMPLE",
        description: "All uppercase, words separated by underscores",
    },
    {
        id: "title",
        label: "Title Case",
        icon: "ti-alphabet-latin",
        example: "Hello World Example",
        description: "All words capitalized, separated by spaces",
    },
    {
        id: "sentence",
        label: "Sentence case",
        icon: "ti-dots",
        example: "Hello world example",
        description: "First word capitalized, rest lowercase",
    },
    {
        id: "lower",
        label: "lowercase",
        icon: "ti-letter-a",
        example: "hello world example",
        description: "All characters lowercase",
    },
    {
        id: "upper",
        label: "UPPERCASE",
        icon: "ti-letter-b",
        example: "HELLO WORLD EXAMPLE",
        description: "All characters uppercase",
    },
    {
        id: "dot",
        label: "dot.case",
        icon: "ti-point",
        example: "hello.world.example",
        description: "All lowercase, words separated by periods",
    },
    {
        id: "path",
        label: "path/case",
        icon: "ti-folder",
        example: "hello/world/example",
        description: "All lowercase, words separated by slashes",
    },
    {
        id: "param",
        label: "Param_Case",
        icon: "ti-code",
        example: "Hello_World_Example",
        description: "All words capitalized, separated by underscores",
    },
    {
        id: "header",
        label: "Header-Case",
        icon: "ti-heading",
        example: "Hello-World-Example",
        description: "All words capitalized, separated by hyphens",
    },
];

export interface ConversionOptions {
    preserveNumbers?: boolean;
    preserveAcronyms?: boolean;
    customDelimiter?: string;
}

/**
 * Split text into words intelligently
 */
function splitIntoWords(text: string, options: ConversionOptions = {}): string[] {
    if (!text) return [];

    let result = text;

    // Handle special characters and split patterns
    result = result
        // Split on camelCase and PascalCase boundaries
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        // Split on acronyms followed by lowercase
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        // Replace common delimiters with spaces
        .replace(/[_\-./\\]+/g, " ")
        // Handle numbers
        .replace(/([a-zA-Z])(\d)/g, "$1 $2")
        .replace(/(\d)([a-zA-Z])/g, "$1 $2");

    // Split and filter
    const words = result
        .split(/\s+/)
        .map((w) => w.trim())
        .filter(Boolean);

    // Preserve numbers if option is set
    if (!options.preserveNumbers) {
        return words.map((w) => w.replace(/\d+/g, ""));
    }

    return words;
}

/**
 * Detect the current case format of a string
 */
export function detectCase(text: string): CaseType | "mixed" | "unknown" {
    if (!text) return "unknown";

    const hasCamelCase = /^[a-z]+([A-Z][a-z]*)+$/.test(text);
    const hasPascalCase = /^[A-Z][a-z]+([A-Z][a-z]*)*$/.test(text);
    const hasSnakeCase = /^[a-z]+(_[a-z]+)+$/.test(text);
    const hasKebabCase = /^[a-z]+(-[a-z]+)+$/.test(text);
    const hasConstantCase = /^[A-Z]+(_[A-Z]+)*$/.test(text);
    const hasDotCase = /^[a-z]+(\.[a-z]+)+$/.test(text);
    const hasPathCase = /^[a-z]+(\/[a-z]+)+$/.test(text);

    if (hasCamelCase) return "camel";
    if (hasPascalCase) return "pascal";
    if (hasSnakeCase) return "snake";
    if (hasKebabCase) return "kebab";
    if (hasConstantCase) return "constant";
    if (hasDotCase) return "dot";
    if (hasPathCase) return "path";

    if (text === text.toLowerCase()) return "lower";
    if (text === text.toUpperCase()) return "upper";

    // Check if it's title case
    const words = text.split(/\s+/);
    if (
        words.length > 1 &&
        words.every((w) => w[0] === w[0].toUpperCase() && w.slice(1) === w.slice(1).toLowerCase())
    ) {
        return "title";
    }

    return "mixed";
}

/**
 * Convert text to specified case format
 */
export function convertCase(
    text: string,
    caseType: CaseType,
    options: ConversionOptions = {}
): string {
    if (!text) return "";

    const words = splitIntoWords(text, options);
    if (words.length === 0) return "";

    // Handle acronyms preservation
    const processWord = (word: string, shouldCapitalize: boolean, allCaps: boolean = false) => {
        if (allCaps) return word.toUpperCase();
        if (!shouldCapitalize) return word.toLowerCase();

        // Check if word is an acronym (all uppercase with length > 1)
        if (options.preserveAcronyms && word.length > 1 && word === word.toUpperCase()) {
            return word;
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };

    switch (caseType) {
        case "camel":
            return words
                .map((w, i) => processWord(w, i > 0))
                .join("");

        case "pascal":
            return words
                .map((w) => processWord(w, true))
                .join("");

        case "snake":
            return words
                .map((w) => w.toLowerCase())
                .join("_");

        case "kebab":
            return words
                .map((w) => w.toLowerCase())
                .join("-");

        case "constant":
            return words
                .map((w) => w.toUpperCase())
                .join("_");

        case "title":
            return words
                .map((w) => processWord(w, true))
                .join(" ");

        case "sentence":
            return words
                .map((w, i) => processWord(w, i === 0))
                .join(" ");

        case "lower":
            return words
                .map((w) => w.toLowerCase())
                .join(" ");

        case "upper":
            return words
                .map((w) => w.toUpperCase())
                .join(" ");

        case "dot":
            return words
                .map((w) => w.toLowerCase())
                .join(".");

        case "path":
            return words
                .map((w) => w.toLowerCase())
                .join("/");

        case "param":
            return words
                .map((w) => processWord(w, true))
                .join("_");

        case "header":
            return words
                .map((w) => processWord(w, true))
                .join("-");

        default:
            return text;
    }
}

/**
 * Analyze text for case conversion insights
 */
export interface CaseAnalysis {
    originalCase: CaseType | "mixed" | "unknown";
    wordCount: number;
    characterCount: number;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    hasMixedCase: boolean;
    words: string[];
    suggestions: string[];
}

export function analyzeText(text: string): CaseAnalysis {
    const detectedCase = detectCase(text);
    const words = splitIntoWords(text, { preserveNumbers: true });
    const hasNumbers = /\d/.test(text);
    const hasSpecialChars = /[^a-zA-Z0-9\s_\-./\\]/.test(text);
    const hasMixedCase = /[a-z]/.test(text) && /[A-Z]/.test(text);

    const suggestions: string[] = [];

    if (detectedCase === "mixed" || detectedCase === "unknown") {
        suggestions.push("Text has mixed formatting. Try converting to a standard case format.");
    }

    if (hasSpecialChars) {
        suggestions.push("Contains special characters that will be removed during conversion.");
    }

    if (words.length === 1) {
        suggestions.push("Single word detected. Case conversion will still apply.");
    }

    if (hasNumbers) {
        suggestions.push("Contains numbers. Enable 'Preserve numbers' to keep them.");
    }

    return {
        originalCase: detectedCase,
        wordCount: words.length,
        characterCount: text.length,
        hasNumbers,
        hasSpecialChars,
        hasMixedCase,
        words,
        suggestions,
    };
}

/**
 * Batch convert multiple texts
 */
export interface BatchConversionItem {
    id: string;
    input: string;
    outputs: Record<CaseType, string>;
}

export function batchConvert(
    texts: string[],
    targetCases: CaseType[],
    options: ConversionOptions = {}
): BatchConversionItem[] {
    return texts.map((text, index) => {
        const outputs: Record<string, string> = {};

        targetCases.forEach((caseType) => {
            outputs[caseType] = convertCase(text, caseType, options);
        });

        return {
            id: `${Date.now()}-${index}`,
            input: text,
            outputs: outputs as Record<CaseType, string>,
        };
    });
}

/**
 * Generate variable name suggestions
 */
export function generateVariableNames(text: string): Record<string, string> {
    const words = splitIntoWords(text);

    return {
        "JavaScript/TypeScript": convertCase(text, "camel"),
        "React Component": convertCase(text, "pascal"),
        "CSS Class": convertCase(text, "kebab"),
        "Database Column": convertCase(text, "snake"),
        "Environment Variable": convertCase(text, "constant"),
        "URL Slug": convertCase(text, "kebab"),
        "File Name": convertCase(text, "kebab"),
        "API Endpoint": convertCase(text, "kebab"),
    };
}