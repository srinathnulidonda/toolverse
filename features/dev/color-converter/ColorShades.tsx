// features/dev/color-converter/ColorShades.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { generateShades, generateTints, generateTones, hexToRgb, rgbToHsl } from "./ts/utils";

interface ColorShadesProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
}

type ShadeType = "shades" | "tints" | "tones";

import styles from "./style/ColorShades.module.css";

export default function ColorShades({ baseColor, onColorSelect }: ColorShadesProps) {
  const [selectedType, setSelectedType] = useState<ShadeType>("shades");
  const [count, setCount] = useState(10);
  const [copiedColor, setCopiedColor] = useState("");

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

  const handleCopyColor = useCallback(async (color: string) => {
    await navigator.clipboard.writeText(color.toUpperCase());
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(""), 1500);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = colors.map((c) => c.toUpperCase()).join("\n");
    await navigator.clipboard.writeText(text);
  }, [colors]);

  const TYPES = [
    {
      id: "shades" as const,
      label: "Shades",
      description: "Mix with black (lightness variation)",
      icon: "ti-moon",
    },
    {
      id: "tints" as const,
      label: "Tints",
      description: "Mix with white (lighter variations)",
      icon: "ti-sun",
    },
    {
      id: "tones" as const,
      label: "Tones",
      description: "Mix with gray (saturation variation)",
      icon: "ti-adjustments",
    },
  ];

  return (
    <>
      <div className={styles.csRoot}>
        {/*  Controls  */}
        <div className={styles.csControls}>
          <div className={styles.csTypeSelector}>
            {TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`${styles.csTypeBtn}${selectedType === type.id ? ` ${styles.active}` : ""}`}
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
            <label className={styles.csCountLabel}>
              <i className="ti ti-adjustments-horizontal" />
              Count: {count}
            </label>
            <input
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

        {/*  Color Grid  */}
        <div className={styles.csDisplay}>
          <div className={styles.csDisplayHeader}>
            <div className={styles.csDisplayLabel}>
              <i className="ti ti-palette" />
              {colors.length} Colors
            </div>
            <button type="button" className={styles.csCopyAllBtn} onClick={handleCopyAll}>
              <i className="ti ti-copy" />
              Copy All
            </button>
          </div>

          <div className={styles.csGrid}>
            {colors.map((color, idx) => {
              const rgb = hexToRgb(color);
              const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
              const isBase =
                color.toUpperCase() === baseColor.toUpperCase() ||
                (selectedType === "shades" && idx === Math.floor(count / 2));

              return (
                <div key={idx} className={styles.csColorItem}>
                  <div
                    className={styles.csColorSwatch}
                    style={{ background: color }}
                    onClick={() => onColorSelect(color)}
                    role="button"
                    tabIndex={0}
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
                        {selectedType === "shades" && `L: ${hsl.l}%`}
                        {selectedType === "tints" && `L: ${hsl.l}%`}
                        {selectedType === "tones" && `S: ${hsl.s}%`}
                      </div>
                    )}
                    <button
                      type="button"
                      className={`${styles.csCopyBtn}${copiedColor === color ? ` ${styles.copied}` : ""}`}
                      onClick={() => handleCopyColor(color)}
                    >
                      <i className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/*  CSS Export  */}
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
            className={styles.csExportCopyBtn}
            onClick={() => {
              const css = `:root {\n${colors.map((c, i) => `  --shade-${i + 1}: ${c};`).join("\n")}\n}`;
              navigator.clipboard.writeText(css);
            }}
          >
            <i className="ti ti-copy" />
            Copy CSS
          </button>
        </div>
      </div>
    </>
  );
}