// data/categories.ts
import { TOOLS } from "./tools";
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

export const CATEGORIES: Category[] = [
  {
    slug: "pdf",
    label: "PDF Tools",
    icon: "ti-file-text",
    description:
      "Compress, merge, split, convert — everything PDF, processed entirely in your browser.",
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
    description:
      "Calculate GST, EMI, SIP returns, and more — accurate financial tools for everyone.",
    color: "#F59E0B",
    colorDark: "#FBBF24",
    bgLight: "#FFFBEB",
    bgDark: "#1F1500",
  },
  {
    slug: "resume",
    label: "Resume Tools",
    icon: "ti-file-cv",
    description:
      "Build, analyze, and optimize your resume with professional templates and AI hints.",
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

export type CategoryWithCount = Category & {
  count: number;
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function getCategoriesWithCount(): CategoryWithCount[] {
  return CATEGORIES.map((cat) => ({
    ...cat,
    count: TOOLS.filter((t) => t.category === cat.slug).length,
  }));
}
