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
} from "./types";
import { THEME_PRESETS } from "./utils";

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
    style.theme === "custom" && style.customTheme
      ? style.customTheme
      : THEME_PRESETS[style.theme];

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
    <>
      <div className="sp-root">
        {/* Theme Presets */}
        <section className="sp-section">
          <p className="sp-label">Theme Presets</p>
          <div className="sp-themes-grid">
            {(Object.keys(THEME_PRESETS) as ThemePreset[])
              .filter((k) => k !== "custom")
              .map((themeKey) => {
                const theme = THEME_PRESETS[themeKey];
                const isActive = style.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    className={`sp-theme-card${isActive ? " active" : ""}`}
                    onClick={() => handleThemeChange(themeKey)}
                  >
                    <div
                      className="sp-theme-preview"
                      style={{
                        background: theme.background.startsWith("linear-gradient")
                          ? theme.background
                          : theme.background,
                        borderColor: theme.border,
                      }}
                    >
                      <div
                        className="sp-theme-card-inner"
                        style={{
                          background: theme.cardBg,
                          borderColor: theme.border,
                        }}
                      >
                        <span
                          className="sp-theme-text"
                          style={{ color: theme.text }}
                        />
                        <span
                          className="sp-theme-accent"
                          style={{ background: theme.accent }}
                        />
                      </div>
                    </div>
                    <span className="sp-theme-name">{theme.name}</span>
                  </button>
                );
              })}
          </div>
        </section>

        {/* Custom Theme Editor */}
        {style.theme === "custom" && style.customTheme && (
          <section className="sp-section">
            <div className="sp-section-header">
              <p className="sp-label">Custom Theme Colors</p>
              <button
                type="button"
                className="sp-reset-btn"
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

            <div className="sp-colors-grid">
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
                <div key={colorField.key} className="sp-color-field">
                  <label className="sp-color-label">
                    {colorField.label}
                  </label>
                  <div className="sp-color-input-row">
                    <label className="sp-swatch-btn">
                      <span
                        className="sp-swatch"
                        style={{
                          background: style.customTheme![colorField.key],
                        }}
                      />
                      <input
                        type="color"
                        className="sp-color-picker"
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
                      className="sp-hex-input"
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

        {/* Aspect Ratio */}
        <section className="sp-section">
          <p className="sp-label">Aspect Ratio</p>
          <div className="sp-ratio-grid">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                className={`sp-ratio-btn${
                  style.aspectRatio === ratio.value ? " active" : ""
                }`}
                onClick={() => set({ aspectRatio: ratio.value })}
              >
                <i className={`ti ${ratio.icon}`} aria-hidden="true" />
                <div className="sp-ratio-text">
                  <span className="sp-ratio-label">{ratio.label}</span>
                  <span className="sp-ratio-value">{ratio.value}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="sp-section">
          <p className="sp-label">Font Family</p>
          <div className="sp-font-select">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                type="button"
                className={`sp-font-btn${
                  style.fontFamily === font.value ? " active" : ""
                }`}
                onClick={() => set({ fontFamily: font.value })}
              >
                <span className="sp-font-name">{font.label}</span>
                <span className="sp-font-preview">{font.preview}</span>
              </button>
            ))}
          </div>

          <div className="sp-row">
            <div className="sp-field">
              <div className="sp-field-header">
                <label className="sp-field-label">Font Size</label>
                <code className="sp-value">{style.fontSize}px</code>
              </div>
              <input
                type="range"
                className="sp-range"
                min={12}
                max={20}
                step={1}
                value={style.fontSize}
                onChange={(e) => set({ fontSize: Number(e.target.value) })}
              />
            </div>

            <div className="sp-field">
              <div className="sp-field-header">
                <label className="sp-field-label">Line Height</label>
                <code className="sp-value">{style.lineHeight.toFixed(2)}</code>
              </div>
              <input
                type="range"
                className="sp-range"
                min={1.2}
                max={2}
                step={0.1}
                value={style.lineHeight}
                onChange={(e) => set({ lineHeight: Number(e.target.value) })}
              />
            </div>
          </div>
        </section>

        {/* Background */}
        <section className="sp-section">
          <p className="sp-label">Background</p>
          <div className="sp-bg-types">
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
                className={`sp-bg-type-btn${
                  style.backgroundType === bg.type ? " active" : ""
                }`}
                onClick={() => set({ backgroundType: bg.type })}
              >
                <i className={`ti ${bg.icon}`} aria-hidden="true" />
                {bg.label}
              </button>
            ))}
          </div>

          {style.backgroundType === "gradient" && (
            <div className="sp-gradient-editor">
              <div className="sp-color-field">
                <label className="sp-color-label">Start Color</label>
                <div className="sp-color-input-row">
                  <label className="sp-swatch-btn">
                    <span
                      className="sp-swatch"
                      style={{
                        background:
                          style.backgroundGradient?.start || "#667EEA",
                      }}
                    />
                    <input
                      type="color"
                      className="sp-color-picker"
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
                    className="sp-hex-input"
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

              <div className="sp-color-field">
                <label className="sp-color-label">End Color</label>
                <div className="sp-color-input-row">
                  <label className="sp-swatch-btn">
                    <span
                      className="sp-swatch"
                      style={{
                        background: style.backgroundGradient?.end || "#764BA2",
                      }}
                    />
                    <input
                      type="color"
                      className="sp-color-picker"
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
                    className="sp-hex-input"
                    value={style.backgroundGradient?.end || "#764BA2"}
                    maxLength={7}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                        set({
                          backgroundGradient: {
                            start:
                              style.backgroundGradient?.start || "#667EEA",
                            end: v,
                            angle: style.backgroundGradient?.angle || 135,
                          },
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="sp-field">
                <div className="sp-field-header">
                  <label className="sp-field-label">Angle</label>
                  <code className="sp-value">
                    {style.backgroundGradient?.angle || 135}°
                  </code>
                </div>
                <input
                  type="range"
                  className="sp-range"
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
            <div className="sp-pattern-editor">
              <p className="sp-sublabel">Pattern Type</p>
              <div className="sp-pattern-grid">
                {PATTERN_TYPES.map((pattern) => (
                  <button
                    key={pattern.value}
                    type="button"
                    className={`sp-pattern-btn${
                      style.backgroundPattern?.type === pattern.value
                        ? " active"
                        : ""
                    }`}
                    onClick={() =>
                      set({
                        backgroundPattern: {
                          type: pattern.value,
                          color:
                            style.backgroundPattern?.color || currentTheme.border,
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

              <div className="sp-field">
                <div className="sp-field-header">
                  <label className="sp-field-label">Opacity</label>
                  <code className="sp-value">
                    {((style.backgroundPattern?.opacity || 0.1) * 100).toFixed(
                      0
                    )}
                    %
                  </code>
                </div>
                <input
                  type="range"
                  className="sp-range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={style.backgroundPattern?.opacity || 0.1}
                  onChange={(e) =>
                    set({
                      backgroundPattern: {
                        type: style.backgroundPattern?.type || "dots",
                        color:
                          style.backgroundPattern?.color || currentTheme.border,
                        opacity: Number(e.target.value),
                        scale: style.backgroundPattern?.scale || 1,
                      },
                    })
                  }
                />
              </div>

              <div className="sp-field">
                <div className="sp-field-header">
                  <label className="sp-field-label">Scale</label>
                  <code className="sp-value">
                    {style.backgroundPattern?.scale || 1}x
                  </code>
                </div>
                <input
                  type="range"
                  className="sp-range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={style.backgroundPattern?.scale || 1}
                  onChange={(e) =>
                    set({
                      backgroundPattern: {
                        type: style.backgroundPattern?.type || "dots",
                        color:
                          style.backgroundPattern?.color || currentTheme.border,
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

        {/* Card Style */}
        <section className="sp-section">
          <p className="sp-label">Card Style</p>

          <div className="sp-corners-row">
            <span className="sp-sublabel">Corners</span>
            <div className="sp-corner-btns">
              {CORNER_STYLES.map((corner) => (
                <button
                  key={corner.value}
                  type="button"
                  className={`sp-corner-btn${
                    style.cornerStyle === corner.value ? " active" : ""
                  }`}
                  onClick={() => set({ cornerStyle: corner.value })}
                >
                  {corner.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sp-toggle-row">
            <span className="sp-toggle-label">Show Border</span>
            <button
              type="button"
              role="switch"
              aria-checked={style.showBorder}
              className={`sp-toggle${style.showBorder ? " on" : ""}`}
              onClick={() => set({ showBorder: !style.showBorder })}
            >
              <span className="sp-toggle-thumb" />
            </button>
          </div>

          {style.showBorder && (
            <div className="sp-field">
              <div className="sp-field-header">
                <label className="sp-field-label">Border Width</label>
                <code className="sp-value">{style.borderWidth}px</code>
              </div>
              <input
                type="range"
                className="sp-range"
                min={1}
                max={8}
                step={1}
                value={style.borderWidth}
                onChange={(e) => set({ borderWidth: Number(e.target.value) })}
              />
            </div>
          )}

          <div className="sp-field">
            <div className="sp-field-header">
              <label className="sp-field-label">Shadow</label>
              <code className="sp-value">{style.shadowIntensity}</code>
            </div>
            <input
              type="range"
              className="sp-range"
              min={0}
              max={5}
              step={1}
              value={style.shadowIntensity}
              onChange={(e) =>
                set({ shadowIntensity: Number(e.target.value) })
              }
            />
          </div>

          <div className="sp-field">
            <div className="sp-field-header">
              <label className="sp-field-label">Padding</label>
              <code className="sp-value">{style.padding}px</code>
            </div>
            <input
              type="range"
              className="sp-range"
              min={0}
              max={80}
              step={4}
              value={style.padding}
              onChange={(e) => set({ padding: Number(e.target.value) })}
            />
          </div>
        </section>

        {/* Watermark */}
        <section className="sp-section">
          <div className="sp-toggle-row">
            <div className="sp-toggle-label-group">
              <span className="sp-toggle-label">Watermark</span>
              <span className="sp-toggle-hint">Add custom branding</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={style.watermark.enabled}
              className={`sp-toggle${style.watermark.enabled ? " on" : ""}`}
              onClick={() =>
                set({
                  watermark: {
                    ...style.watermark,
                    enabled: !style.watermark.enabled,
                  },
                })
              }
            >
              <span className="sp-toggle-thumb" />
            </button>
          </div>

          {style.watermark.enabled && (
            <>
              <div className="sp-field">
                <input
                  type="text"
                  className="sp-input"
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

              <div className="sp-watermark-positions">
                {(
                  [
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ] as const
                ).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`sp-wm-pos-btn${
                      style.watermark.position === pos ? " active" : ""
                    }`}
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

              <div className="sp-field">
                <div className="sp-field-header">
                  <label className="sp-field-label">Opacity</label>
                  <code className="sp-value">
                    {(style.watermark.opacity * 100).toFixed(0)}%
                  </code>
                </div>
                <input
                  type="range"
                  className="sp-range"
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

      <style>{stylePanelStyles}</style>
    </>
  );
}

const stylePanelStyles = `
  .sp-root {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .sp-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sp-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sp-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    font-family: var(--font-sans);
    margin: 0;
  }

  .sp-sublabel {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
  }

  .sp-reset-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 5px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-tertiary);
    font-size: 11px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all 0.12s;
  }

  .sp-reset-btn i {
    font-size: 12px;
  }

  .sp-reset-btn:hover {
    background: var(--border);
    color: var(--text-secondary);
  }

  /* Theme Cards */
  .sp-themes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .sp-theme-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    transition: transform 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-theme-card:hover {
    transform: translateY(-2px);
  }

  .sp-theme-card.active .sp-theme-preview {
    box-shadow: 0 0 0 2px var(--brand);
  }

  .sp-theme-preview {
    width: 100%;
    aspect-ratio: 1.4;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0.5px solid;
    transition: box-shadow 0.12s;
  }

  .sp-theme-card-inner {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    border: 0.5px solid;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sp-theme-text {
    width: 60%;
    height: 3px;
    border-radius: 2px;
    background: currentColor;
  }

  .sp-theme-accent {
    width: 40%;
    height: 3px;
    border-radius: 2px;
  }

  .sp-theme-name {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    text-align: center;
  }

  .sp-theme-card.active .sp-theme-name {
    color: var(--brand-text);
    font-weight: 600;
  }

  /* Colors Grid */
  .sp-colors-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .sp-color-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sp-color-label {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .sp-color-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border: 0.5px solid var(--border);
    border-radius: 7px;
    padding: 6px 10px;
    transition: border-color 0.12s;
  }

  .sp-color-input-row:focus-within {
    border-color: var(--brand);
  }

  .sp-swatch-btn {
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
  }

  .sp-swatch {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 0.5px solid var(--border);
    flex-shrink: 0;
  }

  .sp-color-picker {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .sp-hex-input {
    flex: 1;
    min-width: 0;
    font-size: 11.5px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    background: none;
    border: none;
    outline: none;
    text-transform: uppercase;
  }

  .sp-input {
    font-family: var(--font-sans);
    font-size: 12.5px;
    color: var(--text);
    background: var(--bg);
    border: 0.5px solid var(--border);
    border-radius: 7px;
    padding: 9px 11px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
  }

  .sp-input:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-light);
  }

  /* Aspect Ratio */
  .sp-ratio-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .sp-ratio-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    border-radius: 8px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-ratio-btn i {
    font-size: 18px;
    color: var(--text-tertiary);
  }

  .sp-ratio-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    text-align: left;
  }

  .sp-ratio-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .sp-ratio-value {
    font-size: 10.5px;
    font-family: var(--font-mono);
    color: var(--text-tertiary);
  }

  .sp-ratio-btn:hover {
    background: var(--border-faint);
  }

  .sp-ratio-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
  }

  .sp-ratio-btn.active .sp-ratio-label {
    color: var(--brand-text);
  }

  .sp-ratio-btn.active i {
    color: var(--brand);
  }

  /* Font Select */
  .sp-font-select {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sp-font-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 7px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-font-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .sp-font-preview {
    font-size: 11px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
  }

  .sp-font-btn:hover {
    background: var(--border-faint);
  }

  .sp-font-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
  }

  .sp-font-btn.active .sp-font-name {
    color: var(--brand-text);
  }

  /* Sliders */
  .sp-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .sp-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sp-field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sp-field-label {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .sp-value {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
  }

  .sp-range {
    width: 100%;
    accent-color: var(--brand);
    cursor: pointer;
    height: 16px;
  }

  /* Background Types */
  .sp-bg-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .sp-bg-type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 8px;
    border-radius: 8px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-bg-type-btn i {
    font-size: 16px;
    color: var(--text-tertiary);
  }

  .sp-bg-type-btn:hover {
    background: var(--border-faint);
  }

  .sp-bg-type-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
    color: var(--brand-text);
  }

  .sp-bg-type-btn.active i {
    color: var(--brand);
  }

  .sp-gradient-editor,
  .sp-pattern-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-radius: 8px;
  }

  /* Pattern Grid */
  .sp-pattern-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .sp-pattern-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 8px;
    border-radius: 7px;
    border: 0.5px solid var(--border);
    background: var(--bg);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-pattern-btn i {
    font-size: 16px;
    color: var(--text-tertiary);
  }

  .sp-pattern-btn span {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .sp-pattern-btn:hover {
    background: var(--border-faint);
  }

  .sp-pattern-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
  }

  .sp-pattern-btn.active i {
    color: var(--brand);
  }

  .sp-pattern-btn.active span {
    color: var(--brand-text);
  }

  /* Corners */
  .sp-corners-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sp-corner-btns {
    display: flex;
    gap: 6px;
  }

  .sp-corner-btn {
    padding: 6px 11px;
    border-radius: 6px;
    border: 0.5px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 11.5px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-corner-btn:hover {
    background: var(--border-faint);
  }

  .sp-corner-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
    color: var(--brand-text);
  }

  /* Toggle */
  .sp-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 13px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-radius: 8px;
  }

  .sp-toggle-label-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sp-toggle-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .sp-toggle-hint {
    font-size: 10.5px;
    color: var(--text-tertiary);
    font-family: var(--font-sans);
  }

  .sp-toggle {
    width: 40px;
    height: 22px;
    border-radius: 999px;
    background: var(--border);
    border: none;
    padding: 2px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-toggle.on {
    background: var(--brand);
  }

  .sp-toggle-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
    display: block;
  }

  .sp-toggle.on .sp-toggle-thumb {
    transform: translateX(18px);
  }

  /* Watermark Positions */
  .sp-watermark-positions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .sp-wm-pos-btn {
    padding: 9px 12px;
    border-radius: 7px;
    border: 0.5px solid var(--border);
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 11.5px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all 0.12s;
    text-transform: capitalize;
    -webkit-tap-highlight-color: transparent;
  }

  .sp-wm-pos-btn:hover {
    background: var(--border-faint);
  }

  .sp-wm-pos-btn.active {
    border-color: var(--brand-border);
    background: var(--brand-light);
    color: var(--brand-text);
  }

  @media (max-width: 768px) {
    .sp-themes-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .sp-ratio-grid {
      grid-template-columns: 1fr;
    }

    .sp-row {
      grid-template-columns: 1fr;
    }

    .sp-colors-grid {
      grid-template-columns: 1fr;
    }
  }
`;