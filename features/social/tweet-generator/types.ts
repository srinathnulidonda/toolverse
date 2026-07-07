// features/social/tweet-generator/types.ts

export type TweetLayout = "single" | "quote" | "thread" | "reply";
export type ThemePreset = "twitter-light" | "twitter-dark" | "minimal" | "nord" | "dracula" | "sunset" | "ocean" | "custom";
export type ExportFormat = "png" | "jpg" | "svg";
export type AspectRatio = "1:1" | "16:9" | "4:3" | "9:16" | "custom";
export type FontFamily = "system" | "inter" | "segoe" | "sf-pro" | "roboto" | "poppins";
export type CornerStyle = "sharp" | "rounded" | "extra-rounded";
export type BackgroundType = "solid" | "gradient" | "pattern" | "image" | "blur";
export type PatternType = "dots" | "grid" | "diagonal" | "waves" | "noise";

export interface TweetTheme {
  name: string;
  background: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  accent: string;
  verified: string;
  link: string;
  icon: string;
}

export interface TweetProfile {
  displayName: string;
  handle: string;
  avatar: string; // URL or base64
  verified: boolean;
  verifiedType: "blue" | "gold" | "gray";
  bio?: string;
  location?: string;
  website?: string;
  joined?: string;
  following?: number;
  followers?: number;
}

export interface TweetContent {
  text: string;
  timestamp: string;
  timestampFormat: "relative" | "absolute" | "custom";
  customTimestamp?: string;
  source: string; // "Twitter for iPhone", "Twitter Web App", etc.
  showSource: boolean;
}

export interface TweetMedia {
  type: "image" | "video" | "gif" | null;
  url?: string;
  aspectRatio?: string;
  altText?: string;
}

export interface TweetEngagement {
  replies: number;
  retweets: number;
  likes: number;
  bookmarks: number;
  views: number;
  showMetrics: boolean;
  showViews: boolean;
}

export interface QuotedTweet {
  profile: Partial<TweetProfile>;
  text: string;
  timestamp: string;
  media?: TweetMedia;
}

export interface ReplyContext {
  replyingTo: string[]; // Array of handles
  showReplyLine: boolean;
}

export interface ThreadItem {
  id: string;
  text: string;
  media?: TweetMedia;
}

export interface TweetStyle {
  theme: ThemePreset;
  customTheme?: TweetTheme;
  layout: TweetLayout;
  aspectRatio: AspectRatio;
  customWidth?: number;
  customHeight?: number;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  cornerStyle: CornerStyle;
  showBorder: boolean;
  borderWidth: number;
  borderColor: string;
  shadowIntensity: number;
  backgroundType: BackgroundType;
  backgroundGradient?: {
    start: string;
    end: string;
    angle: number;
  };
  backgroundPattern?: {
    type: PatternType;
    color: string;
    opacity: number;
    scale: number;
  };
  backgroundImage?: string;
  padding: number;
  watermark: {
    enabled: boolean;
    text: string;
    position: "bottom-left" | "bottom-right" | "top-left" | "top-right";
    opacity: number;
  };
}

export interface TweetData {
  profile: TweetProfile;
  content: TweetContent;
  engagement: TweetEngagement;
  media?: TweetMedia;
  quotedTweet?: QuotedTweet;
  replyContext?: ReplyContext;
  threadItems?: ThreadItem[];
}

export interface HistoryItem {
  id: string;
  name: string;
  tweetData: TweetData;
  style: TweetStyle;
  timestamp: number;
  thumbnail?: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scale: number; // 1x, 2x, 3x for retina
  quality: number; // 0-100 for JPG
  transparentBg: boolean;
  includeWatermark: boolean;
}