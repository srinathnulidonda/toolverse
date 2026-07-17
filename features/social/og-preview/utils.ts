// features/social/og-preview/utils.ts

import type {
  MetaData,
  ImageValidation,
  ValidationResult,
  Platform,
  PlatformRequirements,
} from "./types";

export const PLATFORM_REQUIREMENTS: Record<Platform, PlatformRequirements> = {
  facebook: {
    title: { min: 1, max: 100, recommended: 60 },
    description: { min: 1, max: 300, recommended: 155 },
    image: {
      minWidth: 200,
      minHeight: 200,
      maxSize: 8 * 1024 * 1024, // 8MB
      recommended: { width: 1200, height: 630 },
      aspectRatio: [1.91, 1],
      formats: ["jpg", "png", "webp", "gif"],
    },
  },
  twitter: {
    title: { min: 1, max: 70, recommended: 55 },
    description: { min: 1, max: 200, recommended: 125 },
    image: {
      minWidth: 144,
      minHeight: 144,
      maxSize: 5 * 1024 * 1024, // 5MB
      recommended: { width: 1200, height: 675 },
      aspectRatio: [1.91, 1],
      formats: ["jpg", "png", "webp", "gif"],
    },
  },
  linkedin: {
    title: { min: 1, max: 200, recommended: 70 },
    description: { min: 1, max: 300, recommended: 150 },
    image: {
      minWidth: 1200,
      minHeight: 627,
      maxSize: 5 * 1024 * 1024,
      recommended: { width: 1200, height: 627 },
      aspectRatio: [1.91, 1],
      formats: ["jpg", "png"],
    },
  },
  slack: {
    title: { min: 1, max: 100, recommended: 60 },
    description: { min: 1, max: 200, recommended: 120 },
    image: {
      minWidth: 200,
      minHeight: 200,
      maxSize: 5 * 1024 * 1024,
      recommended: { width: 800, height: 418 },
      aspectRatio: [1.91, 1],
      formats: ["jpg", "png", "gif"],
    },
  },
  discord: {
    title: { min: 1, max: 256, recommended: 60 },
    description: { min: 1, max: 350, recommended: 150 },
    image: {
      minWidth: 200,
      minHeight: 200,
      maxSize: 8 * 1024 * 1024,
      recommended: { width: 1280, height: 720 },
      aspectRatio: [16, 9],
      formats: ["jpg", "png", "webp", "gif"],
    },
  },
  whatsapp: {
    title: { min: 1, max: 65, recommended: 55 },
    description: { min: 1, max: 100, recommended: 80 },
    image: {
      minWidth: 200,
      minHeight: 200,
      maxSize: 300 * 1024, // 300KB
      recommended: { width: 400, height: 400 },
      aspectRatio: [1, 1],
      formats: ["jpg", "png"],
    },
  },
  imessage: {
    title: { min: 1, max: 80, recommended: 60 },
    description: { min: 1, max: 200, recommended: 120 },
    image: {
      minWidth: 200,
      minHeight: 200,
      maxSize: 5 * 1024 * 1024,
      recommended: { width: 1200, height: 630 },
      aspectRatio: [1.91, 1],
      formats: ["jpg", "png", "webp"],
    },
  },
  telegram: {
    title: { min: 1, max: 70, recommended: 55 },
    description: { min: 1, max: 150, recommended: 100 },
    image: {
      minWidth: 200,
      minHeight: 200,
      maxSize: 5 * 1024 * 1024,
      recommended: { width: 1200, height: 630 },
      aspectRatio: [1.91, 1],
      formats: ["jpg", "png", "webp"],
    },
  },
};

export function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    facebook: "Facebook",
    twitter: "Twitter/X",
    linkedin: "LinkedIn",
    slack: "Slack",
    discord: "Discord",
    whatsapp: "WhatsApp",
    imessage: "iMessage",
    telegram: "Telegram",
  };
  return labels[platform];
}

export function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    facebook: "ti-brand-facebook",
    twitter: "ti-brand-twitter",
    linkedin: "ti-brand-linkedin",
    slack: "ti-brand-slack",
    discord: "ti-brand-discord",
    whatsapp: "ti-brand-whatsapp",
    imessage: "ti-message-circle",
    telegram: "ti-brand-telegram",
  };
  return icons[platform];
}

export async function fetchMetaFromUrl(url: string): Promise<Partial<MetaData>> {
  try {
    // Using a CORS proxy for demo - in production, use your own backend
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMetaContent = (name: string): string => {
      const meta =
        doc.querySelector(`meta[property="${name}"]`) || doc.querySelector(`meta[name="${name}"]`);
      return meta?.getAttribute("content") || "";
    };

    return {
      title: getMetaContent("og:title") || doc.querySelector("title")?.textContent || "",
      description: getMetaContent("og:description") || getMetaContent("description") || "",
      image: getMetaContent("og:image") || "",
      url: getMetaContent("og:url") || url,
      type: getMetaContent("og:type") || "website",
      siteName: getMetaContent("og:site_name") || "",
      locale: getMetaContent("og:locale") || "en_US",

      twitterCard: (getMetaContent("twitter:card") as any) || "summary_large_image",
      twitterSite: getMetaContent("twitter:site") || "",
      twitterCreator: getMetaContent("twitter:creator") || "",
      twitterTitle: getMetaContent("twitter:title") || "",
      twitterDescription: getMetaContent("twitter:description") || "",
      twitterImage: getMetaContent("twitter:image") || "",

      keywords: getMetaContent("keywords") || "",
      author: getMetaContent("author") || "",
      canonical: doc.querySelector("link[rel='canonical']")?.getAttribute("href") || "",
      robots: getMetaContent("robots") || "",
      themeColor: getMetaContent("theme-color") || "",
      favicon: doc.querySelector("link[rel='icon']")?.getAttribute("href") || "",

      imageAlt: getMetaContent("og:image:alt") || "",
      imageWidth: getMetaContent("og:image:width") || "",
      imageHeight: getMetaContent("og:image:height") || "",
      imageType: getMetaContent("og:image:type") || "",
    };
  } catch (error) {
    throw new Error("Failed to fetch metadata. Please check the URL or enter data manually.");
  }
}

export async function validateImage(imageUrl: string): Promise<ImageValidation> {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!imageUrl) {
    return { valid: false, errors: ["Image URL is required"], warnings: [] };
  }

  try {
    // Check if URL is valid
    new URL(imageUrl);

    // Load image to get dimensions
    const img = new Image();
    img.crossOrigin = "anonymous";

    const result = await new Promise<ImageValidation>((resolve) => {
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const aspectRatio = width / height;

        // Check minimum dimensions for major platforms
        if (width < 1200) {
          warnings.push(`Image width (${width}px) is below recommended 1200px for optimal quality`);
        }
        if (height < 630) {
          warnings.push(`Image height (${height}px) is below recommended 630px`);
        }

        // Check aspect ratio
        const idealRatio = 1200 / 630; // 1.91:1
        if (Math.abs(aspectRatio - idealRatio) > 0.2) {
          warnings.push(`Aspect ratio ${aspectRatio.toFixed(2)}:1 differs from ideal 1.91:1`);
        }

        resolve({
          width,
          height,
          aspectRatio,
          valid: errors.length === 0,
          warnings,
          errors,
        });
      };

      img.onerror = () => {
        errors.push("Failed to load image. Check URL or CORS settings.");
        resolve({ valid: false, errors, warnings: [] });
      };

      img.src = imageUrl;
    });

    return result;
  } catch (e) {
    errors.push("Invalid image URL format");
    return { valid: false, errors, warnings: [] };
  }
}

export function validateMetaForPlatform(meta: MetaData, platform: Platform): ValidationResult[] {
  const results: ValidationResult[] = [];
  const req = PLATFORM_REQUIREMENTS[platform];

  // Validate title
  if (!meta.title) {
    results.push({
      platform,
      level: "error",
      message: "Title is required",
      field: "title",
      recommendation: `Add a compelling title (${req.title.recommended} chars recommended)`,
    });
  } else if (meta.title.length > req.title.max) {
    results.push({
      platform,
      level: "warning",
      message: `Title too long (${meta.title.length}/${req.title.max} chars)`,
      field: "title",
      recommendation: `Keep it under ${req.title.recommended} characters for best display`,
    });
  } else if (meta.title.length < req.title.recommended) {
    results.push({
      platform,
      level: "warning",
      message: `Title could be longer (${meta.title.length} chars)`,
      field: "title",
      recommendation: `Aim for ${req.title.recommended} characters for better engagement`,
    });
  }

  // Validate description
  if (!meta.description) {
    results.push({
      platform,
      level: "error",
      message: "Description is required",
      field: "description",
      recommendation: `Add a description (${req.description.recommended} chars recommended)`,
    });
  } else if (meta.description.length > req.description.max) {
    results.push({
      platform,
      level: "warning",
      message: `Description too long (${meta.description.length}/${req.description.max} chars)`,
      field: "description",
      recommendation: `Keep it under ${req.description.recommended} characters`,
    });
  }

  // Validate image
  if (!meta.image) {
    results.push({
      platform,
      level: "error",
      message: "Image is required for rich previews",
      field: "image",
      recommendation: `Add an image (${req.image.recommended.width}x${req.image.recommended.height}px recommended)`,
    });
  }

  // Platform-specific validations
  if (platform === "twitter" && !meta.twitterCard) {
    results.push({
      platform,
      level: "warning",
      message: "Twitter card type not specified",
      field: "twitterCard",
      recommendation: "Set to 'summary_large_image' for better visibility",
    });
  }

  if (platform === "linkedin" && !meta.siteName) {
    results.push({
      platform,
      level: "warning",
      message: "Site name missing",
      field: "siteName",
      recommendation: "Add your site/brand name for better branding",
    });
  }

  return results;
}

export function generateMetaTags(meta: MetaData): string {
  const lines: string[] = [];

  lines.push("<!-- Primary Meta Tags -->");
  if (meta.title) lines.push(`<title>${escapeHtml(meta.title)}</title>`);
  if (meta.description)
    lines.push(`<meta name="description" content="${escapeHtml(meta.description)}">`);
  if (meta.keywords) lines.push(`<meta name="keywords" content="${escapeHtml(meta.keywords)}">`);
  if (meta.author) lines.push(`<meta name="author" content="${escapeHtml(meta.author)}">`);
  if (meta.robots) lines.push(`<meta name="robots" content="${escapeHtml(meta.robots)}">`);
  if (meta.canonical) lines.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}">`);

  lines.push("");
  lines.push("<!-- Open Graph / Facebook -->");
  lines.push(`<meta property="og:type" content="${escapeHtml(meta.type || "website")}">`);
  if (meta.url) lines.push(`<meta property="og:url" content="${escapeHtml(meta.url)}">`);
  if (meta.title) lines.push(`<meta property="og:title" content="${escapeHtml(meta.title)}">`);
  if (meta.description)
    lines.push(`<meta property="og:description" content="${escapeHtml(meta.description)}">`);
  if (meta.image) {
    lines.push(`<meta property="og:image" content="${escapeHtml(meta.image)}">`);
    if (meta.imageAlt)
      lines.push(`<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">`);
    if (meta.imageWidth)
      lines.push(`<meta property="og:image:width" content="${escapeHtml(meta.imageWidth)}">`);
    if (meta.imageHeight)
      lines.push(`<meta property="og:image:height" content="${escapeHtml(meta.imageHeight)}">`);
  }
  if (meta.siteName)
    lines.push(`<meta property="og:site_name" content="${escapeHtml(meta.siteName)}">`);
  if (meta.locale) lines.push(`<meta property="og:locale" content="${escapeHtml(meta.locale)}">`);

  lines.push("");
  lines.push("<!-- Twitter -->");
  lines.push(
    `<meta name="twitter:card" content="${escapeHtml(meta.twitterCard || "summary_large_image")}">`
  );
  if (meta.url) lines.push(`<meta name="twitter:url" content="${escapeHtml(meta.url)}">`);
  if (meta.twitterTitle || meta.title)
    lines.push(
      `<meta name="twitter:title" content="${escapeHtml(meta.twitterTitle || meta.title)}">`
    );
  if (meta.twitterDescription || meta.description)
    lines.push(
      `<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription || meta.description)}">`
    );
  if (meta.twitterImage || meta.image)
    lines.push(
      `<meta name="twitter:image" content="${escapeHtml(meta.twitterImage || meta.image)}">`
    );
  if (meta.twitterSite)
    lines.push(`<meta name="twitter:site" content="${escapeHtml(meta.twitterSite)}">`);
  if (meta.twitterCreator)
    lines.push(`<meta name="twitter:creator" content="${escapeHtml(meta.twitterCreator)}">`);

  if (meta.themeColor) {
    lines.push("");
    lines.push("<!-- Theme -->");
    lines.push(`<meta name="theme-color" content="${escapeHtml(meta.themeColor)}">`);
  }

  if (meta.favicon) {
    lines.push("");
    lines.push("<!-- Favicon -->");
    lines.push(`<link rel="icon" href="${escapeHtml(meta.favicon)}">`);
  }

  return lines.join("\n");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export function getCharCountColor(count: number, max: number, recommended: number): string {
  if (count === 0) return "var(--text-disabled)";
  if (count > max) return "#B91C1C";
  if (count > recommended) return "#D97706";
  return "var(--brand)";
}
