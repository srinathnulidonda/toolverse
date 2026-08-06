// features/dev/color-converter/ColorPreview.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { parseColor, getContrastRatio, getWCAGCompliance, getColorName } from "./ts/utils";

interface ColorPreviewProps {
  color: string;
  onColorChange: (color: string, format: string) => void;
}

import styles from "./style/ColorPreview.module.css";

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
      <div className={styles.cpRoot}>
        {/*  Input Section  */}
        <div className={styles.cpInputSection}>
          <div className={styles.cpInputRow}>
            <div className={styles.cpPickerGroup}>
              <label className={styles.cpPickerLabel}>Color Picker</label>
              <input
                type="color"
                className={styles.cpColorPicker}
                value={colorData?.hex || "#000000"}
                onChange={(e) => handlePickerChange(e.target.value)}
              />
            </div>

            <div className={styles.cpTextGroup}>
              <label className={styles.cpTextLabel}>Or Enter Value</label>
              <input
                type="text"
                className={styles.cpTextInput}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="#3B82F6 or rgb(59, 130, 246)"
              />
            </div>
          </div>

          {!colorData && input && (
            <div className={styles.cpError}>
              <i className="ti ti-alert-circle" />
              Invalid color format. Try HEX (#3B82F6), RGB (rgb(59,130,246)), or HSL
              (hsl(217,91%,60%))
            </div>
          )}
        </div>

        {colorData ? (
          <div className={styles.cpContent}>
            {/*  Preview Card  */}
            <div className={styles.cpPreviewCard}>
              <div className={styles.cpPreviewSwatch} style={{ background: colorData.hex }}>
                <div className={styles.cpPreviewOverlay}>
                  <span className={styles.cpPreviewHex}>{colorData.hex.toUpperCase()}</span>
                  <span className={styles.cpPreviewName}>{colorName}</span>
                </div>
              </div>
            </div>

            {/*  Format Cards  */}
            <div className={styles.cpFormats}>
              {/* HEX */}
              <div className={styles.cpFormatCard}>
                <div className={styles.cpFormatHeader}>
                  <div className={styles.cpFormatIcon}>
                    <i className="ti ti-hash" />
                  </div>
                  <div className={styles.cpFormatInfo}>
                    <span className={styles.cpFormatTitle}>HEX</span>
                    <span className={styles.cpFormatDesc}>Hexadecimal</span>
                  </div>
                  <button
                    type="button"
                    className={[styles.cpCopyBtn, copiedKey === "hex" ? styles.copied : ""].filter(Boolean).join(" ")}
                    onClick={() => handleCopy(colorData.hex.toUpperCase(), "hex")}
                  >
                    <i className={`ti ${copiedKey === "hex" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </div>
                <div className={styles.cpFormatValue}>{colorData.hex.toUpperCase()}</div>
              </div>

              {/* RGB */}
              <div className={styles.cpFormatCard}>
                <div className={styles.cpFormatHeader}>
                  <div className={`${styles.cpFormatIcon} ${styles.cpIconRgb}`}>
                    <i className="ti ti-code" />
                  </div>
                  <div className={styles.cpFormatInfo}>
                    <span className={styles.cpFormatTitle}>RGB</span>
                    <span className={styles.cpFormatDesc}>Red, Green, Blue</span>
                  </div>
                  <button
                    type="button"
                    className={[styles.cpCopyBtn, copiedKey === "rgb" ? styles.copied : ""].filter(Boolean).join(" ")}
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
                <div className={styles.cpFormatValue}>
                  rgb({colorData.rgb.r}, {colorData.rgb.g}, {colorData.rgb.b})
                </div>
                <div className={styles.cpFormatChannels}>
                  <span className={styles.cpChannel}>R: {colorData.rgb.r}</span>
                  <span className={styles.cpChannel}>G: {colorData.rgb.g}</span>
                  <span className={styles.cpChannel}>B: {colorData.rgb.b}</span>
                </div>
              </div>

              {/* HSL */}
              <div className={styles.cpFormatCard}>
                <div className={styles.cpFormatHeader}>
                  <div className={`${styles.cpFormatIcon} ${styles.cpIconHsl}`}>
                    <i className="ti ti-adjustments" />
                  </div>
                  <div className={styles.cpFormatInfo}>
                    <span className={styles.cpFormatTitle}>HSL</span>
                    <span className={styles.cpFormatDesc}>Hue, Saturation, Lightness</span>
                  </div>
                  <button
                    type="button"
                    className={[styles.cpCopyBtn, copiedKey === "hsl" ? styles.copied : ""].filter(Boolean).join(" ")}
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
                <div className={styles.cpFormatValue}>
                  hsl({colorData.hsl.h}, {colorData.hsl.s}%, {colorData.hsl.l}%)
                </div>
                <div className={styles.cpFormatChannels}>
                  <span className={styles.cpChannel}>H: {colorData.hsl.h}°</span>
                  <span className={styles.cpChannel}>S: {colorData.hsl.s}%</span>
                  <span className={styles.cpChannel}>L: {colorData.hsl.l}%</span>
                </div>
              </div>

              {/* HSV */}
              <div className={styles.cpFormatCard}>
                <div className={styles.cpFormatHeader}>
                  <div className={`${styles.cpFormatIcon} ${styles.cpIconHsv}`}>
                    <i className="ti ti-color-swatch" />
                  </div>
                  <div className={styles.cpFormatInfo}>
                    <span className={styles.cpFormatTitle}>HSV</span>
                    <span className={styles.cpFormatDesc}>Hue, Saturation, Value</span>
                  </div>
                  <button
                    type="button"
                    className={[styles.cpCopyBtn, copiedKey === "hsv" ? styles.copied : ""].filter(Boolean).join(" ")}
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
                <div className={styles.cpFormatValue}>
                  hsv({colorData.hsv.h}, {colorData.hsv.s}%, {colorData.hsv.v}%)
                </div>
                <div className={styles.cpFormatChannels}>
                  <span className={styles.cpChannel}>H: {colorData.hsv.h}°</span>
                  <span className={styles.cpChannel}>S: {colorData.hsv.s}%</span>
                  <span className={styles.cpChannel}>V: {colorData.hsv.v}%</span>
                </div>
              </div>

              {/* CMYK */}
              <div className={styles.cpFormatCard}>
                <div className={styles.cpFormatHeader}>
                  <div className={`${styles.cpFormatIcon} ${styles.cpIconCmyk}`}>
                    <i className="ti ti-printer" />
                  </div>
                  <div className={styles.cpFormatInfo}>
                    <span className={styles.cpFormatTitle}>CMYK</span>
                    <span className={styles.cpFormatDesc}>Cyan, Magenta, Yellow, Black</span>
                  </div>
                  <button
                    type="button"
                    className={[styles.cpCopyBtn, copiedKey === "cmyk" ? styles.copied : ""].filter(Boolean).join(" ")}
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
                <div className={styles.cpFormatValue}>
                  cmyk({colorData.cmyk.c}%, {colorData.cmyk.m}%, {colorData.cmyk.y}%, {colorData.cmyk.k}%)
                </div>
                <div className={styles.cpFormatChannels}>
                  <span className={styles.cpChannel}>C: {colorData.cmyk.c}%</span>
                  <span className={styles.cpChannel}>M: {colorData.cmyk.m}%</span>
                  <span className={styles.cpChannel}>Y: {colorData.cmyk.y}%</span>
                  <span className={styles.cpChannel}>K: {colorData.cmyk.k}%</span>
                </div>
              </div>
            </div>

            {/*  Accessibility Section  */}
            <div className={styles.cpSection}>
              <div className={styles.cpSectionHeader}>
                <i className="ti ti-accessible" />
                Accessibility (WCAG)
              </div>
              <div className={styles.cpContrastGrid}>
                {/* White Background */}
                <div className={styles.cpContrastCard}>
                  <div className={styles.cpContrastDemo} style={{ background: "#FFFFFF" }}>
                    <span style={{ color: colorData.hex }}>Aa</span>
                  </div>
                  <div className={styles.cpContrastInfo}>
                    <div className={styles.cpContrastLabel}>On White</div>
                    <div className={styles.cpContrastRatio}>{contrastWhite.toFixed(2)}:1</div>
                    <div className={styles.cpWcagBadges}>
                      <span className={`${styles.cpWcagBadge}${wcagWhite.AA_normal ? "pass" : "fail"}`}>
                        AA
                      </span>
                      <span className={`${styles.cpWcagBadge}${wcagWhite.AAA_normal ? "pass" : "fail"}`}>
                        AAA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Black Background */}
                <div className={styles.cpContrastCard}>
                  <div className={styles.cpContrastDemo} style={{ background: "#000000" }}>
                    <span style={{ color: colorData.hex }}>Aa</span>
                  </div>
                  <div className={styles.cpContrastInfo}>
                    <div className={styles.cpContrastLabel}>On Black</div>
                    <div className={styles.cpContrastRatio}>{contrastBlack.toFixed(2)}:1</div>
                    <div className={styles.cpWcagBadges}>
                      <span className={`${styles.cpWcagBadge}${wcagBlack.AA_normal ? "pass" : "fail"}`}>
                        AA
                      </span>
                      <span className={`${styles.cpWcagBadge}${wcagBlack.AAA_normal ? "pass" : "fail"}`}>
                        AAA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.cpEmpty}>
            <div className={styles.cpEmptyIcon}>
              <i className="ti ti-palette" />
            </div>
            <p className={styles.cpEmptyTitle}>Convert Color Formats</p>
            <p className={styles.cpEmptyDesc}>
              Pick a color or enter a value to see all format conversions and accessibility
              information
            </p>
          </div>
        )}
      </div>
    </>
  );
}