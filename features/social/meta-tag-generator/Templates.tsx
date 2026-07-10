// features/social/meta-tag-generator/Templates.tsx
"use client";

import type { Template } from "./types";

const TEMPLATES: Template[] = [
  {
    id: "blog-article",
    name: "Blog Article",
    description: "Standard blog post with full SEO setup",
    icon: "ti-article",
    category: "Content",
    tags: {
      title: "10 Best Practices for Modern Web Development in 2024",
      description: "Discover the essential web development practices every developer should know in 2024, from performance optimization to accessibility standards.",
      keywords: "web development, best practices, coding, programming, 2024",
      author: "Tech Team",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "https://example.com/blog/web-dev-best-practices",
      baseUrl: "https://example.com",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "article",
      ogTitle: "",
      ogDescription: "",
      ogImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop",
      ogImageAlt: "Web development best practices",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "https://example.com/blog/web-dev-best-practices",
      ogSiteName: "Tech Blog",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "@techblog",
      twitterCreator: "@author",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: new Date().toISOString().slice(0, 16),
      articleModifiedTime: "",
      articleAuthor: "Tech Team",
      articleSection: "Web Development",
      articleTag: "javascript, react, nextjs, webdev",
      themeColor: "#2563EB",
      msapplicationTileColor: "#2563EB",
      appleMobileWebAppCapable: "",
      appleMobileWebAppStatusBarStyle: "default",
      appleMobileWebAppTitle: "",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: true,
      schemaType: "BlogPosting",
      schemaData: {},
    },
  },
  {
    id: "ecommerce-product",
    name: "E-commerce Product",
    description: "Product page with rich snippets",
    icon: "ti-shopping-cart",
    category: "E-commerce",
    tags: {
      title: "Premium Leather Backpack - Handcrafted | ShopName",
      description: "Handcrafted premium leather backpack with laptop compartment. Durable, stylish, and perfect for work or travel. Free shipping worldwide.",
      keywords: "leather backpack, handcrafted, premium bags, laptop bag",
      author: "",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "https://shop.example.com/products/leather-backpack",
      baseUrl: "https://shop.example.com",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "product",
      ogTitle: "",
      ogDescription: "",
      ogImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=630&fit=crop",
      ogImageAlt: "Premium leather backpack",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "https://shop.example.com/products/leather-backpack",
      ogSiteName: "ShopName",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "@shopname",
      twitterCreator: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: "",
      articleModifiedTime: "",
      articleAuthor: "",
      articleSection: "",
      articleTag: "",
      themeColor: "#000000",
      msapplicationTileColor: "#000000",
      appleMobileWebAppCapable: "",
      appleMobileWebAppStatusBarStyle: "default",
      appleMobileWebAppTitle: "",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: true,
      schemaType: "Product",
      schemaData: {},
    },
  },
  {
    id: "saas-landing",
    name: "SaaS Landing Page",
    description: "High-converting SaaS homepage",
    icon: "ti-rocket",
    category: "Business",
    tags: {
      title: "ProductName - The Best Solution for Your Business",
      description: "Streamline your workflow with ProductName. Trusted by 10,000+ companies worldwide. Start your free trial today, no credit card required.",
      keywords: "saas, software, business tools, productivity, automation",
      author: "",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "https://productname.com",
      baseUrl: "https://productname.com",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "website",
      ogTitle: "",
      ogDescription: "",
      ogImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
      ogImageAlt: "ProductName dashboard preview",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "https://productname.com",
      ogSiteName: "ProductName",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "@productname",
      twitterCreator: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: "",
      articleModifiedTime: "",
      articleAuthor: "",
      articleSection: "",
      articleTag: "",
      themeColor: "#4F46E5",
      msapplicationTileColor: "#4F46E5",
      appleMobileWebAppCapable: "yes",
      appleMobileWebAppStatusBarStyle: "black-translucent",
      appleMobileWebAppTitle: "ProductName",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: true,
      schemaType: "Organization",
      schemaData: {},
    },
  },
  {
    id: "portfolio-personal",
    name: "Personal Portfolio",
    description: "Professional personal website",
    icon: "ti-user",
    category: "Personal",
    tags: {
      title: "Jane Smith - UX Designer & Creative Director",
      description: "Award-winning UX designer with 8+ years of experience creating delightful digital experiences for startups and Fortune 500 companies.",
      keywords: "ux designer, portfolio, product design, creative director",
      author: "Jane Smith",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "https://janesmith.design",
      baseUrl: "https://janesmith.design",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "profile",
      ogTitle: "",
      ogDescription: "",
      ogImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=630&fit=crop",
      ogImageAlt: "Jane Smith portfolio",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "https://janesmith.design",
      ogSiteName: "Jane Smith",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "",
      twitterCreator: "@janesmith",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: "",
      articleModifiedTime: "",
      articleAuthor: "",
      articleSection: "",
      articleTag: "",
      themeColor: "#EC4899",
      msapplicationTileColor: "#EC4899",
      appleMobileWebAppCapable: "",
      appleMobileWebAppStatusBarStyle: "default",
      appleMobileWebAppTitle: "",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: true,
      schemaType: "Person",
      schemaData: {},
    },
  },
  {
    id: "news-article",
    name: "News Article",
    description: "Breaking news or press release",
    icon: "ti-news",
    category: "Content",
    tags: {
      title: "Major Breakthrough in Renewable Energy Technology Announced",
      description: "Scientists announce a revolutionary breakthrough in solar panel efficiency that could transform the renewable energy industry within the next decade.",
      keywords: "renewable energy, solar technology, breaking news, science",
      author: "News Desk",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "https://news.example.com/renewable-energy-breakthrough",
      baseUrl: "https://news.example.com",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "article",
      ogTitle: "",
      ogDescription: "",
      ogImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=630&fit=crop",
      ogImageAlt: "Solar panel technology",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "https://news.example.com/renewable-energy-breakthrough",
      ogSiteName: "Daily News",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "@dailynews",
      twitterCreator: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: new Date().toISOString().slice(0, 16),
      articleModifiedTime: "",
      articleAuthor: "News Desk",
      articleSection: "Science",
      articleTag: "energy, technology, environment, science",
      themeColor: "#DC2626",
      msapplicationTileColor: "#DC2626",
      appleMobileWebAppCapable: "",
      appleMobileWebAppStatusBarStyle: "default",
      appleMobileWebAppTitle: "",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: true,
      schemaType: "NewsArticle",
      schemaData: {},
    },
  },
  {
    id: "local-business",
    name: "Local Business",
    description: "Restaurant, shop, or service business",
    icon: "ti-building-store",
    category: "Business",
    tags: {
      title: "The Coffee House - Best Coffee Shop in Downtown",
      description: "Family-owned coffee shop serving artisan coffee, fresh pastries, and light meals since 2010. Visit us in the heart of downtown.",
      keywords: "coffee shop, cafe, local business, downtown, pastries",
      author: "",
      viewport: "width=device-width, initial-scale=1",
      charset: "UTF-8",
      language: "en",
      canonical: "https://thecoffeehouse.com",
      baseUrl: "https://thecoffeehouse.com",
      robots: "index, follow",
      googlebot: "",
      bingbot: "",
      ogType: "website",
      ogTitle: "",
      ogDescription: "",
      ogImage: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&h=630&fit=crop",
      ogImageAlt: "The Coffee House interior",
      ogImageWidth: "1200",
      ogImageHeight: "630",
      ogUrl: "https://thecoffeehouse.com",
      ogSiteName: "The Coffee House",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "",
      twitterCreator: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageAlt: "",
      articlePublishedTime: "",
      articleModifiedTime: "",
      articleAuthor: "",
      articleSection: "",
      articleTag: "",
      themeColor: "#92400E",
      msapplicationTileColor: "#92400E",
      appleMobileWebAppCapable: "",
      appleMobileWebAppStatusBarStyle: "default",
      appleMobileWebAppTitle: "",
      favicon: "",
      appleTouchIcon: "",
      icon32: "",
      icon16: "",
      enableSchema: true,
      schemaType: "LocalBusiness",
      schemaData: {},
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
        <div className="tpl-intro">
          <div className="tpl-intro-icon">
            <i className="ti ti-sparkles" aria-hidden="true" />
          </div>
          <div className="tpl-intro-text">
            <h3>Quick Start Templates</h3>
            <p>Choose a professionally crafted template to jumpstart your meta tags setup</p>
          </div>
        </div>

        <div className="tpl-grid">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              className="tpl-card"
              onClick={() => onSelect(template)}
            >
              <div className="tpl-card-top">
                <div className="tpl-icon">
                  <i className={`ti ${template.icon}`} aria-hidden="true" />
                </div>
                <span className="tpl-category">{template.category}</span>
              </div>
              <div className="tpl-name">{template.name}</div>
              <div className="tpl-desc">{template.description}</div>
              <div className="tpl-use-btn">
                Use Template
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .tpl-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tpl-intro {
          display: flex;
          gap: 14px;
          padding: 18px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 12px;
        }
        .tpl-intro-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: 10px;
          font-size: 20px;
          color: var(--brand);
          flex-shrink: 0;
        }
        .tpl-intro-text h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--brand-text);
          margin: 0 0 4px;
        }
        .tpl-intro-text p {
          font-size: 12.5px;
          color: var(--brand-text);
          opacity: 0.85;
          margin: 0;
          line-height: 1.5;
        }
        .tpl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }
        .tpl-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }
        .tpl-card:hover {
          border-color: var(--brand);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .tpl-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tpl-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          font-size: 17px;
          color: var(--text-secondary);
          transition: all 0.15s;
        }
        .tpl-card:hover .tpl-icon {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .tpl-category {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          padding: 3px 8px;
          background: var(--bg-surface);
          border-radius: 4px;
        }
        .tpl-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
        }
        .tpl-desc {
          font-size: 11.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          flex: 1;
        }
        .tpl-use-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--brand);
          margin-top: auto;
        }
        .tpl-use-btn i {
          font-size: 13px;
          transition: transform 0.15s;
        }
        .tpl-card:hover .tpl-use-btn i {
          transform: translateX(3px);
        }
        @media (max-width: 600px) {
          .tpl-grid {
            grid-template-columns: 1fr;
          }
          .tpl-intro {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}