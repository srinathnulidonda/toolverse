//features/social/qr-generator/StylePanel.tsx
"use client";

import type { ErrorLevel, QrStyle } from "./types";

const ERROR_LEVELS: { value: ErrorLevel; label: string; desc: string }[] = [
    { value: "L", label: "L — Low", desc: "7% recovery" },
    { value: "M", label: "M — Medium", desc: "15% recovery" },
    { value: "Q", label: "Q — Quartile", desc: "25% recovery" },
    { value: "H", label: "H — High", desc: "30% recovery" },
];

const PRESETS: { name: string; fg: string; bg: string }[] = [
    { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
    { name: "Forest", fg: "#145C3C", bg: "#FFFFFF" },
    { name: "Ocean", fg: "#0C5FA5", bg: "#FFFFFF" },
    { name: "Dusk", fg: "#4B2E7A", bg: "#FFFFFF" },
    { name: "Ink", fg: "#1C1C18", bg: "#F5F5F0" },
    { name: "Dark", fg: "#FFFFFF", bg: "#111110" },
];

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
                <div className="sp-section">
                    <p className="sp-section-label">Color presets</p>
                    <div className="sp-presets">
                        {PRESETS.map(p => {
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
                                    <span className="sp-preset-dot" style={{ background: p.fg, border: `1.5px solid ${p.bg === "#FFFFFF" ? "#E8E8E2" : p.bg}` }} />
                                    <span className="sp-preset-name">{p.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Custom colors */}
                <div className="sp-section">
                    <p className="sp-section-label">Custom colors</p>
                    <div className="sp-colors">
                        <div className="sp-color-field">
                            <label className="sp-color-label" htmlFor="sp-fg">Foreground</label>
                            <div className="sp-color-row">
                                <label className="sp-color-swatch-wrap" htmlFor="sp-fg">
                                    <span className="sp-color-swatch" style={{ background: style.fgColor }} />
                                    <input id="sp-fg" type="color" className="sp-color-picker"
                                        value={style.fgColor} onChange={e => set({ fgColor: e.target.value })} />
                                </label>
                                <input type="text" className="sp-color-text"
                                    value={style.fgColor}
                                    onChange={e => {
                                        const v = e.target.value;
                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) set({ fgColor: v });
                                    }}
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        <div className="sp-color-field">
                            <label className="sp-color-label" htmlFor="sp-bg">Background</label>
                            <div className="sp-color-row">
                                <label className="sp-color-swatch-wrap" htmlFor="sp-bg">
                                    <span className="sp-color-swatch sp-color-swatch--checkered" style={{ background: style.transparent ? "transparent" : style.bgColor }} />
                                    <input id="sp-bg" type="color" className="sp-color-picker"
                                        value={style.bgColor}
                                        onChange={e => set({ bgColor: e.target.value, transparent: false })} />
                                </label>
                                <input type="text" className="sp-color-text"
                                    value={style.transparent ? "transparent" : style.bgColor}
                                    onChange={e => {
                                        const v = e.target.value;
                                        if (v === "transparent") { set({ transparent: true }); return; }
                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) set({ bgColor: v, transparent: false });
                                    }}
                                    maxLength={11}
                                />
                            </div>
                        </div>
                    </div>
                    <label className="sp-checkbox">
                        <input type="checkbox" checked={style.transparent}
                            onChange={e => set({ transparent: e.target.checked })} />
                        Transparent background (PNG only)
                    </label>
                </div>

                {/* Size */}
                <div className="sp-section">
                    <div className="sp-slider-header">
                        <p className="sp-section-label">Size</p>
                        <span className="sp-slider-value">{style.size}px</span>
                    </div>
                    <input type="range" className="sp-range"
                        min={128} max={1024} step={32}
                        value={style.size} onChange={e => set({ size: Number(e.target.value) })} />
                    <div className="sp-size-presets">
                        {[256, 512, 800, 1024].map(s => (
                            <button key={s} type="button"
                                className={`sp-size-chip${style.size === s ? " active" : ""}`}
                                onClick={() => set({ size: s })}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Margin */}
                <div className="sp-section">
                    <div className="sp-slider-header">
                        <p className="sp-section-label">Quiet zone (margin)</p>
                        <span className="sp-slider-value">{style.margin} modules</span>
                    </div>
                    <input type="range" className="sp-range"
                        min={0} max={8} step={1}
                        value={style.margin} onChange={e => set({ margin: Number(e.target.value) })} />
                </div>

                {/* Error correction */}
                <div className="sp-section">
                    <p className="sp-section-label">Error correction</p>
                    <div className="sp-ec-grid">
                        {ERROR_LEVELS.map(lvl => (
                            <button key={lvl.value} type="button"
                                className={`sp-ec-btn${style.errorLevel === lvl.value ? " active" : ""}`}
                                onClick={() => set({ errorLevel: lvl.value })}>
                                <span className="sp-ec-label">{lvl.label}</span>
                                <span className="sp-ec-desc">{lvl.desc}</span>
                            </button>
                        ))}
                    </div>
                    <p className="sp-ec-hint">Higher correction = larger code but more scannable when damaged. Use H if you plan to add a logo.</p>
                </div>
            </div>

            <style>{`
        .sp-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .sp-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sp-section-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
          font-family: var(--font-sans);
        }

        .sp-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .sp-preset {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 30px;
          padding: 0 10px 0 8px;
          border-radius: 6px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          transition: border-color 0.12s, background 0.12s;
        }
        .sp-preset:hover { background: var(--border); }
        .sp-preset.active {
          border-color: var(--brand);
          background: var(--brand-light);
        }
        .sp-preset-dot {
          width: 13px; height: 13px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .sp-preset-name {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .sp-colors {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .sp-color-field { display: flex; flex-direction: column; gap: 6px; }
        .sp-color-label {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }
        .sp-color-row {
          display: flex;
          gap: 8px;
          align-items: center;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg);
          padding: 6px 10px;
        }
        .sp-color-swatch-wrap { cursor: pointer; position: relative; }
        .sp-color-swatch {
          display: block;
          width: 22px; height: 22px;
          border-radius: 5px;
          border: 0.5px solid var(--border);
        }
        .sp-color-swatch--checkered {
          background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }
        .sp-color-picker {
          position: absolute; inset: 0;
          opacity: 0; width: 100%; height: 100%;
          cursor: pointer;
        }
        .sp-color-text {
          flex: 1; min-width: 0;
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          background: none;
          border: none;
          outline: none;
          text-transform: uppercase;
        }

        .sp-checkbox {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          cursor: pointer;
        }
        .sp-checkbox input {
          width: 14px; height: 14px;
          accent-color: var(--brand);
          cursor: pointer;
        }

        .sp-slider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sp-slider-value {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }
        .sp-range {
          width: 100%;
          accent-color: var(--brand);
          cursor: pointer;
          height: 4px;
        }

        .sp-size-presets {
          display: flex;
          gap: 6px;
        }
        .sp-size-chip {
          font-size: 11.5px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 5px;
          padding: 3px 9px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .sp-size-chip:hover { color: var(--text-secondary); border-color: var(--text-tertiary); }
        .sp-size-chip.active {
          color: var(--brand-text);
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .sp-ec-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .sp-ec-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          padding: 9px 12px;
          border-radius: 7px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.12s;
        }
        .sp-ec-btn:hover { background: var(--border); }
        .sp-ec-btn.active {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }
        .sp-ec-label {
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text);
        }
        .sp-ec-btn.active .sp-ec-label { color: var(--brand-text); }
        .sp-ec-desc {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
        .sp-ec-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          line-height: 1.55;
          margin: 0;
        }
      `}</style>
        </>
    );
}