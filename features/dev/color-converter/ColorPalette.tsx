// features/dev/color-converter/ColorPalette.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import {
  generateComplementary,
  generateTriadic,
  generateTetradic,
  generateAnalogous,
  generateMonochromatic,
} from "./utils";

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
      <div className="cpal-root">
        {/*  Palette Type Selector  */}
        <div className="cpal-selector">
          <div className="cpal-selector-header">
            <div className="cpal-selector-label">
              <i className="ti ti-color-swatch" />
              Color Scheme
            </div>
            {selectedInfo && <span className="cpal-selector-desc">{selectedInfo.description}</span>}
          </div>
          <div className="cpal-types">
            {PALETTE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`cpal-type-btn${selectedType === type.id ? " active" : ""}`}
                onClick={() => setSelectedType(type.id)}
              >
                <i className={`ti ${type.icon}`} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/*  Palette Display  */}
        <div className="cpal-display">
          <div className="cpal-colors">
            {palette.map((color, idx) => (
              <div key={idx} className="cpal-color-card">
                <div
                  className="cpal-color-swatch"
                  style={{ background: color }}
                  onClick={() => onColorSelect(color)}
                  role="button"
                  tabIndex={0}
                  title="Click to select this color"
                >
                  {idx === 0 && (
                    <div className="cpal-base-badge">
                      <i className="ti ti-star-filled" />
                      Base
                    </div>
                  )}
                </div>
                <div className="cpal-color-info">
                  <code className="cpal-color-hex">{color.toUpperCase()}</code>
                  <div className="cpal-color-actions">
                    <button
                      type="button"
                      className={`cpal-action-btn${copiedColor === color ? " copied" : ""}`}
                      onClick={() => handleCopyColor(color)}
                      title="Copy HEX"
                    >
                      <i className={`ti ${copiedColor === color ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className="cpal-action-btn"
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
        <div className="cpal-export">
          <div className="cpal-export-header">
            <i className="ti ti-download" />
            Export Palette
          </div>
          <div className="cpal-export-actions">
            <button
              type="button"
              className="cpal-export-btn"
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
              className="cpal-export-btn"
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
              className="cpal-export-btn"
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
