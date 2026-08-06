// features/social/og-preview/PlatformPreview.tsx
"use client";
import type { Platform, MetaData, DeviceMode } from "./ts/types";
import { getPlatformLabel, truncate, PLATFORM_REQUIREMENTS } from "./ts/utils";
import styles from "./style/PlatformPreview.module.css";

type PlatformPreviewProps = {
  platform: Platform;
  meta: MetaData;
  device: DeviceMode;
};

export default function PlatformPreview({ platform, meta, device }: PlatformPreviewProps) {
  const req = PLATFORM_REQUIREMENTS[platform];

  const title = platform === "twitter" && meta.twitterTitle ? meta.twitterTitle : meta.title;

  const description =
    platform === "twitter" && meta.twitterDescription ? meta.twitterDescription : meta.description;

  const image = platform === "twitter" && meta.twitterImage ? meta.twitterImage : meta.image;

  const displayTitle = truncate(title, req.title.max);
  const displayDescription = truncate(description, req.description.max);

  // Helper to capitalize first letter
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const baseClass = `${styles.ppRoot} ${styles[`pp${capitalize(platform)}`]} ${styles[`pp${capitalize(device)}`]}`;

  return (
    <>
      <div className={baseClass}>
        {/* Platform-specific previews */}

        {platform === "facebook" && (
          <div className={styles.ppFacebookCard}>
            {image && (
              <div className={styles.ppFacebookImage}>
                <img src={image} alt="" />
              </div>
            )}
            <div className={styles.ppFacebookContent}>
              <div className={styles.ppFacebookDomain}>
                {meta.url ? new URL(meta.url).hostname.toUpperCase() : "EXAMPLE.COM"}
              </div>
              <div className={styles.ppFacebookTitle}>
                {displayTitle || "Your page title will appear here"}
              </div>
              <div className={styles.ppFacebookDescription}>
                {displayDescription || "Your description will appear here"}
              </div>
            </div>
          </div>
        )}

        {platform === "twitter" && (
          <div className={styles.ppTwitterCard}>
            {meta.twitterCard === "summary" ? (
              <>
                <div className={styles.ppTwitterContentSummary}>
                  <div className={styles.ppTwitterText}>
                    <div className={styles.ppTwitterTitle}>{displayTitle || "Title"}</div>
                    <div className={styles.ppTwitterDescription}>
                      {displayDescription || "Description"}
                    </div>
                    <div className={styles.ppTwitterDomain}>
                      {meta.url ? new URL(meta.url).hostname : "example.com"}
                    </div>
                  </div>
                  {image && (
                    <div className={styles.ppTwitterImageSummary}>
                      <img src={image} alt="" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {image && (
                  <div className={styles.ppTwitterImageLarge}>
                    <img src={image} alt="" />
                  </div>
                )}
                <div className={styles.ppTwitterContent}>
                  <div className={styles.ppTwitterTitle}>{displayTitle || "Title"}</div>
                  <div className={styles.ppTwitterDescription}>
                    {displayDescription || "Description"}
                  </div>
                  <div className={styles.ppTwitterDomain}>
                    {meta.url ? new URL(meta.url).hostname : "example.com"}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {platform === "linkedin" && (
          <div className={styles.ppLinkedinCard}>
            {image && (
              <div className={styles.ppLinkedinImage}>
                <img src={image} alt="" />
              </div>
            )}
            <div className={styles.ppLinkedinContent}>
              <div className={styles.ppLinkedinTitle}>{displayTitle || "Title"}</div>
              <div className={styles.ppLinkedinDomain}>
                {meta.url ? new URL(meta.url).hostname : "example.com"}
              </div>
            </div>
          </div>
        )}

        {platform === "slack" && (
          <div className={styles.ppSlackCard}>
            <div className={styles.ppSlackHeader}>
              <div className={styles.ppSlackFavicon}>
                {meta.favicon ? <img src={meta.favicon} alt="" /> : "🌐"}
              </div>
              <div className={styles.ppSlackSite}>{meta.siteName || "Website"}</div>
            </div>
            {image && (
              <div className={styles.ppSlackImage}>
                <img src={image} alt="" />
              </div>
            )}
            <div className={styles.ppSlackContent}>
              <div className={styles.ppSlackTitle}>{displayTitle || "Title"}</div>
              <div className={styles.ppSlackDescription}>{displayDescription || "Description"}</div>
            </div>
          </div>
        )}

        {platform === "discord" && (
          <div className={styles.ppDiscordCard}>
            <div
              className={styles.ppDiscordAccent}
              style={{ background: meta.themeColor || "#5865F2" }}
            />
            <div className={styles.ppDiscordBody}>
              <div className={styles.ppDiscordContent}>
                <div className={styles.ppDiscordSite}>{meta.siteName || "Website"}</div>
                <div className={styles.ppDiscordTitle}>{displayTitle || "Title"}</div>
                <div className={styles.ppDiscordDescription}>{displayDescription || "Description"}</div>
              </div>
              {image && (
                <div className={styles.ppDiscordThumbnail}>
                  <img src={image} alt="" />
                </div>
              )}
            </div>
          </div>
        )}

        {platform === "whatsapp" && (
          <div className={styles.ppWhatsappBubble}>
            <div className={styles.ppWhatsappCard}>
              {image && (
                <div className={styles.ppWhatsappImage}>
                  <img src={image} alt="" />
                </div>
              )}
              <div className={styles.ppWhatsappContent}>
                <div className={styles.ppWhatsappTitle}>{displayTitle || "Title"}</div>
                <div className={styles.ppWhatsappDescription}>{displayDescription || "Description"}</div>
                <div className={styles.ppWhatsappDomain}>
                  {meta.url ? new URL(meta.url).hostname : "example.com"}
                </div>
              </div>
              <div className={styles.ppWhatsappTime}>12:34 PM</div>
            </div>
          </div>
        )}

        {platform === "imessage" && (
          <div className={styles.ppImessageBubble}>
            <div className={styles.ppImessageCard}>
              <div className={styles.ppImessageSite}>
                {meta.siteName || new URL(meta.url || "https://example.com").hostname}
              </div>
              {image && (
                <div className={styles.ppImessageImage}>
                  <img src={image} alt="" />
                </div>
              )}
              <div className={styles.ppImessageContent}>
                <div className={styles.ppImessageTitle}>{displayTitle || "Title"}</div>
                <div className={styles.ppImessageDescription}>{displayDescription || "Description"}</div>
              </div>
            </div>
          </div>
        )}

        {platform === "telegram" && (
          <div className={styles.ppTelegramBubble}>
            <div className={styles.ppTelegramCard}>
              {image && (
                <div className={styles.ppTelegramImage}>
                  <img src={image} alt="" />
                </div>
              )}
              <div className={styles.ppTelegramContent}>
                <div className={styles.ppTelegramTitle}>{displayTitle || "Title"}</div>
                <div className={styles.ppTelegramDescription}>{displayDescription || "Description"}</div>
                <div className={styles.ppTelegramSite}>{meta.siteName || meta.url || "example.com"}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}