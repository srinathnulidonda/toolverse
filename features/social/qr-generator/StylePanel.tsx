//features/social/qr-generator/StylePanel.tsx
"use client";

import type { ErrorLevel, QrStyle } from "./types";

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
    <>
      <div className="sp-root">
        {/* Color presets */}
        <section className="sp-section">
          <p className="sp-label">Presets</p>
          <div className="sp-presets-grid">
            {PRESETS.map((p) => {
              const active =
                style.fgColor.toLowerCase() === p.fg.toLowerCase() &&
                style.bgColor.toLowerCase() === p.bg.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  className={`sp-preset${active ? " active" : ""}`}
                  onClick={() => set({ fgColor: p.fg, bgColor: p.bg, transparent: false })}
                  title={p.name}
                >
                  <span
                    className="sp-preset-swatch"
                    style={{
                      background:
                        p.bg === "#FFFFFF" || p.bg === "#FFFBF5"
                          ? `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`
                          : `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`,
                      border: "0.5px solid var(--border)",
                    }}
                  />
                  <span className="sp-preset-name">{p.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Custom colors */}
        <section className="sp-section">
          <p className="sp-label">Custom colors</p>
          <div className="sp-color-grid">
            {(["fg", "bg"] as const).map((k) => {
              const id = `sp-color-${k}`;
              const value =
                k === "fg" ? style.fgColor : style.transparent ? "transparent" : style.bgColor;
              const label = k === "fg" ? "Foreground" : "Background";
              const swatch =
                k === "fg" ? style.fgColor : style.transparent ? undefined : style.bgColor;
              return (
                <div key={k} className="sp-color-card">
                  <label className="sp-color-card-label" htmlFor={id}>
                    {label}
                  </label>
                  <div className="sp-color-input-row">
                    <label
                      className="sp-swatch-btn"
                      htmlFor={id}
                      aria-label={`Pick ${label} color`}
                    >
                      <span
                        className={`sp-swatch${k === "bg" && style.transparent ? " sp-swatch-transparent" : ""}`}
                        style={swatch ? { background: swatch } : undefined}
                      />
                      <input
                        id={id}
                        type="color"
                        className="sp-color-picker"
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
                      className="sp-hex-input"
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

          <label className="sp-toggle-row">
            <span className="sp-toggle-label-text">
              Transparent background
              <span className="sp-toggle-hint">PNG only</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={style.transparent}
              className={`sp-toggle${style.transparent ? " on" : ""}`}
              onClick={() => set({ transparent: !style.transparent })}
            >
              <span className="sp-toggle-thumb" />
            </button>
          </label>
        </section>

        {/* Size */}
        <section className="sp-section">
          <div className="sp-row-header">
            <p className="sp-label">Output size</p>
            <code className="sp-value">{style.size}px</code>
          </div>
          <input
            type="range"
            className="sp-range"
            min={128}
            max={1024}
            step={32}
            value={style.size}
            onChange={(e) => set({ size: Number(e.target.value) })}
            aria-label="QR code size"
          />
          <div className="sp-chips">
            {SIZE_CHIPS.map((s) => (
              <button
                key={s}
                type="button"
                className={`sp-chip${style.size === s ? " active" : ""}`}
                onClick={() => set({ size: s })}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Margin */}
        <section className="sp-section">
          <div className="sp-row-header">
            <p className="sp-label">Quiet zone</p>
            <code className="sp-value">{style.margin} mod</code>
          </div>
          <input
            type="range"
            className="sp-range"
            min={0}
            max={8}
            step={1}
            value={style.margin}
            onChange={(e) => set({ margin: Number(e.target.value) })}
            aria-label="QR code margin"
          />
        </section>

        {/* Error correction */}
        <section className="sp-section">
          <p className="sp-label">Error correction</p>
          <div className="sp-ec-grid">
            {ERROR_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                type="button"
                className={`sp-ec-btn${style.errorLevel === lvl.value ? " active" : ""}`}
                onClick={() => set({ errorLevel: lvl.value })}
              >
                <span className="sp-ec-level">{lvl.value}</span>
                <span className="sp-ec-name">{lvl.label}</span>
                <span className="sp-ec-recovery">{lvl.desc}</span>
              </button>
            ))}
          </div>
          <p className="sp-hint">
            Use <strong>H</strong> if adding a logo overlay. Higher = larger code.
          </p>
        </section>
      </div>

      <style>{`
        .sp-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sp-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
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

        /* Presets */
        .sp-presets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .sp-preset {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          transition: border-color 0.12s, background 0.12s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
          text-align: left;
        }
        .sp-preset:hover { background: var(--border-faint); }
        .sp-preset:active { transform: scale(0.97); }
        .sp-preset.active {
          border-color: var(--brand);
          background: var(--brand-light);
        }
        .sp-preset-swatch {
          width: 20px; height: 20px;
          border-radius: 50%;
          flex-shrink: 0;
          display: block;
        }
        .sp-preset-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1;
        }
        .sp-preset.active .sp-preset-name { color: var(--brand-text); }

        /* Colors */
        .sp-color-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .sp-color-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sp-color-card-label {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }
        .sp-color-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 7px 10px;
          transition: border-color 0.12s;
        }
        .sp-color-input-row:focus-within { border-color: var(--brand); }

        .sp-swatch-btn {
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
        }
        .sp-swatch {
          display: block;
          width: 22px; height: 22px;
          border-radius: 5px;
          border: 0.5px solid var(--border);
          flex-shrink: 0;
        }
        .sp-swatch-transparent {
          background-image:
            linear-gradient(45deg, #bbb 25%, transparent 25%),
            linear-gradient(-45deg, #bbb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #bbb 75%),
            linear-gradient(-45deg, transparent 75%, #bbb 75%) !important;
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0;
          background-color: white;
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

        /* Toggle */
        .sp-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
        }
        .sp-toggle-label-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }
        .sp-toggle-hint {
          font-size: 10.5px;
          font-weight: 400;
          color: var(--text-tertiary);
        }
        .sp-toggle {
          width: 40px; height: 22px;
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
        .sp-toggle.on { background: var(--brand); }
        .sp-toggle-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.2s;
          display: block;
          flex-shrink: 0;
        }
        .sp-toggle.on .sp-toggle-thumb { transform: translateX(18px); }

        /* Sliders */
        .sp-row-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sp-value {
          font-size: 11.5px;
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

        /* Size chips */
        .sp-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .sp-chip {
          font-size: 11.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .sp-chip:hover { color: var(--text-secondary); border-color: var(--text-tertiary); }
        .sp-chip:active { transform: scale(0.95); }
        .sp-chip.active {
          color: var(--brand-text);
          border-color: var(--brand-border);
          background: var(--brand-light);
          font-weight: 500;
        }

        /* Error correction */
        .sp-ec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .sp-ec-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 6px 8px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          text-align: center;
          transition: all 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .sp-ec-btn:hover { background: var(--border-faint); }
        .sp-ec-btn:active { transform: scale(0.96); }
        .sp-ec-btn.active {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }
        .sp-ec-level {
          font-size: 16px;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--text);
          line-height: 1;
        }
        .sp-ec-btn.active .sp-ec-level { color: var(--brand-text); }
        .sp-ec-name {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }
        .sp-ec-recovery {
          font-size: 9.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .sp-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          line-height: 1.55;
          margin: 0;
        }
        .sp-hint strong { color: var(--text-secondary); font-weight: 600; }

        /* ── Mobile tweaks ── */
        @media (max-width: 768px) {
          .sp-presets-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .sp-ec-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .sp-ec-btn { padding: 12px 8px; }
          .sp-ec-level { font-size: 18px; }
          .sp-ec-name { font-size: 11px; }
          .sp-ec-recovery { font-size: 10px; }
          .sp-preset { padding: 9px 10px; }
          .sp-toggle-row { padding: 12px 14px; }
          .sp-chips { gap: 8px; }
          .sp-chip { padding: 6px 12px; font-size: 12px; }
        }

        @media (max-width: 400px) {
          .sp-presets-grid { grid-template-columns: repeat(2, 1fr); }
          .sp-color-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
