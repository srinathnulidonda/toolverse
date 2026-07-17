// features/social/tweet-generator/PreviewFab.tsx
"use client";

import type { TweetData, TweetStyle } from "./types";
import TweetPreview from "./TweetPreview";

type PreviewFabProps = {
  tweetData: TweetData;
  style: TweetStyle;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: (thumbnail: string) => void;
};

export default function PreviewFab({
  tweetData,
  style,
  isOpen,
  onOpen,
  onClose,
  onSave,
}: PreviewFabProps) {
  const hasContent = tweetData.content.text.trim().length > 0;

  if (!hasContent) return null;

  return (
    <>
      {/* Floating action button */}
      <button
        className="pfab-btn"
        onClick={onOpen}
        aria-label="View tweet preview"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="pfab-btn-inner">
          <i className="ti ti-eye pfab-icon" aria-hidden="true" />
          <span className="pfab-label">View Preview</span>
        </span>
        <span className="pfab-arrow" aria-hidden="true">
          <i className="ti ti-chevron-up" />
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="pfab-backdrop" onClick={onClose} aria-hidden="true" />}

      {/* Bottom sheet */}
      <div
        className={`pfab-sheet${isOpen ? " pfab-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Tweet preview"
      >
        {/* Drag handle */}
        <button className="pfab-handle" onClick={onClose} aria-label="Close preview">
          <span className="pfab-handle-bar" />
        </button>

        {/* Sheet header */}
        <div className="pfab-sheet-header">
          <div className="pfab-sheet-title-group">
            <span className="pfab-sheet-title">Tweet Preview</span>
            <span className="pfab-sheet-live">
              <span className="pfab-live-dot" aria-hidden="true" />
              Live
            </span>
          </div>
          <button className="pfab-sheet-close" onClick={onClose} aria-label="Close preview">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Sheet content */}
        <div className="pfab-sheet-body">
          <TweetPreview tweetData={tweetData} style={style} onSave={onSave} />
        </div>
      </div>

      <style>{fabStyles}</style>
    </>
  );
}

const fabStyles = `
  .pfab-btn {
    display: none;
  }

  .pfab-backdrop {
    display: none;
  }

  .pfab-sheet {
    display: none;
  }

  @media (max-width: 768px) {
    .pfab-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      bottom: 16px;
      left: 16px;
      right: 16px;
      margin: 0 16px 16px;
      height: 50px;
      padding: 0 16px 0 18px;
      background: var(--bg-card);
      color: var(--text);
      border: 0.5px solid var(--border);
      border-radius: 13px;
      font-family: var(--font-sans);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(0, 0, 0, 0.1),
        0 0 0 0.5px var(--border);
      transition: all 0.15s;
      -webkit-tap-highlight-color: transparent;
      z-index: 10;
      gap: 10px;
    }

    .pfab-btn:hover {
      background: var(--bg-surface);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1), 0 8px 28px rgba(0, 0, 0, 0.12),
        0 0 0 0.5px var(--border);
    }

    .pfab-btn:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06), 0 3px 12px rgba(0, 0, 0, 0.08),
        0 0 0 0.5px var(--border);
    }

    .pfab-btn-inner {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .pfab-icon {
      font-size: 19px;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .pfab-label {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.1px;
      white-space: nowrap;
    }

    .pfab-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: var(--bg-surface);
      border: 0.5px solid var(--border);
      font-size: 14px;
      color: var(--text-tertiary);
      flex-shrink: 0;
      transition: background 0.12s;
    }

    .pfab-btn:hover .pfab-arrow {
      background: var(--border);
      color: var(--text-secondary);
    }

    .pfab-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 49;
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      animation: pfab-fade-in 0.2s ease forwards;
    }

    @keyframes pfab-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .pfab-sheet {
      display: flex;
      flex-direction: column;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 92dvh;
      background: var(--bg-card);
      border-radius: 22px 22px 0 0;
      border: 0.5px solid var(--border);
      border-bottom: none;
      z-index: 50;
      transform: translateY(100%);
      transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform;
      overflow: hidden;
    }

    .pfab-sheet--open {
      transform: translateY(0);
    }

    .pfab-handle {
      padding: 14px 0 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
      background: none;
      border: none;
      width: 100%;
      -webkit-tap-highlight-color: transparent;
    }

    .pfab-handle-bar {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: var(--border);
      transition: background 0.12s;
    }

    .pfab-handle:hover .pfab-handle-bar,
    .pfab-handle:active .pfab-handle-bar {
      background: var(--text-disabled);
    }

    .pfab-sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 20px 16px;
      border-bottom: 0.5px solid var(--border);
      flex-shrink: 0;
      gap: 14px;
    }

    .pfab-sheet-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .pfab-sheet-title {
      font-size: 16.5px;
      font-weight: 600;
      color: var(--text);
      font-family: var(--font-sans);
      letter-spacing: -0.3px;
      white-space: nowrap;
    }

    .pfab-sheet-live {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--brand-light);
      border: 0.5px solid var(--brand-border);
      font-size: 11px;
      font-weight: 500;
      color: var(--brand-text);
      font-family: var(--font-sans);
      white-space: nowrap;
    }

    .pfab-live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--brand);
      animation: pfab-pulse 2s ease-in-out infinite;
    }

    @keyframes pfab-pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(0.8);
      }
    }

    .pfab-sheet-close {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 0.5px solid var(--border);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: var(--text-secondary);
      cursor: pointer;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s, color 0.12s;
    }

    .pfab-sheet-close:hover {
      background: var(--border-faint);
    }

    .pfab-sheet-close:active {
      background: var(--border);
      color: var(--text);
    }

    .pfab-sheet-body {
      overflow-y: auto;
      flex: 1;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
  }
`;
