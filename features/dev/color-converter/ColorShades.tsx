// features/dev/color-converter/ColorShades.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { generateShades, generateTints, generateTones, hexToRgb, rgbToHsl } from "./utils";

interface ColorShadesProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
}

type ShadeType = "shades" | "tints" | "tones";

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
      <div className="cs-root">
        {/*  Controls  */}
        <div className="cs-controls">
          <div className="cs-type-selector">
            {TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`cs-type-btn${selectedType === type.id ? " active" : ""}`}
                onClick={() => setSelectedType(type.id)}
              >
                <i className={`ti ${type.icon}`} />
                <div className="cs-type-text">
                  <span className="cs-type-label">{type.label}</span>
                  <span className="cs-type-desc">{type.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="cs-count-control">
            <label className="cs-count-label">
              <i className="ti ti-adjustments-horizontal" />
              Count: {count}
            </label>
            <input
              type="range"
              className="cs-range"
              min="5"
              max="15"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <div className="cs-range-marks">
              <span>5</span>
              <span>10</span>
              <span>15</span>
            </div>
          </div>
        </div>

        {/*  Color Grid  */}
        <div className="cs-display">
          <div className="cs-display-header">
            <div className="cs-display-label">
              <i className="ti ti-palette" />
              {colors.length} Colors
            </div>
            <button type="button" className="cs-copy-all-btn" onClick={handleCopyAll}>
              <i className="ti ti-copy" />
              Copy All
            </button>
          </div>

          <div className="cs-grid">
            {colors.map((color, idx) => {
              const rgb = hexToRgb(color);
              const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
              const isBase =
                color.toUpperCase() === baseColor.toUpperCase() ||
                (selectedType === "shades" && idx === Math.floor(count / 2));

              return (
                <div key={idx} className="cs-color-item">
                  <div
                    className="cs-color-swatch"
                    style={{ background: color }}
                    onClick={() => onColorSelect(color)}
                    role="button"
                    tabIndex={0}
                  >
                    {isBase && (
                      <div className="cs-base-badge">
                        <i className="ti ti-star-filled" />
                      </div>
                    )}
                  </div>
                  <div className="cs-color-details">
                    <code className="cs-color-hex">{color.toUpperCase()}</code>
                    {hsl && (
                      <div className="cs-color-hsl">
                        {selectedType === "shades" && `L: ${hsl.l}%`}
                        {selectedType === "tints" && `L: ${hsl.l}%`}
                        {selectedType === "tones" && `S: ${hsl.s}%`}
                      </div>
                    )}
                    <button
                      type="button"
                      className={`cs-copy-btn${copiedColor === color ? " copied" : ""}`}
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
        <div className="cs-export">
          <div className="cs-export-header">
            <i className="ti ti-file-code" />
            CSS Variables
          </div>
          <div className="cs-export-code">
            <code>
              {`:root {\n`}
              {colors.map((c, i) => `  --shade-${i + 1}: ${c};\n`).join("")}
              {`}`}
            </code>
          </div>
          <button
            type="button"
            className="cs-export-copy-btn"
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
