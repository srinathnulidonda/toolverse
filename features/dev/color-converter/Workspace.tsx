// features/dev/color-converter/Workspace.tsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { Tool } from "@/lib/tools";
import ColorPreview from "./ColorPreview";
import ColorPalette from "./ColorPalette";
import ColorHistory from "./ColorHistory";
import ColorShades from "./ColorShades";
import { useHistoryStore } from "@/lib/useHistoryStore";
import type { HistoryEntry } from "./ts/colorStore";
import { parseColor, getContrastRatio, getWCAGCompliance } from "./ts/utils";
import styles from "./style/Workspace.module.css";

type ViewTab = "convert" | "palette" | "shades" | "history";

interface PresetColor {
  id: string;
  name: string;
  hex: string;
}

const PRESET_COLORS: PresetColor[] = [
  { id: "brand", name: "Brand Blue", hex: "#3B82F6" },
  { id: "success", name: "Success", hex: "#10B981" },
  { id: "warning", name: "Warning", hex: "#F59E0B" },
  { id: "error", name: "Error", hex: "#EF4444" },
  { id: "purple", name: "Purple", hex: "#8B5CF6" },
  { id: "pink", name: "Pink", hex: "#EC4899" },
  { id: "cyan", name: "Cyan", hex: "#06B6D4" },
  { id: "lime", name: "Lime", hex: "#84CC16" },
  { id: "slate", name: "Slate", hex: "#64748B" },
  { id: "amber", name: "Amber", hex: "#D97706" },
  { id: "rose", name: "Rose", hex: "#F43F5E" },
  { id: "teal", name: "Teal", hex: "#14B8A6" },
];

const VIEW_TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "convert", label: "Convert", icon: "ti-palette" },
  { id: "palette", label: "Palette", icon: "ti-color-swatch" },
  { id: "shades", label: "Shades", icon: "ti-adjustments" },
  { id: "history", label: "History", icon: "ti-history" },
];

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0").toUpperCase()}`;
}

export default function ColorConverterWorkspace({ tool }: { tool: Tool }) {
  const [viewTab, setViewTab] = useState<ViewTab>("convert");
  const [currentColor, setCurrentColor] = useState("#3B82F6");
  const [showSettings, setShowSettings] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);

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
    isDuplicate: (newItem, recentItems) =>
      recentItems.some((h) => h.color.toLowerCase() === newItem.color.toLowerCase()),
    recentItemsCount: 5,
    serialize: (item) => item,
    deserialize: (raw) => raw,
  });

  const recordColor = useCallback(
    (color: string, source: string) => {
      setCurrentColor(color);
      addToHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        color,
        format: source,
        timestamp: Date.now(),
      });
    },
    [addToHistory]
  );

  const handlePickerChrome = useCallback(
    (value: string) => {
      recordColor(value, "picker");
    },
    [recordColor]
  );

  const loadPreset = useCallback(
    (preset: PresetColor) => {
      recordColor(preset.hex, "preset");
      setViewTab("convert");
      setShowSettings(false);
    },
    [recordColor]
  );

  const handleRandom = useCallback(() => {
    recordColor(randomHex(), "random");
  }, [recordColor]);

  const handleCopyHex = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentColor.toUpperCase());
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 1500);
    } catch {
      setCopiedHex(false);
    }
  }, [currentColor]);

  const contrastInfo = useMemo(() => {
    const parsed = parseColor(currentColor);
    if (!parsed) return null;
    const white = getContrastRatio(parsed.hex, "#FFFFFF");
    const black = getContrastRatio(parsed.hex, "#000000");
    return {
      hex: parsed.hex,
      rgb: parsed.rgb,
      white,
      black,
      wcagWhite: getWCAGCompliance(white),
      wcagBlack: getWCAGCompliance(black),
    };
  }, [currentColor]);

  const showsPoorContrast =
    contrastInfo != null && !contrastInfo.wcagWhite.AA_normal && !contrastInfo.wcagBlack.AA_normal;

  return (
    <div className={styles.ccRoot}>
      <div className={styles.ccChrome}>
        <div className={styles.ccChromeLeft}>
          <div className={styles.ccTitle}>
            <div className={styles.ccTitleIcon}>
              <i className="ti ti-palette" />
            </div>
            Color Converter
            <span className={styles.ccTitleBadge}>{currentColor.toUpperCase()}</span>
          </div>
          <label className={styles.ccCurrentColorWrap} title="Click to pick a color">
            <input
              ref={pickerRef}
              type="color"
              className={styles.ccCurrentColorInput}
              value={contrastInfo?.hex || "#000000"}
              onChange={(e) => handlePickerChrome(e.target.value)}
              aria-label="Pick current color"
            />
            <span className={styles.ccCurrentColor} style={{ background: currentColor }} />
          </label>
        </div>

        <div className={styles.ccChromeRight}>
          <button type="button" className={`${styles.ccBtn} ${copiedHex ? styles.copied : ""}`} onClick={handleCopyHex}>
            <i className={`ti ${copiedHex ? "ti-check" : "ti-copy"}`} />
            <span className={styles.ccLabel}>{copiedHex ? "Copied" : "Copy Hex"}</span>
          </button>
          <button
            type="button"
            className={`${styles.ccSettingsBtn} ${showSettings ? styles.active : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            aria-label="Toggle presets and options"
          >
            <i className="ti ti-adjustments" />
            <span className={styles.ccLabel}>Presets</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className={styles.ccSettings}>
          <div className={styles.ccSettingsGrid}>
            <div className={styles.ccSettingGroup}>
              <span className={styles.ccSettingLabel}>Preset Colors</span>
              <div className={styles.ccPresetGrid}>
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.ccPresetSwatch}
                    onClick={() => loadPreset(preset)}
                    title={preset.hex}
                  >
                    <span className={styles.ccPresetDot} style={{ background: preset.hex }} />
                    <span className={styles.ccPresetName}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.ccSettingGroup}>
              <span className={styles.ccSettingLabel}>Quick Actions</span>
              <button type="button" className={styles.ccRandomBtn} onClick={handleRandom}>
                <i className="ti ti-dice-5" />
                Random Color
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span>{tab.label}</span>
              {tab.id === "history" && history.length > 0 && (
                <span className={styles.ccTabBadge}>{history.length}</span>
              )}
              {tab.id === "convert" && showsPoorContrast && <span className={styles.ccTabDot} />}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.ccTabContent}>
        {viewTab === "convert" && (
          <ColorPreview
            color={currentColor}
            presets={PRESET_COLORS}
            onColorChange={(color, source) => recordColor(color, source)}
          />
        )}

        {viewTab === "palette" && (
          <ColorPalette baseColor={currentColor} onColorSelect={(c) => recordColor(c, "palette")} />
        )}

        {viewTab === "shades" && (
          <ColorShades baseColor={currentColor} onColorSelect={(c) => recordColor(c, "shade")} />
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

      <div className={styles.ccFooter}>
        <div className={styles.ccFooterLeft}>
          <i className="ti ti-shield-lock" />
          <span>Everything runs in your browser — no data ever leaves this page.</span>
        </div>
        {contrastInfo && (
          <div className={styles.ccFooterRight}>
            <span>
              rgb({contrastInfo.rgb.r}, {contrastInfo.rgb.g}, {contrastInfo.rgb.b})
            </span>
            <span>·</span>
            <span className={contrastInfo.wcagWhite.AA_normal ? styles.ccFooterPass : styles.ccFooterFail}>
              AA/White {contrastInfo.wcagWhite.AA_normal ? "Pass" : "Fail"}
            </span>
            <span>·</span>
            <span className={contrastInfo.wcagBlack.AA_normal ? styles.ccFooterPass : styles.ccFooterFail}>
              AA/Black {contrastInfo.wcagBlack.AA_normal ? "Pass" : "Fail"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}