// features/dev/password-generator/Workspace.tsx
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";

/* ─── Constants ─── */

const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
    ambiguous: "0O1lI",
};

type CharsetKey = "uppercase" | "lowercase" | "numbers" | "symbols";

interface Config {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeAmbiguous: boolean;
}

const DEFAULT: Config = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
};

/* ─── Crypto helpers ─── */

function buildPool(cfg: Config): string {
    let p = "";
    if (cfg.uppercase) p += CHARSETS.uppercase;
    if (cfg.lowercase) p += CHARSETS.lowercase;
    if (cfg.numbers) p += CHARSETS.numbers;
    if (cfg.symbols) p += CHARSETS.symbols;
    if (cfg.excludeAmbiguous) p = p.split("").filter(c => !CHARSETS.ambiguous.includes(c)).join("");
    return p;
}

function generate(cfg: Config): string {
    const pool = buildPool(cfg);
    if (!pool) return "";
    const bytes = new Uint8Array(cfg.length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => pool[b % pool.length]).join("");
}

function entropy(poolSize: number, length: number): number {
    return poolSize === 0 ? 0 : Math.floor(length * Math.log2(poolSize));
}

/* ─── Strength model ─── */

type Level = "critical" | "weak" | "fair" | "good" | "strong";

interface Strength {
    level: Level;
    label: string;
    score: number; // 0-4
    color: string;
    trackColor: string;
    bits: number;
}

function strength(bits: number): Strength {
    if (bits < 28) return { level: "critical", label: "Critical", score: 0, color: "#EF4444", trackColor: "rgba(239,68,68,.15)", bits };
    if (bits < 40) return { level: "weak", label: "Weak", score: 1, color: "#F97316", trackColor: "rgba(249,115,22,.15)", bits };
    if (bits < 60) return { level: "fair", label: "Fair", score: 2, color: "#EAB308", trackColor: "rgba(234,179,8,.15)", bits };
    if (bits < 80) return { level: "good", label: "Good", score: 3, color: "#22C55E", trackColor: "rgba(34,197,94,.15)", bits };
    return { level: "strong", label: "Strong", score: 4, color: "#10B981", trackColor: "rgba(16,185,129,.15)", bits };
}

/* ─── Entropy Arc SVG ─── */

function EntropyArc({ str }: { str: Strength }) {
    const R = 42;
    const C = 2 * Math.PI * R;
    const maxBits = 128;
    const fill = Math.min(str.bits / maxBits, 1);
    const dash = fill * C;
    const gap = C - dash;

    return (
        <svg viewBox="0 0 100 100" className="pg-arc-svg" aria-hidden="true">
            <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
            <circle
                cx="50" cy="50" r={R}
                fill="none"
                stroke={str.color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={C * 0.25}
                className="pg-arc-fill"
                style={{ filter: `drop-shadow(0 0 6px ${str.color}55)` }}
            />
            <text x="50" y="46" textAnchor="middle" className="pg-arc-bits">{str.bits}</text>
            <text x="50" y="60" textAnchor="middle" className="pg-arc-unit">bits</text>
        </svg>
    );
}

/* ─── Strength bar strip ─── */

function StrengthStrip({ str }: { str: Strength }) {
    return (
        <div className="pg-strip" aria-label={`Strength: ${str.label}`}>
            {[0, 1, 2, 3, 4].map(i => (
                <div
                    key={i}
                    className="pg-strip-seg"
                    style={{
                        background: i <= str.score ? str.color : "var(--border)",
                        opacity: i <= str.score ? 1 : 0.35,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Password row ─── */

function PwRow({
    pw, index, onCopy, onRegen, copied,
}: {
    pw: string; index: number;
    onCopy: (pw: string, i: number) => void;
    onRegen: (i: number) => void;
    copied: number | null;
}) {
    const [revealed, setRevealed] = useState(true);

    return (
        <li className="pg-row">
            <span className="pg-row-num">{index + 1}</span>
            <code className="pg-row-pw" aria-label={revealed ? `Password: ${pw}` : "Password hidden"}>
                {revealed ? pw : "•".repeat(Math.min(pw.length, 28))}
            </code>
            <div className="pg-row-actions">
                <button
                    type="button" className="pg-row-btn"
                    onClick={() => setRevealed(v => !v)}
                    title={revealed ? "Hide" : "Show"}
                    aria-label={revealed ? "Hide password" : "Show password"}
                >
                    <i className={`ti ${revealed ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
                </button>
                <button
                    type="button" className="pg-row-btn"
                    onClick={() => onRegen(index)}
                    title="Regenerate" aria-label="Regenerate this password"
                >
                    <i className="ti ti-refresh" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={`pg-row-btn pg-row-copy${copied === index ? " is-copied" : ""}`}
                    onClick={() => onCopy(pw, index)}
                    aria-label="Copy password"
                >
                    <i className={`ti ${copied === index ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                </button>
            </div>
        </li>
    );
}

/* ─── Checkbox card ─── */

function CheckCard({
    checked, onChange, label, sub, icon,
}: {
    checked: boolean; onChange: (v: boolean) => void;
    label: string; sub: string; icon: string;
}) {
    return (
        <label className={`pg-check${checked ? " is-on" : ""}`}>
            <input
                type="checkbox" checked={checked}
                onChange={e => onChange(e.target.checked)}
                aria-label={`${label}: ${sub}`}
            />
            <span className="pg-check-icon"><i className={`ti ${icon}`} aria-hidden="true" /></span>
            <span className="pg-check-body">
                <span className="pg-check-label">{label}</span>
                <span className="pg-check-sub">{sub}</span>
            </span>
            <span className={`pg-check-dot${checked ? " is-on" : ""}`} aria-hidden="true" />
        </label>
    );
}

/* ─── Main component ─── */

export default function PasswordGeneratorWorkspace({ tool: _t }: { tool: Tool }) {
    const [cfg, setCfg] = useState<Config>(DEFAULT);
    // ✅ FIX: Start with empty array to avoid SSR/client hydration mismatch.
    // crypto.getRandomValues() produces different values on server vs client,
    // so we defer generation to useEffect (client-only).
    const [passwords, setPasswords] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [copied, setCopied] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    // ✅ FIX: Generate initial password only on the client after mount
    useEffect(() => {
        setPasswords([generate(DEFAULT)]);
    }, []);

    const update = useCallback(<K extends keyof Config>(k: K, v: Config[K]) => {
        setCfg(p => ({ ...p, [k]: v }));
    }, []);

    const pool = useMemo(() => buildPool(cfg), [cfg]);
    const bits = useMemo(() => entropy(pool.length, cfg.length), [pool, cfg.length]);
    const str = useMemo(() => strength(bits), [bits]);
    const noneOn = !cfg.uppercase && !cfg.lowercase && !cfg.numbers && !cfg.symbols;

    const doGenerate = useCallback(() => {
        if (noneOn) return;
        setPasswords(Array.from({ length: Math.min(Math.max(1, count), 50) }, () => generate(cfg)));
    }, [cfg, count, noneOn]);

    const doRegen = useCallback((i: number) => {
        if (noneOn) return;
        setPasswords(p => { const a = [...p]; a[i] = generate(cfg); return a; });
    }, [cfg, noneOn]);

    const doCopyOne = useCallback(async (pw: string, i: number) => {
        await navigator.clipboard.writeText(pw);
        setCopied(i);
        setTimeout(() => setCopied(null), 1500);
    }, []);

    const doCopyAll = useCallback(async () => {
        await navigator.clipboard.writeText(passwords.join("\n"));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1600);
    }, [passwords]);

    const doDownload = useCallback(() => {
        const blob = new Blob([passwords.join("\n")], { type: "text/plain" });
        const a = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(blob), download: "passwords.txt",
        });
        a.click();
        URL.revokeObjectURL(a.href);
    }, [passwords]);

    /* Presets */
    type Preset = { label: string; cfg: Partial<Config> };
    const PRESETS: Preset[] = [
        { label: "PIN", cfg: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false } },
        { label: "Simple", cfg: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false } },
        { label: "Secure", cfg: { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true } },
        { label: "Maximum", cfg: { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true } },
    ];

    const applyPreset = useCallback((p: Preset) => {
        setCfg(prev => ({ ...prev, ...p.cfg }));
    }, []);

    const CHARSET_OPTS: Array<{ key: CharsetKey; label: string; sub: string; icon: string }> = [
        { key: "uppercase", label: "Uppercase", sub: "A – Z", icon: "ti-letter-case-upper" },
        { key: "lowercase", label: "Lowercase", sub: "a – z", icon: "ti-letter-case-lower" },
        { key: "numbers", label: "Numbers", sub: "0 – 9", icon: "ti-number" },
        { key: "symbols", label: "Symbols", sub: "!@#$…", icon: "ti-asterisk" },
    ];

    return (
        <>
            <div className="pg">

                {/* ── Left: config ── */}
                <div className="pg-config">

                    {/* Presets */}
                    <div className="pg-section">
                        <p className="pg-section-label">Preset</p>
                        <div className="pg-presets">
                            {PRESETS.map(p => (
                                <button key={p.label} type="button" className="pg-preset" onClick={() => applyPreset(p)}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Length */}
                    <div className="pg-section">
                        <div className="pg-section-row">
                            <p className="pg-section-label">Length</p>
                            <div className="pg-stepper">
                                <button type="button" className="pg-stepper-btn"
                                    onClick={() => update("length", Math.max(4, cfg.length - 1))}
                                    disabled={cfg.length <= 4} aria-label="Decrease length">
                                    <i className="ti ti-minus" aria-hidden="true" />
                                </button>
                                <span className="pg-stepper-val" aria-live="polite">{cfg.length}</span>
                                <button type="button" className="pg-stepper-btn"
                                    onClick={() => update("length", Math.min(128, cfg.length + 1))}
                                    disabled={cfg.length >= 128} aria-label="Increase length">
                                    <i className="ti ti-plus" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        <div className="pg-slider-wrap">
                            <input
                                type="range" min={4} max={128} value={cfg.length}
                                onChange={e => update("length", Number(e.target.value))}
                                className="pg-slider"
                                aria-label={`Password length: ${cfg.length}`}
                                style={{ "--pct": `${((cfg.length - 4) / (128 - 4)) * 100}%` } as React.CSSProperties}
                            />
                        </div>
                        <div className="pg-slider-marks" aria-hidden="true">
                            {[4, 16, 32, 64, 96, 128].map(m => <span key={m}>{m}</span>)}
                        </div>
                    </div>

                    {/* Character sets */}
                    <div className="pg-section">
                        <p className="pg-section-label">Characters</p>
                        <div className="pg-checks">
                            {CHARSET_OPTS.map(o => (
                                <CheckCard
                                    key={o.key}
                                    checked={cfg[o.key]} onChange={v => update(o.key, v)}
                                    label={o.label} sub={o.sub} icon={o.icon}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="pg-section">
                        <p className="pg-section-label">Options</p>
                        <label className={`pg-option${cfg.excludeAmbiguous ? " is-on" : ""}`}>
                            <input type="checkbox" checked={cfg.excludeAmbiguous}
                                onChange={e => update("excludeAmbiguous", e.target.checked)}
                                aria-label="Exclude ambiguous characters" />
                            <span className="pg-option-icon"><i className="ti ti-eye-off" aria-hidden="true" /></span>
                            <span className="pg-option-body">
                                <span className="pg-option-title">Skip ambiguous characters</span>
                                <span className="pg-option-sub">Removes 0, O, 1, l, I — easier to read</span>
                            </span>
                            <span className={`pg-check-dot${cfg.excludeAmbiguous ? " is-on" : ""}`} aria-hidden="true" />
                        </label>
                    </div>

                    {/* Strength gauge */}
                    <div className="pg-section pg-strength-section">
                        <div className="pg-strength-gauge">
                            <EntropyArc str={str} />
                            <span className="pg-strength-label" style={{ color: str.color }}>{str.label}</span>
                        </div>
                        <div className="pg-strength-detail">
                            <p className="pg-section-label" style={{ marginBottom: 8 }}>Security</p>
                            <StrengthStrip str={str} />
                            <div className="pg-strength-meta">
                                <span className="pg-meta-row">
                                    <span className="pg-meta-key">Pool</span>
                                    <span className="pg-meta-val">{pool.length} chars</span>
                                </span>
                                <span className="pg-meta-row">
                                    <span className="pg-meta-key">Entropy</span>
                                    <span className="pg-meta-val" style={{ color: str.color }}>{bits} bits</span>
                                </span>
                                <span className="pg-meta-row">
                                    <span className="pg-meta-key">Combos</span>
                                    <span className="pg-meta-val">10<sup>{Math.floor(bits * 0.301)}</sup>+</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {noneOn && (
                        <p className="pg-warn" role="alert">
                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                            Select at least one character set
                        </p>
                    )}

                </div>

                {/* ── Right: output ── */}
                <div className="pg-output">

                    {/* Output header */}
                    <div className="pg-output-hd">
                        <div className="pg-output-left">
                            <span className="pg-output-title">
                                {passwords.length} password{passwords.length !== 1 ? "s" : ""}
                            </span>
                            <span className="pg-output-sub">{cfg.length} chars · {bits} bits</span>
                        </div>
                        <div className="pg-output-actions">
                            {passwords.length > 1 && (
                                <button type="button"
                                    className={`pg-hd-btn${copiedAll ? " is-success" : ""}`}
                                    onClick={doCopyAll}>
                                    <i className={`ti ${copiedAll ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                    {copiedAll ? "Copied" : "Copy all"}
                                </button>
                            )}
                            <button type="button" className="pg-hd-btn" onClick={doDownload}>
                                <i className="ti ti-download" aria-hidden="true" />
                                <span className="pg-hd-btn-label">Save</span>
                            </button>
                        </div>
                    </div>

                    {/* Password list */}
                    <ul className="pg-list" aria-label="Generated passwords" role="list">
                        {passwords.map((pw, i) => (
                            <PwRow key={i} pw={pw} index={i} onCopy={doCopyOne} onRegen={doRegen} copied={copied} />
                        ))}
                    </ul>

                    {/* Footer: count + generate */}
                    <div className="pg-output-ft">
                        <div className="pg-count">
                            <button type="button" className="pg-count-btn"
                                onClick={() => setCount(c => Math.max(1, c - 1))}
                                disabled={count <= 1} aria-label="Fewer passwords">
                                <i className="ti ti-minus" aria-hidden="true" />
                            </button>
                            <span className="pg-count-val" aria-live="polite">{count}</span>
                            <button type="button" className="pg-count-btn"
                                onClick={() => setCount(c => Math.min(50, c + 1))}
                                disabled={count >= 50} aria-label="More passwords">
                                <i className="ti ti-plus" aria-hidden="true" />
                            </button>
                            <span className="pg-count-label">password{count !== 1 ? "s" : ""}</span>
                        </div>
                        <button
                            type="button" className="pg-generate" onClick={doGenerate} disabled={noneOn}
                            aria-label="Generate passwords">
                            <i className="ti ti-refresh" aria-hidden="true" />
                            Generate
                        </button>
                    </div>
                </div>

            </div>

            <style>{`
        /* ── Root ── */
        .pg {
          display: grid;
          grid-template-columns: 320px 1fr;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          min-height: 560px;
        }

        /* ── Config panel ── */
        .pg-config {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-right: 0.5px solid var(--border);
          overflow-y: auto;
          background: var(--bg-surface);
        }

        .pg-section {
          padding: 16px;
          border-bottom: 0.5px solid var(--border-faint);
        }
        .pg-section:last-child { border-bottom: none; }

        .pg-section-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .pg-section-label {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: var(--font-sans);
          margin: 0 0 10px;
        }
        .pg-section-row .pg-section-label { margin: 0; }

        /* Presets */
        .pg-presets {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
        }
        .pg-preset {
          height: 30px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.1s;
          letter-spacing: -0.1px;
        }
        .pg-preset:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /* Stepper */
        .pg-stepper {
          display: flex;
          align-items: center;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-card);
        }
        .pg-stepper-btn {
          width: 28px; height: 28px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.1s;
        }
        .pg-stepper-btn:hover:not(:disabled) { background: var(--bg-surface); }
        .pg-stepper-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pg-stepper-val {
          min-width: 36px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
          line-height: 28px;
        }

        /* Slider */
        .pg-slider-wrap { padding: 4px 0 2px; }
        .pg-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(to right, var(--brand) var(--pct, 10%), var(--border) var(--pct, 10%));
          outline: none;
          cursor: pointer;
        }
        .pg-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--brand);
          box-shadow: 0 1px 4px rgba(0,0,0,.12);
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .pg-slider::-webkit-slider-thumb:hover {
          transform: scale(1.12);
          box-shadow: 0 0 0 4px var(--brand-border);
        }
        .pg-slider::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--brand);
          cursor: pointer;
        }
        .pg-slider:focus-visible { outline: 2px solid var(--brand); outline-offset: 4px; }
        .pg-slider-marks {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 9.5px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
        }

        /* Check cards */
        .pg-checks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .pg-check {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 10px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.12s;
          user-select: none;
          position: relative;
        }
        .pg-check input { position: absolute; opacity: 0; width: 0; height: 0; }
        .pg-check:hover { border-color: var(--text-disabled); }
        .pg-check.is-on { background: var(--brand-light); border-color: var(--brand-border); }
        .pg-check:focus-within { outline: 2px solid var(--brand); outline-offset: 2px; }

        .pg-check-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          transition: all 0.12s;
        }
        .pg-check.is-on .pg-check-icon {
          background: var(--brand-border);
          border-color: transparent;
          color: var(--brand-text);
        }

        .pg-check-body { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .pg-check-label { font-size: 11.5px; font-weight: 600; color: var(--text); font-family: var(--font-sans); }
        .pg-check-sub { font-size: 10px; color: var(--text-tertiary); font-family: var(--font-mono); letter-spacing: 0.04em; }

        .pg-check-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: transparent;
          flex-shrink: 0;
          transition: all 0.12s;
        }
        .pg-check-dot.is-on { background: var(--brand); border-color: var(--brand); }

        /* Option card */
        .pg-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.12s;
          user-select: none;
          position: relative;
        }
        .pg-option input { position: absolute; opacity: 0; width: 0; height: 0; }
        .pg-option:hover { border-color: var(--text-disabled); }
        .pg-option.is-on { background: var(--brand-light); border-color: var(--brand-border); }
        .pg-option:focus-within { outline: 2px solid var(--brand); outline-offset: 2px; }

        .pg-option-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          transition: all 0.12s;
        }
        .pg-option.is-on .pg-option-icon { background: var(--brand-border); border-color: transparent; color: var(--brand-text); }
        .pg-option-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .pg-option-title { font-size: 12px; font-weight: 600; color: var(--text); font-family: var(--font-sans); }
        .pg-option-sub { font-size: 10.5px; color: var(--text-tertiary); font-family: var(--font-sans); line-height: 1.4; }

        /* Strength section */
        .pg-strength-section {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .pg-strength-section .pg-section-label { margin: 0; }

        .pg-strength-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .pg-arc-svg {
          width: 84px; height: 84px;
          overflow: visible;
        }
        .pg-arc-fill { transition: stroke-dasharray 0.4s cubic-bezier(.4,0,.2,1), stroke 0.3s; }
        .pg-arc-bits {
          font-size: 18px;
          font-weight: 800;
          fill: var(--text);
          font-family: var(--font-mono);
        }
        .pg-arc-unit {
          font-size: 9px;
          fill: var(--text-tertiary);
          font-family: var(--font-sans);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .pg-strength-label {
          font-size: 10.5px;
          font-weight: 700;
          font-family: var(--font-sans);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.3s;
        }

        .pg-strength-detail { flex: 1; display: flex; flex-direction: column; gap: 8px; }

        /* Strip */
        .pg-strip { display: flex; gap: 3px; }
        .pg-strip-seg {
          flex: 1; height: 4px; border-radius: 2px;
          transition: background 0.3s;
        }

        /* Meta */
        .pg-strength-meta { display: flex; flex-direction: column; gap: 5px; }
        .pg-meta-row { display: flex; align-items: baseline; justify-content: space-between; }
        .pg-meta-key { font-size: 10.5px; color: var(--text-tertiary); font-family: var(--font-sans); }
        .pg-meta-val { font-size: 11.5px; font-weight: 700; color: var(--text); font-family: var(--font-mono); transition: color 0.3s; }

        /* Warning */
        .pg-warn {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 0;
          padding: 10px 16px;
          font-size: 11.5px;
          color: #D97706;
          font-family: var(--font-sans);
          background: rgba(217,119,6,.06);
          border-top: 0.5px solid rgba(217,119,6,.15);
        }
        @media (prefers-color-scheme: dark) { .pg-warn { color: #FCD34D; } }
        .pg-warn i { font-size: 13px; flex-shrink: 0; }

        /* ── Output panel ── */
        .pg-output {
          display: flex;
          flex-direction: column;
          min-height: 0;
          background: var(--bg-card);
        }

        .pg-output-hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 16px;
          height: 48px;
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }
        .pg-output-left { display: flex; align-items: baseline; gap: 8px; }
        .pg-output-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.2px;
        }
        .pg-output-sub {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }
        .pg-output-actions { display: flex; align-items: center; gap: 6px; }

        .pg-hd-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.1s;
          white-space: nowrap;
        }
        .pg-hd-btn i { font-size: 12px; }
        .pg-hd-btn:hover { background: var(--border); color: var(--text); }
        .pg-hd-btn.is-success { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }

        /* Password list */
        .pg-list {
          flex: 1;
          list-style: none;
          padding: 4px 0;
          margin: 0;
          overflow-y: auto;
        }

        .pg-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          height: 48px;
          transition: background 0.1s;
          border-top: 0.5px solid var(--border-faint);
        }
        .pg-row:first-child { border-top: none; }
        .pg-row:hover { background: var(--bg-surface); }

        .pg-row-num {
          width: 20px;
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          text-align: right;
          flex-shrink: 0;
        }

        .pg-row-pw {
          flex: 1;
          font-size: 13.5px;
          font-family: var(--font-mono);
          color: var(--text);
          letter-spacing: 0.03em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: none;
          border: none;
          padding: 0;
          min-width: 0;
          line-height: 1;
        }

        .pg-row-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.12s;
        }
        .pg-row:hover .pg-row-actions,
        .pg-row:focus-within .pg-row-actions { opacity: 1; }

        .pg-row-btn {
          width: 30px; height: 30px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.1s, background 0.1s;
        }
        .pg-row-btn:hover { color: var(--text); background: var(--border); }
        .pg-row-copy.is-copied { color: #22C55E; }

        /* Footer */
        .pg-output-ft {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .pg-count {
          display: flex;
          align-items: center;
          gap: 0;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-card);
        }
        .pg-count-btn {
          width: 30px; height: 32px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.1s;
        }
        .pg-count-btn:hover:not(:disabled) { background: var(--bg-surface); }
        .pg-count-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pg-count-val {
          min-width: 32px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
          line-height: 32px;
        }
        .pg-count-label {
          padding: 0 10px;
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .pg-generate {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 20px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--brand-border);
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-sans);
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .pg-generate:hover:not(:disabled) {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }
        .pg-generate:disabled { opacity: 0.35; cursor: not-allowed; }
        .pg-generate i { font-size: 14px; }
        .pg-generate:active:not(:disabled) { transform: scale(0.97); }

        /* ── Mobile ── */
        @media (max-width: 900px) {
          .pg { grid-template-columns: 1fr; }
          .pg-config { border-right: none; border-bottom: 0.5px solid var(--border); }
          .pg-strength-section { flex-direction: row; }
        }

        @media (max-width: 640px) {
          .pg-presets { grid-template-columns: repeat(2, 1fr); }
          .pg-checks { grid-template-columns: 1fr 1fr; }

          .pg-strength-section {
            flex-direction: column;
            align-items: stretch;
          }
          .pg-strength-gauge {
            flex-direction: row;
            align-items: center;
            gap: 12px;
          }
          .pg-arc-svg { width: 64px; height: 64px; }
          .pg-arc-bits { font-size: 14px; }

          .pg-output-hd { padding: 0 12px; }
          .pg-hd-btn-label { display: none; }
          .pg-row { padding: 0 12px; }
          .pg-row-num { display: none; }
          .pg-row-actions { opacity: 1; }

          .pg-output-ft { padding: 8px 12px; gap: 8px; }
          .pg-count-label { display: none; }
          .pg-generate { padding: 0 16px; font-size: 12.5px; }
        }

        @media (max-width: 400px) {
          .pg-checks { grid-template-columns: 1fr; }
          .pg-presets { grid-template-columns: repeat(2, 1fr); }
          .pg-check { padding: 8px; }
          .pg-section { padding: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pg-arc-fill, .pg-strip-seg, .pg-meta-val,
          .pg-strength-label, .pg-slider::-webkit-slider-thumb,
          .pg-generate, .pg-check, .pg-preset { transition: none; }
        }
      `}</style>
        </>
    );
}