// components/shared/FeatureWorkspace.tsx
import { useState } from "react";

interface FeatureWorkspaceProps {
  /** CSS class for the root container */
  className?: string;
  /** Content to render in the left side of the chrome */
  renderChromeLeft: (props: {
    setTab: (tabId: string) => void;
    activeTab: string;
  }) => React.ReactNode;
  /** Content to render in the right side of the chrome */
  renderChromeRight: (props: {
    setTab: (tabId: string) => void;
    activeTab: string;
  }) => React.ReactNode;
  /** Tabs for the tab bar */
  tabs: Array<{
    id: string;
    label: string;
    icon: string; // e.g., "ti-file"
  }>;
  /** Content for each tab */
  renderTabContent: (tabId: string) => React.ReactNode;
  /** Optional: content to render in the options bar (shown under tab bar for certain views) */
  renderOptionsBar?: () => React.ReactNode;
  /** Optional: footer content */
  footerContent?: React.ReactNode;
}

export default function FeatureWorkspace({
  className = "",
  renderChromeLeft,
  renderChromeRight,
  tabs,
  renderTabContent,
  renderOptionsBar,
  footerContent,
}: FeatureWorkspaceProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={`${className}`.trim()}>
      {/*  Chrome  */}
      <div className="fw-chrome">
        <div className="fw-chrome-left">
          {renderChromeLeft({ setTab: setActiveTab, activeTab })}
        </div>
        <div className="fw-chrome-right">
          {renderChromeRight({ setTab: setActiveTab, activeTab })}
        </div>
      </div>

      {/*  Tabs Bar  */}
      <div className="fw-tabs-bar">
        <nav className="fw-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`fw-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              <i className={`ti ${tab.icon}`} />
              {tab.label}
              {tab.id === "history" && /* placeholder for badge - parent can handle */ null}
            </button>
          ))}
        </nav>
      </div>

      {/*  Options Bar (conditionally rendered)  */}
      {renderOptionsBar && <div className="fw-options-bar">{renderOptionsBar()}</div>}

      {/*  Tab Content  */}
      <div className="fw-tab-content">{renderTabContent(activeTab)}</div>

      {/*  Footer  */}
      {footerContent && <div className="fw-footer">{footerContent}</div>}

      <style jsx>{`
        .fw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 600px;
        }

        /*  Chrome  */
        .fw-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .fw-chrome-left,
        .fw-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        /*  Tabs Bar  */
        .fw-tabs-bar {
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .fw-tabs {
          display: flex;
          padding: 0 14px;
        }

        .fw-tab {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 38px;
          padding: 0 14px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .fw-tab i {
          font-size: 13px;
        }

        .fw-tab:hover {
          color: var(--text);
        }

        .fw-tab.active {
          color: var(--text);
        }

        .fw-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 10px;
          right: 10px;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        /*  Options Bar  */
        .fw-options-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        /*  Tab Content  */
        .fw-tab-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Footer  */
        .fw-footer {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          font-size: 11px;
          color: var(--text-disabled);
        }

        .fw-footer i {
          font-size: 13px;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .fw-chrome {
            padding: 8px 10px;
          }

          .fw-options-bar {
            padding: 8px 10px;
            gap: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fw-tab,
          .fw-tab.active::after {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
