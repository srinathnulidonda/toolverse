// features/dev/color-converter/ColorPreview.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { parseColor, getContrastRatio, getWCAGCompliance, getColorName } from "./ts/utils";
import styles from "./style/ColorPreview.module.css";

interface PresetColor {
  id: string;
  name: string;
  hex: string;
}

interface ColorPreviewProps {
  color: string;
  presets?: PresetColor[];
  onColorChange: (color: string, format: string) => void;
}

export default function ColorPreview({ color, presets = [], onColorChange }: ColorPreviewProps) {
  const [input, setInput] = useState(color);
  const [copiedKey, setCopiedKey] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsedInput = parseColor(input);
    if (!parsedInput || parsedInput.hex.toLowerCase() !== color.toLowerCase()) {
      setInput(color);
    }
  }, [color]);

  const colorData = useMemo(() => parseColor(input), [input]);

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
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
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

  const goToOutput = useCallback(() => {
    setMobilePanel("output");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  return (
    <div className={styles.cpRoot} ref={rootRef}>
      <div className={styles.cpMobileSwitcher}>
        <button
          type="button"
          className={`${styles.cpSwTab} ${mobilePanel === "input" ? styles.active : ""}`}
          onClick={goToInput}
        >
          <i className="ti ti-color-picker" />
          Input
        </button>
        <div className={styles.cpSwDivider} />
        <button
          type="button"
          className={`${styles.cpSwTab} ${mobilePanel === "output" ? styles.active : ""}`}
          onClick={goToOutput}
        >
          <i className="ti ti-sparkles" />
          Formats
          {colorData && mobilePanel !== "output" && <span className={styles.cpSwDot} />}
        </button>
      </div>

      <div className={styles.cpBody}>
        <div className={`${styles.cpPanel} ${mobilePanel === "input" ? styles.mobVisible : styles.mobHidden}`}>
          <div className={styles.cpPanelBar}>
            <div className={styles.cpPanelLabel}>
              <i className="ti ti-color-picker" />
              Input Color
            </div>
          </div>

          <div className={styles.cpInputBody}>
            <div className={styles.cpInputRow}>
              <div className={styles.cpPickerGroup}>
                <label className={styles.cpPickerLabel}>Color Picker</label>
                <input
                  type="color"
                  className={styles.cpColorPicker}
                  value={colorData?.hex || "#000000"}
                  onChange={(e) => handlePickerChange(e.target.value)}
                  aria-label="Color picker"
                />
              </div>

              <div className={styles.cpTextGroup}>
                <label className={styles.cpTextLabel} htmlFor="cp-color-input">
                  Or Enter Value
                </label>
                <input
                  id="cp-color-input"
                  type="text"
                  className={styles.cpTextInput}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="#3B82F6 or rgb(59, 130, 246)"
                  spellCheck={false}
                  autoComplete="off"
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

            {presets.length > 0 && (
              <div className={styles.cpQuickRow}>
                <span className={styles.cpQuickLabel}>Quick Presets</span>
                <div className={styles.cpQuickSwatches}>
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={styles.cpQuickSwatch}
                      style={{ background: preset.hex }}
                      onClick={() => handlePickerChange(preset.hex)}
                      title={preset.name}
                      aria-label={`Use ${preset.name}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {colorData && (
            <div className={styles.cpMobCta}>
              <button type="button" className={styles.cpCtaBtn} onClick={goToOutput}>
                <i className="ti ti-sparkles" />
                View All Formats
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.cpGutter}>
          <div className={styles.cpGutterLine} />
          <div className={styles.cpGutterNode}>
            <i className="ti ti-arrow-right" />
          </div>
          <div className={styles.cpGutterLine} />
        </div>

        <div className={`${styles.cpPanel} ${mobilePanel === "output" ? styles.mobVisible : styles.mobHidden}`}>
          <div className={styles.cpPanelBar}>
            <div className={styles.cpPanelLabel}>
              <i className="ti ti-sparkles" />
              Formats
            </div>
            {colorData && (
              <div className={styles.cpPanelActions}>
                <button
                  type="button"
                  className={`${styles.cpIconBtn} ${copiedKey === "hex" ? styles.copied : ""}`}
                  onClick={() => handleCopy(colorData.hex.toUpperCase(), "hex")}
                  title="Copy hex"
                  aria-label="Copy hex value"
                >
                  <i className={`ti ${copiedKey === "hex" ? "ti-check" : "ti-copy"}`} />
                </button>
              </div>
            )}
          </div>

          {!colorData ? (
            <div className={styles.cpEmpty}>
              <div className={styles.cpEmptyIcon}>
                <i className="ti ti-palette" />
              </div>
              <h3 className={styles.cpEmptyTitle}>Convert Color Formats</h3>
              <p className={styles.cpEmptyDesc}>
                Pick a color or enter a value on the left to see all format conversions and
                accessibility information.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.cpOutputBody}>
                <div className={styles.cpPreviewCard}>
                  <div className={styles.cpPreviewSwatch} style={{ background: colorData.hex }}>
                    <div className={styles.cpPreviewOverlay}>
                      <span className={styles.cpPreviewHex}>{colorData.hex.toUpperCase()}</span>
                      <span className={styles.cpPreviewName}>{colorName}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cpFormats}>
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
                        className={`${styles.cpCopyBtn} ${copiedKey === "hex" ? styles.copied : ""}`}
                        onClick={() => handleCopy(colorData.hex.toUpperCase(), "hex")}
                        aria-label="Copy HEX value"
                      >
                        <i className={`ti ${copiedKey === "hex" ? "ti-check" : "ti-copy"}`} />
                      </button>
                    </div>
                    <div className={styles.cpFormatValue}>{colorData.hex.toUpperCase()}</div>
                  </div>

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
                        className={`${styles.cpCopyBtn} ${copiedKey === "rgb" ? styles.copied : ""}`}
                        onClick={() =>
                          handleCopy(`rgb(${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b})`, "rgb")
                        }
                        aria-label="Copy RGB value"
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
                        className={`${styles.cpCopyBtn} ${copiedKey === "hsl" ? styles.copied : ""}`}
                        onClick={() =>
                          handleCopy(`hsl(${colorData.hsl.h}, ${colorData.hsl.s}%, ${colorData.hsl.l}%)`, "hsl")
                        }
                        aria-label="Copy HSL value"
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
                        className={`${styles.cpCopyBtn} ${copiedKey === "hsv" ? styles.copied : ""}`}
                        onClick={() =>
                          handleCopy(`hsv(${colorData.hsv.h}, ${colorData.hsv.s}%, ${colorData.hsv.v}%)`, "hsv")
                        }
                        aria-label="Copy HSV value"
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
                        className={`${styles.cpCopyBtn} ${copiedKey === "cmyk" ? styles.copied : ""}`}
                        onClick={() =>
                          handleCopy(
                            `cmyk(${colorData.cmyk.c}%, ${colorData.cmyk.m}%, ${colorData.cmyk.y}%, ${colorData.cmyk.k}%)`,
                            "cmyk"
                          )
                        }
                        aria-label="Copy CMYK value"
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

                <div className={styles.cpSection}>
                  <div className={styles.cpSectionHeader}>
                    <i className="ti ti-accessible" />
                    Accessibility (WCAG)
                  </div>
                  <div className={styles.cpContrastGrid}>
                    <div className={styles.cpContrastCard}>
                      <div className={styles.cpContrastDemo} style={{ background: "#FFFFFF" }}>
                        <span style={{ color: colorData.hex }}>Aa</span>
                      </div>
                      <div className={styles.cpContrastInfo}>
                        <div className={styles.cpContrastLabel}>On White</div>
                        <div className={styles.cpContrastRatio}>{contrastWhite.toFixed(2)}:1</div>
                        <div className={styles.cpWcagBadges}>
                          <span className={`${styles.cpWcagBadge} ${wcagWhite.AA_normal ? styles.pass : styles.fail}`}>
                            AA
                          </span>
                          <span className={`${styles.cpWcagBadge} ${wcagWhite.AAA_normal ? styles.pass : styles.fail}`}>
                            AAA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cpContrastCard}>
                      <div className={styles.cpContrastDemo} style={{ background: "#000000" }}>
                        <span style={{ color: colorData.hex }}>Aa</span>
                      </div>
                      <div className={styles.cpContrastInfo}>
                        <div className={styles.cpContrastLabel}>On Black</div>
                        <div className={styles.cpContrastRatio}>{contrastBlack.toFixed(2)}:1</div>
                        <div className={styles.cpWcagBadges}>
                          <span className={`${styles.cpWcagBadge} ${wcagBlack.AA_normal ? styles.pass : styles.fail}`}>
                            AA
                          </span>
                          <span className={`${styles.cpWcagBadge} ${wcagBlack.AAA_normal ? styles.pass : styles.fail}`}>
                            AAA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cpMobActions}>
                <button
                  type="button"
                  className={`${styles.cpMobBtn} ${copiedKey === "hex" ? styles.copied : ""}`}
                  onClick={() => handleCopy(colorData.hex.toUpperCase(), "hex")}
                >
                  <i className={`ti ${copiedKey === "hex" ? "ti-check" : "ti-copy"}`} />
                  Copy Hex
                </button>
                <button
                  type="button"
                  className={`${styles.cpMobBtn} ${copiedKey === "rgb" ? styles.copied : ""}`}
                  onClick={() =>
                    handleCopy(`rgb(${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b})`, "rgb")
                  }
                >
                  <i className={`ti ${copiedKey === "rgb" ? "ti-check" : "ti-copy"}`} />
                  Copy RGB
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}