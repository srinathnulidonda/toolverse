// features/social/meta-tag-generator/Workspace.tsx
"use client";

import type { Tool } from "@/lib/tools";
import { useMetaTagGeneratorStore } from "./ts/store";
import BasicSeoForm from "./BasicSeoForm";
import SocialMetaForm from "./SocialMetaForm";
import AdvancedMetaForm from "./AdvancedMetaForm";
import SeoPreview from "./SeoPreview";
import ValidationPanel from "./ValidationPanel";
import CodeExport from "./CodeExport";
import Templates from "./Templates";
import HistoryPanel from "./HistoryPanel";
import styles from "./style/Workspace.module.css";

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
    <div className={styles.mtgRoot}>
      <div className={styles.mtgWorkspace}>
        <div className={styles.mtgLeftPanel}>
          <div className={styles.mtgTabsContainer}>
            <div className={styles.mtgTabsGroup}>
              <span className={styles.mtgTabsGroupLabel}>Configure</span>
              <div className={styles.mtgTabs} role="tablist">
                {inputTabs.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`${styles.mtgTab} ${activeTab === tab.id ? styles.active : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.mtgContent}>
            {activeTab === "basic" && <BasicSeoForm tags={tags} onChange={setTags} />}
            {activeTab === "social" && <SocialMetaForm tags={tags} onChange={setTags} />}
            {activeTab === "advanced" && <AdvancedMetaForm tags={tags} onChange={setTags} />}
            {activeTab === "templates" && <Templates onSelect={handleTemplateSelect} />}
          </div>

          <div className={styles.mtgActions}>
            <button className={`${styles.mtgActionBtn} ${styles.mtgSaveBtn}`} onClick={handleSaveToHistory}>
              <i className="ti ti-device-floppy" aria-hidden="true" />
              Save
            </button>
            <button className={styles.mtgActionBtn} onClick={handleResetWithConfirm}>
              <i className="ti ti-refresh" aria-hidden="true" />
              Reset
            </button>
            <button
              className={`${styles.mtgActionBtn} ${styles.mtgMobileOutputBtn}`}
              onClick={() => setMobileOutputOpen(true)}
            >
              <i className="ti ti-eye" aria-hidden="true" />
              View Output
            </button>
          </div>
        </div>

        <div className={styles.mtgRightPanel}>
          <div className={styles.mtgTabsContainer}>
            <div className={styles.mtgTabsGroup}>
              <span className={styles.mtgTabsGroupLabel}>Output</span>
              <div className={styles.mtgTabs} role="tablist">
                {outputTabs.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`${styles.mtgTab} ${activeTab === tab.id ? styles.active : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} aria-hidden="true" />
                    <span>{tab.label}</span>
                    {tab.id === "history" && history.length > 0 && (
                      <span className={styles.mtgBadge}>{history.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.mtgContent}>
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
              <div className={styles.mtgOutputPlaceholder}>
                <SeoPreview tags={tags} />
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOutputOpen && (
        <>
          <div
            className={styles.mtgMobileBackdrop}
            onClick={() => setMobileOutputOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.mtgMobileModal}>
            <div className={styles.mtgMobileModalHeader}>
              <div className={styles.mtgMobileTabs}>
                {outputTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.mtgMobileTab} ${activeTab === tab.id ? styles.active : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} aria-hidden="true" />
                  </button>
                ))}
              </div>
              <button className={styles.mtgMobileClose} onClick={() => setMobileOutputOpen(false)}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <div className={styles.mtgMobileModalBody}>
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

      <div className={styles.mtgFooter}>
        <div className={styles.mtgFooterItem}>
          <i className="ti ti-lock" aria-hidden="true" />
          <span>100% browser-side processing</span>
        </div>
        <div className={styles.mtgFooterItem}>
          <i className="ti ti-code" aria-hidden="true" />
          <span>6 export formats available</span>
        </div>
        <div className={styles.mtgFooterItem}>
          <i className="ti ti-shield-check" aria-hidden="true" />
          <span>Real-time SEO validation</span>
        </div>
      </div>
    </div>
  );
}