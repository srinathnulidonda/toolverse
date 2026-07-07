// features/social/hashtag-generator/Workspace.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import type { Platform, Hashtag, SavedSet } from "./types";
import PlatformSelector from "./PlatformSelector";
import KeywordInput from "./KeywordInput";
import GeneratedHashtags from "./GeneratedHashtags";
import HashtagCategories from "./HashtagCategories";
import SelectedHashtags from "./SelectedHashtags";
import ExportPanel from "./ExportPanel";
import SavedSets from "./SavedSets";

type LeftTab = "generate" | "browse" | "platform";
type RightTab = "selected" | "export" | "saved";

const LEFT_TABS: { id: LeftTab; icon: string; label: string }[] = [
  { id: "generate", icon: "ti-wand", label: "Generate" },
  { id: "browse", icon: "ti-layout-grid", label: "Browse" },
  { id: "platform", icon: "ti-apps", label: "Platform" },
];

const RIGHT_TABS: { id: RightTab; icon: string; label: string }[] = [
  { id: "selected", icon: "ti-bookmark", label: "Selected" },
  { id: "export", icon: "ti-file-export", label: "Export" },
  { id: "saved", icon: "ti-bookmarks", label: "Saved Sets" },
];

export default function HashtagGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [generatedHashtags, setGeneratedHashtags] = useState<Hashtag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);
  const [leftTab, setLeftTab] = useState<LeftTab>("generate");
  const [rightTab, setRightTab] = useState<RightTab>("selected");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // Load saved sets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hashtag-generator-saved-sets");
      if (saved) setSavedSets(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load saved sets:", e);
    }
  }, []);

  // Persist saved sets
  useEffect(() => {
    try {
      localStorage.setItem("hashtag-generator-saved-sets", JSON.stringify(savedSets));
    } catch (e) {
      console.error("Failed to save sets:", e);
    }
  }, [savedSets]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleGenerate = useCallback((hashtags: Hashtag[]) => {
    setGeneratedHashtags(hashtags);
    setLeftTab("generate");
  }, []);

  const handleSaveSet = () => {
    if (!saveName.trim() || selectedTags.length === 0) return;
    const newSet: SavedSet = {
      id: `${Date.now()}-${Math.random()}`,
      name: saveName.trim(),
      hashtags: selectedTags,
      platform,
      timestamp: Date.now(),
    };
    setSavedSets((prev) => [newSet, ...prev].slice(0, 20));
    setSaveName("");
    setSaveModalOpen(false);
  };

  const handleRestoreSet = (set: SavedSet) => {
    setSelectedTags(set.hashtags);
    setPlatform(set.platform);
    setRightTab("selected");
  };

  return (
    <>
      <div className="hgw-root">
        <div className="hgw-workspace">
          {/* Left panel */}
          <div className="hgw-left-panel">
            <div className="hgw-tabs">
              {LEFT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`hgw-tab ${leftTab === tab.id ? "active" : ""}`}
                  onClick={() => setLeftTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="hgw-content">
              {leftTab === "generate" && (
                <div className="hgw-generate-layout">
                  <KeywordInput onGenerate={handleGenerate} />
                  {generatedHashtags.length > 0 && (
                    <div className="hgw-divider" />
                  )}
                  <GeneratedHashtags
                    hashtags={generatedHashtags}
                    selectedTags={selectedTags}
                    onToggleTag={handleToggleTag}
                  />
                </div>
              )}
              {leftTab === "browse" && (
                <HashtagCategories
                  selectedTags={selectedTags}
                  onToggleTag={handleToggleTag}
                />
              )}
              {leftTab === "platform" && (
                <PlatformSelector
                  selectedPlatform={platform}
                  onChange={setPlatform}
                />
              )}
            </div>

            <div className="hgw-left-footer">
              <button
                className="hgw-mobile-right-btn"
                onClick={() => setMobileRightOpen(true)}
              >
                <i className="ti ti-bookmark" aria-hidden="true" />
                Selected ({selectedTags.length})
                {selectedTags.length > 0 && (
                  <span className="hgw-mobile-badge">{selectedTags.length}</span>
                )}
              </button>
              {selectedTags.length > 0 && (
                <button
                  className="hgw-save-btn"
                  onClick={() => setSaveModalOpen(true)}
                >
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  Save Set
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="hgw-right-panel">
            <div className="hgw-right-header">
              <div className="hgw-tabs">
                {RIGHT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`hgw-tab ${rightTab === tab.id ? "active" : ""}`}
                    onClick={() => setRightTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} aria-hidden="true" />
                    <span>{tab.label}</span>
                    {tab.id === "saved" && savedSets.length > 0 && (
                      <span className="hgw-badge">{savedSets.length}</span>
                    )}
                  </button>
                ))}
              </div>
              {rightTab === "selected" && selectedTags.length > 0 && (
                <button
                  className="hgw-save-set-btn"
                  onClick={() => setSaveModalOpen(true)}
                >
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  Save
                </button>
              )}
            </div>

            <div className="hgw-content">
              {rightTab === "selected" && (
                <SelectedHashtags
                  hashtags={selectedTags}
                  platform={platform}
                  onRemove={(tag) =>
                    setSelectedTags((prev) => prev.filter((t) => t !== tag))
                  }
                  onClear={() => setSelectedTags([])}
                />
              )}
              {rightTab === "export" && (
                <ExportPanel
                  hashtags={selectedTags}
                  platform={platform}
                />
              )}
              {rightTab === "saved" && (
                <SavedSets
                  sets={savedSets}
                  onRestore={handleRestoreSet}
                  onDelete={(id) =>
                    setSavedSets((prev) => prev.filter((s) => s.id !== id))
                  }
                  onClear={() => {
                    if (confirm("Clear all saved sets?")) setSavedSets([]);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile right panel modal */}
        {mobileRightOpen && (
          <>
            <div
              className="hgw-backdrop"
              onClick={() => setMobileRightOpen(false)}
              aria-hidden="true"
            />
            <div className="hgw-mobile-modal">
              <div className="hgw-mobile-modal-header">
                <div className="hgw-tabs">
                  {RIGHT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`hgw-tab hgw-tab-sm ${rightTab === tab.id ? "active" : ""}`}
                      onClick={() => setRightTab(tab.id)}
                    >
                      <i className={`ti ${tab.icon}`} aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="hgw-modal-close"
                  onClick={() => setMobileRightOpen(false)}
                >
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className="hgw-mobile-modal-body">
                {rightTab === "selected" && (
                  <SelectedHashtags
                    hashtags={selectedTags}
                    platform={platform}
                    onRemove={(tag) =>
                      setSelectedTags((prev) => prev.filter((t) => t !== tag))
                    }
                    onClear={() => setSelectedTags([])}
                  />
                )}
                {rightTab === "export" && (
                  <ExportPanel hashtags={selectedTags} platform={platform} />
                )}
                {rightTab === "saved" && (
                  <SavedSets
                    sets={savedSets}
                    onRestore={handleRestoreSet}
                    onDelete={(id) =>
                      setSavedSets((prev) => prev.filter((s) => s.id !== id))
                    }
                    onClear={() => {
                      if (confirm("Clear all saved sets?")) setSavedSets([]);
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Save Set Modal */}
        {saveModalOpen && (
          <>
            <div
              className="hgw-backdrop"
              onClick={() => setSaveModalOpen(false)}
              aria-hidden="true"
            />
            <div className="hgw-save-modal">
              <div className="hgw-save-modal-header">
                <span className="hgw-save-modal-title">Save Hashtag Set</span>
                <button
                  className="hgw-modal-close"
                  onClick={() => setSaveModalOpen(false)}
                >
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className="hgw-save-modal-body">
                <div className="hgw-save-info">
                  <div className="hgw-save-info-item">
                    <i className="ti ti-hash" aria-hidden="true" />
                    <span>{selectedTags.length} hashtags</span>
                  </div>
                  <div className="hgw-save-info-item">
                    <i className={`ti ${platform === "instagram" ? "ti-brand-instagram" : "ti-brand-" + platform}`} aria-hidden="true" />
                    <span>{platform}</span>
                  </div>
                </div>
                <label className="hgw-save-label" htmlFor="hgw-save-name">
                  Set Name
                </label>
                <input
                  id="hgw-save-name"
                  type="text"
                  className="hgw-save-input"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Morning Workout Posts"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSet()}
                  autoFocus
                  maxLength={50}
                />
              </div>
              <div className="hgw-save-modal-footer">
                <button
                  className="hgw-save-cancel"
                  onClick={() => setSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="hgw-save-confirm"
                  onClick={handleSaveSet}
                  disabled={!saveName.trim()}
                >
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  Save Set
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="hgw-footer">
          <div className="hgw-footer-item">
            <i className="ti ti-database" aria-hidden="true" />
            <span>500+ curated hashtags across 12 categories</span>
          </div>
          <div className="hgw-footer-item">
            <i className="ti ti-shield-check" aria-hidden="true" />
            <span>Shadowban risk detection</span>
          </div>
          <div className="hgw-footer-item">
            <i className="ti ti-apps" aria-hidden="true" />
            <span>Optimized for 7 platforms</span>
          </div>
        </div>
      </div>

      <style>{`
        .hgw-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hgw-workspace {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 16px;
          min-height: 720px;
        }

        /* ═══════ PANELS ═══════ */
        .hgw-left-panel,
        .hgw-right-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        /* ═══════ TABS ═══════ */
        .hgw-tabs {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }
        .hgw-tabs::-webkit-scrollbar { display: none; }

        .hgw-right-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }
        .hgw-right-header .hgw-tabs {
          flex: 1;
          border-bottom: none;
        }

        .hgw-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 14px;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          margin-bottom: -0.5px;
        }
        .hgw-tab i { font-size: 15px; }
        .hgw-tab:hover { color: var(--text-secondary); }
        .hgw-tab.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
          background: var(--bg-card);
        }
        .hgw-tab-sm {
          padding: 10px 12px;
          font-size: 12px;
        }

        .hgw-badge {
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

        .hgw-mobile-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--brand);
          color: white;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 2px;
        }

        .hgw-save-set-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          margin: 8px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 6px;
          color: var(--brand-text);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.12s;
          flex-shrink: 0;
        }
        .hgw-save-set-btn i { font-size: 14px; }
        .hgw-save-set-btn:hover { background: var(--brand); color: white; }

        /* ═══════ CONTENT ═══════ */
        .hgw-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          overscroll-behavior: contain;
        }

        .hgw-generate-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hgw-divider {
          height: 0.5px;
          background: var(--border);
          margin: 0 -20px;
        }

        /* ═══════ LEFT FOOTER ═══════ */
        .hgw-left-footer {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          padding: 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          display: none;
        }

        /* ═══════ FOOTER ═══════ */
        .hgw-footer {
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
        .hgw-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-tertiary);
        }
        .hgw-footer-item i { font-size: 13px; }

        /* ═══════ BACKDROP ═══════ */
        .hgw-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 99;
          animation: hgw-fade-in 0.2s;
        }

        /* ═══════ MOBILE MODAL ═══════ */
        .hgw-mobile-modal {
          display: flex;
          flex-direction: column;
          position: fixed;
          inset: 0;
          background: var(--bg-card);
          z-index: 100;
          animation: hgw-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .hgw-mobile-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          padding-right: 12px;
          flex-shrink: 0;
        }
        .hgw-mobile-modal-header .hgw-tabs {
          flex: 1;
          border-bottom: none;
        }
        .hgw-mobile-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        /* ═══════ SAVE MODAL ═══════ */
        .hgw-save-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 420px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          z-index: 100;
          animation: hgw-pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        .hgw-save-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 16px 12px;
          border-bottom: 0.5px solid var(--border);
        }
        .hgw-save-modal-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }
        .hgw-modal-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 50%;
          color: var(--text-secondary);
          font-size: 15px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .hgw-save-modal-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hgw-save-info {
          display: flex;
          gap: 10px;
        }
        .hgw-save-info-item {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: var(--bg-surface);
          border-radius: 6px;
          font-size: 11.5px;
          color: var(--text-secondary);
        }
        .hgw-save-info-item i { font-size: 13px; }
        .hgw-save-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .hgw-save-input {
          width: 100%;
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          transition: border-color 0.15s;
        }
        .hgw-save-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .hgw-save-modal-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 12px 16px 16px;
        }
        .hgw-save-cancel {
          padding: 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }
        .hgw-save-cancel:hover { background: var(--border); }
        .hgw-save-confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          background: var(--brand);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s;
        }
        .hgw-save-confirm i { font-size: 15px; }
        .hgw-save-confirm:hover:not(:disabled) { background: var(--brand-hover); }
        .hgw-save-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ═══════ ANIMATIONS ═══════ */
        @keyframes hgw-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hgw-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes hgw-pop-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* ═══════ TABLET ≤ 1100px ═══════ */
        @media (max-width: 1100px) {
          .hgw-workspace {
            grid-template-columns: 1fr 300px;
          }
        }

        /* ═══════ MOBILE ≤ 900px ═══════ */
        @media (max-width: 900px) {
          .hgw-workspace {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .hgw-right-panel { display: none; }
          .hgw-left-footer { display: grid; }
          .hgw-mobile-right-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 14px;
            background: var(--brand-light);
            border: 0.5px solid var(--brand-border);
            border-radius: 8px;
            color: var(--brand-text);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.12s;
          }
          .hgw-mobile-right-btn:hover { background: var(--brand); color: white; }
          .hgw-save-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px 14px;
            background: var(--bg-card);
            border: 0.5px solid var(--border);
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
          }
          .hgw-tab span { display: none; }
          .hgw-tab { padding: 12px 14px; }
          .hgw-tab i { font-size: 17px; }
          .hgw-content { padding: 16px; }
          .hgw-footer {
            flex-direction: column;
            gap: 8px;
          }
          .hgw-footer-item:not(:first-child) { display: none; }
        }

        @media (max-width: 480px) {
          .hgw-save-modal { width: 95%; }
        }
      `}</style>
    </>
  );
}