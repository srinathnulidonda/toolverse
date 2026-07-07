// features/social/hashtag-generator/PlatformSelector.tsx
"use client";

import type { Platform } from "./types";
import { PLATFORM_LIMITS } from "./data";

type PlatformSelectorProps = {
  selectedPlatform: Platform;
  onChange: (platform: Platform) => void;
};

export default function PlatformSelector({ selectedPlatform, onChange }: PlatformSelectorProps) {
  const platforms = Object.entries(PLATFORM_LIMITS) as [Platform, typeof PLATFORM_LIMITS[Platform]][];

  return (
    <>
      <div className="ps-root">
        <div className="ps-header">
          <i className="ti ti-apps" aria-hidden="true" />
          <span>Select Platform</span>
        </div>
        <div className="ps-grid">
          {platforms.map(([key, config]) => (
            <button
              key={key}
              className={`ps-platform ${selectedPlatform === key ? "active" : ""}`}
              onClick={() => onChange(key)}
            >
              <div className="ps-platform-icon">
                <i className={`ti ${config.icon}`} aria-hidden="true" />
              </div>
              <div className="ps-platform-info">
                <span className="ps-platform-name">{config.label}</span>
                <span className="ps-platform-limit">Max: {config.maxHashtags}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="ps-selected-info">
          <div className="ps-info-card">
            <div className="ps-info-header">
              <i className={`ti ${PLATFORM_LIMITS[selectedPlatform].icon}`} aria-hidden="true" />
              <span>{PLATFORM_LIMITS[selectedPlatform].label} Guidelines</span>
            </div>
            <ul className="ps-info-list">
              <li>
                <strong>Recommended:</strong> {PLATFORM_LIMITS[selectedPlatform].recommended} hashtags
              </li>
              <li>
                <strong>Maximum:</strong> {PLATFORM_LIMITS[selectedPlatform].maxHashtags} hashtags
              </li>
              <li>
                <strong>Character limit:</strong> {PLATFORM_LIMITS[selectedPlatform].maxCharacters.toLocaleString()}
              </li>
            </ul>
            <p className="ps-info-note">{PLATFORM_LIMITS[selectedPlatform].notes}</p>
          </div>
        </div>
      </div>

      <style>{`
        .ps-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ps-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ps-header i { font-size: 16px; color: var(--text-secondary); }

        .ps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }

        .ps-platform {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 8px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .ps-platform:hover {
          background: var(--border-faint);
          border-color: var(--text-disabled);
        }
        .ps-platform.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .ps-platform-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--text-secondary);
          transition: color 0.15s;
        }
        .ps-platform.active .ps-platform-icon {
          color: var(--brand-text);
        }

        .ps-platform-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ps-platform-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
        }
        .ps-platform.active .ps-platform-name {
          color: var(--brand-text);
        }
        .ps-platform-limit {
          font-size: 10px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }
        .ps-platform.active .ps-platform-limit {
          color: var(--brand-text);
          opacity: 0.8;
        }

        .ps-selected-info {
          margin-top: 4px;
        }
        .ps-info-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 12px;
        }
        .ps-info-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        .ps-info-header i { font-size: 14px; color: var(--text-secondary); }

        .ps-info-list {
          margin: 0 0 8px;
          padding-left: 16px;
          list-style: none;
        }
        .ps-info-list li {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 3px;
          position: relative;
        }
        .ps-info-list li::before {
          content: "•";
          position: absolute;
          left: -12px;
          color: var(--text-tertiary);
        }
        .ps-info-list strong {
          color: var(--text);
          font-weight: 600;
        }

        .ps-info-note {
          font-size: 10.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 600px) {
          .ps-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
          .ps-platform {
            padding: 10px 6px;
          }
        }
      `}</style>
    </>
  );
}