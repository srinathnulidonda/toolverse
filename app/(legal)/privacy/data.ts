//app/(legal)/privacy/data.ts

export const effectiveDate = "August 13, 2026";
export const lastUpdated = "August 13, 2026";

export const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: "ti-info-circle",
    summary: "Learn about our privacy-first approach and what data we collect (or don't collect).",
    content: `Toolverse is built on a simple principle: your data belongs to you. Unlike traditional online tools, we process everything locally in your browser using client-side JavaScript and WebAssembly. This means your files, text, and data never leave your device.

This Privacy Policy explains our data practices (or lack thereof) in detail. By using Toolverse, you agree to the terms outlined below.`,
  },
  {
    id: "data-processing",
    title: "How We Process Your Data",
    icon: "ti-cpu",
    summary: "Understand how we process your data and why we keep everything local.",
    content: `<strong>All processing is local.</strong> When you use any tool on Toolverse—whether compressing a PDF, resizing an image, or formatting JSON—the processing happens entirely in your browser. Your files are never uploaded to our servers or any third-party service.

<strong>No server-side storage.</strong> We don't store, log, or have access to the content you process. Once you close your browser tab, all data is permanently deleted from your device's memory.

<strong>No tracking or analytics.</strong> We don't use Google Analytics, Facebook Pixel, or any other tracking scripts. We don't collect IP addresses, browser fingerprints, or behavioral data.`,
  },
  {
    id: "local-storage",
    title: "Local Storage & Cookies",
    icon: "ti-database",
    summary: "Learn how we use localStorage to save your preferences without compromising privacy.",
    content: `We use your browser's <strong>localStorage</strong> to save certain preferences locally on your device:

- <strong>Recent Tools:</strong> The tools you've recently used (stored as tool IDs only)
- <strong>Pinned Tools:</strong> Your pinned shortcuts in the Quick Access panel
- <strong>Tasks:</strong> Your to-do list items in the Today's Tasks widget

This data is stored <strong>only on your device</strong> and never synchronized to our servers. You can clear it anytime by clearing your browser's local storage or using the "Clear" buttons in the respective tools.

We do not use cookies for tracking or advertising purposes.`,
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    icon: "ti-share",
    summary: "Understand our approach to third-party services and data sharing.",
    content: `<strong>We don't share your data</strong> with third parties because we never have access to it in the first place.

<strong>External Links:</strong> Toolverse may contain links to external websites (like our GitHub repository or social media profiles). These third-party sites have their own privacy policies, which we encourage you to review.

<strong>No Third-Party Scripts:</strong> We don't embed third-party analytics, advertising, or tracking scripts from Google, Facebook, or any other service.`,
  },
  {
    id: "security",
    title: "Security",
    icon: "ti-shield-lock",
    summary: "Learn about our security measures and why client-side processing enhances your privacy.",
    content: `<strong>HTTPS Encryption:</strong> All connections to Toolverse use HTTPS encryption to protect data in transit.

<strong>Client-Side Processing:</strong> Since all processing happens in your browser, there's no server-side vulnerability that could expose your files.

<strong>Open Source:</strong> Our codebase is publicly available on GitHub, allowing security researchers and users to audit our code for vulnerabilities.

While we implement industry-standard security measures, no system is 100% secure. Use Toolverse at your own discretion.`,
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    icon: "ti-users",
    summary: "Understand our commitment to protecting children's privacy online.",
    content: `Toolverse is a general-audience tool and not specifically designed for children under 13. We don't knowingly collect personal information from children. If you're a parent or guardian and believe your child has provided us with personal information, please contact us immediately.`,
  },
  {
    id: "international-users",
    title: "International Users",
    icon: "ti-world",
    summary: "Learn about our approach to international users and data protection regulations.",
    content: `Toolverse is hosted on servers that may be located in various countries. However, since all processing happens locally in your browser, your data doesn't cross borders.

If you're in the EU, you have rights under GDPR including data access, rectification, and deletion. Since we don't collect or store your data, these rights are automatically fulfilled.`,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    icon: "ti-refresh",
    summary: "Understand how we handle updates to our privacy policy and how you'll be notified.",
    content: `We may update this Privacy Policy from time to time. When we do, we'll update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically.

Significant changes will be announced on our homepage or via our social media channels.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: "ti-mail",
    summary: "Get in touch with us if you have questions about our privacy practices.",
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

<strong>Email:</strong> srinathnulidonda.dev@gmail.com<br />
<strong>GitHub:</strong> github.com/srinathnulidonda/toolverse/issues<br />
<strong>Twitter:</strong> @toolverse

We'll respond to all inquiries within 48 hours.`,
  },
];
