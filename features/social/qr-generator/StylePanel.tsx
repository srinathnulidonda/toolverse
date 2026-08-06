// features/social/qr-generator/StylePanel.tsx
"use client";

import type { ErrorLevel, QrStyle } from "./ts/types";
import styles from "./style/StylePanel.module.css";

const ERROR_LEVELS: { value: ErrorLevel; label: string; desc: string }[] = [
  { value: "L", label: "Low", desc: "7% recovery" },
  { value: "M", label: "Medium", desc: "15% recovery" },
  { value: "Q", label: "Quartile", desc: "25% recovery" },
  { value: "H", label: "High", desc: "30% recovery" },
];

const PRESETS: { name: string; fg: string; bg: string; swatch: string }[] = [
  { name: "Classic", fg: "#000000", bg: "#FFFFFF", swatch: "#000000" },
  { name: "Forest", fg: "#145C3C", bg: "#FFFFFF", swatch: "#145C3C" },
  { name: "Ocean", fg: "#0C5FA5", bg: "#FFFFFF", swatch: "#0C5FA5" },
  { name: "Dusk", fg: "#4B2E7A", bg: "#FFFFFF", swatch: "#4B2E7A" },
  { name: "Warm", fg: "#92400E", bg: "#FFFBF5", swatch: "#92400E" },
  { name: "Dark", fg: "#FFFFFF", bg: "#111110", swatch: "#111110" },
];

const SIZE_CHIPS = [256, 512, 800, 1024];

type StylePanelProps = {
  style: QrStyle;
  onChange: (s: QrStyle) => void;
};

export default function StylePanel({ style, onChange }: StylePanelProps) {
  const set = (patch: Partial<QrStyle>) => onChange({ ...style, ...patch });

  return (
    <div className={styles.spRoot}>
      <section className={styles.spSection}>
        <p className={styles.spLabel}>Presets</p>
        <div className={styles.spPresetsGrid}>
          {PRESETS.map((p) => {
            const active =
              style.fgColor.toLowerCase() === p.fg.toLowerCase() &&
              style.bgColor.toLowerCase() === p.bg.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                className={`${styles.spPreset} ${active ? styles.active : ""}`}
                onClick={() => set({ fgColor: p.fg, bgColor: p.bg, transparent: false })}
                title={p.name}
              >
                <span
                  className={styles.spPresetSwatch}
                  style={{
                    background:
                      p.bg === "#FFFFFF" || p.bg === "#FFFBF5"
                        ? `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`
                        : `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`,
                    border: "0.5px solid var(--border)",
                  }}
                />
                <span className={styles.spPresetName}>{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.spSection}>
        <p className={styles.spLabel}>Custom colors</p>
        <div className={styles.spColorGrid}>
          {(["fg", "bg"] as const).map((k) => {
            const id = `sp-color-${k}`;
            const value =
              k === "fg" ? style.fgColor : style.transparent ? "transparent" : style.bgColor;
            const label = k === "fg" ? "Foreground" : "Background";
            const swatch =
              k === "fg" ? style.fgColor : style.transparent ? undefined : style.bgColor;
            return (
              <div key={k} className={styles.spColorCard}>
                <label className={styles.spColorCardLabel} htmlFor={id}>
                  {label}
                </label>
                <div className={styles.spColorInputRow}>
                  <label
                    className={styles.spSwatchBtn}
                    htmlFor={id}
                    aria-label={`Pick ${label} color`}
                  >
                    <span
                      className={`${styles.spSwatch} ${k === "bg" && style.transparent ? styles.spSwatchTransparent : ""}`}
                      style={swatch ? { background: swatch } : undefined}
                    />
                    <input
                      id={id}
                      type="color"
                      className={styles.spColorPicker}
                      value={k === "fg" ? style.fgColor : style.bgColor}
                      onChange={(e) =>
                        k === "fg"
                          ? set({ fgColor: e.target.value })
                          : set({ bgColor: e.target.value, transparent: false })
                      }
                    />
                  </label>
                  <input
                    type="text"
                    className={styles.spHexInput}
                    value={value}
                    maxLength={11}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (k === "bg" && v === "transparent") {
                        set({ transparent: true });
                        return;
                      }
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                        k === "fg"
                          ? set({ fgColor: v })
                          : set({ bgColor: v, transparent: false });
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <label className={styles.spToggleRow}>
          <span className={styles.spToggleLabelText}>
            Transparent background
            <span className={styles.spToggleHint}>PNG only</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={style.transparent}
            className={`${styles.spToggle} ${style.transparent ? styles.on : ""}`}
            onClick={() => set({ transparent: !style.transparent })}
          >
            <span className={styles.spToggleThumb} />
          </button>
        </label>
      </section>

      <section className={styles.spSection}>
        <div className={styles.spRowHeader}>
          <p className={styles.spLabel}>Output size</p>
          <code className={styles.spValue}>{style.size}px</code>
        </div>
        <input
          type="range"
          className={styles.spRange}
          min={128}
          max={1024}
          step={32}
          value={style.size}
          onChange={(e) => set({ size: Number(e.target.value) })}
          aria-label="QR code size"
        />
        <div className={styles.spChips}>
          {SIZE_CHIPS.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.spChip} ${style.size === s ? styles.active : ""}`}
              onClick={() => set({ size: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.spSection}>
        <div className={styles.spRowHeader}>
          <p className={styles.spLabel}>Quiet zone</p>
          <code className={styles.spValue}>{style.margin} mod</code>
        </div>
        <input
          type="range"
          className={styles.spRange}
          min={0}
          max={8}
          step={1}
          value={style.margin}
          onChange={(e) => set({ margin: Number(e.target.value) })}
          aria-label="QR code margin"
        />
      </section>

      <section className={styles.spSection}>
        <p className={styles.spLabel}>Error correction</p>
        <div className={styles.spEcGrid}>
          {ERROR_LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              type="button"
              className={`${styles.spEcBtn} ${style.errorLevel === lvl.value ? styles.active : ""}`}
              onClick={() => set({ errorLevel: lvl.value })}
            >
              <span className={styles.spEcLevel}>{lvl.value}</span>
              <span className={styles.spEcName}>{lvl.label}</span>
              <span className={styles.spEcRecovery}>{lvl.desc}</span>
            </button>
          ))}
        </div>
        <p className={styles.spHint}>
          Use <strong>H</strong> if adding a logo overlay. Higher = larger code.
        </p>
      </section>
    </div>
  );
}