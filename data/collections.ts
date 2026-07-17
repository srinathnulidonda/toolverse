// data/collections.ts
export type Collection = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  tools: string[]; // tool slugs
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "student",
    title: "Student Toolkit",
    description: "Essential tools for students and academic work",
    icon: "ti-school",
    tools: ["compress-pdf", "merge-pdf", "image-compress", "resume-builder"],
  },
  {
    slug: "developer",
    title: "Developer Toolkit",
    description: "Tools for developers and programmers",
    icon: "ti-code",
    tools: ["json-formatter", "base64", "regex-tester", "color-converter"],
  },
  {
    slug: "creator",
    title: "Creator Toolkit",
    description: "Tools for content creators and designers",
    icon: "ti-palette",
    tools: ["image-compress", "remove-bg", "qr-generator", "og-preview"],
  },
  {
    slug: "business",
    title: "Business Toolkit",
    description: "Tools for business professionals",
    icon: "ti-building",
    tools: ["gst-calculator", "currency-converter", "resume-builder", "meta-tag-generator"],
  },
];
