// features/social/og-preview/Templates.tsx
"use client";

import type { Template } from "./types";

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
      <div className="tpl-root">
        <div className="tpl-header">
          <i className="ti ti-template" aria-hidden="true" />
          <div className="tpl-header-text">
            <h3 className="tpl-title">Quick Start Templates</h3>
            <p className="tpl-subtitle">
              Select a template to get started with pre-filled meta tags
            </p>
          </div>
        </div>

        <div className="tpl-grid">
          {TEMPLATES.map((template) => (
            <button key={template.id} className="tpl-card" onClick={() => onSelect(template)}>
              <div className="tpl-card-icon">
                <i className={`ti ${template.icon}`} aria-hidden="true" />
              </div>
              <div className="tpl-card-content">
                <div className="tpl-card-name">{template.name}</div>
                <div className="tpl-card-desc">{template.description}</div>
              </div>
              <div className="tpl-card-arrow">
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>

        <div className="tpl-footer">
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            Templates use placeholder images from Unsplash. Replace with your own images for
            production.
          </span>
        </div>
      </div>

      <style>{`
        .tpl-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tpl-header {
          display: flex;
          gap: 14px;
          padding: 20px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
        }
        .tpl-header > i {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--brand-light);
          color: var(--brand-text);
          border-radius: 10px;
          font-size: 22px;
          flex-shrink: 0;
        }
        .tpl-header-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tpl-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.3;
        }
        .tpl-subtitle {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          line-height: 1.5;
        }

        .tpl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .tpl-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .tpl-card:hover {
          background: var(--bg-surface);
          border-color: var(--brand);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .tpl-card:active {
          transform: translateY(0);
        }

        .tpl-card-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          font-size: 20px;
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .tpl-card:hover .tpl-card-icon {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .tpl-card-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .tpl-card-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
        }
        .tpl-card-desc {
          font-size: 11.5px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        .tpl-card-arrow {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border-radius: 6px;
          font-size: 14px;
          color: var(--text-disabled);
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .tpl-card:hover .tpl-card-arrow {
          background: var(--brand);
          color: white;
          transform: translateX(2px);
        }

        .tpl-footer {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 14px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 8px;
          font-size: 11.5px;
          color: var(--brand-text);
          line-height: 1.5;
        }
        .tpl-footer i {
          font-size: 14px;
          margin-top: 1px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .tpl-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .tpl-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .tpl-header > i {
            margin: 0 auto;
          }
        }
      `}</style>
    </>
  );
}
