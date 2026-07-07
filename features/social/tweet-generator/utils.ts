// features/social/tweet-generator/utils.ts

import type { TweetTheme, ThemePreset, TweetContent } from "./types";

export const THEME_PRESETS: Record<ThemePreset, TweetTheme> = {
  "twitter-light": {
    name: "Twitter Light",
    background: "#FFFFFF",
    cardBg: "#FFFFFF",
    text: "#0F1419",
    textSecondary: "#536471",
    textTertiary: "#8B98A5",
    border: "#EFF3F4",
    accent: "#1D9BF0",
    verified: "#1D9BF0",
    link: "#1D9BF0",
    icon: "#536471",
  },
  "twitter-dark": {
    name: "Twitter Dark",
    background: "#15202B",
    cardBg: "#192734",
    text: "#E7E9EA",
    textSecondary: "#8B98A5",
    textTertiary: "#6E767D",
    border: "#38444D",
    accent: "#1D9BF0",
    verified: "#1D9BF0",
    link: "#1D9BF0",
    icon: "#8B98A5",
  },
  minimal: {
    name: "Minimal",
    background: "#FAFAFA",
    cardBg: "#FFFFFF",
    text: "#111111",
    textSecondary: "#666666",
    textTertiary: "#999999",
    border: "#E5E5E5",
    accent: "#000000",
    verified: "#000000",
    link: "#000000",
    icon: "#666666",
  },
  nord: {
    name: "Nord",
    background: "#2E3440",
    cardBg: "#3B4252",
    text: "#ECEFF4",
    textSecondary: "#D8DEE9",
    textTertiary: "#A3BE8C",
    border: "#4C566A",
    accent: "#88C0D0",
    verified: "#88C0D0",
    link: "#88C0D0",
    icon: "#D8DEE9",
  },
  dracula: {
    name: "Dracula",
    background: "#282A36",
    cardBg: "#44475A",
    text: "#F8F8F2",
    textSecondary: "#BD93F9",
    textTertiary: "#6272A4",
    border: "#6272A4",
    accent: "#FF79C6",
    verified: "#FF79C6",
    link: "#8BE9FD",
    icon: "#BD93F9",
  },
  sunset: {
    name: "Sunset",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    cardBg: "#FFFFFF",
    text: "#2D3748",
    textSecondary: "#718096",
    textTertiary: "#A0AEC0",
    border: "#E2E8F0",
    accent: "#FF6B6B",
    verified: "#FF6B6B",
    link: "#FF6B6B",
    icon: "#718096",
  },
  ocean: {
    name: "Ocean",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    cardBg: "#FFFFFF",
    text: "#1A202C",
    textSecondary: "#4A5568",
    textTertiary: "#718096",
    border: "#E2E8F0",
    accent: "#667EEA",
    verified: "#667EEA",
    link: "#667EEA",
    icon: "#4A5568",
  },
  custom: {
    name: "Custom",
    background: "#FFFFFF",
    cardBg: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",
    border: "#E5E5E5",
    accent: "#1D9BF0",
    verified: "#1D9BF0",
    link: "#1D9BF0",
    icon: "#666666",
  },
};

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatTimestamp(
  timestamp: string,
  format: "relative" | "absolute" | "custom",
  custom?: string
): string {
  if (format === "custom" && custom) return custom;

  const date = new Date(timestamp);
  const now = new Date();

  if (format === "relative") {
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Absolute format
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${time} · ${dateStr}`;
}

export function parseTwitterHandles(text: string): { text: string; mentions: string[] } {
  const mentions: string[] = [];
  const regex = /@(\w+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return { text, mentions };
}

export function parseHashtags(text: string): string[] {
  const hashtags: string[] = [];
  const regex = /#(\w+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  return hashtags;
}

export function highlightTextEntities(text: string, theme: TweetTheme): string {
  // First, escape HTML entities in the text to prevent XSS
  const escapedText = escapeHtml(text);

  // Highlight @mentions, #hashtags, and URLs
  let highlighted = escapedText;

  // URLs
  highlighted = highlighted.replace(
    /(https?:\/\/[^\s]+)/g,
    `<span style="color: ${theme.link}">$1</span>`
  );

  // Mentions
  highlighted = highlighted.replace(
    /@(\w+)/g,
    `<span style="color: ${theme.link}">@$1</span>`
  );

  // Hashtags
  highlighted = highlighted.replace(
    /#(\w+)/g,
    `<span style="color: ${theme.link}">#$1</span>`
  );

  return highlighted;
}

// Helper function to escape HTML entities
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "&#039;");
}

export function validateTweetLength(text: string): { valid: boolean; length: number; max: number } {
  const length = text.length;
  const max = 280;
  return { valid: length <= max, length, max };
}

export function generateDefaultAvatar(name: string): string {
  // Generate a simple gradient avatar based on name
  const colors = [
    ["#667EEA", "#764BA2"],
    ["#F093FB", "#F5576C"],
    ["#4FACFE", "#00F2FE"],
    ["#43E97B", "#38F9D7"],
    ["#FA709A", "#FEE140"],
    ["#30CFD0", "#330867"],
    ["#A8EDEA", "#FED6E3"],
    ["#FF9A9E", "#FAD0C4"],
  ];

  const charCode = name.charCodeAt(0) || 0;
  const colorPair = colors[charCode % colors.length];

  const svg = `
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${charCode}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#grad-${charCode})" rx="24"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui" font-size="20" font-weight="600" fill="white">
        ${name.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getSocialShareText(tweetText: string): string {
  const maxLength = 100;
  if (tweetText.length <= maxLength) return tweetText;
  return tweetText.slice(0, maxLength - 3) + "...";
}

export const TWITTER_SOURCES = [
  "Twitter for iPhone",
  "Twitter for Android",
  "Twitter Web App",
  "Twitter for iPad",
  "Twitter for Mac",
  "TweetDeck",
];

export const VERIFIED_BADGE_COLORS = {
  blue: "#1D9BF0",
  gold: "#FFD700",
  gray: "#697882",
};

export function getAspectRatioDimensions(
  ratio: string,
  baseWidth: number = 600
): { width: number; height: number } {
  const ratios: Record<string, number> = {
    "1:1": 1,
    "16:9": 16 / 9,
    "4:3": 4 / 3,
    "9:16": 9 / 16,
  };

  const aspectRatio = ratios[ratio] || 1;
  return {
    width: baseWidth,
    height: Math.round(baseWidth / aspectRatio),
  };
}