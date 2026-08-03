// features/dev/random-string-generator/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import type { GeneratorOptions, GeneratedString, PresetType } from "./utils";
import { DEFAULT_OPTIONS, PRESETS } from "./utils";
import { useStringStore } from "./stringStore";
import GeneratorPanel from "./GeneratorPanel";
import BatchGenerator from "./BatchGenerator";
import PatternGenerator from "./PatternGenerator";
import HistoryView from "./HistoryView";
import "./style/BatchGenerator.css";
import "./style/GeneratorPanel.css";
import "./style/HistoryView.css";
import "./style/PatternGenerator.css";
import "./style/Workspace.css";

type ViewTab = "single" | "batch" | "pattern" | "history";

const VIEW_TABS = [
  { id: "single" as const, label: "Single", icon: "ti-file" },
  { id: "batch" as const, label: "Batch", icon: "ti-files" },
  { id: "pattern" as const, label: "Pattern", icon: "ti-template" },
  { id: "history" as const, label: "History", icon: "ti-history" },
];

export default function RandomStringGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("single");
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);

  const {
    history,
    favorites,
    addToHistory,
    clearHistory,
    removeFromHistory,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
  } = useStringStore();

  const handleGenerate = useCallback(
    (result: GeneratedString) => {
      addToHistory(result);
    },
    [addToHistory]
  );

  const handleBatchGenerate = useCallback(
    (results: GeneratedString[]) => {
      results.forEach((result) => addToHistory(result));
    },
    [addToHistory]
  );

  const handlePatternGenerate = useCallback(
    (value: string) => {
      const entry: GeneratedString = {
        id: Date.now().toString(),
        value,
        timestamp: Date.now(),
        options: { ...options },
        entropy: 0,
        strength: "good",
      };
      addToHistory(entry);
    },
    [options, addToHistory]
  );

  const handleRestore = useCallback((entry: GeneratedString) => {
    setOptions(entry.options);
    setViewTab("single");
  }, []);

  const handleToggleFavorite = useCallback(
    (value: string) => {
      if (isFavorite(value)) {
        removeFromFavorites(value);
      } else {
        addToFavorites(value);
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  );

  const loadPreset = useCallback((presetKey: PresetType) => {
    const preset = PRESETS[presetKey];
    if (preset && preset.options) {
      setOptions((prev) => ({ ...prev, ...preset.options }));
    }
  }, []);

  return (
    <>
      <div className="rsg-root">
        {/*  Top Chrome  */}
        <div className="rsg-chrome">
          <div className="rsg-chrome-left">
            <span className="rsg-preset-label">Presets:</span>
            {Object.entries(PRESETS)
              .slice(0, 4)
              .map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  className="rsg-preset-btn"
                  onClick={() => loadPreset(key as PresetType)}
                  title={preset.label}
                >
                  <i className={`ti ${preset.icon}`} />
                  <span className="rsg-preset-text">{preset.label}</span>
                </button>
              ))}
          </div>

          <div className="rsg-chrome-right">
            {history.length > 0 && (
              <div className="rsg-history-badge">
                <i className="ti ti-history" />
                {history.length}
              </div>
            )}
          </div>
        </div>

        {/*  View Tabs  */}
        <div className="rsg-tabs-bar">
          <nav className="rsg-tabs" role="tablist" aria-label="View selector">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={viewTab === tab.id}
                aria-controls={`rsg-panel-${tab.id}`}
                className={`rsg-tab${viewTab === tab.id ? " active" : ""}`}
                onClick={() => setViewTab(tab.id)}
              >
                <i className={`ti ${tab.icon}`} />
                <span>{tab.label}</span>
                {tab.id === "history" && typeof window !== 'undefined' && history.length > 0 && (
                  <span className="rsg-tab-badge">{history.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/*  Tab Content  */}
        <div className="rsg-tab-content">
          {viewTab === "single" && (
            <div id="rsg-panel-single" role="tabpanel" className="rsg-panel">
              <GeneratorPanel
                options={options}
                onOptionsChange={setOptions}
                onGenerate={handleGenerate}
              />
            </div>
          )}

          {viewTab === "batch" && (
            <div id="rsg-panel-batch" role="tabpanel" className="rsg-panel">
              <BatchGenerator options={options} onGenerate={handleBatchGenerate} />
            </div>
          )}

          {viewTab === "pattern" && (
            <div id="rsg-panel-pattern" role="tabpanel" className="rsg-panel">
              <PatternGenerator onGenerate={handlePatternGenerate} />
            </div>
          )}

          {viewTab === "history" && (
            <div id="rsg-panel-history" role="tabpanel" className="rsg-panel">
              <HistoryView
                history={history}
                favorites={favorites}
                onClear={clearHistory}
                onRemove={removeFromHistory}
                onRestore={handleRestore}
                onToggleFavorite={handleToggleFavorite}
                onClearFavorites={clearFavorites}
              />
            </div>
          )}
        </div>

        {/*  Footer  */}
        <div className="rsg-footer">
          <i className="ti ti-shield-lock" />
          <span>
            Generated using cryptographically secure random values (crypto.getRandomValues). All
            processing happens in your browser — nothing is ever sent to a server.
          </span>
        </div>
      </div>
    </>
  );
}
