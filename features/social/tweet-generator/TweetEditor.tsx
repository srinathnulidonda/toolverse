// features/social/tweet-generator/TweetEditor.tsx
"use client";

import { useCallback, useRef } from "react";
import type { TweetContent, TweetEngagement, TweetProfile, TweetLayout } from "./types";
import { validateTweetLength, TWITTER_SOURCES, generateDefaultAvatar } from "./utils";

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
      <>
        <div className="te-root">
          <section className="te-section">
            <p className="te-label">Profile Picture</p>
            <div className="te-avatar-upload">
              <div className="te-avatar-preview">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.displayName} />
                ) : (
                  <div className="te-avatar-placeholder">
                    <i className="ti ti-user" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="te-avatar-actions">
                <button
                  type="button"
                  className="te-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="ti ti-upload" aria-hidden="true" />
                  Upload
                </button>
                <button
                  type="button"
                  className="te-avatar-btn te-avatar-btn-secondary"
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
                className="te-file-input"
                onChange={handleAvatarUpload}
              />
            </div>
          </section>

          <section className="te-section">
            <div className="te-field">
              <label className="te-field-label" htmlFor="te-display-name">
                Display Name
              </label>
              <input
                id="te-display-name"
                type="text"
                className="te-input"
                value={profile.displayName}
                onChange={(e) => onProfileChange({ ...profile, displayName: e.target.value })}
                placeholder="John Doe"
                maxLength={50}
              />
            </div>

            <div className="te-field">
              <label className="te-field-label" htmlFor="te-handle">
                Handle (username)
              </label>
              <div className="te-input-group">
                <span className="te-input-prefix">@</span>
                <input
                  id="te-handle"
                  type="text"
                  className="te-input te-input-with-prefix"
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

          <section className="te-section">
            <div className="te-toggle-row">
              <div className="te-toggle-label-group">
                <span className="te-toggle-label">Verified Badge</span>
                <span className="te-toggle-hint">Show verification checkmark</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.verified}
                className={`te-toggle${profile.verified ? " on" : ""}`}
                onClick={() => onProfileChange({ ...profile, verified: !profile.verified })}
              >
                <span className="te-toggle-thumb" />
              </button>
            </div>

            {profile.verified && (
              <div className="te-verified-type">
                {(["blue", "gold", "gray"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`te-verified-btn${profile.verifiedType === type ? " active" : ""}`}
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

        <style>{editorStyles}</style>
      </>
    );
  }

  return (
    <>
      <div className="te-root">
        <section className="te-section">
          <div className="te-field">
            <div className="te-field-header">
              <label className="te-field-label" htmlFor="te-tweet-text">
                Tweet Text
              </label>
              <span className={`te-char-count${!validation.valid ? " te-over-limit" : ""}`}>
                {validation.length} / {validation.max}
              </span>
            </div>
            <textarea
              id="te-tweet-text"
              className={`te-textarea${!validation.valid ? " te-error" : ""}`}
              value={content.text}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              placeholder="What's happening?"
              rows={6}
              maxLength={500}
              autoFocus
            />
            {!validation.valid && (
              <span className="te-error-msg">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                Tweet exceeds {validation.max} characters
              </span>
            )}
          </div>
        </section>

        <section className="te-section">
          <p className="te-label">Timestamp</p>
          <div className="te-timestamp-options">
            {(["relative", "absolute", "custom"] as const).map((fmt) => (
              <label key={fmt} className="te-radio-label">
                <input
                  type="radio"
                  name="timestamp-format"
                  value={fmt}
                  checked={content.timestampFormat === fmt}
                  onChange={() => onChange({ ...content, timestampFormat: fmt })}
                  className="te-radio"
                />
                <span className="te-radio-text">
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
            <div className="te-field">
              <input
                type="text"
                className="te-input"
                value={content.customTimestamp || ""}
                onChange={(e) => onChange({ ...content, customTimestamp: e.target.value })}
                placeholder="e.g., 2:30 PM · Dec 15, 2024"
              />
            </div>
          ) : (
            <div className="te-field">
              <input
                type="datetime-local"
                className="te-input"
                value={content.timestamp.slice(0, 16)}
                onChange={(e) =>
                  onChange({ ...content, timestamp: new Date(e.target.value).toISOString() })
                }
              />
            </div>
          )}
        </section>

        <section className="te-section">
          <div className="te-toggle-row">
            <span className="te-toggle-label">Show Source</span>
            <button
              type="button"
              role="switch"
              aria-checked={content.showSource}
              className={`te-toggle${content.showSource ? " on" : ""}`}
              onClick={() => onChange({ ...content, showSource: !content.showSource })}
            >
              <span className="te-toggle-thumb" />
            </button>
          </div>

          {content.showSource && (
            <div className="te-field">
              <select
                className="te-select"
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

        <section className="te-section">
          <div className="te-toggle-row">
            <div className="te-toggle-label-group">
              <span className="te-toggle-label">Engagement Metrics</span>
              <span className="te-toggle-hint">Likes, retweets, etc.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={engagement.showMetrics}
              className={`te-toggle${engagement.showMetrics ? " on" : ""}`}
              onClick={() =>
                onEngagementChange({
                  ...engagement,
                  showMetrics: !engagement.showMetrics,
                })
              }
            >
              <span className="te-toggle-thumb" />
            </button>
          </div>

          {engagement.showMetrics && (
            <div className="te-metrics-grid">
              {(
                [
                  { key: "replies", icon: "ti-message-circle", label: "Replies" },
                  { key: "retweets", icon: "ti-repeat", label: "Retweets" },
                  { key: "likes", icon: "ti-heart", label: "Likes" },
                  { key: "bookmarks", icon: "ti-bookmark", label: "Bookmarks" },
                ] as const
              ).map((metric) => (
                <div key={metric.key} className="te-metric-field">
                  <label className="te-metric-label">
                    <i className={`ti ${metric.icon}`} aria-hidden="true" />
                    {metric.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="te-input te-input-number"
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
            <div className="te-toggle-row">
              <span className="te-toggle-label">Show Views</span>
              <button
                type="button"
                role="switch"
                aria-checked={engagement.showViews}
                className={`te-toggle${engagement.showViews ? " on" : ""}`}
                onClick={() =>
                  onEngagementChange({
                    ...engagement,
                    showViews: !engagement.showViews,
                  })
                }
              >
                <span className="te-toggle-thumb" />
              </button>
            </div>
          )}

          {engagement.showViews && (
            <div className="te-field">
              <label className="te-field-label">
                <i className="ti ti-eye" aria-hidden="true" />
                Views
              </label>
              <input
                type="number"
                min="0"
                className="te-input te-input-number"
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

      <style>{editorStyles}</style>
    </>
  );
}

const editorStyles = `
  .te-root {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .te-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .te-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    font-family: var(--font-sans);
    margin: 0;
  }

  .te-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .te-field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .te-field-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .te-char-count {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    font-weight: 500;
  }
  .te-char-count.te-over-limit {
    color: #DC2626;
  }

  .te-input,
  .te-textarea,
  .te-select {
    font-family: var(--font-sans);
    font-size: 13.5px;
    color: var(--text);
    background: var(--bg);
    border: 0.5px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
  }

  .te-input:focus,
  .te-textarea:focus,
  .te-select:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-light);
  }

  .te-input.te-error,
  .te-textarea.te-error {
    border-color: #DC2626;
  }

  .te-textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
  }

  .te-input::placeholder,
  .te-textarea::placeholder {
    color: var(--text-disabled);
  }

  .te-select {
    cursor: pointer;
  }

  .te-error-msg {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    color: #DC2626;
    font-family: var(--font-sans);
  }

  .te-input-group {
    position: relative;
    display: flex;
    align-items: center;
  }

  .te-input-prefix {
    position: absolute;
    left: 12px;
    font-size: 13.5px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
    pointer-events: none;
  }

  .te-input-with-prefix {
    padding-left: 24px;
  }

  .te-input-number {
    font-family: var(--font-mono);
  }

  /* Avatar Upload */
  .te-avatar-upload {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .te-avatar-preview {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 0.5px solid var(--border);
    flex-shrink: 0;
    background: var(--bg-surface);
  }

  .te-avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .te-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-disabled);
    font-size: 24px;
  }

  .te-avatar-actions {
    display: flex;
    gap: 8px;
    flex: 1;
  }

  .te-avatar-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 7px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 12.5px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .te-avatar-btn i {
    font-size: 14px;
  }

  .te-avatar-btn:hover {
    background: var(--border);
    color: var(--text);
  }

  .te-avatar-btn-secondary {
    background: var(--brand-light);
    border-color: var(--brand-border);
    color: var(--brand-text);
  }

  .te-avatar-btn-secondary:hover {
    background: var(--brand-border);
  }

  .te-file-input {
    display: none;
  }

  /* Toggle */
  .te-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 13px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-radius: 8px;
  }

  .te-toggle-label-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .te-toggle-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .te-toggle-hint {
    font-size: 10.5px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
  }

  .te-toggle {
    width: 40px;
    height: 22px;
    border-radius: 999px;
    background: var(--border);
    border: none;
    padding: 2px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .te-toggle.on {
    background: var(--brand);
  }

  .te-toggle-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
    display: block;
  }

  .te-toggle.on .te-toggle-thumb {
    transform: translateX(18px);
  }

  /* Radio */
  .te-timestamp-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .te-radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
  }

  .te-radio-label:hover {
    background: var(--border-faint);
  }

  .te-radio {
    width: 16px;
    height: 16px;
    accent-color: var(--brand);
    cursor: pointer;
  }

  .te-radio-text {
    font-size: 12.5px;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  /* Verified Badge Type */
  .te-verified-type {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .te-verified-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 8px;
    border-radius: 8px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .te-verified-btn i {
    font-size: 20px;
  }

  .te-verified-btn span {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .te-verified-btn:hover {
    background: var(--border-faint);
  }

  .te-verified-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
  }

  .te-verified-btn.active span {
    color: var(--brand-text);
  }

  /* Metrics Grid */
  .te-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .te-metric-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .te-metric-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
  }

  .te-metric-label i {
    font-size: 13px;
  }

  @media (max-width: 600px) {
    .te-metrics-grid {
      grid-template-columns: 1fr;
    }
  }
`;
