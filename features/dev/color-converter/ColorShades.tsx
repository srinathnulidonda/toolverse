// features/dev/color-converter/ColorShades.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { generateShades, generateTints, generateTones, hexToRgb, rgbToHsl } from "./ts/utils";
import styles from "./style/ColorShades.module.css";

interface ColorShadesProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
}

type ShadeType = "shades" | "tints" | "tones";

const TYPES: { id: ShadeType; label: string; description: string; icon: string }[] = [
  {
    id: "shades",
    label: "Shades",
    description: "Mix with black (lightness variation)",
    icon: "ti-moon",
  },
  {
    id: "tints",
    label: "Tints",
    description: "Mix with white (lighter variations)",
    icon: "ti-sun",
  },
  {
    id: "tones",
    label: "Tones",
    description: "Mix with gray (saturation variation)",
    icon: "ti-adjustments",
  },
];

export default function ColorShades({ baseColor, onColorSelect }: ColorShadesProps) {
  const [selectedType, setSelectedType] = useState<ShadeType>("shades");
  const [count, setCount] = useState(10);
  const [copiedColor, setCopiedColor] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const colors = useMemo(() => {
    switch (selectedType) {
      case "shades":
        return generateShades(baseColor, count);
      case "tints":
        return generateTints(baseColor, count);
      case "tones":
        return generateTones(baseColor, count);
      default:
        return [baseColor];
    }
  }, [baseColor, selectedType, count]);

  const swatchStylesMap = useMemo(() => new Map(colors.map(color => [color, { background: color }])), [colors]);

  const handleCopyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color.toUpperCase());
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(""), 1500);
    } catch {
      setCopiedColor("");
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(colors.map((c) => c.toUpperCase()).join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      setCopiedAll(false);
    }
  }, [colors]);

  const handleCopyCss = useCallback(async () => {
    const css = `:root {\n${colors.map((c, i) => `  --shade-${i + 1}: ${c};`).join("\n")}\n}`;
    try {
      await navigator.clipboard.writeText(css);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1500);
    } catch {
      setCopiedCss(false);
    }
  }, [colors]);

  const handleSwatchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, color: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onColorSelect(color);
      }
    },
    [onColorSelect]
  );

  return (
    <div className={styles.csRoot}>
      <div className={styles.csControls}>
        <div className={styles.csTypeSelector}>
          {TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`${styles.csTypeBtn} ${selectedType === type.id ? styles.active : ""}`}
              onClick={() => setSelectedType(type.id)}
            >
              <i className={`ti ${type.icon}`} />
              <div className={styles.csTypeText}>
                <span className={styles.csTypeLabel}>{type.label}</span>
                <span className={styles.csTypeDesc}>{type.description}</span>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.csCountControl}>
          <label className={styles.csCountLabel} htmlFor="cs-count-range">
            <i className="ti ti-adjustments-horizontal" />
            Count: {count}
          </label>
          <input
            id="cs-count-range"
            type="range"
            className={styles.csRange}
            min="5"
            max="15"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <div className={styles.csRangeMarks}>
            <span>5</span>
            <span>10</span>
            <span>15</span>
          </div>
        </div>
      </div>

      <div className={styles.csDisplay}>
        <div className={styles.csDisplayHeader}>
          <div className={styles.csDisplayLabel}>
            <i className="ti ti-palette" />
            {colors.length} Colors
          </div>
          <button
            type="button"
            className={`${styles.csCopyAllBtn} ${copiedAll ? styles.copied : ""}`}
            onClick={handleCopyAll}
            disabled={!colors.length}
          >
            <i className={`ti ${copiedAll ? "ti-check" : "ti-copy"}`} />
            {copiedAll ? "Copied" : "Copy All"}
          </button>
        </div>

        {colors.length === 0 ? (
          <div className={styles.csEmpty}>
            <div className={styles.csEmptyIcon}>
              <i className="ti ti-palette-off" />
            </div>
            <p className={styles.csEmptyTitle}>No colors generated</p>
          </div>
        ) : (
          <div className={styles.csGrid}>
            {colors.map((color, idx) => {
              const rgb = hexToRgb(color);
              const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
              const isBase = color.toLowerCase() === baseColor.toLowerCase();

              return (
                <div key={idx} className={styles.csColorItem}>
                  <div
                    className={styles.csColorSwatch}
                    style={swatchStylesMap.get(color)}
                    onClick={() => onColorSelect(color)}
                    onKeyDown={(e) => handleSwatchKeyDown(e, color)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select color ${color}`}
                  >
                    {isBase && (
                      <div className={styles.csBaseBadge}>
                        <i className="ti ti-star-filled" />
                      </div>
                    )}
                  </div>
                  <div className={styles.csColorDetails}>
                    <code className={styles.csColorHex}>{color.toUpperCase()}</code>
                    {hsl && (
                      <div className={styles.csColorHsl}>
                        {selectedType === "tones" ? `S: ${hsl.s}%` : `L: ${hsl.l}%`}
                      </div>
                    )}
                    <button
                      type="button"
                      className={`${styles.csCopyBtn} ${copiedColor === color ? styles.copied : ""}`}
                      onClick={() => handleCopyColor(color)}
                      aria-label={`Copy ${color}`}
                    >
                      <i className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.csExport}>
        <div className={styles.csExportHeader}>
          <i className="ti ti-file-code" />
          CSS Variables
        </div>
        <div className={styles.csExportCode}>
          <code>
            {`:root {\n`}
            {colors.map((c, i) => `  --shade-${i + 1}: ${c};\n`).join("")}
            {`}`}
          </code>
        </div>
        <button
          type="button"
          className={`${styles.csExportCopyBtn} ${copiedCss ? styles.copied : ""}`}
          onClick={handleCopyCss}
          disabled={!colors.length}
        >
          <i className={`ti ${copiedCss ? "ti-check" : "ti-copy"}`} />
          {copiedCss ? "Copied" : "Copy CSS"}
        </button>
      </div>
    </div>
  );
}