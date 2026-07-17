// features/social/meta-tag-generator/SeoPreview.tsx
"use client";

import type { MetaTags } from "./types";

type SeoPreviewProps = {
  tags: MetaTags;
};

function truncate(text: string, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export default function SeoPreview({ tags }: SeoPreviewProps) {
  const displayUrl = tags.canonical || tags.ogUrl || "https://example.com/page";
  const displayTitle = truncate(tags.title || "Your Page Title", 60);
  const displayDescription = truncate(
    tags.description || "Your meta description will appear here...",
    160
  );

  let hostname = "example.com";
  try {
    hostname = new URL(displayUrl).hostname;
  } catch {}

  return (
    <>
      <div className="sp-root">
        {/* Google Search Preview */}
        <div className="sp-section">
          <div className="sp-section-header">
            <i className="ti ti-brand-google" aria-hidden="true" />
            <span>Google Search Result</span>
          </div>
          <div className="sp-google-preview">
            <div className="sp-google-url">
              <span className="sp-google-favicon">🌐</span>
              <span>{hostname}</span>
              <span className="sp-google-path">
                {displayUrl.replace(/^https?:\/\/[^\/]+/, "") || "/"}
              </span>
            </div>
            <div className="sp-google-title">{displayTitle}</div>
            <div className="sp-google-description">{displayDescription}</div>
          </div>
        </div>

        {/* Browser Tab Preview */}
        <div className="sp-section">
          <div className="sp-section-header">
            <i className="ti ti-browser" aria-hidden="true" />
            <span>Browser Tab</span>
          </div>
          <div className="sp-browser-preview">
            <div className="sp-browser-chrome">
              <div className="sp-browser-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="sp-browser-tab">
              {tags.favicon ? (
                <img src={tags.favicon} alt="" className="sp-browser-favicon" />
              ) : (
                <div className="sp-browser-favicon-placeholder" />
              )}
              <span className="sp-browser-tab-title">
                {truncate(tags.title || "Page Title", 30)}
              </span>
              <i className="ti ti-x sp-browser-tab-close" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Bing Search Preview */}
        <div className="sp-section">
          <div className="sp-section-header">
            <i className="ti ti-brand-bing" aria-hidden="true" />
            <span>Bing Search Result</span>
          </div>
          <div className="sp-bing-preview">
            <div className="sp-bing-title">{displayTitle}</div>
            <div className="sp-bing-url">{displayUrl}</div>
            <div className="sp-bing-description">{displayDescription}</div>
          </div>
        </div>

        {/* Mobile Search Preview */}
        <div className="sp-section">
          <div className="sp-section-header">
            <i className="ti ti-device-mobile" aria-hidden="true" />
            <span>Mobile Search Result</span>
          </div>
          <div className="sp-mobile-preview">
            <div className="sp-mobile-site-info">
              <span className="sp-mobile-favicon">🌐</span>
              <div className="sp-mobile-site-details">
                <span className="sp-mobile-sitename">{tags.ogSiteName || hostname}</span>
                <span className="sp-mobile-url">{hostname}</span>
              </div>
            </div>
            <div className="sp-mobile-title">{truncate(displayTitle, 50)}</div>
            <div className="sp-mobile-description">{truncate(displayDescription, 120)}</div>
          </div>
        </div>
      </div>

      <style>{`
        .sp-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sp-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sp-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sp-section-header i { font-size: 15px; }

        /* Google Preview */
        .sp-google-preview {
          padding: 16px;
          background: white;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          font-family: arial, sans-serif;
        }
        .sp-google-url {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #202124;
          margin-bottom: 4px;
        }
        .sp-google-favicon {
          font-size: 14px;
        }
        .sp-google-path {
          color: #5f6368;
        }
        .sp-google-title {
          font-size: 20px;
          color: #1a0dab;
          line-height: 1.3;
          margin-bottom: 3px;
          cursor: pointer;
        }
        .sp-google-title:hover {
          text-decoration: underline;
        }
        .sp-google-description {
          font-size: 14px;
          color: #4d5156;
          line-height: 1.4;
        }

        /* Browser Tab Preview */
        .sp-browser-preview {
          background: #dee1e6;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }
        .sp-browser-chrome {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: #dee1e6;
        }
        .sp-browser-dots {
          display: flex;
          gap: 6px;
        }
        .sp-browser-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #9aa0a6;
        }
        .sp-browser-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 10px 14px;
          border-radius: 8px 8px 0 0;
          margin: 0 8px;
          max-width: 240px;
        }
        .sp-browser-favicon {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          object-fit: cover;
        }
        .sp-browser-favicon-placeholder {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          background: #e0e0e0;
        }
        .sp-browser-tab-title {
          flex: 1;
          font-size: 12px;
          color: #3c4043;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sp-browser-tab-close {
          font-size: 12px;
          color: #5f6368;
        }

        /* Bing Preview */
        .sp-bing-preview {
          padding: 16px;
          background: white;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          font-family: 'Segoe UI', sans-serif;
        }
        .sp-bing-title {
          font-size: 18px;
          color: #1a0dab;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .sp-bing-url {
          font-size: 13px;
          color: #006621;
          margin-bottom: 4px;
        }
        .sp-bing-description {
          font-size: 13px;
          color: #545454;
          line-height: 1.4;
        }

        /* Mobile Preview */
        .sp-mobile-preview {
          max-width: 360px;
          padding: 14px;
          background: white;
          border: 0.5px solid var(--border);
          border-radius: 8px;
        }
        .sp-mobile-site-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .sp-mobile-favicon {
          font-size: 20px;
        }
        .sp-mobile-site-details {
          display: flex;
          flex-direction: column;
        }
        .sp-mobile-sitename {
          font-size: 13px;
          font-weight: 500;
          color: #202124;
        }
        .sp-mobile-url {
          font-size: 11px;
          color: #5f6368;
        }
        .sp-mobile-title {
          font-size: 16px;
          color: #1a0dab;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .sp-mobile-description {
          font-size: 13px;
          color: #4d5156;
          line-height: 1.4;
        }

        @media (prefers-color-scheme: dark) {
          .sp-google-preview,
          .sp-bing-preview,
          .sp-mobile-preview {
            background: #1a1a1a;
          }
          .sp-google-title,
          .sp-bing-title,
          .sp-mobile-title {
            color: #8ab4f8;
          }
          .sp-google-url,
          .sp-mobile-sitename {
            color: #e8eaed;
          }
          .sp-google-description,
          .sp-bing-description,
          .sp-mobile-description {
            color: #bdc1c6;
          }
        }
      `}</style>
    </>
  );
}
