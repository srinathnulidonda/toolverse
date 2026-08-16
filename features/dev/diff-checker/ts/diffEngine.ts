// features/dev/diff-checker/ts/diffEngine.ts
export type DiffAlgorithm = "myers" | "word" | "character";
export type DiffViewMode = "split" | "unified" | "inline";
export type FileType =
  | "text"
  | "javascript"
  | "typescript"
  | "css"
  | "html"
  | "json"
  | "markdown"
  | "xml";

export interface DiffOptions {
  algorithm: DiffAlgorithm;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  contextLines: number;
  showInvisibles: boolean;
  wrapLines: boolean;
}

export interface DiffLine {
  type: "add" | "remove" | "unchanged" | "modified";
  content: string;
  originalLineNum?: number;
  modifiedLineNum?: number;
  isWordDiff?: boolean;
  wordDiffs?: WordDiff[];
}

export interface WordDiff {
  type: "add" | "remove" | "unchanged";
  content: string;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: DiffStats;
  summary: string;
}

export interface DiffStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  totalLines: number;
  similarity: number;
  linesOfContext: number;
}

export const SAMPLE_DIFFS = {
  javascript: {
    original: `function calculateTotal(items) {
    let total = 0;
    for (let item of items) {
        total += item.price;
    }
    return total;
}

const discount = 0.1;
console.log("Discount:", discount);`,
    modified: `function calculateTotal(items, tax = 0.08) {
    let total = 0;
    for (let item of items) {
        total += item.price * (1 + tax);
    }
    return Math.round(total * 100) / 100;
}

const discount = 0.15;
const maxDiscount = 50;
console.log("Discount:", discount, "Max:", maxDiscount);`,
  },
  css: {
    original: `.button {
    background: blue;
    padding: 10px;
    border: none;
}`,
    modified: `.button {
    background: #3b82f6;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    transition: all 0.2s;
}`,
  },
};

export function computeDiff(
  text1: string,
  text2: string,
  options: DiffOptions = {
    algorithm: "myers",
    ignoreWhitespace: false,
    ignoreCase: false,
    contextLines: 3,
    showInvisibles: false,
    wrapLines: true,
  }
): DiffResult {
  let processedText1 = text1 || "";
  let processedText2 = text2 || "";

  if (options.ignoreCase) {
    processedText1 = processedText1.toLowerCase();
    processedText2 = processedText2.toLowerCase();
  }

  if (options.ignoreWhitespace) {
    processedText1 = processedText1.replace(/\s+/g, " ").trim();
    processedText2 = processedText2.replace(/\s+/g, " ").trim();
  }

  const lines1 = processedText1.split("\n");
  const lines2 = processedText2.split("\n");

  let result: DiffResult;

  switch (options.algorithm) {
    case "word":
      result = computeWordDiff(lines1, lines2, text1, text2);
      break;
    case "character":
      result = computeCharacterDiff(text1, text2);
      break;
    default:
      result = computeMyersDiff(lines1, lines2, options.contextLines);
  }

  return result;
}

function computeMyersDiff(
  lines1: string[],
  lines2: string[],
  contextLines: number
): DiffResult {
  const diffLines: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  let modified = 0;

  while (i < lines1.length || j < lines2.length) {
    if (i < lines1.length && j < lines2.length) {
      if (lines1[i] === lines2[j]) {
        diffLines.push({
          type: "unchanged",
          content: lines1[i],
          originalLineNum: i + 1,
          modifiedLineNum: j + 1,
        });
        unchanged++;
        i++;
        j++;
      } else {
        const isModification = isSimilarLine(lines1[i], lines2[j]);

        if (isModification) {
          const wordDiffs = computeWordDiffForLines(lines1[i], lines2[j]);
          diffLines.push({
            type: "modified",
            content: lines2[j],
            originalLineNum: i + 1,
            modifiedLineNum: j + 1,
            isWordDiff: true,
            wordDiffs,
          });
          modified++;
          i++;
          j++;
        } else {
          diffLines.push({
            type: "remove",
            content: lines1[i],
            originalLineNum: i + 1,
          });
          removed++;
          i++;

          if (j < lines2.length) {
            diffLines.push({
              type: "add",
              content: lines2[j],
              modifiedLineNum: j + 1,
            });
            added++;
            j++;
          }
        }
      }
    } else if (i < lines1.length) {
      diffLines.push({
        type: "remove",
        content: lines1[i],
        originalLineNum: i + 1,
      });
      removed++;
      i++;
    } else if (j < lines2.length) {
      diffLines.push({
        type: "add",
        content: lines2[j],
        modifiedLineNum: j + 1,
      });
      added++;
      j++;
    }
  }

  const totalLines = Math.max(lines1.length, lines2.length);
  const similarity =
    totalLines > 0 ? Math.round((unchanged / totalLines) * 100) : 100;

  return {
    lines: diffLines,
    stats: {
      added,
      removed,
      modified,
      unchanged,
      totalLines,
      similarity,
      linesOfContext: contextLines,
    },
    summary: generateSummary(added, removed, unchanged, totalLines),
  };
}

function computeWordDiff(
  lines1: string[],
  lines2: string[],
  originalText1: string,
  originalText2: string
): DiffResult {
  const words1 = originalText1.split(/\s+/).filter(Boolean);
  const words2 = originalText2.split(/\s+/).filter(Boolean);

  const diffLines: DiffLine[] = [];

  let added = 0;
  let removed = 0;
  let unchanged = 0;
  let currentLine = "";
  let lineType: DiffLine["type"] = "unchanged";

  const maxLen = Math.max(words1.length, words2.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < words1.length && i < words2.length && words1[i] === words2[i]) {
      currentLine += words1[i] + " ";
      unchanged++;
    } else {
      if (i < words1.length && words1[i]) {
        removed++;
        lineType = "remove";
      }
      if (i < words2.length && words2[i]) {
        added++;
        lineType = "add";
      }
      currentLine += (words2[i] || words1[i] || "") + " ";
    }

    if (
      currentLine.includes("\n") ||
      i === maxLen - 1 ||
      currentLine.length > 80
    ) {
      if (currentLine.trim()) {
        diffLines.push({
          type: lineType,
          content: currentLine.trim(),
          originalLineNum: diffLines.length + 1,
          modifiedLineNum: diffLines.length + 1,
        });
      }
      currentLine = "";
      lineType = "unchanged";
    }
  }

  const totalWords = Math.max(words1.length, words2.length);
  const similarity =
    totalWords > 0 ? Math.round((unchanged / totalWords) * 100) : 100;

  return {
    lines: diffLines,
    stats: {
      added,
      removed,
      modified: 0,
      unchanged,
      totalLines: diffLines.length,
      similarity,
      linesOfContext: 0,
    },
    summary: `${added} words added, ${removed} words removed`,
  };
}

function computeCharacterDiff(text1: string, text2: string): DiffResult {
  const chars1 = text1.split("");
  const chars2 = text2.split("");

  const diffLines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  const maxLen = Math.max(chars1.length, chars2.length);
  let currentLine = "";
  let currentType: DiffLine["type"] = "unchanged";

  for (let i = 0; i < maxLen; i++) {
    const char1 = chars1[i];
    const char2 = chars2[i];

    if (char1 === char2) {
      currentLine += char1 || "";
      unchanged++;
      currentType = "unchanged";
    } else {
      if (char1 !== undefined) removed++;
      if (char2 !== undefined) added++;
      currentLine += char2 || char1 || "";
      currentType = added > removed ? "add" : removed > added ? "remove" : "unchanged";
    }

    if (currentLine.includes("\n") || i === maxLen - 1) {
      diffLines.push({
        type: currentType,
        content: currentLine.replace(/\n$/, ""),
        originalLineNum: diffLines.length + 1,
        modifiedLineNum: diffLines.length + 1,
      });
      currentLine = "";
      currentType = "unchanged";
    }
  }

  const similarity = maxLen > 0 ? Math.round((unchanged / maxLen) * 100) : 100;

  return {
    lines: diffLines,
    stats: {
      added,
      removed,
      modified: 0,
      unchanged,
      totalLines: diffLines.length,
      similarity,
      linesOfContext: 0,
    },
    summary: `${added} characters added, ${removed} characters removed`,
  };
}

function computeWordDiffForLines(line1: string, line2: string): WordDiff[] {
  const words1 = line1.split(/(\s+)/);
  const words2 = line2.split(/(\s+)/);
  const wordDiffs: WordDiff[] = [];

  const maxLen = Math.max(words1.length, words2.length);

  for (let i = 0; i < maxLen; i++) {
    const word1 = words1[i];
    const word2 = words2[i];

    if (word1 === word2 && word1 !== undefined) {
      wordDiffs.push({ type: "unchanged", content: word1 });
    } else {
      if (word1 !== undefined && word1 !== word2) {
        wordDiffs.push({ type: "remove", content: word1 });
      }
      if (word2 !== undefined && word1 !== word2) {
        wordDiffs.push({ type: "add", content: word2 });
      }
    }
  }

  return wordDiffs;
}

function longestCommonSubsequence(arr1: string[], arr2: string[]): number[][] {
  const m = arr1.length;
  const n = arr2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function isSimilarLine(line1: string, line2: string): boolean {
  if (!line1 || !line2) return false;
  const similarity = calculateStringSimilarity(line1, line2);
  return similarity > 0.6;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return (maxLen - distance) / maxLen;
}

function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  const matrix: number[][] = Array.from({ length: len1 + 1 }, () =>
    Array(len2 + 1).fill(0)
  );

  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

function generateSummary(
  added: number,
  removed: number,
  unchanged: number,
  total: number
): string {
  if (total === 0) return "No content to compare";
  if (added === 0 && removed === 0) return "Files are identical";

  const parts: string[] = [];
  if (added > 0) parts.push(`${added} line${added === 1 ? "" : "s"} added`);
  if (removed > 0)
    parts.push(`${removed} line${removed === 1 ? "" : "s"} removed`);

  return parts.join(", ");
}

export function detectFileType(filename: string, content: string): FileType {
  const ext = filename.toLowerCase().split(".").pop() || "";

  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "css":
    case "scss":
    case "sass":
    case "less":
      return "css";
    case "html":
    case "htm":
      return "html";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "xml":
    case "svg":
      return "xml";
    default:
      return "text";
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const base = 1024;
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );

  const value = bytes / Math.pow(base, index);

  if (value < 10) {
    return `${value.toFixed(2)} ${units[index]}`;
  } else if (value < 100) {
    return `${value.toFixed(1)} ${units[index]}`;
  } else {
    return `${Math.round(value)} ${units[index]}`;
  }
}