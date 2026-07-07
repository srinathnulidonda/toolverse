// features/social/meta-tag-generator/utils.ts

import type { MetaTags, ValidationIssue, ExportFormat, SchemaType } from "./types";

export function validateMetaTags(tags: MetaTags): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Title validation
  if (!tags.title) {
    issues.push({
      field: "title",
      level: "error",
      message: "Title is required",
      recommendation: "Add a descriptive title between 50-60 characters",
    });
  } else if (tags.title.length > 60) {
    issues.push({
      field: "title",
      level: "warning",
      message: `Title is too long (${tags.title.length} chars)`,
      recommendation: "Keep title under 60 characters for optimal display",
    });
  } else if (tags.title.length < 30) {
    issues.push({
      field: "title",
      level: "info",
      message: "Title could be more descriptive",
      recommendation: "Aim for 50-60 characters for better SEO",
    });
  }

  // Description validation
  if (!tags.description) {
    issues.push({
      field: "description",
      level: "error",
      message: "Meta description is required",
      recommendation: "Add a compelling description between 150-160 characters",
    });
  } else if (tags.description.length > 160) {
    issues.push({
      field: "description",
      level: "warning",
      message: `Description is too long (${tags.description.length} chars)`,
      recommendation: "Keep description under 160 characters",
    });
  } else if (tags.description.length < 120) {
    issues.push({
      field: "description",
      level: "info",
      message: "Description could be longer",
      recommendation: "Aim for 150-160 characters for better engagement",
    });
  }

  // Canonical URL
  if (!tags.canonical) {
    issues.push({
      field: "canonical",
      level: "warning",
      message: "Canonical URL is missing",
      recommendation: "Add canonical URL to avoid duplicate content issues",
    });
  } else {
    try {
      new URL(tags.canonical);
    } catch {
      issues.push({
        field: "canonical",
        level: "error",
        message: "Canonical URL is invalid",
        recommendation: "Enter a valid URL (e.g., https://example.com/page)",
      });
    }
  }

  // Open Graph image
  if (!tags.ogImage) {
    issues.push({
      field: "ogImage",
      level: "warning",
      message: "Open Graph image is missing",
      recommendation: "Add an image (1200x630px) for social media sharing",
    });
  }

  // Keywords
  if (tags.keywords && tags.keywords.split(",").length > 10) {
    issues.push({
      field: "keywords",
      level: "info",
      message: "Too many keywords",
      recommendation: "Focus on 5-10 relevant keywords",
    });
  }

  return issues;
}

export function generateMetaTagsCode(tags: MetaTags, format: ExportFormat): string {
  const lines: string[] = [];

  if (format === "html") {
    return generateHTML(tags);
  } else if (format === "jsx") {
    return generateJSX(tags);
  } else if (format === "nextjs") {
    return generateNextJS(tags);
  } else if (format === "gatsby") {
    return generateGatsby(tags);
  } else if (format === "vue") {
    return generateVue(tags);
  } else if (format === "json") {
    return generateJSON(tags);
  }

  return "";
}

function generateHTML(tags: MetaTags): string {
  const lines: string[] = [];

  lines.push("<!-- Primary Meta Tags -->");
  if (tags.charset) lines.push(`<meta charset="${tags.charset}">`);
  if (tags.viewport) lines.push(`<meta name="viewport" content="${tags.viewport}">`);
  if (tags.title) lines.push(`<title>${escapeHtml(tags.title)}</title>`);
  if (tags.description) lines.push(`<meta name="description" content="${escapeHtml(tags.description)}">`);
  if (tags.keywords) lines.push(`<meta name="keywords" content="${escapeHtml(tags.keywords)}">`);
  if (tags.author) lines.push(`<meta name="author" content="${escapeHtml(tags.author)}">`);
  if (tags.language) lines.push(`<meta http-equiv="content-language" content="${tags.language}">`);

  if (tags.canonical || tags.robots) {
    lines.push("");
    lines.push("<!-- SEO -->");
    if (tags.canonical) lines.push(`<link rel="canonical" href="${escapeHtml(tags.canonical)}">`);
    if (tags.robots) lines.push(`<meta name="robots" content="${tags.robots}">`);
    if (tags.googlebot) lines.push(`<meta name="googlebot" content="${tags.googlebot}">`);
    if (tags.bingbot) lines.push(`<meta name="bingbot" content="${tags.bingbot}">`);
  }

  lines.push("");
  lines.push("<!-- Open Graph / Facebook -->");
  lines.push(`<meta property="og:type" content="${tags.ogType || 'website'}">`);
  if (tags.ogUrl) lines.push(`<meta property="og:url" content="${escapeHtml(tags.ogUrl)}">`);
  if (tags.ogTitle || tags.title) lines.push(`<meta property="og:title" content="${escapeHtml(tags.ogTitle || tags.title)}">`);
  if (tags.ogDescription || tags.description) lines.push(`<meta property="og:description" content="${escapeHtml(tags.ogDescription || tags.description)}">`);
  if (tags.ogImage) {
    lines.push(`<meta property="og:image" content="${escapeHtml(tags.ogImage)}">`);
    if (tags.ogImageAlt) lines.push(`<meta property="og:image:alt" content="${escapeHtml(tags.ogImageAlt)}">`);
    if (tags.ogImageWidth) lines.push(`<meta property="og:image:width" content="${tags.ogImageWidth}">`);
    if (tags.ogImageHeight) lines.push(`<meta property="og:image:height" content="${tags.ogImageHeight}">`);
  }
  if (tags.ogSiteName) lines.push(`<meta property="og:site_name" content="${escapeHtml(tags.ogSiteName)}">`);
  if (tags.ogLocale) lines.push(`<meta property="og:locale" content="${tags.ogLocale}">`);

  if (tags.ogType === "article" && (tags.articlePublishedTime || tags.articleAuthor)) {
    lines.push("");
    lines.push("<!-- Article Meta -->");
    if (tags.articlePublishedTime) lines.push(`<meta property="article:published_time" content="${tags.articlePublishedTime}">`);
    if (tags.articleModifiedTime) lines.push(`<meta property="article:modified_time" content="${tags.articleModifiedTime}">`);
    if (tags.articleAuthor) lines.push(`<meta property="article:author" content="${escapeHtml(tags.articleAuthor)}">`);
    if (tags.articleSection) lines.push(`<meta property="article:section" content="${escapeHtml(tags.articleSection)}">`);
    if (tags.articleTag) {
      tags.articleTag.split(",").forEach(tag => {
        lines.push(`<meta property="article:tag" content="${escapeHtml(tag.trim())}">`);
      });
    }
  }

  lines.push("");
  lines.push("<!-- Twitter -->");
  lines.push(`<meta name="twitter:card" content="${tags.twitterCard || 'summary_large_image'}">`);
  if (tags.ogUrl) lines.push(`<meta name="twitter:url" content="${escapeHtml(tags.ogUrl)}">`);
  if (tags.twitterTitle || tags.title) lines.push(`<meta name="twitter:title" content="${escapeHtml(tags.twitterTitle || tags.title)}">`);
  if (tags.twitterDescription || tags.description) lines.push(`<meta name="twitter:description" content="${escapeHtml(tags.twitterDescription || tags.description)}">`);
  if (tags.twitterImage || tags.ogImage) lines.push(`<meta name="twitter:image" content="${escapeHtml(tags.twitterImage || tags.ogImage)}">`);
  if (tags.twitterImageAlt || tags.ogImageAlt) lines.push(`<meta name="twitter:image:alt" content="${escapeHtml(tags.twitterImageAlt || tags.ogImageAlt)}">`);
  if (tags.twitterSite) lines.push(`<meta name="twitter:site" content="${escapeHtml(tags.twitterSite)}">`);
  if (tags.twitterCreator) lines.push(`<meta name="twitter:creator" content="${escapeHtml(tags.twitterCreator)}">`);

  if (tags.themeColor || tags.appleMobileWebAppCapable) {
    lines.push("");
    lines.push("<!-- Mobile & PWA -->");
    if (tags.themeColor) lines.push(`<meta name="theme-color" content="${tags.themeColor}">`);
    if (tags.msapplicationTileColor) lines.push(`<meta name="msapplication-TileColor" content="${tags.msapplicationTileColor}">`);
    if (tags.appleMobileWebAppCapable) lines.push(`<meta name="apple-mobile-web-app-capable" content="${tags.appleMobileWebAppCapable}">`);
    if (tags.appleMobileWebAppStatusBarStyle) lines.push(`<meta name="apple-mobile-web-app-status-bar-style" content="${tags.appleMobileWebAppStatusBarStyle}">`);
    if (tags.appleMobileWebAppTitle) lines.push(`<meta name="apple-mobile-web-app-title" content="${escapeHtml(tags.appleMobileWebAppTitle)}">`);
  }

  if (tags.favicon || tags.appleTouchIcon) {
    lines.push("");
    lines.push("<!-- Favicons -->");
    if (tags.favicon) lines.push(`<link rel="icon" href="${escapeHtml(tags.favicon)}">`);
    if (tags.icon16) lines.push(`<link rel="icon" type="image/png" sizes="16x16" href="${escapeHtml(tags.icon16)}">`);
    if (tags.icon32) lines.push(`<link rel="icon" type="image/png" sizes="32x32" href="${escapeHtml(tags.icon32)}">`);
    if (tags.appleTouchIcon) lines.push(`<link rel="apple-touch-icon" href="${escapeHtml(tags.appleTouchIcon)}">`);
  }

  if (tags.enableSchema && tags.schemaType) {
    lines.push("");
    lines.push("<!-- Schema.org Structured Data -->");
    lines.push(`<script type="application/ld+json">`);
    lines.push(JSON.stringify(generateSchemaData(tags), null, 2));
    lines.push(`</script>`);
  }

  return lines.join("\n");
}

function generateJSX(tags: MetaTags): string {
  const html = generateHTML(tags);
  return html
    .replace(/<!--(.*?)-->/g, (match, content) => `{/* ${content.trim()} */}`)
    .replace(/charset=/g, 'charSet=')
    .replace(/http-equiv=/g, 'httpEquiv=')
    .replace(/content-language/g, 'contentLanguage');
}

function generateNextJS(tags: MetaTags): string {
  const lines: string[] = [];
  
  lines.push("import Head from 'next/head';");
  lines.push("");
  lines.push("export default function MyPage() {");
  lines.push("  return (");
  lines.push("    <>");
  lines.push("      <Head>");
  
  if (tags.title) lines.push(`        <title>${escapeHtml(tags.title)}</title>`);
  if (tags.description) lines.push(`        <meta name="description" content="${escapeHtml(tags.description)}" />`);
  if (tags.keywords) lines.push(`        <meta name="keywords" content="${escapeHtml(tags.keywords)}" />`);
  if (tags.canonical) lines.push(`        <link rel="canonical" href="${escapeHtml(tags.canonical)}" />`);
  if (tags.viewport) lines.push(`        <meta name="viewport" content="${tags.viewport}" />`);
  
  lines.push("");
  lines.push("        {/* Open Graph */}");
  if (tags.ogTitle || tags.title) lines.push(`        <meta property="og:title" content="${escapeHtml(tags.ogTitle || tags.title)}" />`);
  if (tags.ogDescription || tags.description) lines.push(`        <meta property="og:description" content="${escapeHtml(tags.ogDescription || tags.description)}" />`);
  if (tags.ogImage) lines.push(`        <meta property="og:image" content="${escapeHtml(tags.ogImage)}" />`);
  if (tags.ogUrl) lines.push(`        <meta property="og:url" content="${escapeHtml(tags.ogUrl)}" />`);
  
  lines.push("");
  lines.push("        {/* Twitter */}");
  lines.push(`        <meta name="twitter:card" content="${tags.twitterCard || 'summary_large_image'}" />`);
  if (tags.twitterTitle || tags.title) lines.push(`        <meta name="twitter:title" content="${escapeHtml(tags.twitterTitle || tags.title)}" />`);
  
  if (tags.themeColor) {
    lines.push("");
    lines.push(`        <meta name="theme-color" content="${tags.themeColor}" />`);
  }
  
  lines.push("      </Head>");
  lines.push("");
  lines.push("      {/* Your page content */}");
  lines.push("    </>");
  lines.push("  );");
  lines.push("}");
  
  return lines.join("\n");
}

function generateGatsby(tags: MetaTags): string {
  const lines: string[] = [];
  
  lines.push("import { Helmet } from 'react-helmet';");
  lines.push("");
  lines.push("export default function MyPage() {");
  lines.push("  return (");
  lines.push("    <>");
  lines.push("      <Helmet>");
  
  if (tags.title) lines.push(`        <title>${escapeHtml(tags.title)}</title>`);
  if (tags.description) lines.push(`        <meta name="description" content="${escapeHtml(tags.description)}" />`);
  if (tags.canonical) lines.push(`        <link rel="canonical" href="${escapeHtml(tags.canonical)}" />`);
  
  lines.push("");
  lines.push("        {/* Open Graph */}");
  if (tags.ogTitle || tags.title) lines.push(`        <meta property="og:title" content="${escapeHtml(tags.ogTitle || tags.title)}" />`);
  if (tags.ogImage) lines.push(`        <meta property="og:image" content="${escapeHtml(tags.ogImage)}" />`);
  
  lines.push("      </Helmet>");
  lines.push("");
  lines.push("      {/* Your page content */}");
  lines.push("    </>");
  lines.push("  );");
  lines.push("}");
  
  return lines.join("\n");
}

function generateVue(tags: MetaTags): string {
  const lines: string[] = [];
  
  lines.push("export default {");
  lines.push("  head() {");
  lines.push("    return {");
  if (tags.title) lines.push(`      title: '${escapeHtml(tags.title)}',`);
  lines.push("      meta: [");
  if (tags.description) lines.push(`        { hid: 'description', name: 'description', content: '${escapeHtml(tags.description)}' },`);
  if (tags.keywords) lines.push(`        { name: 'keywords', content: '${escapeHtml(tags.keywords)}' },`);
  
  lines.push("        // Open Graph");
  if (tags.ogTitle || tags.title) lines.push(`        { property: 'og:title', content: '${escapeHtml(tags.ogTitle || tags.title)}' },`);
  if (tags.ogDescription || tags.description) lines.push(`        { property: 'og:description', content: '${escapeHtml(tags.ogDescription || tags.description)}' },`);
  if (tags.ogImage) lines.push(`        { property: 'og:image', content: '${escapeHtml(tags.ogImage)}' },`);
  
  lines.push("      ],");
  lines.push("      link: [");
  if (tags.canonical) lines.push(`        { rel: 'canonical', href: '${escapeHtml(tags.canonical)}' },`);
  lines.push("      ]");
  lines.push("    }");
  lines.push("  }");
  lines.push("}");
  
  return lines.join("\n");
}

function generateJSON(tags: MetaTags): string {
  const data = {
    basic: {
      title: tags.title,
      description: tags.description,
      keywords: tags.keywords,
      author: tags.author,
      canonical: tags.canonical,
    },
    openGraph: {
      type: tags.ogType,
      title: tags.ogTitle || tags.title,
      description: tags.ogDescription || tags.description,
      image: tags.ogImage,
      url: tags.ogUrl,
      siteName: tags.ogSiteName,
    },
    twitter: {
      card: tags.twitterCard,
      site: tags.twitterSite,
      creator: tags.twitterCreator,
      title: tags.twitterTitle || tags.title,
      description: tags.twitterDescription || tags.description,
      image: tags.twitterImage || tags.ogImage,
    },
  };
  
  return JSON.stringify(data, null, 2);
}

function generateSchemaData(tags: MetaTags): any {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": tags.schemaType,
  };

  switch (tags.schemaType) {
    case "Article":
    case "BlogPosting":
    case "NewsArticle":
      return {
        ...baseSchema,
        headline: tags.title,
        description: tags.description,
        image: tags.ogImage,
        author: {
          "@type": "Person",
          name: tags.articleAuthor || tags.author,
        },
        publisher: {
          "@type": "Organization",
          name: tags.ogSiteName,
        },
        datePublished: tags.articlePublishedTime,
        dateModified: tags.articleModifiedTime,
      };

    case "Product":
      return {
        ...baseSchema,
        name: tags.title,
        description: tags.description,
        image: tags.ogImage,
      };

    case "Organization":
    case "LocalBusiness":
      return {
        ...baseSchema,
        name: tags.ogSiteName || tags.title,
        description: tags.description,
        url: tags.ogUrl || tags.canonical,
      };

    case "Person":
      return {
        ...baseSchema,
        name: tags.author,
        description: tags.description,
        image: tags.ogImage,
      };

    case "WebSite":
      return {
        ...baseSchema,
        name: tags.ogSiteName || tags.title,
        description: tags.description,
        url: tags.ogUrl || tags.canonical,
      };

    default:
      return baseSchema;
  }
}

function escapeHtml(text: string): string {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function getCharCountColor(count: number, max: number, recommended: number): string {
  if (count === 0) return "var(--text-disabled)";
  if (count > max) return "#B91C1C";
  if (count > recommended) return "#D97706";
  return "var(--brand)";
}

export function getSEOScore(tags: MetaTags): number {
  let score = 0;
  const maxScore = 100;

  // Title (20 points)
  if (tags.title) {
    score += 10;
    if (tags.title.length >= 30 && tags.title.length <= 60) score += 10;
  }

  // Description (20 points)
  if (tags.description) {
    score += 10;
    if (tags.description.length >= 120 && tags.description.length <= 160) score += 10;
  }

  // Canonical URL (10 points)
  if (tags.canonical) score += 10;

  // OG Image (15 points)
  if (tags.ogImage) score += 15;

  // Keywords (10 points)
  if (tags.keywords) score += 10;

  // Robots (5 points)
  if (tags.robots) score += 5;

  // Twitter card (10 points)
  if (tags.twitterCard) score += 10;

  // Author (5 points)
  if (tags.author) score += 5;

  // OG tags (10 points)
  if (tags.ogTitle || tags.ogDescription) score += 5;
  if (tags.ogUrl && tags.ogSiteName) score += 5;

  // Schema (5 points)
  if (tags.enableSchema) score += 5;

  return Math.min(score, maxScore);
}