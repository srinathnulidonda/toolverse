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

import styles from "./style/ColorPalette.module.css";

export default function ColorPalette({ baseColor, onColorSelect }: ColorPaletteProps) {
  const [selectedType, setSelectedType] = useState<PaletteType>("complementary");
  const [copiedColor, setCopiedColor] = useState("");

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
    await navigator.clipboard.writeText(color.toUpperCase());
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(""), 1500);
  }, []);

  const selectedInfo = PALETTE_TYPES.find((t) => t.id === selectedType);

  return (
    <>
      <div className={styles.cpalRoot}>
        {/*  Palette Type Selector  */}
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
                className={`${styles.cpalTypeBtn}${selectedType === type.id ? ` ${styles.active}` : ""}`}
                onClick={() => setSelectedType(type.id)}
              >
                <i className={`ti ${type.icon}`} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/*  Palette Display  */}
        <div className={styles.cpalDisplay}>
          <div className={styles.cpalColors}>
            {palette.map((color, idx) => (
              <div key={idx} className={styles.cpalColorCard}>
                <div
                  className={styles.cpalColorSwatch}
                  style={{ background: color }}
                  onClick={() => onColorSelect(color)}
                  role="button"
                  tabIndex={0}
                  title="Click to select this color"
                >
                  {idx === 0 && (
                    <div className={styles.cpalBaseBadge}>
                      <i className="ti ti-star-filled" />
                      Base
                    </div>
                  )}
                </div>
                <div className={styles.cpalColorInfo}>
                  <code className={styles.cpalColorHex}>{color.toUpperCase()}</code>
                  <div className={styles.cpalColorActions}>
                    <button
                      type="button"
                      className={`${styles.cpalActionBtn}${copiedColor === color ? ` ${styles.copied}` : ""}`}
                      onClick={() => handleCopyColor(color)}
                      title="Copy HEX"
                    >
                      <i className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.cpalActionBtn}
                      onClick={() => onColorSelect(color)}
                      title="Use this color"
                    >
                      <i className="ti ti-arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  Export Options  */}
        <div className={styles.cpalExport}>
          <div className={styles.cpalExportHeader}>
            <i className="ti ti-download" />
            Export Palette
          </div>
          <div className={styles.cpalExportActions}>
            <button
              type="button"
              className={styles.cpalExportBtn}
              onClick={() => {
                const css = palette.map((c, i) => `--color-${i + 1}: ${c};`).join("\n");
                navigator.clipboard.writeText(`:root {\n  ${css}\n}`);
              }}
            >
              <i className="ti ti-file-code" />
              CSS Variables
            </button>
            <button
              type="button"
              className={styles.cpalExportBtn}
              onClick={() => {
                const json = JSON.stringify(
                  palette.reduce((acc, c, i) => ({ ...acc, [`color${i + 1}`]: c }), {}),
                  null,
                  2
                );
                navigator.clipboard.writeText(json);
              }}
            >
              <i className="ti ti-braces" />
              JSON
            </button>
            <button
              type="button"
              className={styles.cpalExportBtn}
              onClick={() => {
                const scss = palette.map((c, i) => `$color-${i + 1}: ${c};`).join("\n");
                navigator.clipboard.writeText(scss);
              }}
            >
              <i className="ti ti-brand-sass" />
              SCSS
            </button>
          </div>
        </div>
      </div>
    </>
  );
}