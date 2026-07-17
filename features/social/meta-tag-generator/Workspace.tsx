// features/social/meta-tag-generator/Workspace.tsx
"use client";

import type { Tool } from "@/lib/tools";
import { useMetaTagGeneratorStore } from "./store";
import BasicSeoForm from "./BasicSeoForm";
import SocialMetaForm from "./SocialMetaForm";
import AdvancedMetaForm from "./AdvancedMetaForm";
import SeoPreview from "./SeoPreview";
import ValidationPanel from "./ValidationPanel";
import CodeExport from "./CodeExport";
import Templates from "./Templates";
import HistoryPanel from "./HistoryPanel";

type TabId =
  "basic" | "social" | "advanced" | "preview" | "validation" | "code" | "templates" | "history";

const TABS: { id: TabId; icon: string; label: string; group: "input" | "output" }[] = [
  { id: "basic", icon: "ti-file-text", label: "Basic SEO", group: "input" },
  { id: "social", icon: "ti-share", label: "Social", group: "input" },
  { id: "advanced", icon: "ti-settings", label: "Advanced", group: "input" },
  { id: "templates", icon: "ti-template", label: "Templates", group: "input" },
  { id: "preview", icon: "ti-eye", label: "Preview", group: "output" },
  { id: "validation", icon: "ti-checkup-list", label: "Validate", group: "output" },
  { id: "code", icon: "ti-code", label: "Export", group: "output" },
  { id: "history", icon: "ti-history", label: "History", group: "output" },
];

export default function MetaTagGeneratorWorkspace({ tool }: { tool: Tool }) {
  const {
    tags,
    setTags,
    activeTab,
    setActiveTab,
    mobileOutputOpen,
    setMobileOutputOpen,
    history,
    setHistory,
    handleSaveToHistory,
    handleRestoreFromHistory,
    handleTemplateSelect,
    handleReset,
  } = useMetaTagGeneratorStore();

  const inputTabs = TABS.filter((t) => t.group === "input");
  const outputTabs = TABS.filter((t) => t.group === "output");
  const isOutputTab = outputTabs.some((t) => t.id === activeTab);

  const handleResetWithConfirm = () => {
    if (confirm("Reset all fields? This will clear your current work.")) {
      handleReset();
    }
  };

  const handleClearHistory = () => {
    if (confirm("Clear all history?")) {
      setHistory({ v: 1, data: [] });
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => ({
      v: 1,
      data: (prev?.data || []).filter((i) => i.id !== id),
    }));
  };

  return (
    <>
      <div className="mtg-root">
        <div className="mtg-workspace">
          <div className="mtg-left-panel">
            <div className="mtg-tabs-container">
              <div className="mtg-tabs-group">
                <span className="mtg-tabs-group-label">Configure</span>
                <div className="mtg-tabs" role="tablist">
                  {inputTabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      className={`mtg-tab ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`ti ${tab.icon}`} aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mtg-content">
              {activeTab === "basic" && <BasicSeoForm tags={tags} onChange={setTags} />}
              {activeTab === "social" && <SocialMetaForm tags={tags} onChange={setTags} />}
              {activeTab === "advanced" && <AdvancedMetaForm tags={tags} onChange={setTags} />}
              {activeTab === "templates" && <Templates onSelect={handleTemplateSelect} />}
            </div>

            <div className="mtg-actions">
              <button className="mtg-action-btn mtg-save-btn" onClick={handleSaveToHistory}>
                <i className="ti ti-device-floppy" aria-hidden="true" />
                Save
              </button>
              <button className="mtg-action-btn mtg-reset-btn" onClick={handleResetWithConfirm}>
                <i className="ti ti-refresh" aria-hidden="true" />
                Reset
              </button>
              <button
                className="mtg-action-btn mtg-mobile-output-btn"
                onClick={() => setMobileOutputOpen(true)}
              >
                <i className="ti ti-eye" aria-hidden="true" />
                View Output
              </button>
            </div>
          </div>

          <div className="mtg-right-panel">
            <div className="mtg-tabs-container">
              <div className="mtg-tabs-group">
                <span className="mtg-tabs-group-label">Output</span>
                <div className="mtg-tabs" role="tablist">
                  {outputTabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      className={`mtg-tab ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`ti ${tab.icon}`} aria-hidden="true" />
                      <span>{tab.label}</span>
                      {tab.id === "history" && history.length > 0 && (
                        <span className="mtg-badge">{history.length}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mtg-content">
              {activeTab === "preview" && <SeoPreview tags={tags} />}
              {activeTab === "validation" && <ValidationPanel tags={tags} />}
              {activeTab === "code" && <CodeExport tags={tags} />}
              {activeTab === "history" && (
                <HistoryPanel
                  items={history}
                  onRestore={handleRestoreFromHistory}
                  onDelete={handleDeleteHistory}
                  onClear={handleClearHistory}
                />
              )}
              {!isOutputTab && (
                <div className="mtg-output-placeholder">
                  <SeoPreview tags={tags} />
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileOutputOpen && (
          <>
            <div
              className="mtg-mobile-backdrop"
              onClick={() => setMobileOutputOpen(false)}
              aria-hidden="true"
            />
            <div className="mtg-mobile-modal">
              <div className="mtg-mobile-modal-header">
                <div className="mtg-mobile-tabs">
                  {outputTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`mtg-mobile-tab ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`ti ${tab.icon}`} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <button className="mtg-mobile-close" onClick={() => setMobileOutputOpen(false)}>
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className="mtg-mobile-modal-body">
                {activeTab === "preview" && <SeoPreview tags={tags} />}
                {activeTab === "validation" && <ValidationPanel tags={tags} />}
                {activeTab === "code" && <CodeExport tags={tags} />}
                {activeTab === "history" && (
                  <HistoryPanel
                    items={history}
                    onRestore={handleRestoreFromHistory}
                    onDelete={handleDeleteHistory}
                    onClear={handleClearHistory}
                  />
                )}
                {!isOutputTab && <SeoPreview tags={tags} />}
              </div>
            </div>
          </>
        )}

        <div className="mtg-footer">
          <div className="mtg-footer-item">
            <i className="ti ti-lock" aria-hidden="true" />
            <span>100% browser-side processing</span>
          </div>
          <div className="mtg-footer-item">
            <i className="ti ti-code" aria-hidden="true" />
            <span>6 export formats available</span>
          </div>
          <div className="mtg-footer-item">
            <i className="ti ti-shield-check" aria-hidden="true" />
            <span>Real-time SEO validation</span>
          </div>
        </div>
      </div>

      <style>{`
        .mtg-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mtg-workspace {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          min-height: 720px;
        }
        .mtg-left-panel,
        .mtg-right-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .mtg-tabs-container {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }
        .mtg-tabs-group {
          display: flex;
          flex-direction: column;
        }
        .mtg-tabs-group-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 10px 16px 4px;
        }
        .mtg-tabs {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 8px 4px;
        }
        .mtg-tabs::-webkit-scrollbar { display: none; }
        .mtg-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          border-radius: 6px 6px 0 0;
          position: relative;
        }
        .mtg-tab i { font-size: 14px; }
        .mtg-tab:hover { color: var(--text-secondary); background: var(--border-faint); }
        .mtg-tab.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
          background: var(--bg-card);
        }
        .mtg-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: var(--brand-light);
          color: var(--brand-text);
          border-radius: 999px;
          font-size: 9.5px;
          font-weight: 700;
        }
        .mtg-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          overscroll-behavior: contain;
        }
        .mtg-output-placeholder {
          opacity: 0.6;
        }
        .mtg-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
        }
        .mtg-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .mtg-action-btn i { font-size: 15px; }
        .mtg-action-btn:hover { background: var(--border); color: var(--text); }
        .mtg-save-btn {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }
        .mtg-save-btn:hover { background: var(--brand); color: white; }
        .mtg-mobile-output-btn { display: none; }
        .mtg-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 24px;
          padding: 12px 20px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
        }
        .mtg-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-tertiary);
        }
        .mtg-footer-item i { font-size: 13px; }
        .mtg-mobile-backdrop {
          display: none;
        }
        .mtg-mobile-modal {
          display: none;
        }
        @media (max-width: 1100px) {
          .mtg-workspace {
            grid-template-columns: 1fr 380px;
          }
        }
        @media (max-width: 900px) {
          .mtg-workspace {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .mtg-right-panel {
            display: none;
          }
          .mtg-actions {
            grid-template-columns: 1fr 1fr 1fr;
          }
          .mtg-mobile-output-btn {
            display: flex;
          }
          .mtg-tab span {
            display: none;
          }
          .mtg-tab {
            padding: 10px;
          }
          .mtg-tab i { font-size: 17px; }
          .mtg-mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 99;
            animation: mtg-fade-in 0.2s;
          }
          .mtg-mobile-modal {
            display: flex;
            flex-direction: column;
            position: fixed;
            inset: 0;
            background: var(--bg-card);
            z-index: 100;
            animation: mtg-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .mtg-mobile-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg-surface);
            border-bottom: 0.5px solid var(--border);
          }
          .mtg-mobile-tabs {
            display: flex;
            gap: 6px;
          }
          .mtg-mobile-tab {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-card);
            border: 0.5px solid var(--border);
            border-radius: 8px;
            color: var(--text-tertiary);
            font-size: 17px;
            cursor: pointer;
            transition: all 0.15s;
          }
          .mtg-mobile-tab.active {
            background: var(--brand-light);
            border-color: var(--brand-border);
            color: var(--brand-text);
          }
          .mtg-mobile-close {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-card);
            border: 0.5px solid var(--border);
            border-radius: 50%;
            color: var(--text-secondary);
            font-size: 16px;
            cursor: pointer;
          }
          .mtg-mobile-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }
          @keyframes mtg-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes mtg-slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .mtg-footer {
            flex-direction: column;
            gap: 8px;
          }
          .mtg-footer-item:not(:first-child) {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .mtg-content {
            padding: 16px;
          }
          .mtg-actions {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
}
