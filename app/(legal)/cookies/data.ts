// app/(legal)/cookies/data.ts

export const effectiveDate = "August 13, 2026";
export const lastUpdated = "August 13, 2026";

export const sections = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies",
    icon: "ti-cookie",
    summary: "Learn what cookies are, how Toolverse uses them, and your options for managing them.",
    content: `Cookies are small text files that websites store on your device when you visit them. They help websites remember information about your visit, like your preferences and actions.

<strong>Essential vs. Non-essential cookies.</strong> Some cookies are essential for the website to function (like remembering items in a shopping cart), while others are used for analytics, advertising, or personalization.

Since Toolverse processes everything locally in your browser, we use very few cookies compared to typical websites.`,
  },
  {
    id: "how-we-use-cookies",
    title: "How We Use Cookies",
    icon: "ti-settings",
    summary: "Discover how Toolverse uses cookies and why we prefer localStorage for storing your preferences.",
    content: `<strong>We use minimal cookies.</strong> Toolverse only uses essential cookies required for the website to function properly. We don't use tracking cookies, analytics cookies, or advertising cookies.

<strong>Local Storage instead of cookies.</strong> For storing your preferences (like recent tools, pinned shortcuts, and tasks), we use your browser's localStorage instead of cookies. This data stays on your device and never leaves your browser.

<strong>No cross-site tracking.</strong> We don't use cookies to track you across other websites or build advertising profiles.`,
  },
  {
    id: "types-of-cookies",
    title: "Types of Cookies We Use",
    icon: "ti-list",
    summary: "Understand the different types of cookies Toolverse may use and which ones we avoid.",
    content: `<strong>Session Cookies.</strong> These are temporary cookies that expire when you close your browser. They help maintain your session while using Toolverse.

<strong>Security Cookies.</strong> We may use cookies to protect against security threats and ensure the integrity of our service.

<strong>Functionality Cookies.</strong> These remember your preferences and settings to improve your experience on future visits.

We do <strong>not</strong> use: Analytics cookies, advertising cookies, social media cookies, or third-party tracking cookies.`,
  },
  {
    id: "managing-cookies",
    title: "Managing Cookies",
    icon: "ti-adjustments",
    summary: "Learn how to manage and control cookies in your browser for optimal privacy.",
    content: `<strong>Browser settings.</strong> You can control cookies through your browser settings. Most browsers allow you to view, delete, and block cookies from specific websites.

<strong>Disabling cookies.</strong> You can disable cookies entirely, but this may affect the functionality of Toolverse and other websites you visit.

<strong>Clear data.</strong> You can clear all cookies and local storage data at any time through your browser's privacy settings.

<strong>Selective control.</strong> Modern browsers allow you to accept some cookies while blocking others, giving you granular control over your privacy.`,
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    icon: "ti-external-link",
    summary: "Understand our approach to third-party cookies and external tracking services.",
    content: `<strong>We don't use third-party cookies.</strong> Toolverse doesn't embed third-party analytics, advertising, or social media scripts that would set cookies from other domains.

<strong>No external tracking.</strong> We don't use Google Analytics, Facebook Pixel, or similar tracking services that rely on cookies.

<strong>Self-hosted resources.</strong> All fonts, icons, and scripts are served from our own domain or from privacy-respecting CDNs that don't track users.`,
  },
  {
    id: "cookie-consent",
    title: "Cookie Consent",
    icon: "ti-check-circle",
    summary: "Learn about our cookie consent approach and why we don't use intrusive banners.",
    content: `<strong>Implied consent.</strong> By using Toolverse, you consent to our use of essential cookies as described in this policy.

<strong>No cookie banners.</strong> Since we only use essential cookies and don't track users, we don't show intrusive cookie consent banners that interrupt your experience.

<strong>Transparency.</strong> We believe in clear, upfront disclosure about our cookie practices rather than hiding behind legal jargon.`,
  },
  {
    id: "legal-basis",
    title: "Legal Basis",
    icon: "ti-scale",
    summary: "Understand our legal basis for processing cookies under GDPR and CCPA.",
    content: `<strong>GDPR compliance.</strong> Under GDPR, we process cookies based on legitimate interest for essential website functionality and your consent for any non-essential cookies.

<strong>CCPA compliance.</strong> California residents have the right to know about and control the personal information collected through cookies.

<strong>Minimal data collection.</strong> Our privacy-by-design approach means we collect the minimum data necessary to provide our service.`,
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    icon: "ti-refresh",
    summary: "Learn how we update our cookie policy and how you can stay informed about changes.",
    content: `We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. When we do, we'll update the "Last Updated" date at the top of this page.

<strong>Notification of changes.</strong> Significant changes will be announced on our homepage or via our social media channels.

<strong>Review regularly.</strong> We encourage you to review this policy periodically to stay informed about how we use cookies.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: "ti-mail",
    summary: "Get in touch with us if you have questions about our cookie policy.",
    content: `If you have questions about our use of cookies or this Cookie Policy, please contact us:

<strong>Email:</strong> hello@toolverse.app<br />
<strong>GitHub:</strong> github.com/srinathnulidonda/toolverse/issues<br />
<strong>Twitter:</strong> @toolverse

We'll respond to all inquiries within 48 hours.`,
  },
];
