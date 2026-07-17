// features/social/hashtag-generator/types.ts

export type Platform =
  "instagram" | "twitter" | "tiktok" | "linkedin" | "youtube" | "facebook" | "pinterest";

export type HashtagSize = "mega" | "large" | "medium" | "small" | "niche";

export type InputMode = "keyword" | "caption";

export type ExportFormat = "space" | "comma" | "newline" | "numbered";

export interface Hashtag {
  tag: string;
  size: HashtagSize;
  estimatedReach: number;
  category: string;
  risky?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  hashtags: Hashtag[];
}

export interface PlatformLimit {
  maxHashtags: number;
  maxCharacters: number;
  recommended: number;
  label: string;
  icon: string;
  notes: string;
}

export interface SavedSet {
  id: string;
  name: string;
  hashtags: string[];
  platform: Platform;
  timestamp: number;
}

export interface ReachEstimate {
  totalReach: number;
  competitionLevel: "low" | "medium" | "high" | "very-high";
  distribution: Record<HashtagSize, number>;
}

export interface ValidationWarning {
  level: "error" | "warning" | "info";
  message: string;
  hashtags?: string[];
}
