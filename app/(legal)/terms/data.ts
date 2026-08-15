// app/(legal)/terms/data.ts

export const effectiveDate = "August 13, 2026";
export const lastUpdated = "August 13, 2026";

export const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: "ti-check-circle",
    summary: "Understand what it means to accept our Terms of Service and how updates work.",
    content: `By accessing and using Toolverse ("the Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.

We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.`,
  },
  {
    id: "description",
    title: "Description of Service",
    icon: "ti-apps",
    summary: "Learn about the tools and services we offer and how they work.",
    content: `Toolverse provides browser-based productivity tools for PDF manipulation, image processing, development utilities, financial calculations, resume building, and social media content creation.

<strong>All tools run client-side</strong> in your browser. We do not upload, store, or process your files on our servers. The Service is provided "as is" without warranties of any kind.`,
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    icon: "ti-user-check",
    summary: "Learn about your responsibilities when using Toolverse.",
    content: `You agree to:

<strong>Use the Service legally.</strong> Don't use our tools to process illegal content, violate copyrights, or harm others.

<strong>Respect resource limits.</strong> While we don't impose artificial file size limits, processing large files consumes your device's resources. Use reasonable judgment.

<strong>Not reverse engineer.</strong> You may not attempt to extract, decompile, or reverse engineer the Service's code, except as permitted by open-source licenses.

<strong>Not automate abuse.</strong> Don't use bots, scrapers, or automated tools to overload or abuse the Service.`,
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: "ti-copyright",
    summary: "Understand intellectual property rights related to Toolverse and your content.",
    content: `<strong>Our IP.</strong> Toolverse's design, code, branding, and content are owned by Toolverse or our licensors and protected by copyright, trademark, and other intellectual property laws.

<strong>Your IP.</strong> You retain all rights to the files and content you process using our tools. We don't claim ownership over your data.

<strong>Open Source.</strong> Parts of Toolverse are open-source and governed by their respective licenses (MIT, Apache, etc.). See our GitHub repository for details.`,
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    icon: "ti-shield-lock",
    summary: "Learn about our privacy practices and how we handle your data.",
    content: `Your privacy is critical to us. Please review our <strong>Privacy Policy</strong> to understand how we handle data (spoiler: we don't collect it).

Since all processing is client-side, <strong>we never have access to your files</strong>. This means we can't assist with data recovery if you lose work before downloading the output.`,
  },
  {
    id: "disclaimers",
    title: "Disclaimers & Limitations",
    icon: "ti-alert-triangle",
    summary: "Understand the limitations and disclaimers of using Toolverse.",
    content: `<strong>No Warranties.</strong> The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.

<strong>No Guarantees.</strong> We don't guarantee that the Service will be uninterrupted, error-free, or secure. Tools may produce unexpected results.

<strong>Use at Your Own Risk.</strong> You're responsible for backing up important files before processing them. We're not liable for data loss, corruption, or any damages arising from your use of the Service.`,
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    icon: "ti-scale",
    summary: "Understand the limits of our liability when you use Toolverse.",
    content: `To the fullest extent permitted by law, Toolverse and its operators shall not be liable for:

- <strong>Direct, indirect, incidental, or consequential damages</strong> arising from your use of the Service
- <strong>Data loss, corruption, or security breaches</strong>
- <strong>Downtime or service interruptions</strong>
- <strong>Third-party actions</strong> (e.g., if you share processed files and they're misused)

<strong>Maximum Liability.</strong> In any case, our total liability shall not exceed $100 USD.`,
  },
  {
    id: "indemnification",
    title: "Indemnification",
    icon: "ti-shield-check",
    summary: "Learn about your responsibility to indemnify Toolverse when using our service.",
    content: `You agree to indemnify and hold harmless Toolverse, its operators, contributors, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your violation of any third-party rights (e.g., copyright infringement)`,
  },
  {
    id: "termination",
    title: "Termination",
    icon: "ti-logout",
    summary: "Understand how and when your access to Toolverse may be terminated.",
    content: `We reserve the right to suspend or terminate your access to the Service at any time, for any reason, without notice.

You may stop using the Service at any time. Since we don't require accounts, "termination" simply means clearing your browser's local storage.`,
  },
  {
    id: "governing-law",
    title: "Governing Law",
    icon: "ti-gavel",
    summary: "Understand which laws govern our Terms of Service and where disputes are resolved.",
    content: `These Terms are governed by the laws of the Republic of India, without regard to conflict of law principles.

Any disputes shall be resolved in the courts of India. By using the Service, you consent to this jurisdiction.`,
  },
  {
    id: "severability",
    title: "Severability",
    icon: "ti-dots",
    summary: "Learn how we handle invalid provisions in our Terms of Service.",
    content: `If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force.`,
  },
  {
    id: "contact",
    title: "Contact Information",
    icon: "ti-mail",
    summary: "Get in touch with us if you have questions about our Terms of Service.",
    content: `For questions about these Terms, please contact us:

<strong>Email:</strong> hello@toolverse.app<br />
<strong>GitHub:</strong> github.com/srinathnulidonda/toolverse/issues<br />
<strong>Twitter:</strong> @toolverse`,
  },
];
