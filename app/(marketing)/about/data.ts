// app/(marketing)/about/data.ts

export const values = [
  {
    icon: "ti-shield-check",
    title: "Privacy First",
    description:
      "Your files never leave your device. Every tool runs entirely in your browser using client-side processing with WebAssembly and modern JavaScript APIs.",
    tag: "Core Value",
  },
  {
    icon: "ti-bolt",
    title: "Blazing Fast",
    description:
      "No server uploads or queues. Process files instantly with WebAssembly-powered engines delivering desktop-grade performance in your browser.",
    tag: "Performance",
  },
  {
    icon: "ti-accessible",
    title: "Accessible to All",
    description:
      "Built with WCAG 2.1 AA compliance. Full keyboard navigation, screen reader support, and semantic HTML ensure everyone can use our tools.",
    tag: "Inclusive",
  },
  {
    icon: "ti-code",
    title: "Open & Transparent",
    description:
      "100% open-source codebase. No tracking scripts, no analytics cookies, no dark patterns. Audit our code anytime on GitHub.",
    tag: "Open Source",
  },
  {
    icon: "ti-world",
    title: "Works Everywhere",
    description:
      "Responsive design tested on all devices. Works offline as a PWA once loaded. Support for all modern browsers including mobile.",
    tag: "Universal",
  },
  {
    icon: "ti-heart",
    title: "Built with Care",
    description:
      "Every detail matters—from typography to error messages. We obsess over UX so you can focus on your work without friction.",
    tag: "Craftsmanship",
  },
];

export const useCases = [
  {
    icon: "ti-code",
    title: "Developers",
    description:
      "Format JSON, encode Base64, generate UUIDs, test regex patterns, and validate code—all without leaving your workflow.",
    tools: ["JSON Formatter", "Base64 Encoder", "Hash Generator", "Regex Tester"],
  },
  {
    icon: "ti-palette",
    title: "Designers",
    description:
      "Compress images, convert formats, remove backgrounds, and generate favicons—preserving quality while reducing file sizes.",
    tools: ["Image Compressor", "Format Converter", "Background Remover", "Favicon Generator"],
  },
  {
    icon: "ti-briefcase",
    title: "Business Professionals",
    description:
      "Merge PDFs, calculate GST, generate invoices, and build resumes—all with professional results and complete privacy.",
    tools: ["PDF Merger", "GST Calculator", "Invoice Generator", "Resume Builder"],
  },
  {
    icon: "ti-school",
    title: "Students & Educators",
    description:
      "Split PDFs, compress files, convert documents, and organize study materials—without account requirements or fees.",
    tools: ["PDF Splitter", "File Compressor", "Document Converter", "QR Generator"],
  },
  {
    icon: "ti-chart-line",
    title: "Finance Teams",
    description:
      "Calculate EMI, track ITC, compute SIP returns, and generate reports—with accurate, compliant calculations.",
    tools: ["EMI Calculator", "ITC Calculator", "SIP Calculator", "GST Tools"],
  },
  {
    icon: "ti-users",
    title: "Marketing Teams",
    description:
      "Generate QR codes, create meta tags, preview social cards, and optimize images—streamlining your marketing workflow.",
    tools: ["QR Generator", "Meta Tag Generator", "OG Preview", "Image Optimizer"],
  },
];

export const features = [
  { name: "Privacy Protection", toolverse: true, others: false },
  { name: "No Account Required", toolverse: true, others: false },
  { name: "Unlimited Usage", toolverse: true, others: "Limited" },
  { name: "File Size Limits", toolverse: "None", others: "10-50 MB" },
  { name: "Processing Speed", toolverse: "Instant", others: "Queue-based" },
  { name: "Offline Support", toolverse: true, others: false },
  { name: "Open Source", toolverse: true, others: false },
  { name: "Cost", toolverse: "Free Forever", others: "Freemium" },
  { name: "Data Collection", toolverse: "Zero", others: "Extensive" },
  { name: "Ads", toolverse: false, others: true },
];

export const widgetFeatures = [
  { icon: "ti-checklist", text: "Tasks with priority levels and quick search" },
  { icon: "ti-notes", text: "Rich notes and checklists with autosave" },
  { icon: "ti-arrows-move", text: "Draggable widget available on every page" },
  { icon: "ti-command", text: "Press ⌘K / Ctrl+K to open instantly" },
  { icon: "ti-device-floppy", text: "Stored locally — nothing synced to servers" },
];