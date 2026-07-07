// features/social/og-preview/PlatformPreview.tsx
"use client";

import type { Platform, MetaData, DeviceMode } from "./types";
import { getPlatformLabel, truncate, PLATFORM_REQUIREMENTS } from "./utils";

type PlatformPreviewProps = {
  platform: Platform;
  meta: MetaData;
  device: DeviceMode;
};

export default function PlatformPreview({ platform, meta, device }: PlatformPreviewProps) {
  const req = PLATFORM_REQUIREMENTS[platform];
  
  const title = (platform === "twitter" && meta.twitterTitle) 
    ? meta.twitterTitle 
    : meta.title;
    
  const description = (platform === "twitter" && meta.twitterDescription)
    ? meta.twitterDescription
    : meta.description;
    
  const image = (platform === "twitter" && meta.twitterImage)
    ? meta.twitterImage
    : meta.image;

  const displayTitle = truncate(title, req.title.max);
  const displayDescription = truncate(description, req.description.max);

  return (
    <>
      <div className={`pp-root pp-${platform} pp-${device}`}>
        {/* Platform-specific previews */}
        
        {platform === "facebook" && (
          <div className="pp-facebook-card">
            {image && (
              <div className="pp-facebook-image">
                <img src={image} alt="" />
              </div>
            )}
            <div className="pp-facebook-content">
              <div className="pp-facebook-domain">{meta.url ? new URL(meta.url).hostname.toUpperCase() : "EXAMPLE.COM"}</div>
              <div className="pp-facebook-title">{displayTitle || "Your page title will appear here"}</div>
              <div className="pp-facebook-description">{displayDescription || "Your description will appear here"}</div>
            </div>
          </div>
        )}

        {platform === "twitter" && (
          <div className="pp-twitter-card">
            {meta.twitterCard === "summary" ? (
              <>
                <div className="pp-twitter-content-summary">
                  <div className="pp-twitter-text">
                    <div className="pp-twitter-title">{displayTitle || "Title"}</div>
                    <div className="pp-twitter-description">{displayDescription || "Description"}</div>
                    <div className="pp-twitter-domain">
                      {meta.url ? new URL(meta.url).hostname : "example.com"}
                    </div>
                  </div>
                  {image && (
                    <div className="pp-twitter-image-summary">
                      <img src={image} alt="" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {image && (
                  <div className="pp-twitter-image-large">
                    <img src={image} alt="" />
                  </div>
                )}
                <div className="pp-twitter-content">
                  <div className="pp-twitter-title">{displayTitle || "Title"}</div>
                  <div className="pp-twitter-description">{displayDescription || "Description"}</div>
                  <div className="pp-twitter-domain">
                    {meta.url ? new URL(meta.url).hostname : "example.com"}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {platform === "linkedin" && (
          <div className="pp-linkedin-card">
            {image && (
              <div className="pp-linkedin-image">
                <img src={image} alt="" />
              </div>
            )}
            <div className="pp-linkedin-content">
              <div className="pp-linkedin-title">{displayTitle || "Title"}</div>
              <div className="pp-linkedin-domain">
                {meta.url ? new URL(meta.url).hostname : "example.com"}
              </div>
            </div>
          </div>
        )}

        {platform === "slack" && (
          <div className="pp-slack-card">
            <div className="pp-slack-header">
              <div className="pp-slack-favicon">
                {meta.favicon ? <img src={meta.favicon} alt="" /> : "🌐"}
              </div>
              <div className="pp-slack-site">{meta.siteName || "Website"}</div>
            </div>
            {image && (
              <div className="pp-slack-image">
                <img src={image} alt="" />
              </div>
            )}
            <div className="pp-slack-content">
              <div className="pp-slack-title">{displayTitle || "Title"}</div>
              <div className="pp-slack-description">{displayDescription || "Description"}</div>
            </div>
          </div>
        )}

        {platform === "discord" && (
          <div className="pp-discord-card">
            <div className="pp-discord-accent" style={{ background: meta.themeColor || "#5865F2" }} />
            <div className="pp-discord-body">
              <div className="pp-discord-content">
                <div className="pp-discord-site">{meta.siteName || "Website"}</div>
                <div className="pp-discord-title">{displayTitle || "Title"}</div>
                <div className="pp-discord-description">{displayDescription || "Description"}</div>
              </div>
              {image && (
                <div className="pp-discord-thumbnail">
                  <img src={image} alt="" />
                </div>
              )}
            </div>
          </div>
        )}

        {platform === "whatsapp" && (
          <div className="pp-whatsapp-bubble">
            <div className="pp-whatsapp-card">
              {image && (
                <div className="pp-whatsapp-image">
                  <img src={image} alt="" />
                </div>
              )}
              <div className="pp-whatsapp-content">
                <div className="pp-whatsapp-title">{displayTitle || "Title"}</div>
                <div className="pp-whatsapp-description">{displayDescription || "Description"}</div>
                <div className="pp-whatsapp-domain">
                  {meta.url ? new URL(meta.url).hostname : "example.com"}
                </div>
              </div>
            </div>
            <div className="pp-whatsapp-time">12:34 PM</div>
          </div>
        )}

        {platform === "imessage" && (
          <div className="pp-imessage-bubble">
            <div className="pp-imessage-card">
              <div className="pp-imessage-site">{meta.siteName || new URL(meta.url || "https://example.com").hostname}</div>
              {image && (
                <div className="pp-imessage-image">
                  <img src={image} alt="" />
                </div>
              )}
              <div className="pp-imessage-content">
                <div className="pp-imessage-title">{displayTitle || "Title"}</div>
                <div className="pp-imessage-description">{displayDescription || "Description"}</div>
              </div>
            </div>
          </div>
        )}

        {platform === "telegram" && (
          <div className="pp-telegram-bubble">
            <div className="pp-telegram-card">
              {image && (
                <div className="pp-telegram-image">
                  <img src={image} alt="" />
                </div>
              )}
              <div className="pp-telegram-content">
                <div className="pp-telegram-title">{displayTitle || "Title"}</div>
                <div className="pp-telegram-description">{displayDescription || "Description"}</div>
                <div className="pp-telegram-site">{meta.siteName || meta.url || "example.com"}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pp-root {
          width: 100%;
          font-family: var(--font-sans);
        }

        /* ═══════════════════ FACEBOOK ═══════════════════ */
        .pp-facebook-card {
          border: 0.5px solid #dddfe2;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          color: #1c1e21;
        }
        .pp-facebook-image {
          width: 100%;
          aspect-ratio: 1.91/1;
          overflow: hidden;
          background: #f0f2f5;
        }
        .pp-facebook-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-facebook-content {
          padding: 12px;
          background: #f0f2f5;
        }
        .pp-facebook-domain {
          font-size: 12px;
          color: #65676b;
          margin-bottom: 3px;
        }
        .pp-facebook-title {
          font-size: 16px;
          font-weight: 600;
          color: #1c1e21;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-facebook-description {
          font-size: 14px;
          color: #65676b;
          line-height: 1.4;
        }

        /* ═══════════════════ TWITTER ═══════════════════ */
        .pp-twitter-card {
          border: 0.5px solid #cfd9de;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          color: #0f1419;
        }
        .pp-twitter-image-large {
          width: 100%;
          aspect-ratio: 1.91/1;
          overflow: hidden;
          background: #f7f9f9;
        }
        .pp-twitter-image-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-twitter-content {
          padding: 12px;
        }
        .pp-twitter-content-summary {
          display: flex;
          gap: 12px;
          padding: 12px;
        }
        .pp-twitter-text {
          flex: 1;
          min-width: 0;
        }
        .pp-twitter-image-summary {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          background: #f7f9f9;
          flex-shrink: 0;
        }
        .pp-twitter-image-summary img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-twitter-title {
          font-size: 15px;
          font-weight: 600;
          color: #0f1419;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .pp-twitter-description {
          font-size: 14px;
          color: #536471;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-twitter-domain {
          font-size: 13px;
          color: #536471;
        }

        /* ═══════════════════ LINKEDIN ═══════════════════ */
        .pp-linkedin-card {
          border: 0.5px solid #d0d0d0;
          border-radius: 2px;
          overflow: hidden;
          background: white;
          color: rgba(0,0,0,0.9);
        }
        .pp-linkedin-image {
          width: 100%;
          aspect-ratio: 1.91/1;
          overflow: hidden;
          background: #f3f2ef;
        }
        .pp-linkedin-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-linkedin-content {
          padding: 12px;
        }
        .pp-linkedin-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(0,0,0,0.9);
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-linkedin-domain {
          font-size: 12px;
          color: rgba(0,0,0,0.6);
        }

        /* ═══════════════════ SLACK ═══════════════════ */
        .pp-slack-card {
          border: 0.5px solid #e8e8e8;
          border-left: 4px solid #1d9bd1;
          border-radius: 4px;
          overflow: hidden;
          background: white;
          padding: 8px 12px 8px 16px;
        }
        .pp-slack-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .pp-slack-favicon {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          overflow: hidden;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pp-slack-favicon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-slack-site {
          font-size: 12px;
          font-weight: 700;
          color: #1d1c1d;
        }
        .pp-slack-image {
          width: 100%;
          max-width: 360px;
          aspect-ratio: 1.91/1;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
          background: #f8f8f8;
        }
        .pp-slack-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-slack-title {
          font-size: 14px;
          font-weight: 700;
          color: #1264a3;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-slack-description {
          font-size: 13px;
          color: #616061;
          line-height: 1.4;
        }

        /* ═══════════════════ DISCORD ═══════════════════ */
        .pp-discord-card {
          display: flex;
          background: #2f3136;
          border-radius: 4px;
          overflow: hidden;
          max-width: 520px;
        }
        .pp-discord-accent {
          width: 4px;
          flex-shrink: 0;
        }
        .pp-discord-body {
          flex: 1;
          padding: 8px 12px 12px 12px;
          display: flex;
          gap: 12px;
        }
        .pp-discord-content {
          flex: 1;
          min-width: 0;
        }
        .pp-discord-site {
          font-size: 12px;
          font-weight: 600;
          color: #00b0f4;
          margin-bottom: 4px;
        }
        .pp-discord-title {
          font-size: 14px;
          font-weight: 600;
          color: #00b0f4;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-discord-description {
          font-size: 13px;
          color: #dcddde;
          line-height: 1.4;
        }
        .pp-discord-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          background: #36393f;
        }
        .pp-discord-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ═══════════════════ WHATSAPP ═══════════════════ */
        .pp-whatsapp-bubble {
          max-width: 340px;
          margin-left: auto;
        }
        .pp-whatsapp-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }
        .pp-whatsapp-image {
          width: 100%;
          aspect-ratio: 1/1;
          background: #f0f0f0;
        }
        .pp-whatsapp-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-whatsapp-content {
          padding: 8px 12px;
          background: white;
        }
        .pp-whatsapp-title {
          font-size: 14px;
          font-weight: 600;
          color: #000;
          margin-bottom: 2px;
        }
        .pp-whatsapp-description {
          font-size: 13px;
          color: #667781;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-whatsapp-domain {
          font-size: 12px;
          color: #667781;
        }
        .pp-whatsapp-time {
          font-size: 11px;
          color: #667781;
          text-align: right;
          margin-top: 4px;
          padding-right: 4px;
        }

        /* ═══════════════════ IMESSAGE ═══════════════════ */
        .pp-imessage-bubble {
          max-width: 300px;
          margin-left: auto;
        }
        .pp-imessage-card {
          background: #3a82f7;
          border-radius: 18px;
          overflow: hidden;
          color: white;
        }
        .pp-imessage-site {
          padding: 8px 12px;
          font-size: 11px;
          opacity: 0.8;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .pp-imessage-image {
          width: 100%;
          aspect-ratio: 1.91/1;
          background: rgba(0,0,0,0.1);
        }
        .pp-imessage-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-imessage-content {
          padding: 8px 12px;
        }
        .pp-imessage-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 3px;
        }
        .pp-imessage-description {
          font-size: 13px;
          opacity: 0.9;
          line-height: 1.3;
        }

        /* ═══════════════════ TELEGRAM ═══════════════════ */
        .pp-telegram-bubble {
          max-width: 420px;
        }
        .pp-telegram-card {
          background: white;
          border-radius: 10px;
          border: 0.5px solid #d7d7d7;
          overflow: hidden;
        }
        .pp-telegram-image {
          width: 100%;
          aspect-ratio: 1.91/1;
          background: #f4f4f5;
        }
        .pp-telegram-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pp-telegram-content {
          padding: 10px 12px;
        }
        .pp-telegram-title {
          font-size: 14px;
          font-weight: 500;
          color: #000;
          margin-bottom: 3px;
        }
        .pp-telegram-description {
          font-size: 13px;
          color: #707579;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .pp-telegram-site {
          font-size: 12px;
          color: #707579;
        }

        /* Mobile adjustments */
        .pp-mobile .pp-facebook-title,
        .pp-mobile .pp-twitter-title,
        .pp-mobile .pp-linkedin-title {
          font-size: 14px;
        }
        .pp-mobile .pp-facebook-description,
        .pp-mobile .pp-twitter-description {
          font-size: 13px;
        }
        .pp-mobile .pp-twitter-image-summary {
          width: 80px;
          height: 80px;
        }
      `}</style>
    </>
  );
}