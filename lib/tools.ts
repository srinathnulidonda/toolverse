// lib/tools.ts

export type Category = {
    slug: string;
    label: string;
    icon: string;
    description: string;
    color: string;
    colorDark: string;
    bgLight: string;
    bgDark: string;
};

export type CategoryWithCount = Category & {
    count: number;
};

export type Tool = {
    slug: string;
    label: string;
    description: string;
    category: string;
    icon: string;
    href: string;
    badge?: "new" | "popular" | "beta";
    tags?: string[];
};

const BASE_CATEGORIES: Category[] = [
    {
        slug: "pdf",
        label: "PDF Tools",
        icon: "ti-file-text",
        description: "Compress, merge, split, convert — everything PDF, processed entirely in your browser.",
        color: "#E05252",
        colorDark: "#F07070",
        bgLight: "#FEF0F0",
        bgDark: "#2A0D0D",
    },
    {
        slug: "image",
        label: "Image Tools",
        icon: "ti-photo",
        description: "Compress, resize, convert, and edit images without uploading to any server.",
        color: "#7C5CFC",
        colorDark: "#9B80FF",
        bgLight: "#F3F0FF",
        bgDark: "#1A1030",
    },
    {
        slug: "dev",
        label: "Developer Tools",
        icon: "ti-code",
        description: "Format, validate, encode, and transform code and data structures instantly.",
        color: "#0EA5E9",
        colorDark: "#38BDF8",
        bgLight: "#F0F9FF",
        bgDark: "#0A1F2E",
    },
    {
        slug: "finance",
        label: "Finance Tools",
        icon: "ti-calculator",
        description: "Calculate GST, EMI, SIP returns, and more — accurate financial tools for everyone.",
        color: "#F59E0B",
        colorDark: "#FBBF24",
        bgLight: "#FFFBEB",
        bgDark: "#1F1500",
    },
    {
        slug: "resume",
        label: "Resume Tools",
        icon: "ti-file-cv",
        description: "Build, analyze, and optimize your resume with professional templates and AI hints.",
        color: "#145C3C",
        colorDark: "#4CAF82",
        bgLight: "#E8F5EF",
        bgDark: "#0B1F16",
    },
    {
        slug: "social",
        label: "Social Tools",
        icon: "ti-share",
        description: "Generate QR codes, Open Graph previews, meta tags, and social media assets.",
        color: "#EC4899",
        colorDark: "#F472B6",
        bgLight: "#FDF2F8",
        bgDark: "#200A16",
    },
];

export const TOOLS: Tool[] = [
    // PDF — /tools/pdf/[slug]
    {
        slug: "compress-pdf",
        label: "Compress PDF",
        description: "Reduce PDF file size while preserving quality. No uploads required.",
        category: "pdf",
        icon: "ti-file-zip",
        href: "/tools/pdf/compress-pdf",
        badge: "popular",
        tags: ["compress", "reduce", "optimize", "size"],
    },
    {
        slug: "merge-pdf",
        label: "Merge PDF",
        description: "Combine multiple PDF files into one document in seconds.",
        category: "pdf",
        icon: "ti-files",
        href: "/tools/pdf/merge-pdf",
        badge: "popular",
        tags: ["merge", "combine", "join", "pdf"],
    },
    {
        slug: "split-pdf",
        label: "Split PDF",
        description: "Extract pages or split a PDF into multiple separate files.",
        category: "pdf",
        icon: "ti-scissors",
        href: "/tools/pdf/split-pdf",
        tags: ["split", "extract", "pages", "separate"],
    },
    {
        slug: "pdf-to-word",
        label: "PDF to Word",
        description: "Convert PDF documents to editable Word (.docx) files instantly.",
        category: "pdf",
        icon: "ti-file-word",
        href: "/tools/pdf/pdf-to-word",
        tags: ["convert", "word", "docx", "editable"],
    },
    {
        slug: "word-to-pdf",
        label: "Word to PDF",
        description: "Convert Word documents to professional PDF files in one click.",
        category: "pdf",
        icon: "ti-file-type-pdf",
        href: "/tools/pdf/word-to-pdf",
        tags: ["convert", "word", "docx", "pdf"],
    },
    {
        slug: "pdf-to-jpg",
        label: "PDF to JPG",
        description: "Convert each PDF page into a high-quality JPG image.",
        category: "pdf",
        icon: "ti-photo",
        href: "/tools/pdf/pdf-to-jpg",
        tags: ["convert", "image", "jpg", "jpeg"],
    },
    {
        slug: "jpg-to-pdf",
        label: "JPG to PDF",
        description: "Combine one or more JPG images into a single PDF document.",
        category: "pdf",
        icon: "ti-file-plus",
        href: "/tools/pdf/jpg-to-pdf",
        tags: ["convert", "image", "jpg", "create"],
    },
    {
        slug: "rotate-pdf",
        label: "Rotate PDF",
        description: "Rotate pages in your PDF to the correct orientation.",
        category: "pdf",
        icon: "ti-rotate",
        href: "/tools/pdf/rotate-pdf",
        tags: ["rotate", "orientation", "pages"],
    },

    // Image — /tools/image/[slug]
    {
        slug: "image-compress",
        label: "Image Compressor",
        description: "Compress JPG, PNG, and WebP images without visible quality loss.",
        category: "image",
        icon: "ti-photo-down",
        href: "/tools/image/image-compress",
        badge: "popular",
        tags: ["compress", "optimize", "jpg", "png", "webp"],
    },
    {
        slug: "image-resize",
        label: "Image Resizer",
        description: "Resize images to exact dimensions while preserving aspect ratio.",
        category: "image",
        icon: "ti-arrow-autofit-content",
        href: "/tools/image/image-resize",
        tags: ["resize", "dimensions", "scale"],
    },
    {
        slug: "image-convert",
        label: "Image Converter",
        description: "Convert between JPG, PNG, WebP, AVIF, and GIF formats.",
        category: "image",
        icon: "ti-refresh",
        href: "/tools/image/image-convert",
        tags: ["convert", "format", "jpg", "png", "webp", "avif"],
    },
    {
        slug: "image-crop",
        label: "Image Cropper",
        description: "Crop images to any size or aspect ratio with a visual editor.",
        category: "image",
        icon: "ti-crop",
        href: "/tools/image/image-crop",
        tags: ["crop", "trim", "aspect ratio"],
    },
    {
        slug: "remove-bg",
        label: "Remove Background",
        description: "Remove image backgrounds instantly with AI-powered detection.",
        category: "image",
        icon: "ti-eraser",
        href: "/tools/image/remove-bg",
        badge: "new",
        tags: ["background", "remove", "transparent", "ai"],
    },
    {
        slug: "image-to-base64",
        label: "Image to Base64",
        description: "Encode any image to a Base64 string for use in HTML or CSS.",
        category: "image",
        icon: "ti-binary",
        href: "/tools/image/image-to-base64",
        tags: ["base64", "encode", "data url"],
    },
    {
        slug: "favicon-generator",
        label: "Favicon Generator",
        description: "Generate favicons in all required sizes from a single image.",
        category: "image",
        icon: "ti-star",
        href: "/tools/image/favicon-generator",
        tags: ["favicon", "icon", "browser", "tab"],
    },

    // Developer — /tools/dev/[slug]
    {
        slug: "json-formatter",
        label: "JSON Formatter",
        description: "Format, validate, and minify JSON with syntax highlighting.",
        category: "dev",
        icon: "ti-braces",
        href: "/tools/dev/json-formatter",
        badge: "popular",
        tags: ["json", "format", "validate", "minify"],
    },
    {
        slug: "base64",
        label: "Base64 Encoder/Decoder",
        description: "Encode and decode Base64 strings instantly in your browser.",
        category: "dev",
        icon: "ti-binary",
        href: "/tools/dev/base64",
        tags: ["base64", "encode", "decode"],
    },
    {
        slug: "url-encoder",
        label: "URL Encoder/Decoder",
        description: "Encode special characters in URLs or decode encoded URL strings.",
        category: "dev",
        icon: "ti-link",
        href: "/tools/dev/url-encoder",
        tags: ["url", "encode", "decode", "percent"],
    },
    {
        slug: "regex-tester",
        label: "Regex Tester",
        description: "Write, test, and debug regular expressions with live match highlighting.",
        category: "dev",
        icon: "ti-regex",
        href: "/tools/dev/regex-tester",
        badge: "new",
        tags: ["regex", "regexp", "pattern", "match"],
    },
    {
        slug: "color-converter",
        label: "Color Converter",
        description: "Convert between HEX, RGB, HSL, and HSB color formats.",
        category: "dev",
        icon: "ti-palette",
        href: "/tools/dev/color-converter",
        tags: ["color", "hex", "rgb", "hsl", "convert"],
    },
    {
        slug: "css-minifier",
        label: "CSS Minifier",
        description: "Minify and compress CSS code for production builds.",
        category: "dev",
        icon: "ti-brand-css3",
        href: "/tools/dev/css-minifier",
        tags: ["css", "minify", "compress", "optimize"],
    },
    {
        slug: "js-minifier",
        label: "JS Minifier",
        description: "Minify JavaScript files to reduce bundle size.",
        category: "dev",
        icon: "ti-brand-javascript",
        href: "/tools/dev/js-minifier",
        tags: ["javascript", "js", "minify", "compress"],
    },
    {
        slug: "html-formatter",
        label: "HTML Formatter",
        description: "Beautify or minify HTML markup with one click.",
        category: "dev",
        icon: "ti-brand-html5",
        href: "/tools/dev/html-formatter",
        tags: ["html", "format", "beautify", "minify"],
    },
    {
        slug: "uuid-generator",
        label: "UUID Generator",
        description: "Generate v1, v4, or v5 UUIDs for your projects instantly.",
        category: "dev",
        icon: "ti-fingerprint",
        href: "/tools/dev/uuid-generator",
        tags: ["uuid", "guid", "generate", "unique"],
    },

    // Finance — /tools/finance/[slug]
    {
        slug: "gst-calculator",
        label: "GST Calculator",
        description: "Calculate GST-inclusive or exclusive prices for any tax rate.",
        category: "finance",
        icon: "ti-receipt-tax",
        href: "/tools/finance/gst-calculator",
        badge: "popular",
        tags: ["gst", "tax", "india", "calculate"],
    },
    {
        slug: "emi-calculator",
        label: "EMI Calculator",
        description: "Calculate monthly loan installments with amortization schedule.",
        category: "finance",
        icon: "ti-credit-card",
        href: "/tools/finance/emi-calculator",
        tags: ["emi", "loan", "mortgage", "installment"],
    },
    {
        slug: "sip-calculator",
        label: "SIP Calculator",
        description: "Estimate returns on your Systematic Investment Plan over time.",
        category: "finance",
        icon: "ti-chart-line",
        href: "/tools/finance/sip-calculator",
        badge: "popular",
        tags: ["sip", "investment", "mutual fund", "returns"],
    },
    {
        slug: "compound-interest",
        label: "Compound Interest",
        description: "Calculate compound interest with flexible compounding frequencies.",
        category: "finance",
        icon: "ti-trending-up",
        href: "/tools/finance/compound-interest",
        tags: ["compound", "interest", "invest", "growth"],
    },
    {
        slug: "currency-converter",
        label: "Currency Converter",
        description: "Convert between 170+ currencies with live exchange rates.",
        category: "finance",
        icon: "ti-currency-dollar",
        href: "/tools/finance/currency-converter",
        tags: ["currency", "forex", "exchange", "convert"],
    },
    {
        slug: "salary-calculator",
        label: "Salary Calculator",
        description: "Calculate take-home pay after tax deductions and allowances.",
        category: "finance",
        icon: "ti-wallet",
        href: "/tools/finance/salary-calculator",
        tags: ["salary", "pay", "tax", "ctc", "income"],
    },
    {
        slug: "discount-calculator",
        label: "Discount Calculator",
        description: "Find discounted prices, savings amounts, and discount percentages.",
        category: "finance",
        icon: "ti-tag",
        href: "/tools/finance/discount-calculator",
        tags: ["discount", "sale", "percentage", "saving"],
    },
    {
        slug: "percentage-calculator",
        label: "Percentage Calculator",
        description: "Calculate percentages, percentage change, and percentage of totals.",
        category: "finance",
        icon: "ti-percentage",
        href: "/tools/finance/percentage-calculator",
        tags: ["percentage", "percent", "ratio", "calculate"],
    },

    // Resume — /tools/resume/[slug]
    {
        slug: "resume-builder",
        label: "Resume Builder",
        description: "Build a professional resume with ATS-friendly templates and export to PDF.",
        category: "resume",
        icon: "ti-file-cv",
        href: "/tools/resume/resume-builder",
        badge: "popular",
        tags: ["resume", "cv", "build", "template", "ats"],
    },
    {
        slug: "resume-checker",
        label: "ATS Resume Checker",
        description: "Analyze your resume for ATS compatibility and get actionable suggestions.",
        category: "resume",
        icon: "ti-checkup-list",
        href: "/tools/resume/resume-checker",
        badge: "new",
        tags: ["ats", "check", "analyze", "score", "resume"],
    },
    {
        slug: "cover-letter",
        label: "Cover Letter Builder",
        description: "Write a compelling cover letter with guided prompts and templates.",
        category: "resume",
        icon: "ti-mail",
        href: "/tools/resume/cover-letter",
        tags: ["cover letter", "job", "application", "template"],
    },
    {
        slug: "linkedin-summary",
        label: "LinkedIn Summary Generator",
        description: "Generate a professional LinkedIn About section that gets noticed.",
        category: "resume",
        icon: "ti-brand-linkedin",
        href: "/tools/resume/linkedin-summary",
        tags: ["linkedin", "summary", "about", "profile"],
    },

    // Social — /tools/social/[slug]
    {
        slug: "qr-generator",
        label: "QR Code Generator",
        description: "Generate custom QR codes for URLs, text, WiFi, and vCards.",
        category: "social",
        icon: "ti-qrcode",
        href: "/tools/social/qr-generator",
        badge: "popular",
        tags: ["qr", "qrcode", "barcode", "generate"],
    },
    {
        slug: "og-preview",
        label: "OG Image Preview",
        description: "Preview how your page looks when shared on social media platforms.",
        category: "social",
        icon: "ti-eye",
        href: "/tools/social/og-preview",
        tags: ["og", "opengraph", "social", "preview", "meta"],
    },
    {
        slug: "meta-tag-generator",
        label: "Meta Tag Generator",
        description: "Generate SEO meta tags, Open Graph, and Twitter Card markup.",
        category: "social",
        icon: "ti-tags",
        href: "/tools/social/meta-tag-generator",
        tags: ["meta", "seo", "opengraph", "twitter", "tags"],
    },
    {
        slug: "hashtag-generator",
        label: "Hashtag Generator",
        description: "Generate relevant hashtags for Instagram, Twitter, and LinkedIn.",
        category: "social",
        icon: "ti-hash",
        href: "/tools/social/hashtag-generator",
        badge: "new",
        tags: ["hashtag", "instagram", "twitter", "social"],
    },
    {
        slug: "tweet-generator",
        label: "Tweet Card Generator",
        description: "Create beautiful tweet screenshot cards to share across platforms.",
        category: "social",
        icon: "ti-brand-twitter",
        href: "/tools/social/tweet-generator",
        tags: ["tweet", "twitter", "card", "screenshot", "share"],
    },
];

export const CATEGORIES: CategoryWithCount[] = BASE_CATEGORIES.map((cat) => ({
    ...cat,
    count: TOOLS.filter((t) => t.category === cat.slug).length,
}));

export function getCategoryBySlug(slug: string): CategoryWithCount | undefined {
    return CATEGORIES.find((c) => c.slug === slug);
}

export function getToolsByCategory(categorySlug: string): Tool[] {
    return TOOLS.filter((t) => t.category === categorySlug);
}

export function getToolBySlug(categorySlug: string, toolSlug: string): Tool | undefined {
    return TOOLS.find((t) => t.category === categorySlug && t.slug === toolSlug);
}

export function getAllTools(): Tool[] {
    return TOOLS;
}

export function getCategoryCount(slug: string): number {
    return TOOLS.filter((t) => t.category === slug).length;
}