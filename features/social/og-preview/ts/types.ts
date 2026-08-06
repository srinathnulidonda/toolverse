// features/social/og-preview/ts/types.ts

export type Platform =
  "facebook" | "twitter" | "linkedin" | "slack" | "discord" | "whatsapp" | "imessage" | "telegram";

export type TwitterCardType = "summary" | "summary_large_image" | "player" | "app";

export type DeviceMode = "desktop" | "mobile";

export type InputMode = "url" | "manual";

export interface MetaData {
  // Basic OG tags
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;

  // Twitter specific
  twitterCard: TwitterCardType;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;

  // Additional OG
  locale: string;
  author: string;
  publishedTime: string;
  modifiedTime: string;
  section: string;
  tags: string[];

  // Article specific
  articleAuthor: string;
  articleSection: string;
  articlePublishedTime: string;
  articleModifiedTime: string;

  // Video/Audio
  videoUrl: string;
  videoType: string;
  videoWidth: string;
  videoHeight: string;
  audioUrl: string;
  audioType: string;

  // Image metadata
  imageAlt: string;
  imageWidth: string;
  imageHeight: string;
  imageType: string;

  // SEO
  keywords: string;
  canonical: string;
  robots: string;
  themeColor: string;
  favicon: string;
}

export interface ImageValidation {
  width?: number;
  height?: number;
  size?: number;
  aspectRatio?: number;
  format?: string;
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export interface ValidationResult {
  platform: Platform;
  level: "error" | "warning" | "success";
  message: string;
  field?: string;
  recommendation?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  timestamp: number;
  metadata: MetaData;
}

export interface PlatformRequirements {
  title: { min: number; max: number; recommended: number };
  description: { min: number; max: number; recommended: number };
  image: {
    minWidth: number;
    minHeight: number;
    maxSize: number; // in bytes
    recommended: { width: number; height: number };
    aspectRatio: number[];
    formats: string[];
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  data: Partial<MetaData>;
}
