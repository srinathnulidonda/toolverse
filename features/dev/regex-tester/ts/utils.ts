// features/dev/regex-tester/ts/utils.ts
import { formatBytes } from "@/utils";

export type Flag = "g" | "i" | "m" | "s" | "u" | "y";
export type ViewTab = "test" | "replace" | "library" | "explainer" | "history";
export type CodeLanguage = "javascript" | "python" | "java" | "csharp" | "php" | "ruby" | "go";

export interface RegexFlags {
  g: boolean; // global
  i: boolean; // case insensitive
  m: boolean; // multiline
  s: boolean; // dotAll
  u: boolean; // unicode
  y: boolean; // sticky
}

export interface Match {
  match: string;
  index: number;
  length: number;
  groups: CaptureGroup[];
  namedGroups: Record<string, string>;
  lineNumber: number;
  columnNumber: number;
}

export interface CaptureGroup {
  value: string;
  index: number;
  name?: string;
}

export interface ReplaceResult {
  original: string;
  replaced: string;
  replacementCount: number;
  matches: Match[];
}

export interface PatternAnalysis {
  valid: boolean;
  error?: string;
  complexity: "simple" | "moderate" | "complex";
  features: string[];
  suggestions: string[];
  performanceWarnings: string[];
}

export interface RegexPattern {
  id: string;
  name: string;
  pattern: string;
  flags: RegexFlags;
  description: string;
  category: PatternCategory;
  tags: string[];
  testCases?: TestCase[];
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedMatches?: number;
  shouldMatch: boolean;
  description?: string;
}

export type PatternCategory =
  "validation" | "extraction" | "formatting" | "security" | "web" | "datetime" | "custom";

export const FLAG_DEFINITIONS = [
  { id: "g" as Flag, label: "Global", desc: "Find all matches (not just first)", icon: "ti-world" },
  {
    id: "i" as Flag,
    label: "Case Insensitive",
    desc: "Ignore case sensitivity",
    icon: "ti-letter-case",
  },
  {
    id: "m" as Flag,
    label: "Multiline",
    desc: "^ and $ match line breaks",
    icon: "ti-line-height",
  },
  { id: "s" as Flag, label: "Dot All", desc: ". matches newlines too", icon: "ti-dots" },
  { id: "u" as Flag, label: "Unicode", desc: "Treat pattern as Unicode", icon: "ti-language" },
  { id: "y" as Flag, label: "Sticky", desc: "Match from lastIndex only", icon: "ti-pin" },
];

export const SAMPLE_PATTERNS: RegexPattern[] = [
  {
    id: "email",
    name: "Email Address",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: { g: true, i: true, m: false, s: false, u: false, y: false },
    description: "Validates standard email addresses",
    category: "validation",
    tags: ["email", "validation", "contact"],
    testCases: [
      { id: "1", input: "user@example.com", shouldMatch: true, expectedMatches: 1 },
      { id: "2", input: "invalid.email", shouldMatch: false, expectedMatches: 0 },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "url",
    name: "URL/Website",
    pattern:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    description: "Matches HTTP and HTTPS URLs",
    category: "web",
    tags: ["url", "link", "http", "https"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "phone-us",
    name: "US Phone Number",
    pattern: "^\\+?1?[-.]?\\(?([0-9]{3})\\)?[-.]?([0-9]{3})[-.]?([0-9]{4})$",
    flags: { g: false, i: false, m: true, s: false, u: false, y: false },
    description: "Matches US phone numbers in various formats",
    category: "validation",
    tags: ["phone", "us", "contact", "telephone"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "hex-color",
    name: "Hex Color Code",
    pattern: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b",
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    description: "Matches hex color codes (#fff or #ffffff)",
    category: "web",
    tags: ["color", "hex", "css", "design"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "ipv4",
    name: "IPv4 Address",
    pattern:
      "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    description: "Matches valid IPv4 addresses",
    category: "validation",
    tags: ["ip", "network", "address"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "date-iso",
    name: "ISO Date",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    description: "Matches ISO 8601 date format (YYYY-MM-DD)",
    category: "datetime",
    tags: ["date", "iso", "datetime"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "credit-card",
    name: "Credit Card",
    pattern: "\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b",
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    description: "Matches credit card numbers with optional separators",
    category: "validation",
    tags: ["credit", "card", "payment", "financial"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "html-tag",
    name: "HTML Tag",
    pattern: "<\\/?[a-z][a-z0-9]*[^<>]*>",
    flags: { g: true, i: true, m: false, s: false, u: false, y: false },
    description: "Matches HTML tags (opening and closing)",
    category: "web",
    tags: ["html", "tag", "markup"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Pattern execution and analysis
export function executePattern(
  pattern: string,
  flags: RegexFlags,
  testString: string
): { matches: Match[]; error?: string; performance: number } {
  const startTime = performance.now();

  // Input length limits to prevent ReDoS
  const MAX_INPUT_LENGTH = 50000;
  const MAX_PATTERN_LENGTH = 200;
  const MAX_ITERATIONS = 10000;

  if (testString.length > MAX_INPUT_LENGTH) {
    return {
      matches: [],
      error: `Input too large (max ${MAX_INPUT_LENGTH} characters)`,
      performance: 0,
    };
  }
  if (pattern.length > MAX_PATTERN_LENGTH) {
    return {
      matches: [],
      error: `Pattern too complex (max ${MAX_PATTERN_LENGTH} characters)`,
      performance: 0,
    };
  }

  try {
    const flagString = Object.entries(flags)
      .filter(([, enabled]) => enabled)
      .map(([flag]) => flag)
      .join("");

    const regex = new RegExp(pattern, flagString);
    const matches: Match[] = [];
    const lines = testString.split("\n");

    if (flags.g) {
      let match;
      let iterCount = 0;
      while ((match = regex.exec(testString)) !== null && iterCount < MAX_ITERATIONS) {
        const lineInfo = getLineAndColumn(testString, match.index);
        matches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1).map((value, idx) => ({
            value: value ?? "",
            index: idx,
          })),
          namedGroups: match.groups ?? {},
          lineNumber: lineInfo.line,
          columnNumber: lineInfo.column,
        });

        // Prevent infinite loops
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        iterCount++;
      }

      if (iterCount >= MAX_ITERATIONS) {
        return {
          matches,
          error: `Execution stopped: too many iterations (max ${MAX_ITERATIONS})`,
          performance: performance.now() - startTime,
        };
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        const lineInfo = getLineAndColumn(testString, match.index);
        matches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1).map((value, idx) => ({
            value: value ?? "",
            index: idx,
          })),
          namedGroups: match.groups ?? {},
          lineNumber: lineInfo.line,
          columnNumber: lineInfo.column,
        });
      }
    }

    const endTime = performance.now();
    return { matches, performance: endTime - startTime };
  } catch (error) {
    const endTime = performance.now();
    return {
      matches: [],
      error: error instanceof Error ? error.message : "Invalid pattern",
      performance: endTime - startTime,
    };
  }
}

export function performReplace(
  pattern: string,
  flags: RegexFlags,
  testString: string,
  replacement: string
): ReplaceResult {
  try {
    const flagString = Object.entries(flags)
      .filter(([, enabled]) => enabled)
      .map(([flag]) => flag)
      .join("");

    const regex = new RegExp(pattern, flagString);
    const { matches } = executePattern(pattern, flags, testString);
    const replaced = testString.replace(regex, replacement);

    return {
      original: testString,
      replaced,
      replacementCount: matches.length,
      matches,
    };
  } catch (error) {
    return {
      original: testString,
      replaced: testString,
      replacementCount: 0,
      matches: [],
    };
  }
}

export function analyzePattern(pattern: string): PatternAnalysis {
  if (!pattern) {
    return {
      valid: false,
      error: "Empty pattern",
      complexity: "simple",
      features: [],
      suggestions: [],
      performanceWarnings: [],
    };
  }

  try {
    new RegExp(pattern);

    const features: string[] = [];
    const suggestions: string[] = [];
    const performanceWarnings: string[] = [];

    // Detect features
    if (pattern.includes("(?<")) features.push("Named capture groups");
    if (pattern.includes("(?:")) features.push("Non-capturing groups");
    if (pattern.includes("(?=") || pattern.includes("(?!")) features.push("Lookahead");
    if (pattern.includes("(?<=") || pattern.includes("(?<!")) features.push("Lookbehind");
    if (pattern.includes("\\b")) features.push("Word boundaries");
    if (pattern.includes("^") || pattern.includes("$")) features.push("Anchors");
    if (pattern.includes("[")) features.push("Character classes");
    if (pattern.includes("|")) features.push("Alternation");
    if (/[*+]{2,}/.test(pattern)) features.push("Nested quantifiers");

    // Performance warnings
    if (/(\.\*){2,}/.test(pattern)) {
      performanceWarnings.push("Multiple .* can cause catastrophic backtracking");
    }
    if (/[*+]{2,}/.test(pattern)) {
      performanceWarnings.push("Nested quantifiers may impact performance");
    }
    if (pattern.length > 200) {
      performanceWarnings.push("Very long pattern may be slow");
    }

    // Suggestions
    if (pattern.includes(".*") && !pattern.includes(".*?")) {
      suggestions.push("Consider using .*? for non-greedy matching");
    }
    if (!pattern.includes("^") && !pattern.includes("$")) {
      suggestions.push("Add ^ and $ anchors for full string matching");
    }
    if (pattern.includes("(") && !pattern.includes("(?:")) {
      suggestions.push("Use (?:) for non-capturing groups to improve performance");
    }

    const complexity =
      features.length > 5 || performanceWarnings.length > 0
        ? "complex"
        : features.length > 2
          ? "moderate"
          : "simple";

    return {
      valid: true,
      complexity,
      features,
      suggestions,
      performanceWarnings,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid pattern",
      complexity: "simple",
      features: [],
      suggestions: [],
      performanceWarnings: [],
    };
  }
}

export function explainPattern(pattern: string): ExplanationNode[] {
  const nodes: ExplanationNode[] = [];

  // This is a simplified explainer - a full implementation would use a proper regex parser
  if (pattern.startsWith("^")) {
    nodes.push({
      type: "anchor",
      value: "^",
      description: "Start of string/line",
      position: 0,
    });
  }

  if (pattern.endsWith("$")) {
    nodes.push({
      type: "anchor",
      value: "$",
      description: "End of string/line",
      position: pattern.length - 1,
    });
  }

  // Character classes
  const charClassRegex = /\[([^\]]+)\]/g;
  let match;
  while ((match = charClassRegex.exec(pattern)) !== null) {
    nodes.push({
      type: "charclass",
      value: match[0],
      description: `Character class: matches any of ${match[1]}`,
      position: match.index,
    });
  }

  // Quantifiers
  const quantifierRegex = /([*+?]|\{\d+,?\d*\})/g;
  while ((match = quantifierRegex.exec(pattern)) !== null) {
    nodes.push({
      type: "quantifier",
      value: match[0],
      description: getQuantifierDescription(match[0]),
      position: match.index,
    });
  }

  return nodes;
}

export interface ExplanationNode {
  type: "anchor" | "charclass" | "group" | "quantifier" | "literal" | "special";
  value: string;
  description: string;
  position: number;
}

function getQuantifierDescription(quantifier: string): string {
  switch (quantifier) {
    case "*":
      return "0 or more times";
    case "+":
      return "1 or more times";
    case "?":
      return "0 or 1 time (optional)";
    default:
      return `Exactly ${quantifier} times`;
  }
}

function getLineAndColumn(text: string, index: number): { line: number; column: number } {
  const beforeIndex = text.substring(0, index);
  const lines = beforeIndex.split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function generateCode(pattern: string, flags: RegexFlags, language: CodeLanguage): string {
  const flagString = Object.entries(flags)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag)
    .join("");

  switch (language) {
    case "javascript":
      return `const regex = /${pattern}/${flagString};\nconst matches = text.match(regex);`;

    case "python":
      return `import re\n\npattern = r"${pattern}"\nmatches = re.findall(pattern, text${flags.i ? ", re.IGNORECASE" : ""})`;

    case "java":
      return `import java.util.regex.*;\n\nPattern pattern = Pattern.compile("${pattern}"${flags.i ? ", Pattern.CASE_INSENSITIVE" : ""});\nMatcher matcher = pattern.matcher(text);`;

    case "csharp":
      return `using System.Text.RegularExpressions;\n\nvar regex = new Regex(@"${pattern}"${flags.i ? ", RegexOptions.IgnoreCase" : ""});\nvar matches = regex.Matches(text);`;

    case "php":
      return `$pattern = '/${pattern}/${flagString}';\npreg_match_all($pattern, $text, $matches);`;

    case "ruby":
      return `pattern = /${pattern}/${flagString}\nmatches = text.scan(pattern)`;

    case "go":
      return `import "regexp"\n\nregex := regexp.MustCompile(\`${pattern}\`)\nmatches := regex.FindAllString(text, -1)`;

    default:
      return `/${pattern}/${flagString}`;
  }
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function unescapeRegex(str: string): string {
  return str.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
}
