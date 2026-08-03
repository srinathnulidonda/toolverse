// features/dev/color-converter/ColorPreview.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { parseColor, getContrastRatio, getWCAGCompliance, getColorName } from "./utils";

interface ColorPreviewProps {
  color: string;
  onColorChange: (color: string, format: string) => void;
}

export default function ColorPreview({ color, onColorChange }: ColorPreviewProps) {
  const [input, setInput] = useState(color);
  const [copiedKey, setCopiedKey] = useState("");

  const colorData = useMemo(() => parseColor(input || color), [input, color]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      const parsed = parseColor(value);
      if (parsed) {
        onColorChange(parsed.hex, "input");
      }
    },
    [onColorChange]
  );

  const handlePickerChange = useCallback(
    (value: string) => {
      setInput(value);
      onColorChange(value, "picker");
    },
    [onColorChange]
  );

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const contrastWhite = useMemo(
    () => (colorData ? getContrastRatio(colorData.hex, "#FFFFFF") : 0),
    [colorData]
  );

  const contrastBlack = useMemo(
    () => (colorData ? getContrastRatio(colorData.hex, "#000000") : 0),
    [colorData]
  );

  const wcagWhite = useMemo(() => getWCAGCompliance(contrastWhite), [contrastWhite]);
  const wcagBlack = useMemo(() => getWCAGCompliance(contrastBlack), [contrastBlack]);

  const colorName = useMemo(() => (colorData ? getColorName(colorData.hex) : ""), [colorData]);

  return (
    <>
      <div className="cp-root">
        {/*  Input Section  */}
        <div className="cp-input-section">
          <div className="cp-input-row">
            <div className="cp-picker-group">
              <label className="cp-picker-label">Color Picker</label>
              <input
                type="color"
                className="cp-color-picker"
                value={colorData?.hex || "#000000"}
                onChange={(e) => handlePickerChange(e.target.value)}
              />
            </div>

            <div className="cp-text-group">
              <label className="cp-text-label">Or Enter Value</label>
              <input
                type="text"
                className="cp-text-input"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="#3B82F6 or rgb(59, 130, 246)"
              />
            </div>
          </div>

          {!colorData && input && (
            <div className="cp-error">
              <i className="ti ti-alert-circle" />
              Invalid color format. Try HEX (#3B82F6), RGB (rgb(59,130,246)), or HSL
              (hsl(217,91%,60%))
            </div>
          )}
        </div>

        {colorData ? (
          <div className="cp-content">
            {/*  Preview Card  */}
            <div className="cp-preview-card">
              <div className="cp-preview-swatch" style={{ background: colorData.hex }}>
                <div className="cp-preview-overlay">
                  <span className="cp-preview-hex">{colorData.hex.toUpperCase()}</span>
                  <span className="cp-preview-name">{colorName}</span>
                </div>
              </div>
            </div>

            {/*  Format Cards  */}
            <div className="cp-formats">
              {/* HEX */}
              <div className="cp-format-card">
                <div className="cp-format-header">
                  <div className="cp-format-icon">
                    <i className="ti ti-hash" />
                  </div>
                  <div className="cp-format-info">
                    <span className="cp-format-title">HEX</span>
                    <span className="cp-format-desc">Hexadecimal</span>
                  </div>
                  <button
                    type="button"
                    className={`cp-copy-btn${copiedKey === "hex" ? " copied" : ""}`}
                    onClick={() => handleCopy(colorData.hex.toUpperCase(), "hex")}
                  >
                    <i className={`ti ${copiedKey === "hex" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
                <div className="cp-format-value">{colorData.hex.toUpperCase()}</div>
              </div>

              {/* RGB */}
              <div className="cp-format-card">
                <div className="cp-format-header">
                  <div className="cp-format-icon cp-icon-rgb">
                    <i className="ti ti-code" />
                  </div>
                  <div className="cp-format-info">
                    <span className="cp-format-title">RGB</span>
                    <span className="cp-format-desc">Red, Green, Blue</span>
                  </div>
                  <button
                    type="button"
                    className={`cp-copy-btn${copiedKey === "rgb" ? " copied" : ""}`}
                    onClick={() =>
                      handleCopy(
                        `rgb(${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b})`,
                        "rgb"
                      )
                    }
                  >
                    <i className={`ti ${copiedKey === "rgb" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
                <div className="cp-format-value">
                  rgb({colorData.rgb.r}, {colorData.rgb.g}, {colorData.rgb.b})
                </div>
                <div className="cp-format-channels">
                  <span className="cp-channel">R: {colorData.rgb.r}</span>
                  <span className="cp-channel">G: {colorData.rgb.g}</span>
                  <span className="cp-channel">B: {colorData.rgb.b}</span>
                </div>
              </div>

              {/* HSL */}
              <div className="cp-format-card">
                <div className="cp-format-header">
                  <div className="cp-format-icon cp-icon-hsl">
                    <i className="ti ti-adjustments" />
                  </div>
                  <div className="cp-format-info">
                    <span className="cp-format-title">HSL</span>
                    <span className="cp-format-desc">Hue, Saturation, Lightness</span>
                  </div>
                  <button
                    type="button"
                    className={`cp-copy-btn${copiedKey === "hsl" ? " copied" : ""}`}
                    onClick={() =>
                      handleCopy(
                        `hsl(${colorData.hsl.h}, ${colorData.hsl.s}%, ${colorData.hsl.l}%)`,
                        "hsl"
                      )
                    }
                  >
                    <i className={`ti ${copiedKey === "hsl" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
                <div className="cp-format-value">
                  hsl({colorData.hsl.h}, {colorData.hsl.s}%, {colorData.hsl.l}%)
                </div>
                <div className="cp-format-channels">
                  <span className="cp-channel">H: {colorData.hsl.h}°</span>
                  <span className="cp-channel">S: {colorData.hsl.s}%</span>
                  <span className="cp-channel">L: {colorData.hsl.l}%</span>
                </div>
              </div>

              {/* HSV */}
              <div className="cp-format-card">
                <div className="cp-format-header">
                  <div className="cp-format-icon cp-icon-hsv">
                    <i className="ti ti-color-swatch" />
                  </div>
                  <div className="cp-format-info">
                    <span className="cp-format-title">HSV</span>
                    <span className="cp-format-desc">Hue, Saturation, Value</span>
                  </div>
                  <button
                    type="button"
                    className={`cp-copy-btn${copiedKey === "hsv" ? " copied" : ""}`}
                    onClick={() =>
                      handleCopy(
                        `hsv(${colorData.hsv.h}, ${colorData.hsv.s}%, ${colorData.hsv.v}%)`,
                        "hsv"
                      )
                    }
                  >
                    <i className={`ti ${copiedKey === "hsv" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
                <div className="cp-format-value">
                  hsv({colorData.hsv.h}, {colorData.hsv.s}%, {colorData.hsv.v}%)
                </div>
                <div className="cp-format-channels">
                  <span className="cp-channel">H: {colorData.hsv.h}°</span>
                  <span className="cp-channel">S: {colorData.hsv.s}%</span>
                  <span className="cp-channel">V: {colorData.hsv.v}%</span>
                </div>
              </div>

              {/* CMYK */}
              <div className="cp-format-card">
                <div className="cp-format-header">
                  <div className="cp-format-icon cp-icon-cmyk">
                    <i className="ti ti-printer" />
                  </div>
                  <div className="cp-format-info">
                    <span className="cp-format-title">CMYK</span>
                    <span className="cp-format-desc">Cyan, Magenta, Yellow, Black</span>
                  </div>
                  <button
                    type="button"
                    className={`cp-copy-btn${copiedKey === "cmyk" ? " copied" : ""}`}
                    onClick={() =>
                      handleCopy(
                        `cmyk(${colorData.cmyk.c}%, ${colorData.cmyk.m}%, ${colorData.cmyk.y}%, ${colorData.cmyk.k}%)`,
                        "cmyk"
                      )
                    }
                  >
                    <i className={`ti ${copiedKey === "cmyk" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
                <div className="cp-format-value">
                  cmyk({colorData.cmyk.c}%, {colorData.cmyk.m}%, {colorData.cmyk.y}%,{" "}
                  {colorData.cmyk.k}%)
                </div>
                <div className="cp-format-channels">
                  <span className="cp-channel">C: {colorData.cmyk.c}%</span>
                  <span className="cp-channel">M: {colorData.cmyk.m}%</span>
                  <span className="cp-channel">Y: {colorData.cmyk.y}%</span>
                  <span className="cp-channel">K: {colorData.cmyk.k}%</span>
                </div>
              </div>
            </div>

            {/*  Accessibility Section  */}
            <div className="cp-section">
              <div className="cp-section-header">
                <i className="ti ti-accessible" />
                Accessibility (WCAG)
              </div>
              <div className="cp-contrast-grid">
                {/* White Background */}
                <div className="cp-contrast-card">
                  <div className="cp-contrast-demo" style={{ background: "#FFFFFF" }}>
                    <span style={{ color: colorData.hex }}>Aa</span>
                  </div>
                  <div className="cp-contrast-info">
                    <div className="cp-contrast-label">On White</div>
                    <div className="cp-contrast-ratio">{contrastWhite.toFixed(2)}:1</div>
                    <div className="cp-wcag-badges">
                      <span className={`cp-wcag-badge${wcagWhite.AA_normal ? " pass" : " fail"}`}>
                        AA
                      </span>
                      <span className={`cp-wcag-badge${wcagWhite.AAA_normal ? " pass" : " fail"}`}>
                        AAA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Black Background */}
                <div className="cp-contrast-card">
                  <div className="cp-contrast-demo" style={{ background: "#000000" }}>
                    <span style={{ color: colorData.hex }}>Aa</span>
                  </div>
                  <div className="cp-contrast-info">
                    <div className="cp-contrast-label">On Black</div>
                    <div className="cp-contrast-ratio">{contrastBlack.toFixed(2)}:1</div>
                    <div className="cp-wcag-badges">
                      <span className={`cp-wcag-badge${wcagBlack.AA_normal ? " pass" : " fail"}`}>
                        AA
                      </span>
                      <span className={`cp-wcag-badge${wcagBlack.AAA_normal ? " pass" : " fail"}`}>
                        AAA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <i className="ti ti-palette" />
            </div>
            <p className="cp-empty-title">Convert Color Formats</p>
            <p className="cp-empty-desc">
              Pick a color or enter a value to see all format conversions and accessibility
              information
            </p>
          </div>
        )}
      </div>
    </>
  );
}
