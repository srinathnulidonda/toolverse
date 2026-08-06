// features/social/hashtag-generator/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import type { Platform, Hashtag, SavedSet } from "./ts/types";
import PlatformSelector from "./PlatformSelector";
import KeywordInput from "./KeywordInput";
import GeneratedHashtags from "./GeneratedHashtags";
import HashtagCategories from "./HashtagCategories";
import SelectedHashtags from "./SelectedHashtags";
import ExportPanel from "./ExportPanel";
import SavedSets from "./SavedSets";
import styles from "./style/Workspace.module.css";

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hashtag-generator-saved-sets");
      if (saved) setSavedSets(JSON.parse(saved));
    } catch (e) {
      logger.error("Failed to load saved sets:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("hashtag-generator-saved-sets", JSON.stringify(savedSets));
    } catch (e) {
      logger.error("Failed to save sets:", e);
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
      <div className={styles.hgwRoot}>
        <div className={styles.hgwWorkspace}>
          <div className={styles.hgwLeftPanel}>
            <div className={styles.hgwTabs}>
              {LEFT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.hgwTab}${leftTab === tab.id ? ` ${styles.active}` : ""}`}
                  onClick={() => setLeftTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.hgwContent}>
              {leftTab === "generate" && (
                <div className={styles.hgwGenerateLayout}>
                  <KeywordInput onGenerate={handleGenerate} />
                  {generatedHashtags.length > 0 && <div className={styles.hgwDivider} />}
                  <GeneratedHashtags
                    hashtags={generatedHashtags}
                    selectedTags={selectedTags}
                    onToggleTag={handleToggleTag}
                  />
                </div>
              )}
              {leftTab === "browse" && (
                <HashtagCategories selectedTags={selectedTags} onToggleTag={handleToggleTag} />
              )}
              {leftTab === "platform" && (
                <PlatformSelector selectedPlatform={platform} onChange={setPlatform} />
              )}
            </div>

            <div className={styles.hgwLeftFooter}>
              <button className={styles.hgwMobileRightBtn} onClick={() => setMobileRightOpen(true)}>
                <i className="ti ti-bookmark" aria-hidden="true" />
                Selected ({selectedTags.length})
                {selectedTags.length > 0 && (
                  <span className={styles.hgwMobileBadge}>{selectedTags.length}</span>
                )}
              </button>
              {selectedTags.length > 0 && (
                <button className={styles.hgwSaveBtn} onClick={() => setSaveModalOpen(true)}>
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  Save Set
                </button>
              )}
            </div>
          </div>

          <div className={styles.hgwRightPanel}>
            <div className={styles.hgwRightHeader}>
              <div className={styles.hgwTabs}>
                {RIGHT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.hgwTab}${rightTab === tab.id ? ` ${styles.active}` : ""}`}
                    onClick={() => setRightTab(tab.id)}
                  >
                    <i className={`ti ${tab.icon}`} aria-hidden="true" />
                    <span>{tab.label}</span>
                    {tab.id === "saved" && savedSets.length > 0 && (
                      <span className={styles.hgwBadge}>{savedSets.length}</span>
                    )}
                  </button>
                ))}
              </div>
              {rightTab === "selected" && selectedTags.length > 0 && (
                <button className={styles.hgwSaveSetBtn} onClick={() => setSaveModalOpen(true)}>
                  <i className="ti ti-device-floppy" aria-hidden="true" />
                  Save
                </button>
              )}
            </div>

            <div className={styles.hgwContent}>
              {rightTab === "selected" && (
                <SelectedHashtags
                  hashtags={selectedTags}
                  platform={platform}
                  onRemove={(tag) => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
                  onClear={() => setSelectedTags([])}
                />
              )}
              {rightTab === "export" && <ExportPanel hashtags={selectedTags} platform={platform} />}
              {rightTab === "saved" && (
                <SavedSets
                  sets={savedSets}
                  onRestore={handleRestoreSet}
                  onDelete={(id) => setSavedSets((prev) => prev.filter((s) => s.id !== id))}
                  onClear={() => {
                    if (confirm("Clear all saved sets?")) setSavedSets([]);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {mobileRightOpen && (
          <>
            <div
              className={styles.hgwBackdrop}
              onClick={() => setMobileRightOpen(false)}
              aria-hidden="true"
            />
            <div className={styles.hgwMobileModal}>
              <div className={styles.hgwMobileModalHeader}>
                <div className={styles.hgwTabs}>
                  {RIGHT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`${styles.hgwTab} ${styles.hgwTabSm}${rightTab === tab.id ? ` ${styles.active}` : ""}`}
                      onClick={() => setRightTab(tab.id)}
                    >
                      <i className={`ti ${tab.icon}`} aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <button className={styles.hgwModalClose} onClick={() => setMobileRightOpen(false)}>
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className={styles.hgwMobileModalBody}>
                {rightTab === "selected" && (
                  <SelectedHashtags
                    hashtags={selectedTags}
                    platform={platform}
                    onRemove={(tag) => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
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
                    onDelete={(id) => setSavedSets((prev) => prev.filter((s) => s.id !== id))}
                    onClear={() => {
                      if (confirm("Clear all saved sets?")) setSavedSets([]);
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {saveModalOpen && (
          <>
            <div
              className={styles.hgwBackdrop}
              onClick={() => setSaveModalOpen(false)}
              aria-hidden="true"
            />
            <div className={styles.hgwSaveModal}>
              <div className={styles.hgwSaveModalHeader}>
                <span className={styles.hgwSaveModalTitle}>Save Hashtag Set</span>
                <button className={styles.hgwModalClose} onClick={() => setSaveModalOpen(false)}>
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className={styles.hgwSaveModalBody}>
                <div className={styles.hgwSaveInfo}>
                  <div className={styles.hgwSaveInfoItem}>
                    <i className="ti ti-hash" aria-hidden="true" />
                    <span>{selectedTags.length} hashtags</span>
                  </div>
                  <div className={styles.hgwSaveInfoItem}>
                    <i
                      className={`ti ${platform === "instagram" ? "ti-brand-instagram" : "ti-brand-" + platform}`}
                      aria-hidden="true"
                    />
                    <span>{platform}</span>
                  </div>
                </div>
                <label className={styles.hgwSaveLabel} htmlFor="hgw-save-name">
                  Set Name
                </label>
                <input
                  id="hgw-save-name"
                  type="text"
                  className={styles.hgwSaveInput}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Morning Workout Posts"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSet()}
                  autoFocus
                  maxLength={50}
                />
              </div>
              <div className={styles.hgwSaveModalFooter}>
                <button className={styles.hgwSaveCancel} onClick={() => setSaveModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className={styles.hgwSaveConfirm}
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

        <div className={styles.hgwFooter}>
          <div className={styles.hgwFooterItem}>
            <i className="ti ti-database" aria-hidden="true" />
            <span>500+ curated hashtags across 12 categories</span>
          </div>
          <div className={styles.hgwFooterItem}>
            <i className="ti ti-shield-check" aria-hidden="true" />
            <span>Shadowban risk detection</span>
          </div>
          <div className={styles.hgwFooterItem}>
            <i className="ti ti-apps" aria-hidden="true" />
            <span>Optimized for 7 platforms</span>
          </div>
        </div>
      </div>
    </>
  );
}