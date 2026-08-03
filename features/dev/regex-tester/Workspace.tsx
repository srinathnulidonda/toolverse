// features/dev/regex-tester/Workspace.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { Tool } from "@/lib/tools";
import {
  FLAG_DEFINITIONS,
  SAMPLE_PATTERNS,
  type RegexFlags,
  type ViewTab,
  type RegexPattern,
} from "./utils";
import { useRegexStore } from "./regexStore";
import RegexTest from "./RegexTest";
import RegexReplace from "./RegexReplace";
import RegexLibrary from "./RegexLibrary";
import RegexExplainer from "./RegexExplainer";
import RegexHistory from "./RegexHistory";
import "./style/RegexExplainer.css";
import "./style/RegexHistory.css";
import "./style/RegexLibrary.css";
import "./style/RegexReplace.css";
import "./style/RegexTest.css";
import "./style/Workspace.css";

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

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: "",
    description: "",
    category: "custom" as const,
    tags: "",
  });

  // Add state for pending test string
  const [pendingTestString, setPendingTestString] = useState<string | null>(null);

  const {
    patterns,
    history,
    savePattern,
    updatePattern,
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

  const toggleFlag = useCallback((flag: keyof RegexFlags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const handleLoadPattern = useCallback((loadedPattern: RegexPattern) => {
    setPattern(loadedPattern.pattern);
    setFlags(loadedPattern.flags);
    setViewTab("test");
  }, []);

  // Add handleLoadExample callback
  const handleLoadExample = useCallback(
    (examplePattern: string, testString: string, exampleFlags?: Partial<RegexFlags>) => {
      setPattern(examplePattern);
      if (exampleFlags) {
        setFlags((prev) => ({
          g: exampleFlags.g ?? false,
          i: exampleFlags.i ?? false,
          m: exampleFlags.m ?? false,
          s: exampleFlags.s ?? false,
          u: exampleFlags.u ?? false,
          y: exampleFlags.y ?? false,
        }));
      }
      setViewTab("test");
      // Store test string temporarily so RegexTest can pick it up
      setPendingTestString(testString);
    },
    []
  );

  const handleSavePattern = useCallback(() => {
    if (!pattern) return;

    const newPattern = savePattern({
      name: saveForm.name || `Pattern ${Date.now()}`,
      pattern,
      flags,
      description: saveForm.description || "Custom regex pattern",
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

  const handleAddToHistory = useCallback(
    (testString: string, matchCount: number) => {
      if (!pattern || !testString) return;
      addToHistory({
        pattern,
        flags,
        testString,
        matchCount,
      });
    },
    [pattern, flags, addToHistory]
  );

  const quickActions = useMemo(() => {
    return SAMPLE_PATTERNS.slice(0, 4);
  }, []);

  return (
    <>
      <div className="rxt-workspace">
        {/* Top Command Bar */}
        <div className="rxt-command-bar">
          <div className="rxt-cmd-left">
            <div className="rxt-quick-actions">
              <span className="rxt-quick-label">Quick:</span>
              {quickActions.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rxt-quick-btn"
                  onClick={() => handleLoadPattern(preset)}
                  title={preset.description}
                >
                  <i
                    className={`ti ${preset.id === "email"
                      ? "ti-mail"
                      : preset.id === "url"
                        ? "ti-link"
                        : preset.id === "phone-us"
                          ? "ti-phone"
                          : "ti-palette"
                      }`}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rxt-cmd-right">
            {pattern && (
              <span className="rxt-pattern-indicator">
                <code>
                  /{pattern.substring(0, 30)}
                  {pattern.length > 30 ? "..." : ""}/
                </code>
              </span>
            )}
          </div>
        </div>

        {/* Flags Bar */}
        <div className="rxt-flags-bar">
          <div className="rxt-flags-label">
            <i className="ti ti-flag" />
            Flags
          </div>
          <div className="rxt-flags-list">
            {FLAG_DEFINITIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`rxt-flag-toggle${flags[f.id] ? " active" : ""}`}
                onClick={() => toggleFlag(f.id)}
                title={f.desc}
              >
                <i className={`ti ${f.icon}`} />
                <span className="rxt-flag-id">{f.id}</span>
                <span className="rxt-flag-name">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Tabs */}
        <div className="rxt-tabs-bar">
          <nav className="rxt-tabs" role="tablist">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`rxt-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                {tab.label}
                {tab.id === "library" && patterns.length > 0 && (
                  <span className="rxt-tab-badge">{patterns.length}</span>
                )}
                {typeof window !== 'undefined' && tab.id === "history" && history.length > 0 && (
                  <span className="rxt-tab-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rxt-tab-content">
          {viewTab === "test" && (
            <RegexTest
              pattern={pattern}
              flags={flags}
              onPatternChange={setPattern}
              onFlagsChange={setFlags}
              onSave={() => setShowSaveDialog(true)}
              initialTestString={pendingTestString}
              onTestStringConsumed={() => setPendingTestString(null)}
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

        {/* Footer */}
        <div className="rxt-footer">
          <div className="rxt-footer-left">
            <i className="ti ti-shield-lock" />
            <span>Everything runs in your browser — no data ever leaves this page.</span>
          </div>
          {pattern && (
            <div className="rxt-footer-right">
              <span className="rxt-footer-info">
                Pattern length: <strong>{pattern.length}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Save Pattern Dialog */}
        {showSaveDialog && (
          <div className="rxt-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
            <div className="rxt-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="rxt-dialog-header">
                <h3 className="rxt-dialog-title">
                  <i className="ti ti-bookmark-plus" />
                  Save Pattern to Library
                </h3>
                <button
                  type="button"
                  className="rxt-dialog-close"
                  onClick={() => setShowSaveDialog(false)}
                >
                  <i className="ti ti-x" />
                </button>
              </div>

              <div className="rxt-dialog-body">
                <div className="rxt-form-group">
                  <label className="rxt-form-label" htmlFor="pattern-name">
                    Name
                  </label>
                  <input
                    id="pattern-name"
                    type="text"
                    className="rxt-form-input"
                    value={saveForm.name}
                    onChange={(e) => setSaveForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Email Validator"
                    autoFocus
                  />
                </div>

                <div className="rxt-form-group">
                  <label className="rxt-form-label" htmlFor="pattern-desc">
                    Description
                  </label>
                  <textarea
                    id="pattern-desc"
                    className="rxt-form-textarea"
                    value={saveForm.description}
                    onChange={(e) =>
                      setSaveForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe what this pattern does..."
                    rows={3}
                  />
                </div>

                <div className="rxt-form-group">
                  <label className="rxt-form-label" htmlFor="pattern-category">
                    Category
                  </label>
                  <select
                    id="pattern-category"
                    className="rxt-form-select"
                    value={saveForm.category}
                    onChange={(e) =>
                      setSaveForm((prev) => ({ ...prev, category: e.target.value as any }))
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

                <div className="rxt-form-group">
                  <label className="rxt-form-label" htmlFor="pattern-tags">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="pattern-tags"
                    type="text"
                    className="rxt-form-input"
                    value={saveForm.tags}
                    onChange={(e) => setSaveForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., email, validation, contact"
                  />
                </div>

                <div className="rxt-pattern-preview">
                  <div className="rxt-preview-label">Pattern Preview</div>
                  <code className="rxt-preview-code">
                    /{pattern}/
                    {Object.entries(flags)
                      .filter(([, v]) => v)
                      .map(([k]) => k)
                      .join("")}
                  </code>
                </div>
              </div>

              <div className="rxt-dialog-footer">
                <button
                  type="button"
                  className="rxt-dialog-btn rxt-cancel-btn"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rxt-dialog-btn rxt-save-btn"
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
    </>
  );
}
