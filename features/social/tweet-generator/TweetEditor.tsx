// features/social/tweet-generator/TweetEditor.tsx
"use client";

import { useCallback, useRef } from "react";
import type { TweetContent, TweetEngagement, TweetProfile, TweetLayout } from "./ts/types";
import { validateTweetLength, TWITTER_SOURCES, generateDefaultAvatar } from "./ts/utils";
import styles from "./style/TweetEditor.module.css";

type TweetEditorProps = {
  layout: TweetLayout;
  content: TweetContent;
  onChange: (c: TweetContent) => void;
  engagement: TweetEngagement;
  onEngagementChange: (e: TweetEngagement) => void;
  profile?: TweetProfile;
  onProfileChange?: (p: TweetProfile) => void;
  showProfileEditor?: boolean;
};

export default function TweetEditor({
  layout,
  content,
  onChange,
  engagement,
  onEngagementChange,
  profile,
  onProfileChange,
  showProfileEditor = false,
}: TweetEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validation = validateTweetLength(content.text);

  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onProfileChange || !profile) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result;
        if (typeof result === "string") {
          onProfileChange({ ...profile, avatar: result });
        }
      };
      reader.readAsDataURL(file);
    },
    [profile, onProfileChange]
  );

  const handleGenerateAvatar = useCallback(() => {
    if (!onProfileChange || !profile) return;
    onProfileChange({
      ...profile,
      avatar: generateDefaultAvatar(profile.displayName),
    });
  }, [profile, onProfileChange]);

  if (showProfileEditor && profile && onProfileChange) {
    return (
      <div className={styles.teRoot}>
        <section className={styles.teSection}>
          <p className={styles.teLabel}>Profile Picture</p>
          <div className={styles.teAvatarUpload}>
            <div className={styles.teAvatarPreview}>
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} />
              ) : (
                <div className={styles.teAvatarPlaceholder}>
                  <i className="ti ti-user" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className={styles.teAvatarActions}>
              <button
                type="button"
                className={styles.teAvatarBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="ti ti-upload" aria-hidden="true" />
                Upload
              </button>
              <button
                type="button"
                className={`${styles.teAvatarBtn} ${styles.teAvatarBtnSecondary}`}
                onClick={handleGenerateAvatar}
              >
                <i className="ti ti-wand" aria-hidden="true" />
                Generate
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.teFileInput}
              onChange={handleAvatarUpload}
            />
          </div>
        </section>

        <section className={styles.teSection}>
          <div className={styles.teField}>
            <label className={styles.teFieldLabel} htmlFor="te-display-name">
              Display Name
            </label>
            <input
              id="te-display-name"
              type="text"
              className={styles.teInput}
              value={profile.displayName}
              onChange={(e) => onProfileChange({ ...profile, displayName: e.target.value })}
              placeholder="John Doe"
              maxLength={50}
            />
          </div>

          <div className={styles.teField}>
            <label className={styles.teFieldLabel} htmlFor="te-handle">
              Handle (username)
            </label>
            <div className={styles.teInputGroup}>
              <span className={styles.teInputPrefix}>@</span>
              <input
                id="te-handle"
                type="text"
                className={`${styles.teInput} ${styles.teInputWithPrefix}`}
                value={profile.handle}
                onChange={(e) =>
                  onProfileChange({
                    ...profile,
                    handle: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                  })
                }
                placeholder="johndoe"
                maxLength={15}
              />
            </div>
          </div>
        </section>

        <section className={styles.teSection}>
          <div className={styles.teToggleRow}>
            <div className={styles.teToggleLabelGroup}>
              <span className={styles.teToggleLabel}>Verified Badge</span>
              <span className={styles.teToggleHint}>Show verification checkmark</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.verified}
              className={`${styles.teToggle}${profile.verified ? ` ${styles.on}` : ""}`}
              onClick={() => onProfileChange({ ...profile, verified: !profile.verified })}
            >
              <span className={styles.teToggleThumb} />
            </button>
          </div>

          {profile.verified && (
            <div className={styles.teVerifiedType}>
              {(["blue", "gold", "gray"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.teVerifiedBtn}${profile.verifiedType === type ? ` ${styles.active}` : ""}`}
                  onClick={() => onProfileChange({ ...profile, verifiedType: type })}
                >
                  <i
                    className="ti ti-circle-check-filled"
                    style={{
                      color:
                        type === "blue" ? "#1D9BF0" : type === "gold" ? "#FFD700" : "#697882",
                    }}
                    aria-hidden="true"
                  />
                  <span>
                    {type === "blue" ? "Individual" : type === "gold" ? "Business" : "Government"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className={styles.teRoot}>
      <section className={styles.teSection}>
        <div className={styles.teField}>
          <div className={styles.teFieldHeader}>
            <label className={styles.teFieldLabel} htmlFor="te-tweet-text">
              Tweet Text
            </label>
            <span className={`${styles.teCharCount}${!validation.valid ? ` ${styles.teOverLimit}` : ""}`}>
              {validation.length} / {validation.max}
            </span>
          </div>
          <textarea
            id="te-tweet-text"
            className={`${styles.teTextarea}${!validation.valid ? ` ${styles.teError}` : ""}`}
            value={content.text}
            onChange={(e) => onChange({ ...content, text: e.target.value })}
            placeholder="What's happening?"
            rows={6}
            maxLength={500}
            autoFocus
          />
          {!validation.valid && (
            <span className={styles.teErrorMsg}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
              Tweet exceeds {validation.max} characters
            </span>
          )}
        </div>
      </section>

      <section className={styles.teSection}>
        <p className={styles.teLabel}>Timestamp</p>
        <div className={styles.teTimestampOptions}>
          {(["relative", "absolute", "custom"] as const).map((fmt) => (
            <label key={fmt} className={styles.teRadioLabel}>
              <input
                type="radio"
                name="timestamp-format"
                value={fmt}
                checked={content.timestampFormat === fmt}
                onChange={() => onChange({ ...content, timestampFormat: fmt })}
                className={styles.teRadio}
              />
              <span className={styles.teRadioText}>
                {fmt === "relative"
                  ? "Relative (2h ago)"
                  : fmt === "absolute"
                    ? "Absolute (date + time)"
                    : "Custom"}
              </span>
            </label>
          ))}
        </div>

        {content.timestampFormat === "custom" ? (
          <div className={styles.teField}>
            <input
              type="text"
              className={styles.teInput}
              value={content.customTimestamp || ""}
              onChange={(e) => onChange({ ...content, customTimestamp: e.target.value })}
              placeholder="e.g., 2:30 PM · Dec 15, 2024"
            />
          </div>
        ) : (
          <div className={styles.teField}>
            <input
              type="datetime-local"
              className={styles.teInput}
              value={content.timestamp.slice(0, 16)}
              onChange={(e) =>
                onChange({ ...content, timestamp: new Date(e.target.value).toISOString() })
              }
            />
          </div>
        )}
      </section>

      <section className={styles.teSection}>
        <div className={styles.teToggleRow}>
          <span className={styles.teToggleLabel}>Show Source</span>
          <button
            type="button"
            role="switch"
            aria-checked={content.showSource}
            className={`${styles.teToggle}${content.showSource ? ` ${styles.on}` : ""}`}
            onClick={() => onChange({ ...content, showSource: !content.showSource })}
          >
            <span className={styles.teToggleThumb} />
          </button>
        </div>

        {content.showSource && (
          <div className={styles.teField}>
            <select
              className={styles.teSelect}
              value={content.source}
              onChange={(e) => onChange({ ...content, source: e.target.value })}
            >
              {TWITTER_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      <section className={styles.teSection}>
        <div className={styles.teToggleRow}>
          <div className={styles.teToggleLabelGroup}>
            <span className={styles.teToggleLabel}>Engagement Metrics</span>
            <span className={styles.teToggleHint}>Likes, retweets, etc.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={engagement.showMetrics}
            className={`${styles.teToggle}${engagement.showMetrics ? ` ${styles.on}` : ""}`}
            onClick={() =>
              onEngagementChange({
                ...engagement,
                showMetrics: !engagement.showMetrics,
              })
            }
          >
            <span className={styles.teToggleThumb} />
          </button>
        </div>

        {engagement.showMetrics && (
          <div className={styles.teMetricsGrid}>
            {(
              [
                { key: "replies", icon: "ti-message-circle", label: "Replies" },
                { key: "retweets", icon: "ti-repeat", label: "Retweets" },
                { key: "likes", icon: "ti-heart", label: "Likes" },
                { key: "bookmarks", icon: "ti-bookmark", label: "Bookmarks" },
              ] as const
            ).map((metric) => (
              <div key={metric.key} className={styles.teMetricField}>
                <label className={styles.teMetricLabel}>
                  <i className={`ti ${metric.icon}`} aria-hidden="true" />
                  {metric.label}
                </label>
                <input
                  type="number"
                  min="0"
                  className={`${styles.teInput} ${styles.teInputNumber}`}
                  value={engagement[metric.key]}
                  onChange={(e) =>
                    onEngagementChange({
                      ...engagement,
                      [metric.key]: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {engagement.showMetrics && (
          <div className={styles.teToggleRow}>
            <span className={styles.teToggleLabel}>Show Views</span>
            <button
              type="button"
              role="switch"
              aria-checked={engagement.showViews}
              className={`${styles.teToggle}${engagement.showViews ? ` ${styles.on}` : ""}`}
              onClick={() =>
                onEngagementChange({
                  ...engagement,
                  showViews: !engagement.showViews,
                })
              }
            >
              <span className={styles.teToggleThumb} />
            </button>
          </div>
        )}

        {engagement.showViews && (
          <div className={styles.teField}>
            <label className={styles.teFieldLabel}>
              <i className="ti ti-eye" aria-hidden="true" />
              Views
            </label>
            <input
              type="number"
              min="0"
              className={`${styles.teInput} ${styles.teInputNumber}`}
              value={engagement.views}
              onChange={(e) =>
                onEngagementChange({
                  ...engagement,
                  views: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}