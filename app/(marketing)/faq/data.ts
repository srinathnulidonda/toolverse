// app/(marketing)/faq/data.ts
import { FAQ_COMPANY_INFO, FAQ_DATES, FAQ_CONTACT_INFO, TOOL_STATS } from '../constants';

export const categories = [
  { id: "all", label: "All Questions", icon: "ti-layout-grid", count: TOOL_STATS.totalTools },
  { id: "general", label: "General", icon: "ti-help-circle", count: 4 },
  { id: "privacy", label: "Privacy & Security", icon: "ti-shield-lock", count: 3 },
  { id: "tools", label: "Tools & Features", icon: "ti-tool", count: 3 },
  { id: "technical", label: "Technical", icon: "ti-code", count: 5 },
];

// Helper function to generate schema.org FAQPage JSON-LD markup
export const generateFAQSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question.replace(/<[^>]*>/g, ''),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>/g, '')
      }
    }))
  };
};

export const faqs = [
  {
    category: "general",
    question: "What is Toolverse?",
    answer:
      "<strong>Toolverse is a collection of 51+ privacy-first productivity tools that run entirely in your browser.</strong> No sign-ups, no uploads, no limits—just instant access to tools for PDF, images, finance, development, and more.",
  },
  {
    category: "general",
    question: "Is Toolverse really free?",
    answer:
      "<strong>Yes! Toolverse is 100% free and will remain so forever.</strong> We believe essential productivity tools should be accessible to everyone without paywalls or subscription fees.",
  },
  {
    category: "general",
    question: "Do I need to create an account?",
    answer:
      "<strong>No account needed.</strong> All tools are instantly accessible without any sign-up process. Just visit, pick a tool, and start working.",
  },
  {
    category: "privacy",
    question: "Are my files uploaded to your servers?",
    answer:
      "<strong>No.</strong> All processing happens locally in your browser using JavaScript and WebAssembly. Your files never leave your device, ensuring complete privacy and security.",
  },
  {
    category: "privacy",
    question: "Do you track user activity?",
    answer:
      "<strong>We respect your privacy.</strong> We don't use analytics cookies, tracking pixels, or third-party scripts. Your usage remains completely private.",
  },
  {
    category: "privacy",
    question: "Can I use Toolverse offline?",
    answer:
      "<strong>Yes!</strong> Once loaded, many tools work offline as Progressive Web Apps (PWAs). You can install Toolverse to your device and use it without an internet connection.",
  },
  {
    category: "tools",
    question: "How many tools are available?",
    answer:
      `<strong>We currently offer ${TOOL_STATS.totalTools}+ tools across 6 categories:</strong> PDF (${TOOL_STATS.categories.pdf} tools), Images (${TOOL_STATS.categories.images} tools), Developer (${TOOL_STATS.categories.developer} tools), Finance (${TOOL_STATS.categories.finance} tools), Resume (${TOOL_STATS.categories.resume} tools), and Social (${TOOL_STATS.categories.social} tools). We're constantly adding more based on community feedback.`,
  },
  {
    category: "tools",
    question: "Can I request a new tool?",
    answer:
      "<strong>Absolutely!</strong> We prioritize feature requests from our community. Contact us via email, GitHub issues, or Twitter with your suggestions.",
  },
  {
    category: "tools",
    question: "Are there file size limits?",
    answer:
      "<strong>Processing happens in your browser,</strong> so limits depend on your device's memory. Most modern devices can handle files up to several hundred MB without issues.",
  },
  {
    category: "technical",
    question: "Which browsers are supported?",
    answer:
      "<strong>Toolverse works on all modern browsers including Chrome, Firefox, Safari, and Edge.</strong> We recommend keeping your browser updated for the best experience.",
  },
  {
    category: "technical",
    question: "Is Toolverse mobile-friendly?",
    answer:
      "<strong>Yes!</strong> Our responsive design works seamlessly on desktop, tablet, and mobile devices. Some tools may have limited functionality on older mobile browsers.",
  },
  {
    category: "technical",
    question: "Is the code open source?",
    answer:
      "<strong>Yes!</strong> Toolverse is open source and available on GitHub. You can review the code, contribute improvements, or self-host if needed.",
  },
  {
    category: "technical",
    question: "Can I integrate Toolverse into my app?",
    answer:
      "<strong>Since all tools run client-side,</strong> you can embed or integrate them into your projects. Check our GitHub repository for documentation and examples.",
  },
  {
    category: "general",
    question: "How do you make money if it's free?",
    answer:
      "<strong>Currently, Toolverse is a passion project.</strong> We may explore ethical monetization (like optional donations) in the future, but all core tools will always remain free.",
  },
  {
    category: "technical",
    question: "What if I encounter a bug?",
    answer:
      "<strong>Please report bugs via GitHub Issues or contact us directly.</strong> We actively monitor and fix issues to ensure a smooth experience for all users.",
  },
];