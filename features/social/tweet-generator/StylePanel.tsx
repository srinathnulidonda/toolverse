// features/social/tweet-generator/StylePanel.tsx
"use client";

import type {
  TweetStyle,
  ThemePreset,
  TweetTheme,
  AspectRatio,
  FontFamily,
  CornerStyle,
  BackgroundType,
  PatternType,
} from "./ts/types";
import { THEME_PRESETS } from "./ts/utils";
import styles from "./style/StylePanel.module.css";

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1", label: "Square", icon: "ti-square" },
  { value: "16:9", label: "Landscape", icon: "ti-rectangle" },
  { value: "4:3", label: "Classic", icon: "ti-layout" },
  { value: "9:16", label: "Story", icon: "ti-device-mobile" },
];

const FONT_FAMILIES: { value: FontFamily; label: string; preview: string }[] = [
  { value: "system", label: "System", preview: "System UI" },
  { value: "inter", label: "Inter", preview: "Modern Sans" },
  { value: "segoe", label: "Segoe UI", preview: "Microsoft" },
  { value: "sf-pro", label: "SF Pro", preview: "Apple" },
  { value: "roboto", label: "Roboto", preview: "Google" },
  { value: "poppins", label: "Poppins", preview: "Rounded" },
];

const CORNER_STYLES: { value: CornerStyle; label: string }[] = [
  { value: "sharp", label: "Sharp" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra" },
];

const PATTERN_TYPES: { value: PatternType; label: string; icon: string }[] = [
  { value: "dots", label: "Dots", icon: "ti-dots" },
  { value: "grid", label: "Grid", icon: "ti-grid-dots" },
  { value: "diagonal", label: "Lines", icon: "ti-border-style" },
  { value: "waves", label: "Waves", icon: "ti-wave-sine" },
  { value: "noise", label: "Noise", icon: "ti-spray" },
];

type StylePanelProps = {
  style: TweetStyle;
  onChange: (s: TweetStyle) => void;
};

export default function StylePanel({ style, onChange }: StylePanelProps) {
  const set = (patch: Partial<TweetStyle>) => onChange({ ...style, ...patch });

  const currentTheme =
    style.theme === "custom" && style.customTheme ? style.customTheme : THEME_PRESETS[style.theme];

  const handleThemeChange = (themeKey: ThemePreset) => {
    if (themeKey === "custom") {
      set({
        theme: "custom",
        customTheme: { ...THEME_PRESETS["twitter-light"] },
      });
    } else {
      set({ theme: themeKey, customTheme: undefined });
    }
  };

  const handleCustomThemeChange = (patch: Partial<TweetTheme>) => {
    if (style.customTheme) {
      set({ customTheme: { ...style.customTheme, ...patch } });
    }
  };

  return (
    <div className={styles.spRoot}>
      <section className={styles.spSection}>
        <p className={styles.spLabel}>Theme Presets</p>
        <div className={styles.spThemesGrid}>
          {(Object.keys(THEME_PRESETS) as ThemePreset[])
            .filter((k) => k !== "custom")
            .map((themeKey) => {
              const theme = THEME_PRESETS[themeKey];
              const isActive = style.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  className={`${styles.spThemeCard}${isActive ? ` ${styles.active}` : ""}`}
                  onClick={() => handleThemeChange(themeKey)}
                >
                  <div
                    className={styles.spThemePreview}
                    style={{
                      background: theme.background.startsWith("linear-gradient")
                        ? theme.background
                        : theme.background,
                      borderColor: theme.border,
                    }}
                  >
                    <div
                      className={styles.spThemeCardInner}
                      style={{
                        background: theme.cardBg,
                        borderColor: theme.border,
                      }}
                    >
                      <span className={styles.spThemeText} style={{ color: theme.text }} />
                      <span className={styles.spThemeAccent} style={{ background: theme.accent }} />
                    </div>
                  </div>
                  <span className={styles.spThemeName}>{theme.name}</span>
                </button>
              );
            })}
        </div>
      </section>

      {style.theme === "custom" && style.customTheme && (
        <section className={styles.spSection}>
          <div className={styles.spSectionHeader}>
            <p className={styles.spLabel}>Custom Theme Colors</p>
            <button
              type="button"
              className={styles.spResetBtn}
              onClick={() =>
                set({
                  customTheme: { ...THEME_PRESETS["twitter-light"] },
                })
              }
            >
              <i className="ti ti-refresh" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className={styles.spColorsGrid}>
            {(
              [
                { key: "background", label: "Background" },
                { key: "cardBg", label: "Card" },
                { key: "text", label: "Text" },
                { key: "textSecondary", label: "Secondary" },
                { key: "accent", label: "Accent" },
                { key: "border", label: "Border" },
              ] as const
            ).map((colorField) => (
              <div key={colorField.key} className={styles.spColorField}>
                <label className={styles.spColorLabel}>{colorField.label}</label>
                <div className={styles.spColorInputRow}>
                  <label className={styles.spSwatchBtn}>
                    <span
                      className={styles.spSwatch}
                      style={{
                        background: style.customTheme![colorField.key],
                      }}
                    />
                    <input
                      type="color"
                      className={styles.spColorPicker}
                      value={style.customTheme![colorField.key]}
                      onChange={(e) =>
                        handleCustomThemeChange({
                          [colorField.key]: e.target.value,
                        })
                      }
                    />
                  </label>
                  <input
                    type="text"
                    className={styles.spHexInput}
                    value={style.customTheme![colorField.key]}
                    maxLength={7}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                        handleCustomThemeChange({ [colorField.key]: v });
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.spSection}>
        <p className={styles.spLabel}>Aspect Ratio</p>
        <div className={styles.spRatioGrid}>
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              className={`${styles.spRatioBtn}${style.aspectRatio === ratio.value ? ` ${styles.active}` : ""}`}
              onClick={() => set({ aspectRatio: ratio.value })}
            >
              <i className={`ti ${ratio.icon}`} aria-hidden="true" />
              <div className={styles.spRatioText}>
                <span className={styles.spRatioLabel}>{ratio.label}</span>
                <span className={styles.spRatioValue}>{ratio.value}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.spSection}>
        <p className={styles.spLabel}>Font Family</p>
        <div className={styles.spFontSelect}>
          {FONT_FAMILIES.map((font) => (
            <button
              key={font.value}
              type="button"
              className={`${styles.spFontBtn}${style.fontFamily === font.value ? ` ${styles.active}` : ""}`}
              onClick={() => set({ fontFamily: font.value })}
            >
              <span className={styles.spFontName}>{font.label}</span>
              <span className={styles.spFontPreview}>{font.preview}</span>
            </button>
          ))}
        </div>

        <div className={styles.spRow}>
          <div className={styles.spField}>
            <div className={styles.spFieldHeader}>
              <label className={styles.spFieldLabel}>Font Size</label>
              <code className={styles.spValue}>{style.fontSize}px</code>
            </div>
            <input
              type="range"
              className={styles.spRange}
              min={12}
              max={20}
              step={1}
              value={style.fontSize}
              onChange={(e) => set({ fontSize: Number(e.target.value) })}
            />
          </div>

          <div className={styles.spField}>
            <div className={styles.spFieldHeader}>
              <label className={styles.spFieldLabel}>Line Height</label>
              <code className={styles.spValue}>{style.lineHeight.toFixed(2)}</code>
            </div>
            <input
              type="range"
              className={styles.spRange}
              min={1.2}
              max={2}
              step={0.1}
              value={style.lineHeight}
              onChange={(e) => set({ lineHeight: Number(e.target.value) })}
            />
          </div>
        </div>
      </section>

      <section className={styles.spSection}>
        <p className={styles.spLabel}>Background</p>
        <div className={styles.spBgTypes}>
          {(
            [
              { type: "solid", icon: "ti-square-filled", label: "Solid" },
              { type: "gradient", icon: "ti-gradient", label: "Gradient" },
              { type: "pattern", icon: "ti-grid-pattern", label: "Pattern" },
            ] as const
          ).map((bg) => (
            <button
              key={bg.type}
              type="button"
              className={`${styles.spBgTypeBtn}${style.backgroundType === bg.type ? ` ${styles.active}` : ""}`}
              onClick={() => set({ backgroundType: bg.type })}
            >
              <i className={`ti ${bg.icon}`} aria-hidden="true" />
              {bg.label}
            </button>
          ))}
        </div>

        {style.backgroundType === "gradient" && (
          <div className={styles.spGradientEditor}>
            <div className={styles.spColorField}>
              <label className={styles.spColorLabel}>Start Color</label>
              <div className={styles.spColorInputRow}>
                <label className={styles.spSwatchBtn}>
                  <span
                    className={styles.spSwatch}
                    style={{
                      background: style.backgroundGradient?.start || "#667EEA",
                    }}
                  />
                  <input
                    type="color"
                    className={styles.spColorPicker}
                    value={style.backgroundGradient?.start || "#667EEA"}
                    onChange={(e) =>
                      set({
                        backgroundGradient: {
                          start: e.target.value,
                          end: style.backgroundGradient?.end || "#764BA2",
                          angle: style.backgroundGradient?.angle || 135,
                        },
                      })
                    }
                  />
                </label>
                <input
                  type="text"
                  className={styles.spHexInput}
                  value={style.backgroundGradient?.start || "#667EEA"}
                  maxLength={7}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                      set({
                        backgroundGradient: {
                          start: v,
                          end: style.backgroundGradient?.end || "#764BA2",
                          angle: style.backgroundGradient?.angle || 135,
                        },
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.spColorField}>
              <label className={styles.spColorLabel}>End Color</label>
              <div className={styles.spColorInputRow}>
                <label className={styles.spSwatchBtn}>
                  <span
                    className={styles.spSwatch}
                    style={{
                      background: style.backgroundGradient?.end || "#764BA2",
                    }}
                  />
                  <input
                    type="color"
                    className={styles.spColorPicker}
                    value={style.backgroundGradient?.end || "#764BA2"}
                    onChange={(e) =>
                      set({
                        backgroundGradient: {
                          start: style.backgroundGradient?.start || "#667EEA",
                          end: e.target.value,
                          angle: style.backgroundGradient?.angle || 135,
                        },
                      })
                    }
                  />
                </label>
                <input
                  type="text"
                  className={styles.spHexInput}
                  value={style.backgroundGradient?.end || "#764BA2"}
                  maxLength={7}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                      set({
                        backgroundGradient: {
                          start: style.backgroundGradient?.start || "#667EEA",
                          end: v,
                          angle: style.backgroundGradient?.angle || 135,
                        },
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.spField}>
              <div className={styles.spFieldHeader}>
                <label className={styles.spFieldLabel}>Angle</label>
                <code className={styles.spValue}>{style.backgroundGradient?.angle || 135}°</code>
              </div>
              <input
                type="range"
                className={styles.spRange}
                min={0}
                max={360}
                step={15}
                value={style.backgroundGradient?.angle || 135}
                onChange={(e) =>
                  set({
                    backgroundGradient: {
                      start: style.backgroundGradient?.start || "#667EEA",
                      end: style.backgroundGradient?.end || "#764BA2",
                      angle: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {style.backgroundType === "pattern" && (
          <div className={styles.spPatternEditor}>
            <p className={styles.spSublabel}>Pattern Type</p>
            <div className={styles.spPatternGrid}>
              {PATTERN_TYPES.map((pattern) => (
                <button
                  key={pattern.value}
                  type="button"
                  className={`${styles.spPatternBtn}${style.backgroundPattern?.type === pattern.value ? ` ${styles.active}` : ""
                    }`}
                  onClick={() =>
                    set({
                      backgroundPattern: {
                        type: pattern.value,
                        color: style.backgroundPattern?.color || currentTheme.border,
                        opacity: style.backgroundPattern?.opacity || 0.1,
                        scale: style.backgroundPattern?.scale || 1,
                      },
                    })
                  }
                >
                  <i className={`ti ${pattern.icon}`} aria-hidden="true" />
                  <span>{pattern.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.spField}>
              <div className={styles.spFieldHeader}>
                <label className={styles.spFieldLabel}>Opacity</label>
                <code className={styles.spValue}>
                  {((style.backgroundPattern?.opacity || 0.1) * 100).toFixed(0)}%
                </code>
              </div>
              <input
                type="range"
                className={styles.spRange}
                min={0}
                max={1}
                step={0.05}
                value={style.backgroundPattern?.opacity || 0.1}
                onChange={(e) =>
                  set({
                    backgroundPattern: {
                      type: style.backgroundPattern?.type || "dots",
                      color: style.backgroundPattern?.color || currentTheme.border,
                      opacity: Number(e.target.value),
                      scale: style.backgroundPattern?.scale || 1,
                    },
                  })
                }
              />
            </div>

            <div className={styles.spField}>
              <div className={styles.spFieldHeader}>
                <label className={styles.spFieldLabel}>Scale</label>
                <code className={styles.spValue}>{style.backgroundPattern?.scale || 1}x</code>
              </div>
              <input
                type="range"
                className={styles.spRange}
                min={0.5}
                max={2}
                step={0.1}
                value={style.backgroundPattern?.scale || 1}
                onChange={(e) =>
                  set({
                    backgroundPattern: {
                      type: style.backgroundPattern?.type || "dots",
                      color: style.backgroundPattern?.color || currentTheme.border,
                      opacity: style.backgroundPattern?.opacity || 0.1,
                      scale: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </section>

      <section className={styles.spSection}>
        <p className={styles.spLabel}>Card Style</p>

        <div className={styles.spCornersRow}>
          <span className={styles.spSublabel}>Corners</span>
          <div className={styles.spCornerBtns}>
            {CORNER_STYLES.map((corner) => (
              <button
                key={corner.value}
                type="button"
                className={`${styles.spCornerBtn}${style.cornerStyle === corner.value ? ` ${styles.active}` : ""}`}
                onClick={() => set({ cornerStyle: corner.value })}
              >
                {corner.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.spToggleRow}>
          <span className={styles.spToggleLabel}>Show Border</span>
          <button
            type="button"
            role="switch"
            aria-checked={style.showBorder}
            className={`${styles.spToggle}${style.showBorder ? ` ${styles.on}` : ""}`}
            onClick={() => set({ showBorder: !style.showBorder })}
          >
            <span className={styles.spToggleThumb} />
          </button>
        </div>

        {style.showBorder && (
          <div className={styles.spField}>
            <div className={styles.spFieldHeader}>
              <label className={styles.spFieldLabel}>Border Width</label>
              <code className={styles.spValue}>{style.borderWidth}px</code>
            </div>
            <input
              type="range"
              className={styles.spRange}
              min={1}
              max={8}
              step={1}
              value={style.borderWidth}
              onChange={(e) => set({ borderWidth: Number(e.target.value) })}
            />
          </div>
        )}

        <div className={styles.spField}>
          <div className={styles.spFieldHeader}>
            <label className={styles.spFieldLabel}>Shadow</label>
            <code className={styles.spValue}>{style.shadowIntensity}</code>
          </div>
          <input
            type="range"
            className={styles.spRange}
            min={0}
            max={5}
            step={1}
            value={style.shadowIntensity}
            onChange={(e) => set({ shadowIntensity: Number(e.target.value) })}
          />
        </div>

        <div className={styles.spField}>
          <div className={styles.spFieldHeader}>
            <label className={styles.spFieldLabel}>Padding</label>
            <code className={styles.spValue}>{style.padding}px</code>
          </div>
          <input
            type="range"
            className={styles.spRange}
            min={0}
            max={80}
            step={4}
            value={style.padding}
            onChange={(e) => set({ padding: Number(e.target.value) })}
          />
        </div>
      </section>

      <section className={styles.spSection}>
        <div className={styles.spToggleRow}>
          <div className={styles.spToggleLabelGroup}>
            <span className={styles.spToggleLabel}>Watermark</span>
            <span className={styles.spToggleHint}>Add custom branding</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={style.watermark.enabled}
            className={`${styles.spToggle}${style.watermark.enabled ? ` ${styles.on}` : ""}`}
            onClick={() =>
              set({
                watermark: {
                  ...style.watermark,
                  enabled: !style.watermark.enabled,
                },
              })
            }
          >
            <span className={styles.spToggleThumb} />
          </button>
        </div>

        {style.watermark.enabled && (
          <>
            <div className={styles.spField}>
              <input
                type="text"
                className={styles.spInput}
                value={style.watermark.text}
                onChange={(e) =>
                  set({
                    watermark: { ...style.watermark, text: e.target.value },
                  })
                }
                placeholder="Your watermark text"
                maxLength={50}
              />
            </div>

            <div className={styles.spWatermarkPositions}>
              {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  className={`${styles.spWmPosBtn}${style.watermark.position === pos ? ` ${styles.active}` : ""}`}
                  onClick={() =>
                    set({
                      watermark: { ...style.watermark, position: pos },
                    })
                  }
                >
                  {pos.replace("-", " ")}
                </button>
              ))}
            </div>

            <div className={styles.spField}>
              <div className={styles.spFieldHeader}>
                <label className={styles.spFieldLabel}>Opacity</label>
                <code className={styles.spValue}>{(style.watermark.opacity * 100).toFixed(0)}%</code>
              </div>
              <input
                type="range"
                className={styles.spRange}
                min={0.1}
                max={1}
                step={0.1}
                value={style.watermark.opacity}
                onChange={(e) =>
                  set({
                    watermark: {
                      ...style.watermark,
                      opacity: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}