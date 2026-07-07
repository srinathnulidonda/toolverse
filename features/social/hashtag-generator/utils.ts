// features/social/hashtag-generator/utils.ts

import type {
  Hashtag,
  HashtagSize,
  Platform,
  ReachEstimate,
  ValidationWarning,
  ExportFormat,
} from "./types";
import { CATEGORIES, RISKY_HASHTAGS, PLATFORM_LIMITS, getAllHashtags } from "./data";

export function getSizeLabel(size: HashtagSize): string {
  const labels: Record<HashtagSize, string> = {
    mega: "Mega (100M+)",
    large: "Large (10-100M)",
    medium: "Medium (1-10M)",
    small: "Small (100K-1M)",
    niche: "Niche (<100K)",
  };
  return labels[size];
}

export function getSizeColor(size: HashtagSize): string {
  const colors: Record<HashtagSize, string> = {
    mega: "#DC2626",
    large: "#EA580C",
    medium: "#D97706",
    small: "#65A30D",
    niche: "#0891B2",
  };
  return colors[size];
}

export function formatReach(reach: number): string {
  if (reach >= 1_000_000_000) return `${(reach / 1_000_000_000).toFixed(1)}B`;
  if (reach >= 1_000_000) return `${(reach / 1_000_000).toFixed(1)}M`;
  if (reach >= 1_000) return `${(reach / 1_000).toFixed(1)}K`;
  return reach.toString();
}

/**
 * Simple deterministic pseudo-hash based on string content.
 * Used to generate consistent mock data for arbitrary keyword input.
 */
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function sizeFromHash(hash: number): HashtagSize {
  const sizes: HashtagSize[] = ["mega", "large", "medium", "small", "niche"];
  return sizes[hash % sizes.length];
}

function reachFromSize(size: HashtagSize, seed: number): number {
  const ranges: Record<HashtagSize, [number, number]> = {
    mega: [100_000_000, 1_500_000_000],
    large: [10_000_000, 99_000_000],
    medium: [1_000_000, 9_900_000],
    small: [100_000, 990_000],
    niche: [5_000, 99_000],
  };
  const [min, max] = ranges[size];
  const pct = (seed % 1000) / 1000;
  return Math.round(min + (max - min) * pct);
}

export function slugifyTag(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "");
}

/**
 * Generate hashtags from a free-text keyword input.
 * Combines: exact match variations, curated matches, and generated related tags.
 */
export function generateFromKeyword(keyword: string): Hashtag[] {
  const clean = slugifyTag(keyword);
  if (!clean) return [];

  const results: Hashtag[] = [];
  const allTags = getAllHashtags();

  // 1. Exact/partial matches from curated database
  const matches = allTags.filter(
    (h) => h.tag.includes(clean) || clean.includes(h.tag)
  );
  results.push(...matches);

  // 2. Generate variations for the keyword itself
  const variations = [
    clean,
    `${clean}life`,
    `${clean}lover`,
    `${clean}community`,
    `${clean}daily`,
    `${clean}gram`,
    `${clean}addict`,
    `${clean}world`,
    `${clean}love`,
    `instagood${clean}`,
    `${clean}vibes`,
    `${clean}goals`,
    `best${clean}`,
    `${clean}official`,
    `${clean}style`,
  ];

  variations.forEach((tag) => {
    if (results.some((r) => r.tag === tag)) return;
    const hash = stringHash(tag);
    const size = sizeFromHash(hash);
    results.push({
      tag,
      size,
      estimatedReach: reachFromSize(size, hash),
      category: "generated",
      risky: RISKY_HASHTAGS.has(tag),
    });
  });

  // Deduplicate
  const seen = new Set<string>();
  const deduped = results.filter((h) => {
    if (seen.has(h.tag)) return false;
    seen.add(h.tag);
    return true;
  });

  // Sort by size (mega first) then reach
  const sizeOrder: Record<HashtagSize, number> = {
    mega: 0,
    large: 1,
    medium: 2,
    small: 3,
    niche: 4,
  };
  deduped.sort((a, b) => {
    if (sizeOrder[a.size] !== sizeOrder[b.size]) {
      return sizeOrder[a.size] - sizeOrder[b.size];
    }
    return b.estimatedReach - a.estimatedReach;
  });

  return deduped.slice(0, 40);
}

/**
 * Extract potential hashtag keywords from a caption/text block.
 */
export function generateFromCaption(caption: string): Hashtag[] {
  // Extract meaningful words (nouns/keywords) - simple approach: words > 3 chars, not common stopwords
  const stopwords = new Set([
    "this", "that", "with", "from", "have", "just", "your", "will",
    "about", "there", "their", "what", "when", "where", "which",
    "would", "could", "should", "into", "than", "then", "them",
    "these", "those", "some", "such", "very", "much", "more", "most",
  ]);

  const words = caption
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w));

  const uniqueWords = Array.from(new Set(words)).slice(0, 8);

  const allResults: Hashtag[] = [];
  uniqueWords.forEach((word) => {
    const generated = generateFromKeyword(word);
    allResults.push(...generated.slice(0, 6));
  });

  // Deduplicate
  const seen = new Set<string>();
  const deduped = allResults.filter((h) => {
    if (seen.has(h.tag)) return false;
    seen.add(h.tag);
    return true;
  });

  return deduped.slice(0, 40);
}

export function calculateReachEstimate(hashtags: Hashtag[]): ReachEstimate {
  const distribution: Record<HashtagSize, number> = {
    mega: 0,
    large: 0,
    medium: 0,
    small: 0,
    niche: 0,
  };

  let totalReach = 0;
  hashtags.forEach((h) => {
    distribution[h.size]++;
    totalReach += h.estimatedReach;
  });

  const megaAndLarge = distribution.mega + distribution.large;
  const total = hashtags.length || 1;
  const competitionRatio = megaAndLarge / total;

  let competitionLevel: ReachEstimate["competitionLevel"] = "low";
  if (competitionRatio > 0.6) competitionLevel = "very-high";
  else if (competitionRatio > 0.4) competitionLevel = "high";
  else if (competitionRatio > 0.2) competitionLevel = "medium";

  return { totalReach, competitionLevel, distribution };
}

export function validateHashtagSet(
  hashtags: string[],
  platform: Platform
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const limit = PLATFORM_LIMITS[platform];

  if (hashtags.length === 0) {
    warnings.push({
      level: "info",
      message: "No hashtags selected yet",
    });
    return warnings;
  }

  if (hashtags.length > limit.maxHashtags) {
    warnings.push({
      level: "error",
      message: `Exceeds ${limit.label} limit of ${limit.maxHashtags} hashtags`,
    });
  } else if (hashtags.length > limit.recommended * 2) {
    warnings.push({
      level: "warning",
      message: `Using more than recommended (${limit.recommended}) may look spammy`,
    });
  }

  const totalChars = hashtags.reduce((sum, h) => sum + h.length + 2, 0);
  if (totalChars > limit.maxCharacters) {
    warnings.push({
      level: "error",
      message: `Character count (${totalChars}) exceeds platform limit (${limit.maxCharacters})`,
    });
  }

  const risky = hashtags.filter((h) =>
    RISKY_HASHTAGS.has(h.toLowerCase().replace("#", ""))
  );
  if (risky.length > 0) {
    warnings.push({
      level: "warning",
      message: `${risky.length} potentially shadowbanned hashtag(s) detected`,
      hashtags: risky,
    });
  }

  // Check for duplicate-ish patterns
  const uniqueLower = new Set(hashtags.map((h) => h.toLowerCase()));
  if (uniqueLower.size !== hashtags.length) {
    warnings.push({
      level: "warning",
      message: "Duplicate hashtags detected",
    });
  }

  return warnings;
}

export function formatHashtagsForExport(
  hashtags: string[],
  format: ExportFormat
): string {
  const tagged = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`));

  switch (format) {
    case "space":
      return tagged.join(" ");
    case "comma":
      return tagged.join(", ");
    case "newline":
      return tagged.join("\n");
    case "numbered":
      return tagged.map((t, i) => `${i + 1}. ${t}`).join("\n");
    default:
      return tagged.join(" ");
  }
}

export function isRiskyHashtag(tag: string): boolean {
  return RISKY_HASHTAGS.has(tag.toLowerCase().replace("#", ""));
}