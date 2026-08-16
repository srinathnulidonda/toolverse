// features/social/meta-tag-generator/SeoPreview.tsx
"use client";

import type { MetaTags } from "./ts/types";
import styles from "./style/SeoPreview.module.css";

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
  } catch { }

  return (
    <div className={styles.spRoot}>
      <div className={styles.spSection}>
        <div className={styles.spSectionHeader}>
          <i className="ti ti-brand-google" aria-hidden="true" />
          <span>Google Search Result</span>
        </div>
        <div className={styles.spGooglePreview}>
          <div className={styles.spGoogleUrl}>
            <span className={styles.spGoogleFavicon}>🌐</span>
            <span>{hostname}</span>
            <span className={styles.spGooglePath}>
              {displayUrl.replace(/^https?:\/\/[^\/]+/, "") || "/"}
            </span>
          </div>
          <div className={styles.spGoogleTitle}>{displayTitle}</div>
          <div className={styles.spGoogleDescription}>{displayDescription}</div>
        </div>
      </div>

      <div className={styles.spSection}>
        <div className={styles.spSectionHeader}>
          <i className="ti ti-browser" aria-hidden="true" />
          <span>Browser Tab</span>
        </div>
        <div className={styles.spBrowserPreview}>
          <div className={styles.spBrowserChrome}>
            <div className={styles.spBrowserDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className={styles.spBrowserTab}>
            {tags.favicon ? (
              <img src={tags.favicon} alt="" className={styles.spBrowserFavicon} />
            ) : (
              <div className={styles.spBrowserFaviconPlaceholder} />
            )}
            <span className={styles.spBrowserTabTitle}>
              {truncate(tags.title || "Page Title", 30)}
            </span>
            <i className={`ti ti-x ${styles.spBrowserTabClose}`} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={styles.spSection}>
        <div className={styles.spSectionHeader}>
          <i className="ti ti-brand-bing" aria-hidden="true" />
          <span>Bing Search Result</span>
        </div>
        <div className={styles.spBingPreview}>
          <div className={styles.spBingTitle}>{displayTitle}</div>
          <div className={styles.spBingUrl}>{displayUrl}</div>
          <div className={styles.spBingDescription}>{displayDescription}</div>
        </div>
      </div>

      <div className={styles.spSection}>
        <div className={styles.spSectionHeader}>
          <i className="ti ti-device-mobile" aria-hidden="true" />
          <span>Mobile Search Result</span>
        </div>
        <div className={styles.spMobilePreview}>
          <div className={styles.spMobileSiteInfo}>
            <span className={styles.spMobileFavicon}>🌐</span>
            <div className={styles.spMobileSiteDetails}>
              <span className={styles.spMobileSitename}>{tags.ogSiteName || hostname}</span>
              <span className={styles.spMobileUrl}>{hostname}</span>
            </div>
          </div>
          <div className={styles.spMobileTitle}>{truncate(displayTitle, 50)}</div>
          <div className={styles.spMobileDescription}>{truncate(displayDescription, 120)}</div>
        </div>
      </div>
    </div>
  );
}
