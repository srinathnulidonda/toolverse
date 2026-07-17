// app/(marketing)/faq/data.ts
export const categories = [
  { id: "all", label: "All Questions", icon: "ti-layout-grid", count: 15 },
  { id: "general", label: "General", icon: "ti-help-circle", count: 4 },
  { id: "privacy", label: "Privacy & Security", icon: "ti-shield-lock", count: 3 },
  { id: "tools", label: "Tools & Features", icon: "ti-tool", count: 3 },
  { id: "technical", label: "Technical", icon: "ti-code", count: 5 },
];

export const faqs = [
  {
    category: "general",
    question: "What is Toolverse?",
    answer:
      "Toolverse is a collection of 51+ privacy-first productivity tools that run entirely in your browser. No sign-ups, no uploads, no limits—just instant access to tools for PDF, images, finance, development, and more.",
  },
  {
    category: "general",
    question: "Is Toolverse really free?",
    answer:
      "Yes! Toolverse is 100% free and will remain so forever. We believe essential productivity tools should be accessible to everyone without paywalls or subscription fees.",
  },
  {
    category: "general",
    question: "Do I need to create an account?",
    answer:
      "No account needed. All tools are instantly accessible without any sign-up process. Just visit, pick a tool, and start working.",
  },
  {
    category: "privacy",
    question: "Are my files uploaded to your servers?",
    answer:
      "No. All processing happens locally in your browser using JavaScript and WebAssembly. Your files never leave your device, ensuring complete privacy and security.",
  },
  {
    category: "privacy",
    question: "Do you track user activity?",
    answer:
      "We respect your privacy. We don't use analytics cookies, tracking pixels, or third-party scripts. Your usage remains completely private.",
  },
  {
    category: "privacy",
    question: "Can I use Toolverse offline?",
    answer:
      "Yes! Once loaded, many tools work offline as Progressive Web Apps (PWAs). You can install Toolverse to your device and use it without an internet connection.",
  },
  {
    category: "tools",
    question: "How many tools are available?",
    answer:
      "We currently offer 51+ tools across 6 categories: PDF (8 tools), Images (7 tools), Developer (18 tools), Finance (8 tools), Resume (4 tools), and Social (5 tools). We're constantly adding more based on community feedback.",
  },
  {
    category: "tools",
    question: "Can I request a new tool?",
    answer:
      "Absolutely! We prioritize feature requests from our community. Contact us via email, GitHub issues, or Twitter with your suggestions.",
  },
  {
    category: "tools",
    question: "Are there file size limits?",
    answer:
      "Processing happens in your browser, so limits depend on your device's memory. Most modern devices can handle files up to several hundred MB without issues.",
  },
  {
    category: "technical",
    question: "Which browsers are supported?",
    answer:
      "Toolverse works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.",
  },
  {
    category: "technical",
    question: "Is Toolverse mobile-friendly?",
    answer:
      "Yes! Our responsive design works seamlessly on desktop, tablet, and mobile devices. Some tools may have limited functionality on older mobile browsers.",
  },
  {
    category: "technical",
    question: "Is the code open source?",
    answer:
      "Yes! Toolverse is open source and available on GitHub. You can review the code, contribute improvements, or self-host if needed.",
  },
  {
    category: "technical",
    question: "Can I integrate Toolverse into my app?",
    answer:
      "Since all tools run client-side, you can embed or integrate them into your projects. Check our GitHub repository for documentation and examples.",
  },
  {
    category: "general",
    question: "How do you make money if it's free?",
    answer:
      "Currently, Toolverse is a passion project. We may explore ethical monetization (like optional donations) in the future, but all core tools will always remain free.",
  },
  {
    category: "technical",
    question: "What if I encounter a bug?",
    answer:
      "Please report bugs via GitHub Issues or contact us directly. We actively monitor and fix issues to ensure a smooth experience for all users.",
  },
];
