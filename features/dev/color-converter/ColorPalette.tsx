// features/dev/color-converter/ColorPalette.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import {
  generateComplementary,
  generateTriadic,
  generateTetradic,
  generateAnalogous,
  generateMonochromatic,
} from "./ts/utils";
import styles from "./style/ColorPalette.module.css";

interface ColorPaletteProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
}

type PaletteType = "complementary" | "triadic" | "tetradic" | "analogous" | "monochromatic";

const PALETTE_TYPES: Array<{
  id: PaletteType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "complementary",
    label: "Complementary",
    description: "Colors opposite on the color wheel",
    icon: "ti-arrows-split-2",
  },
  {
    id: "triadic",
    label: "Triadic",
    description: "Three colors evenly spaced",
    icon: "ti-triangle",
  },
  {
    id: "tetradic",
    label: "Tetradic",
    description: "Four colors in two complementary pairs",
    icon: "ti-box",
  },
  {
    id: "analogous",
    label: "Analogous",
    description: "Colors adjacent on the color wheel",
    icon: "ti-arrows-horizontal",
  },
  {
    id: "monochromatic",
    label: "Monochromatic",
    description: "Variations of a single hue",
    icon: "ti-palette",
  },
];

export default function ColorPalette({ baseColor, onColorSelect }: ColorPaletteProps) {
  const [selectedType, setSelectedType] = useState<PaletteType>("complementary");
  const [copiedColor, setCopiedColor] = useState("");
  const [copiedExport, setCopiedExport] = useState("");

  const palette = useMemo(() => {
    switch (selectedType) {
      case "complementary":
        return generateComplementary(baseColor);
      case "triadic":
        return generateTriadic(baseColor);
      case "tetradic":
        return generateTetradic(baseColor);
      case "analogous":
        return generateAnalogous(baseColor);
      case "monochromatic":
        return generateMonochromatic(baseColor);
      default:
        return [baseColor];
    }
  }, [baseColor, selectedType]);

  const handleCopyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color.toUpperCase());
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(""), 1500);
    } catch {
      setCopiedColor("");
    }
  }, []);

  const swatchStylesMap = useMemo(() => new Map(palette.map(color => [color, { background: color }])), [palette]);

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(palette.map((c) => c.toUpperCase()).join("\n"));
      setCopiedExport("all");
      setTimeout(() => setCopiedExport(""), 1500);
    } catch {
      setCopiedExport("");
    }
  }, [palette]);

  const handleExport = useCallback(
    async (kind: "css" | "json" | "scss") => {
      let text = "";
      if (kind === "css") {
        text = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
      } else if (kind === "json") {
        text = JSON.stringify(
          palette.reduce((acc, c, i) => ({ ...acc, [`color${i + 1}`]: c }), {}),
          null,
          2
        );
      } else {
        text = palette.map((c, i) => `$color-${i + 1}: ${c};`).join("\n");
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopiedExport(kind);
        setTimeout(() => setCopiedExport(""), 1500);
      } catch {
        setCopiedExport("");
      }
    },
    [palette]
  );

  const handleSwatchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, color: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onColorSelect(color);
      }
    },
    [onColorSelect]
  );

  const selectedInfo = PALETTE_TYPES.find((t) => t.id === selectedType);

  return (
    <div className={styles.cpalRoot}>
      <div className={styles.cpalSelector}>
        <div className={styles.cpalSelectorHeader}>
          <div className={styles.cpalSelectorLabel}>
            <i className="ti ti-color-swatch" />
            Color Scheme
          </div>
          {selectedInfo && <span className={styles.cpalSelectorDesc}>{selectedInfo.description}</span>}
        </div>
        <div className={styles.cpalTypes}>
          {PALETTE_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`${styles.cpalTypeBtn} ${selectedType === type.id ? styles.active : ""}`}
              onClick={() => setSelectedType(type.id)}
            >
              <i className={`ti ${type.icon}`} />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.cpalDisplay}>
        <div className={styles.cpalDisplayHeader}>
          <div className={styles.cpalDisplayLabel}>
            <i className="ti ti-palette" />
            {palette.length} Colors
          </div>
          <button type="button" className={styles.cpalCopyAllBtn} onClick={handleCopyAll}>
            <i className={`ti ${copiedExport === "all" ? "ti-check" : "ti-copy"}`} />
            {copiedExport === "all" ? "Copied" : "Copy All"}
          </button>
        </div>
        <div className={styles.cpalColors}>
          {palette.map((color, idx) => {
            const isActive = color.toLowerCase() === baseColor.toLowerCase() && idx !== 0;
            return (
              <div key={idx} className={styles.cpalColorCard}>
                <div
                  className={styles.cpalColorSwatch}
                  style={swatchStylesMap.get(color)}
                  onClick={() => onColorSelect(color)}
                  onKeyDown={(e) => handleSwatchKeyDown(e, color)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select color ${color}`}
                  title="Click to select this color"
                >
                  {idx === 0 && (
                    <div className={styles.cpalBaseBadge}>
                      <i className="ti ti-star-filled" />
                      Base
                    </div>
                  )}
                  {isActive && (
                    <div className={styles.cpalActiveBadge}>
                      <i className="ti ti-check" />
                    </div>
                  )}
                </div>
                <div className={styles.cpalColorInfo}>
                  <code className={styles.cpalColorHex}>{color.toUpperCase()}</code>
                  <div className={styles.cpalColorActions}>
                    <button
                      type="button"
                      className={`${styles.cpalActionBtn} ${copiedColor === color ? styles.copied : ""}`}
                      onClick={() => handleCopyColor(color)}
                      title="Copy HEX"
                      aria-label={`Copy ${color}`}
                    >
                      <i className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.cpalActionBtn}
                      onClick={() => onColorSelect(color)}
                      title="Use this color"
                      aria-label={`Use ${color}`}
                    >
                      <i className="ti ti-arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.cpalExport}>
        <div className={styles.cpalExportHeader}>
          <i className="ti ti-download" />
          Export Palette
        </div>
        <div className={styles.cpalExportActions}>
          <button
            type="button"
            className={`${styles.cpalExportBtn} ${copiedExport === "css" ? styles.copied : ""}`}
            onClick={() => handleExport("css")}
          >
            <i className={`ti ${copiedExport === "css" ? "ti-check" : "ti-file-code"}`} />
            CSS Variables
          </button>
          <button
            type="button"
            className={`${styles.cpalExportBtn} ${copiedExport === "json" ? styles.copied : ""}`}
            onClick={() => handleExport("json")}
          >
            <i className={`ti ${copiedExport === "json" ? "ti-check" : "ti-braces"}`} />
            JSON
          </button>
          <button
            type="button"
            className={`${styles.cpalExportBtn} ${copiedExport === "scss" ? styles.copied : ""}`}
            onClick={() => handleExport("scss")}
          >
            <i className={`ti ${copiedExport === "scss" ? "ti-check" : "ti-brand-sass"}`} />
            SCSS
          </button>
        </div>
      </div>
    </div>
  );
}