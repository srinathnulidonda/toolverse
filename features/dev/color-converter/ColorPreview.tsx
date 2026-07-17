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

      <style jsx>{`
        .cp-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        /*  Input Section  */
        .cp-input-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cp-input-row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 14px;
        }

        .cp-picker-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cp-picker-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .cp-color-picker {
          width: 120px;
          height: 120px;
          border: 2px solid var(--border);
          border-radius: var(--cc-radius-lg);
          cursor: pointer;
          transition: transform 0.12s;
        }

        .cp-color-picker:hover {
          transform: scale(1.02);
        }

        .cp-text-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cp-text-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .cp-text-input {
          height: 44px;
          padding: 0 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-md);
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text);
          transition: border-color 0.12s;
        }

        .cp-text-input:focus {
          outline: none;
          border-color: var(--brand-border);
        }

        .cp-text-input::placeholder {
          color: var(--text-disabled);
          font-size: 12px;
        }

        .cp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--error-bg);
          border: 0.5px solid #fecaca;
          border-radius: var(--cc-radius-md);
          color: #991b1b;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (prefers-color-scheme: dark) {
          .cp-error {
            border-color: #7f1d1d;
            color: #f87171;
          }
        }

        .cp-error i {
          font-size: 14px;
          flex-shrink: 0;
        }

        /*  Content  */
        .cp-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /*  Preview Card  */
        .cp-preview-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-lg);
          overflow: hidden;
        }

        .cp-preview-swatch {
          height: 180px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cp-preview-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.25);
          border-radius: var(--cc-radius-lg);
        }

        .cp-preview-hex {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.5px;
        }

        .cp-preview-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }

        /*  Formats  */
        .cp-formats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cp-format-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-lg);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.12s;
        }

        .cp-format-card:hover {
          border-color: var(--brand-border);
        }

        .cp-format-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cp-format-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--cc-radius-md);
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          color: var(--brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .cp-icon-rgb {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }

        .cp-icon-hsl {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        }

        .cp-icon-hsv {
          background: #fef3c7;
          border-color: #fde68a;
          color: #92400e;
        }

        .cp-icon-cmyk {
          background: #fce7f3;
          border-color: #fbcfe8;
          color: #9f1239;
        }

        @media (prefers-color-scheme: dark) {
          .cp-icon-rgb {
            background: #0a1628;
            border-color: #1e3a5f;
            color: #93c5fd;
          }
          .cp-icon-hsl {
            background: #052e16;
            border-color: #166534;
            color: #4ade80;
          }
          .cp-icon-hsv {
            background: #1c1400;
            border-color: #78350f;
            color: #fcd34d;
          }
          .cp-icon-cmyk {
            background: #1c0a14;
            border-color: #831843;
            color: #f9a8d4;
          }
        }

        .cp-format-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cp-format-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .cp-format-desc {
          font-size: 10px;
          color: var(--text-disabled);
        }

        .cp-copy-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--cc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          flex-shrink: 0;
        }

        .cp-copy-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }

        .cp-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .cp-format-value {
          font-family: var(--font-mono);
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: var(--cc-radius-md);
        }

        .cp-format-channels {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cp-channel {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          font-weight: 600;
        }

        /*  Section  */
        .cp-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-lg);
          overflow: hidden;
        }

        .cp-section-header {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cp-section-header i {
          font-size: 12px;
        }

        /*  Accessibility  */
        .cp-contrast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          padding: 14px;
        }

        .cp-contrast-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cp-contrast-demo {
          height: 100px;
          border-radius: var(--cc-radius-md);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 700;
        }

        .cp-contrast-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cp-contrast-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .cp-contrast-ratio {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .cp-wcag-badges {
          display: flex;
          gap: 6px;
        }

        .cp-wcag-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 22px;
          padding: 0 8px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .cp-wcag-badge.pass {
          background: #dcfce7;
          color: #166534;
          border: 0.5px solid #bbf7d0;
        }

        .cp-wcag-badge.fail {
          background: #fee2e2;
          color: #991b1b;
          border: 0.5px solid #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .cp-wcag-badge.pass {
            background: #052e16;
            color: #4ade80;
            border-color: #166534;
          }
          .cp-wcag-badge.fail {
            background: #1c0a0a;
            color: #f87171;
            border-color: #7f1d1d;
          }
        }

        /*  Empty State  */
        .cp-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .cp-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .cp-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .cp-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 340px;
          line-height: 1.6;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .cp-root {
            padding: 12px;
          }

          .cp-input-row {
            grid-template-columns: 1fr;
          }

          .cp-color-picker {
            width: 100%;
          }

          .cp-contrast-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cp-color-picker,
          .cp-text-input,
          .cp-format-card,
          .cp-copy-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
