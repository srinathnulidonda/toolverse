// features/dev/regex-tester/Workspace.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { Tool } from "@/lib/tools";
import {
  FLAG_DEFINITIONS,
  SAMPLE_PATTERNS,
  analyzePattern,
  normalizeFlags,
  type RegexFlags,
  type ViewTab,
  type RegexPattern,
  type PatternCategory,
} from "./ts/utils";
import { useRegexStore } from "./ts/regexStore";
import RegexTest from "./RegexTest";
import RegexReplace from "./RegexReplace";
import RegexLibrary from "./RegexLibrary";
import RegexExplainer from "./RegexExplainer";
import RegexHistory from "./RegexHistory";
import styles from "./style/Workspace.module.css";

interface SaveForm {
  name: string;
  description: string;
  category: PatternCategory;
  tags: string;
}

export default function RegexTesterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("test");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<RegexFlags>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });

  const [showFlagsPanel, setShowFlagsPanel] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState<SaveForm>({
    name: "",
    description: "",
    category: "custom",
    tags: "",
  });

  const [pendingTestString, setPendingTestString] = useState<string | null>(null);

  const {
    patterns,
    history,
    savePattern,
    deletePattern,
    toggleFavorite,
    addToHistory,
    clearHistory,
    deleteHistoryEntry,
    importPatterns,
    exportPatterns,
  } = useRegexStore();

  const VIEW_TABS = [
    { id: "test" as const, label: "Test", icon: "ti-play" },
    { id: "replace" as const, label: "Replace", icon: "ti-replace" },
    { id: "library" as const, label: "Library", icon: "ti-bookmark" },
    { id: "explainer" as const, label: "Explainer", icon: "ti-bulb" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  const analysis = useMemo(() => analyzePattern(pattern), [pattern]);
  const activeFlagsCount = useMemo(
    () => Object.values(flags).filter(Boolean).length,
    [flags]
  );

  const toggleFlag = useCallback((flag: keyof RegexFlags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const handleLoadPattern = useCallback((loadedPattern: RegexPattern) => {
    setPattern(loadedPattern.pattern);
    setFlags(loadedPattern.flags);
    setViewTab("test");
  }, []);

  const handleLoadExample = useCallback(
    (examplePattern: string, testString: string, exampleFlags: Partial<RegexFlags> = {}) => {
      setPattern(examplePattern);
      setFlags(normalizeFlags(exampleFlags));
      setViewTab("test");
      setPendingTestString(testString);
    },
    []
  );

  const handleSavePattern = useCallback(() => {
    if (!pattern || !saveForm.name.trim()) return;

    savePattern({
      name: saveForm.name.trim(),
      pattern,
      flags,
      description: saveForm.description.trim() || "Custom regex pattern",
      category: saveForm.category,
      tags: saveForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setShowSaveDialog(false);
    setSaveForm({ name: "", description: "", category: "custom", tags: "" });
  }, [pattern, flags, saveForm, savePattern]);

  const handleRestoreHistory = useCallback((entry: (typeof history)[0]) => {
    setPattern(entry.pattern);
    setFlags(entry.flags);
    setViewTab("test");
  }, []);

  const handleRecordHistory = useCallback(
    (testString: string, matchCount: number) => {
      addToHistory({ pattern, flags, testString, matchCount });
    },
    [pattern, flags, addToHistory]
  );

  const quickPatterns = useMemo(() => SAMPLE_PATTERNS.slice(0, 4), []);

  return (
    <div className={styles.rxtWorkspace}>
      <div className={styles.rxtChrome}>
        <div className={styles.rxtChromeLeft}>
          <div className={styles.rxtTitle}>
            <div className={styles.rxtTitleIcon}>
              <i className="ti ti-regex" />
            </div>
            Regex Tester
            {pattern &&
              (analysis.valid ? (
                <span className={styles.rxtValidBadge}>
                  <i className="ti ti-check" />
                  Valid
                </span>
              ) : (
                <span className={styles.rxtInvalidBadge}>
                  <i className="ti ti-x" />
                  Invalid
                </span>
              ))}
          </div>
        </div>

        <div className={styles.rxtChromeRight}>
          <div className={styles.rxtQuickActions}>
            <span className={styles.rxtQuickLabel}>Quick:</span>
            {quickPatterns.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.rxtQuickBtn}
                onClick={() => handleLoadPattern(preset)}
                title={preset.description}
              >
                <i className="ti ti-bolt" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.rxtFlagsToggleBtn}${showFlagsPanel ? ` ${styles.active}` : ""}`}
            onClick={() => setShowFlagsPanel((s) => !s)}
            aria-expanded={showFlagsPanel}
          >
            <i className="ti ti-flag" />
            <span>Flags</span>
            {activeFlagsCount > 0 && (
              <span className={styles.rxtFlagsCount}>{activeFlagsCount}</span>
            )}
          </button>
        </div>
      </div>

      {showFlagsPanel && (
        <div className={styles.rxtFlagsPanel}>
          <div className={styles.rxtFlagsGrid}>
            {FLAG_DEFINITIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`${styles.rxtFlagChip}${flags[f.id] ? ` ${styles.active}` : ""}`}
                onClick={() => toggleFlag(f.id)}
                title={f.desc}
              >
                <i className={`ti ${f.icon}`} />
                <span className={styles.rxtFlagId}>{f.id}</span>
                <span className={styles.rxtFlagName}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.rxtTabsBar}>
        <nav className={styles.rxtTabs} role="tablist">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`${styles.rxtTab}${viewTab === tab.id ? ` ${styles.active}` : ""}`}
              onClick={() => setViewTab(tab.id)}
              aria-selected={viewTab === tab.id}
            >
              <i className={`ti ${tab.icon}`} />
              <span>{tab.label}</span>
              {tab.id === "library" && patterns.length > 0 && (
                <span className={styles.rxtTabBadge}>{patterns.length}</span>
              )}
              {tab.id === "history" && history.length > 0 && (
                <span className={styles.rxtTabBadge}>{history.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.rxtTabContent}>
        {viewTab === "test" && (
          <RegexTest
            pattern={pattern}
            flags={flags}
            onPatternChange={setPattern}
            onSave={() => setShowSaveDialog(true)}
            initialTestString={pendingTestString}
            onTestStringConsumed={() => setPendingTestString(null)}
            onRecordHistory={handleRecordHistory}
          />
        )}

        {viewTab === "replace" && <RegexReplace pattern={pattern} flags={flags} />}

        {viewTab === "library" && (
          <RegexLibrary
            patterns={patterns}
            onLoadPattern={handleLoadPattern}
            onDeletePattern={deletePattern}
            onToggleFavorite={toggleFavorite}
            onImport={importPatterns}
            onExport={exportPatterns}
          />
        )}

        {viewTab === "explainer" && (
          <RegexExplainer pattern={pattern} flags={flags} onLoadExample={handleLoadExample} />
        )}

        {viewTab === "history" && (
          <RegexHistory
            history={history}
            onRestore={handleRestoreHistory}
            onClear={clearHistory}
            onDelete={deleteHistoryEntry}
          />
        )}
      </div>

      <div className={styles.rxtFooter}>
        <div className={styles.rxtFooterLeft}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
        {pattern && (
          <div className={styles.rxtFooterRight}>
            <span>Pattern length: {pattern.length}</span>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <div className={styles.rxtDialogOverlay} onClick={() => setShowSaveDialog(false)}>
          <div className={styles.rxtDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.rxtDialogHeader}>
              <h3 className={styles.rxtDialogTitle}>
                <i className="ti ti-bookmark-plus" />
                Save Pattern to Library
              </h3>
              <button
                type="button"
                className={styles.rxtDialogClose}
                onClick={() => setShowSaveDialog(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className={styles.rxtDialogBody}>
              <div className={styles.rxtFormGroup}>
                <label className={styles.rxtFormLabel} htmlFor="pattern-name">
                  Name
                </label>
                <input
                  id="pattern-name"
                  type="text"
                  className={styles.rxtFormInput}
                  value={saveForm.name}
                  onChange={(e) => setSaveForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Email Validator"
                  autoFocus
                />
              </div>

              <div className={styles.rxtFormGroup}>
                <label className={styles.rxtFormLabel} htmlFor="pattern-desc">
                  Description
                </label>
                <textarea
                  id="pattern-desc"
                  className={styles.rxtFormTextarea}
                  value={saveForm.description}
                  onChange={(e) =>
                    setSaveForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what this pattern does..."
                  rows={3}
                />
              </div>

              <div className={styles.rxtFormGroup}>
                <label className={styles.rxtFormLabel} htmlFor="pattern-category">
                  Category
                </label>
                <select
                  id="pattern-category"
                  className={styles.rxtFormSelect}
                  value={saveForm.category}
                  onChange={(e) =>
                    setSaveForm((prev) => ({
                      ...prev,
                      category: e.target.value as PatternCategory,
                    }))
                  }
                >
                  <option value="validation">Validation</option>
                  <option value="extraction">Extraction</option>
                  <option value="web">Web</option>
                  <option value="datetime">Date & Time</option>
                  <option value="formatting">Formatting</option>
                  <option value="security">Security</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className={styles.rxtFormGroup}>
                <label className={styles.rxtFormLabel} htmlFor="pattern-tags">
                  Tags (comma-separated)
                </label>
                <input
                  id="pattern-tags"
                  type="text"
                  className={styles.rxtFormInput}
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., email, validation, contact"
                />
              </div>

              <div className={styles.rxtPatternPreview}>
                <div className={styles.rxtPreviewLabel}>Pattern Preview</div>
                <code className={styles.rxtPreviewCode}>
                  /{pattern}/
                  {Object.entries(flags)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join("")}
                </code>
              </div>
            </div>

            <div className={styles.rxtDialogFooter}>
              <button
                type="button"
                className={`${styles.rxtDialogBtn} ${styles.rxtCancelBtn}`}
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.rxtDialogBtn} ${styles.rxtSaveBtn}`}
                onClick={handleSavePattern}
                disabled={!saveForm.name.trim()}
              >
                <i className="ti ti-check" />
                Save Pattern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}