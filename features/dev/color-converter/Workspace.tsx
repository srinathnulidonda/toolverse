// features/dev/color-converter/Workspace.tsx
"use client";

import { useState, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import ColorPreview from "./ColorPreview";
import ColorPalette from "./ColorPalette";
import ColorHistory from "./ColorHistory";
import ColorShades from "./ColorShades";
import { useHistoryStore } from "@/lib/useHistoryStore";
import type { HistoryEntry } from "./ts/colorStore";
import styles from "./style/Workspace.module.css";

type ViewTab = "convert" | "palette" | "shades" | "history";

const PRESET_COLORS = [
  { id: "brand", name: "Brand Blue", hex: "#3B82F6" },
  { id: "success", name: "Success", hex: "#10B981" },
  { id: "warning", name: "Warning", hex: "#F59E0B" },
  { id: "error", name: "Error", hex: "#EF4444" },
  { id: "purple", name: "Purple", hex: "#8B5CF6" },
  { id: "pink", name: "Pink", hex: "#EC4899" },
  { id: "cyan", name: "Cyan", hex: "#06B6D4" },
  { id: "lime", name: "Lime", hex: "#84CC16" },
];

export default function ColorConverterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("convert");
  const [currentColor, setCurrentColor] = useState("#3B82F6");
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");

  const { history, addToHistory, clearHistory } = useHistoryStore<HistoryEntry>({
    key: "color-converter-history",
    maxItems: 50,
    validateItem: (raw) => {
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as any).id === "string" &&
        typeof (raw as any).color === "string" &&
        typeof (raw as any).format === "string" &&
        typeof (raw as any).timestamp === "number"
      ) {
        return raw as HistoryEntry;
      }
      return null;
    },
    isDuplicate: (newItem: HistoryEntry, recentItems: HistoryEntry[]) => {
      return recentItems.some((h) => h.color.toLowerCase() === newItem.color.toLowerCase());
    },
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const handleColorChange = useCallback(
    (color: string, fromFormat: string) => {
      setCurrentColor(color);
      addToHistory({
        id: Date.now().toString(),
        color,
        format: fromFormat,
        timestamp: Date.now(),
      });
    },
    [addToHistory]
  );

  const loadPreset = useCallback((preset: (typeof PRESET_COLORS)[0]) => {
    setCurrentColor(preset.hex);
    setViewTab("convert");
  }, []);

  const VIEW_TABS = [
    { id: "convert" as const, label: "Convert", icon: "ti-palette" },
    { id: "palette" as const, label: "Palette", icon: "ti-color-swatch" },
    { id: "shades" as const, label: "Shades", icon: "ti-adjust" },
    { id: "history" as const, label: "History", icon: "ti-history" },
  ];

  return (
    <>
      <div className={styles.ccRoot}>
        {/*  Top Chrome  */}
        <div className={styles.ccChrome}>
          <div className={styles.ccChromeLeft}>
            <div className={styles.ccTitle}>
              <i className="ti ti-palette" />
              Color Converter
            </div>
            <div
              className={styles.ccCurrentColor}
              style={{ background: currentColor }}
              title={currentColor}
            />
          </div>

          <div className={styles.ccChromeRight}>
            <div className={styles.ccPresetGroup}>
              <span className={styles.ccPresetLabel}>Presets:</span>
              {PRESET_COLORS.slice(0, 4).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={styles.ccPresetBtn}
                  onClick={() => loadPreset(preset)}
                  title={preset.name}
                  style={{ background: preset.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/*  View Tabs  */}
        <div className={styles.ccTabsBar}>
          <nav className={styles.ccTabs} role="tablist">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`${styles.ccTab} ${viewTab === tab.id ? styles.active : ""}`}
                onClick={() => setViewTab(tab.id)}
                aria-selected={viewTab === tab.id}
              >
                <i className={`ti ${tab.icon}`} />
                {tab.label}
                {typeof window !== "undefined" && tab.id === "history" && history.length > 0 ? (
                  <span className={styles.ccBadge}>{history.length}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/*  Tab Content  */}
        <div className={styles.ccTabContent}>
          {viewTab === "convert" && (
            <ColorPreview color={currentColor} onColorChange={handleColorChange} />
          )}

          {viewTab === "palette" && (
            <ColorPalette baseColor={currentColor} onColorSelect={setCurrentColor} />
          )}

          {viewTab === "shades" && (
            <ColorShades baseColor={currentColor} onColorSelect={setCurrentColor} />
          )}

          {viewTab === "history" && (
            <ColorHistory
              history={history}
              onClear={clearHistory}
              onRestore={(entry) => {
                setCurrentColor(entry.color);
                setViewTab("convert");
              }}
            />
          )}
        </div>

        {/*  Footer  */}
        <div className={styles.ccFooter}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
      </div>
    </>
  );
}