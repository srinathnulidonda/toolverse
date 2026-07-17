// features/social/meta-tag-generator/types.ts

export type PageType = "website" | "article" | "product" | "profile" | "video" | "music" | "book";

export type TwitterCardType = "summary" | "summary_large_image" | "app" | "player";

export type RobotsDirective =
  "" | "index, follow" | "noindex, follow" | "index, nofollow" | "noindex, nofollow";

export type SchemaType =
  | "Article"
  | "BlogPosting"
  | "NewsArticle"
  | "Product"
  | "Organization"
  | "Person"
  | "WebSite"
  | "VideoObject"
  | "Recipe"
  | "Event"
  | "LocalBusiness";

export type ExportFormat = "html" | "jsx" | "nextjs" | "gatsby" | "vue" | "json";

export interface MetaTags {
  // Basic SEO
  title: string;
  description: string;
  keywords: string;
  author: string;
  viewport: string;
  charset: string;
  language: string;

  // URLs
  canonical: string;
  baseUrl: string;

  // Robots
  robots: RobotsDirective;
  googlebot: string;
  bingbot: string;

  // Open Graph
  ogType: PageType;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogUrl: string;
  ogSiteName: string;
  ogLocale: string;

  // Twitter
  twitterCard: TwitterCardType;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;

  // Article specific
  articlePublishedTime: string;
  articleModifiedTime: string;
  articleAuthor: string;
  articleSection: string;
  articleTag: string;

  // Additional
  themeColor: string;
  msapplicationTileColor: string;
  appleMobileWebAppCapable: string;
  appleMobileWebAppStatusBarStyle: string;
  appleMobileWebAppTitle: string;

  // Favicons
  favicon: string;
  appleTouchIcon: string;
  icon32: string;
  icon16: string;

  // Schema.org
  enableSchema: boolean;
  schemaType: SchemaType;
  schemaData: Record<string, any>;
}

export interface ValidationIssue {
  field: string;
  level: "error" | "warning" | "info";
  message: string;
  recommendation?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: MetaTags;
}

export interface HistoryItem {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  tags: MetaTags;
}
