// features/social/og-preview/Templates.tsx
"use client";
import type { Template } from "./ts/types";
import styles from "./style/Templates.module.css";

const TEMPLATES: Template[] = [
  {
    id: "blog-post",
    name: "Blog Post",
    description: "Standard blog article template",
    icon: "ti-article",
    data: {
      type: "article",
      title: "10 Tips for Writing Better Meta Tags",
      description:
        "Learn how to craft compelling meta tags that improve your click-through rates and social engagement across all platforms.",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop",
      siteName: "Tech Blog",
      twitterCard: "summary_large_image",
      author: "John Doe",
      keywords: "meta tags, seo, social media, open graph",
      locale: "en_US",
    },
  },
  {
    id: "product-page",
    name: "Product Page",
    description: "E-commerce product showcase",
    icon: "ti-shopping-bag",
    data: {
      type: "product",
      title: "Premium Wireless Headphones - Noise Cancelling",
      description:
        "Experience studio-quality sound with our premium wireless headphones. Features active noise cancellation, 30-hour battery life, and premium comfort.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=630&fit=crop",
      siteName: "AudioStore",
      twitterCard: "summary_large_image",
      keywords: "headphones, wireless, noise cancelling, audio",
      themeColor: "#000000",
    },
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description: "Marketing landing page template",
    icon: "ti-rocket",
    data: {
      type: "website",
      title: "Build Your SaaS Product Faster | ProductName",
      description:
        "The all-in-one platform to build, launch, and scale your SaaS product. Start free today and join 10,000+ founders building the future.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
      siteName: "ProductName",
      twitterCard: "summary_large_image",
      twitterSite: "@productname",
      keywords: "saas, startup, platform, business",
      themeColor: "#4F46E5",
    },
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Personal portfolio or profile",
    icon: "ti-user",
    data: {
      type: "profile",
      title: "Jane Smith - Product Designer & Creative Director",
      description:
        "Award-winning product designer specializing in user experience, interface design, and design systems. Available for freelance projects.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=630&fit=crop",
      siteName: "Jane Smith Portfolio",
      twitterCard: "summary_large_image",
      twitterCreator: "@janesmith",
      author: "Jane Smith",
      keywords: "portfolio, designer, ux, ui, creative",
      themeColor: "#EC4899",
    },
  },
  {
    id: "news-article",
    name: "News Article",
    description: "News or magazine article",
    icon: "ti-news",
    data: {
      type: "article",
      title: "Breaking: Major Tech Company Announces New AI Initiative",
      description:
        "In a surprise announcement today, the company revealed plans to invest $10 billion in artificial intelligence research and development over the next five years.",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop",
      siteName: "Tech News Daily",
      twitterCard: "summary_large_image",
      articleAuthor: "Tech News Daily Staff",
      articleSection: "Technology",
      keywords: "tech news, ai, artificial intelligence, business",
    },
  },
  {
    id: "event",
    name: "Event",
    description: "Conference or event page",
    icon: "ti-calendar-event",
    data: {
      type: "website",
      title: "DesignCon 2024 - The Future of Digital Design",
      description:
        "Join 5,000+ designers, developers, and innovators at the world's leading design conference. March 15-17, 2024 in San Francisco.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop",
      siteName: "DesignCon",
      twitterCard: "summary_large_image",
      twitterSite: "@designcon",
      keywords: "design conference, event, design, ux, ui",
      themeColor: "#F59E0B",
    },
  },
  {
    id: "video",
    name: "Video Content",
    description: "YouTube or video sharing",
    icon: "ti-video",
    data: {
      type: "video.movie",
      title: "How to Master Open Graph Tags in 10 Minutes",
      description:
        "A complete tutorial on implementing Open Graph meta tags for better social media sharing. Perfect for beginners and advanced users.",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=630&fit=crop",
      siteName: "WebDev Academy",
      twitterCard: "player",
      twitterSite: "@webdevacademy",
      keywords: "tutorial, video, web development, meta tags",
      videoUrl: "https://example.com/video.mp4",
      videoWidth: "1280",
      videoHeight: "720",
    },
  },
  {
    id: "podcast",
    name: "Podcast Episode",
    description: "Podcast or audio content",
    icon: "ti-microphone",
    data: {
      type: "music.song",
      title: "EP 42: The Art of Social Media Marketing with Sarah Johnson",
      description:
        "Join us as we dive deep into modern social media strategies, content creation tips, and the latest platform updates with marketing expert Sarah Johnson.",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=630&fit=crop",
      siteName: "Marketing Matters Podcast",
      twitterCard: "summary_large_image",
      author: "Marketing Matters",
      keywords: "podcast, marketing, social media, interview",
    },
  },
];

type TemplatesProps = {
  onSelect: (template: Template) => void;
};

export default function Templates({ onSelect }: TemplatesProps) {
  return (
    <>
      <div className={styles.tplRoot}>
        <div className={styles.tplHeader}>
          <i className="ti ti-template" aria-hidden="true" />
          <div className={styles.tplHeaderText}>
            <h3 className={styles.tplTitle}>Quick Start Templates</h3>
            <p className={styles.tplSubtitle}>
              Select a template to get started with pre-filled meta tags
            </p>
          </div>
        </div>

        <div className={styles.tplGrid}>
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              className={styles.tplCard}
              onClick={() => onSelect(template)}
            >
              <div className={styles.tplCardIcon}>
                <i className={`ti ${template.icon}`} aria-hidden="true" />
              </div>
              <div className={styles.tplCardContent}>
                <div className={styles.tplCardName}>{template.name}</div>
                <div className={styles.tplCardDesc}>{template.description}</div>
              </div>
              <div className={styles.tplCardArrow}>
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>

        <div className={styles.tplFooter}>
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            Templates use placeholder images from Unsplash. Replace with your own images for
            production.
          </span>
        </div>
      </div>
    </>
  );
}