// features/dev/password-generator/Workspace.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Tool } from "@/lib/tools";

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

function buildPool(cfg: Config): string {
  let p = "";
  if (cfg.uppercase) p += CHARSETS.uppercase;
  if (cfg.lowercase) p += CHARSETS.lowercase;
  if (cfg.numbers) p += CHARSETS.numbers;
  if (cfg.symbols) p += CHARSETS.symbols;
  if (cfg.excludeAmbiguous)
    p = p
      .split("")
      .filter((c) => !CHARSETS.ambiguous.includes(c))
      .join("");
  return p;
}

function generate(cfg: Config): string {
  const pool = buildPool(cfg);
  if (!pool) return "";
  const bytes = new Uint8Array(cfg.length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => pool[b % pool.length]).join("");
}

function entropy(poolSize: number, length: number): number {
  return poolSize === 0 ? 0 : Math.floor(length * Math.log2(poolSize));
}

type Level = "critical" | "weak" | "fair" | "good" | "strong";

interface Strength {
  level: Level;
  label: string;
  score: number;
  color: string;
  trackColor: string;
  bits: number;
}

function strength(bits: number): Strength {
  if (bits < 28)
    return {
      level: "critical",
      label: "Critical",
      score: 0,
      color: "#EF4444",
      trackColor: "rgba(239,68,68,.15)",
      bits,
    };
  if (bits < 40)
    return {
      level: "weak",
      label: "Weak",
      score: 1,
      color: "#F97316",
      trackColor: "rgba(249,115,22,.15)",
      bits,
    };
  if (bits < 60)
    return {
      level: "fair",
      label: "Fair",
      score: 2,
      color: "#EAB308",
      trackColor: "rgba(234,179,8,.15)",
      bits,
    };
  if (bits < 80)
    return {
      level: "good",
      label: "Good",
      score: 3,
      color: "#22C55E",
      trackColor: "rgba(34,197,94,.15)",
      bits,
    };
  return {
    level: "strong",
    label: "Strong",
    score: 4,
    color: "#10B981",
    trackColor: "rgba(16,185,129,.15)",
    bits,
  };
}

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
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke={str.color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={C * 0.25}
        className="pg-arc-fill"
        style={{ filter: `drop-shadow(0 0 6px ${str.color}55)` }}
      />
      <text x="50" y="46" textAnchor="middle" className="pg-arc-bits">
        {str.bits}
      </text>
      <text x="50" y="60" textAnchor="middle" className="pg-arc-unit">
        bits
      </text>
    </svg>
  );
}

function StrengthStrip({ str }: { str: Strength }) {
  return (
    <div className="pg-strip" aria-label={`Strength: ${str.label}`}>
      {[0, 1, 2, 3, 4].map((i) => (
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

function PwRow({
  pw,
  index,
  onCopy,
  onRegen,
  copied,
}: {
  pw: string;
  index: number;
  onCopy: (pw: string, i: number) => void;
  onRegen: (i: number) => void;
  copied: number | null;
}) {
  const [revealed, setRevealed] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="pg-row">
      <span className="pg-row-num">{index + 1}</span>
      <code
        className={`pg-row-pw${expanded ? " is-expanded" : ""}`}
        onClick={() => setExpanded((v) => !v)}
        aria-label={revealed ? `Password: ${pw}` : "Password hidden"}
        title="Click to expand/collapse"
      >
        {revealed ? pw : "•".repeat(Math.min(pw.length, 32))}
      </code>
      <div className="pg-row-actions">
        <button
          type="button"
          className="pg-row-btn"
          onClick={() => setRevealed((v) => !v)}
          title={revealed ? "Hide" : "Show"}
          aria-label={revealed ? "Hide password" : "Show password"}
        >
          <i className={`ti ${revealed ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pg-row-btn"
          onClick={() => onRegen(index)}
          title="Regenerate"
          aria-label="Regenerate this password"
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

function CheckCard({
  checked,
  onChange,
  label,
  sub,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub: string;
  icon: string;
}) {
  return (
    <label className={`pg-check${checked ? " is-on" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={`${label}: ${sub}`}
      />
      <span className="pg-check-icon">
        <i className={`ti ${icon}`} aria-hidden="true" />
      </span>
      <span className="pg-check-body">
        <span className="pg-check-label">{label}</span>
        <span className="pg-check-sub">{sub}</span>
      </span>
      <span className={`pg-check-dot${checked ? " is-on" : ""}`} aria-hidden="true" />
    </label>
  );
}

function OptionsModal({
  cfg,
  update,
  onClose,
  onGenerate,
  noneOn,
}: {
  cfg: Config;
  update: <K extends keyof Config>(k: K, v: Config[K]) => void;
  onClose: () => void;
  onGenerate: () => void;
  noneOn: boolean;
}) {
  const PRESETS = [
    {
      label: "PIN",
      cfg: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false },
    },
    {
      label: "Simple",
      cfg: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false },
    },
    {
      label: "Strong",
      cfg: { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true },
    },
    {
      label: "Maximum",
      cfg: { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true },
    },
  ];

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    Object.entries(p.cfg).forEach(([k, v]) => {
      update(k as keyof Config, v as any);
    });
  };

  const CHARSET_OPTS: Array<{ key: CharsetKey; label: string; sub: string; icon: string }> = [
    { key: "uppercase", label: "Uppercase", sub: "A – Z", icon: "ti-letter-case-upper" },
    { key: "lowercase", label: "Lowercase", sub: "a – z", icon: "ti-letter-case-lower" },
    { key: "numbers", label: "Numbers", sub: "0 – 9", icon: "ti-number" },
    { key: "symbols", label: "Symbols", sub: "!@#$…", icon: "ti-asterisk" },
  ];

  return (
    <>
      <div className="pg-modal-overlay" onClick={onClose} />
      <div className="pg-modal">
        <div className="pg-modal-header">
          <h2 className="pg-modal-title">Password Options</h2>
          <button type="button" className="pg-modal-close" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="pg-modal-body">
          <div className="pg-section">
            <p className="pg-section-label">Quick Presets</p>
            <div className="pg-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="pg-preset"
                  onClick={() => applyPreset(p)}
                >
                  <span>{p.label}</span>
                  <span className="pg-preset-len">{p.cfg.length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pg-section">
            <div className="pg-section-row">
              <p className="pg-section-label">Length</p>
              <div className="pg-stepper">
                <button
                  type="button"
                  className="pg-stepper-btn"
                  onClick={() => update("length", Math.max(4, cfg.length - 1))}
                  disabled={cfg.length <= 4}
                >
                  <i className="ti ti-minus" />
                </button>
                <span className="pg-stepper-val">{cfg.length}</span>
                <button
                  type="button"
                  className="pg-stepper-btn"
                  onClick={() => update("length", Math.min(128, cfg.length + 1))}
                  disabled={cfg.length >= 128}
                >
                  <i className="ti ti-plus" />
                </button>
              </div>
            </div>
            <input
              type="range"
              min={4}
              max={128}
              value={cfg.length}
              onChange={(e) => update("length", Number(e.target.value))}
              className="pg-slider"
              style={{ "--pct": `${((cfg.length - 4) / (128 - 4)) * 100}%` } as React.CSSProperties}
            />
          </div>

          <div className="pg-section">
            <p className="pg-section-label">Characters</p>
            <div className="pg-chars">
              {CHARSET_OPTS.map((o) => (
                <label key={o.key} className={`pg-char-opt${cfg[o.key] ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={cfg[o.key]}
                    onChange={(e) => update(o.key, e.target.checked)}
                  />
                  <div className="pg-char-icon">
                    <i className={`ti ${o.icon}`} />
                  </div>
                  <div className="pg-char-body">
                    <span className="pg-char-label">{o.label}</span>
                    <span className="pg-char-sub">{o.sub}</span>
                  </div>
                  <div className={`pg-char-check${cfg[o.key] ? " is-on" : ""}`}>
                    <i className="ti ti-check" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pg-section">
            <p className="pg-section-label">Advanced</p>
            <label className={`pg-adv-opt${cfg.excludeAmbiguous ? " is-on" : ""}`}>
              <input
                type="checkbox"
                checked={cfg.excludeAmbiguous}
                onChange={(e) => update("excludeAmbiguous", e.target.checked)}
              />
              <div className="pg-adv-icon">
                <i className="ti ti-eye-off" />
              </div>
              <div className="pg-adv-body">
                <span className="pg-adv-title">Exclude ambiguous characters</span>
                <span className="pg-adv-sub">Removes 0, O, 1, l, I for better readability</span>
              </div>
              <div className={`pg-char-check${cfg.excludeAmbiguous ? " is-on" : ""}`}>
                <i className="ti ti-check" />
              </div>
            </label>
          </div>

          {noneOn && (
            <div className="pg-warn">
              <i className="ti ti-alert-triangle" />
              <span>Select at least one character set</span>
            </div>
          )}
        </div>

        <div className="pg-modal-footer">
          <button type="button" className="pg-modal-btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pg-modal-btn-pri"
            onClick={() => {
              onGenerate();
              onClose();
            }}
            disabled={noneOn}
          >
            <i className="ti ti-refresh" />
            Generate
          </button>
        </div>
      </div>
    </>
  );
}

export default function PasswordGeneratorWorkspace({ tool: _t }: { tool: Tool }) {
  const [cfg, setCfg] = useState<Config>(DEFAULT);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setPasswords([generate(DEFAULT)]);
  }, []);

  const update = useCallback(<K extends keyof Config>(k: K, v: Config[K]) => {
    setCfg((p) => ({ ...p, [k]: v }));
  }, []);

  const pool = useMemo(() => buildPool(cfg), [cfg]);
  const bits = useMemo(() => entropy(pool.length, cfg.length), [pool, cfg.length]);
  const str = useMemo(() => strength(bits), [bits]);
  const noneOn = !cfg.uppercase && !cfg.lowercase && !cfg.numbers && !cfg.symbols;

  const doGenerate = useCallback(() => {
    if (noneOn) return;
    setPasswords(Array.from({ length: Math.min(Math.max(1, count), 50) }, () => generate(cfg)));
  }, [cfg, count, noneOn]);

  const doRegen = useCallback(
    (i: number) => {
      if (noneOn) return;
      setPasswords((p) => {
        const a = [...p];
        a[i] = generate(cfg);
        return a;
      });
    },
    [cfg, noneOn]
  );

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

  const doClearAll = useCallback(() => {
    setPasswords([]);
    setCount(1);
  }, []);

  const doDownload = useCallback(() => {
    const blob = new Blob([passwords.join("\n")], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: "passwords.txt",
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }, [passwords]);

  type Preset = { label: string; cfg: Partial<Config> };
  const PRESETS: Preset[] = [
    {
      label: "PIN",
      cfg: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false },
    },
    {
      label: "Simple",
      cfg: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false },
    },
    {
      label: "Secure",
      cfg: { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true },
    },
    {
      label: "Maximum",
      cfg: { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true },
    },
  ];

  const applyPreset = useCallback((p: Preset) => {
    setCfg((prev) => ({ ...prev, ...p.cfg }));
  }, []);

  const CHARSET_OPTS: Array<{ key: CharsetKey; label: string; sub: string; icon: string }> = [
    { key: "uppercase", label: "Uppercase", sub: "A – Z", icon: "ti-letter-case-upper" },
    { key: "lowercase", label: "Lowercase", sub: "a – z", icon: "ti-letter-case-lower" },
    { key: "numbers", label: "Numbers", sub: "0 – 9", icon: "ti-number" },
    { key: "symbols", label: "Symbols", sub: "!@#$…", icon: "ti-asterisk" },
  ];

  const activeChars = [
    cfg.uppercase && "ABC",
    cfg.lowercase && "abc",
    cfg.numbers && "123",
    cfg.symbols && "!@#",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="pg">
        <div className="pg-desktop">
          <div className="pg-config">
            <div className="pg-section">
              <p className="pg-section-label">Preset</p>
              <div className="pg-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="pg-preset"
                    onClick={() => applyPreset(p)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pg-section">
              <div className="pg-section-row">
                <p className="pg-section-label">Length</p>
                <div className="pg-stepper">
                  <button
                    type="button"
                    className="pg-stepper-btn"
                    onClick={() => update("length", Math.max(4, cfg.length - 1))}
                    disabled={cfg.length <= 4}
                    aria-label="Decrease length"
                  >
                    <i className="ti ti-minus" aria-hidden="true" />
                  </button>
                  <span className="pg-stepper-val" aria-live="polite">
                    {cfg.length}
                  </span>
                  <button
                    type="button"
                    className="pg-stepper-btn"
                    onClick={() => update("length", Math.min(128, cfg.length + 1))}
                    disabled={cfg.length >= 128}
                    aria-label="Increase length"
                  >
                    <i className="ti ti-plus" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="pg-slider-wrap">
                <input
                  type="range"
                  min={4}
                  max={128}
                  value={cfg.length}
                  onChange={(e) => update("length", Number(e.target.value))}
                  className="pg-slider"
                  aria-label={`Password length: ${cfg.length}`}
                  style={
                    { "--pct": `${((cfg.length - 4) / (128 - 4)) * 100}%` } as React.CSSProperties
                  }
                />
              </div>
              <div className="pg-slider-marks" aria-hidden="true">
                {[4, 16, 32, 64, 96, 128].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

            <div className="pg-section">
              <p className="pg-section-label">Characters</p>
              <div className="pg-checks">
                {CHARSET_OPTS.map((o) => (
                  <CheckCard
                    key={o.key}
                    checked={cfg[o.key]}
                    onChange={(v) => update(o.key, v)}
                    label={o.label}
                    sub={o.sub}
                    icon={o.icon}
                  />
                ))}
              </div>
            </div>

            <div className="pg-section">
              <p className="pg-section-label">Options</p>
              <label className={`pg-option${cfg.excludeAmbiguous ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={cfg.excludeAmbiguous}
                  onChange={(e) => update("excludeAmbiguous", e.target.checked)}
                  aria-label="Exclude ambiguous characters"
                />
                <span className="pg-option-icon">
                  <i className="ti ti-eye-off" aria-hidden="true" />
                </span>
                <span className="pg-option-body">
                  <span className="pg-option-title">Skip ambiguous characters</span>
                  <span className="pg-option-sub">Removes 0, O, 1, l, I — easier to read</span>
                </span>
                <span
                  className={`pg-check-dot${cfg.excludeAmbiguous ? " is-on" : ""}`}
                  aria-hidden="true"
                />
              </label>
            </div>

            <div className="pg-section pg-strength-section">
              <div className="pg-strength-gauge">
                <EntropyArc str={str} />
                <span className="pg-strength-label" style={{ color: str.color }}>
                  {str.label}
                </span>
              </div>
              <div className="pg-strength-detail">
                <p className="pg-section-label" style={{ marginBottom: 8 }}>
                  Security
                </p>
                <StrengthStrip str={str} />
                <div className="pg-strength-meta">
                  <span className="pg-meta-row">
                    <span className="pg-meta-key">Pool</span>
                    <span className="pg-meta-val">{pool.length} chars</span>
                  </span>
                  <span className="pg-meta-row">
                    <span className="pg-meta-key">Entropy</span>
                    <span className="pg-meta-val" style={{ color: str.color }}>
                      {bits} bits
                    </span>
                  </span>
                  <span className="pg-meta-row">
                    <span className="pg-meta-key">Combos</span>
                    <span className="pg-meta-val">
                      10<sup>{Math.floor(bits * 0.301)}</sup>+
                    </span>
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

          <div className="pg-output">
            <div className="pg-output-hd">
              <div className="pg-output-left">
                <span className="pg-output-title">
                  {passwords.length} password{passwords.length !== 1 ? "s" : ""}
                </span>
                <span className="pg-output-sub">
                  {cfg.length} chars · {bits} bits
                </span>
              </div>
              <div className="pg-output-actions">
                {passwords.length > 0 && (
                  <button type="button" className="pg-hd-btn pg-hd-btn-danger" onClick={doClearAll}>
                    <i className="ti ti-trash" aria-hidden="true" />
                    <span className="pg-hd-btn-label">Clear</span>
                  </button>
                )}
                {passwords.length > 1 && (
                  <button
                    type="button"
                    className={`pg-hd-btn${copiedAll ? " is-success" : ""}`}
                    onClick={doCopyAll}
                  >
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

            <ul className="pg-list" aria-label="Generated passwords" role="list">
              {passwords.map((pw, i) => (
                <PwRow
                  key={i}
                  pw={pw}
                  index={i}
                  onCopy={doCopyOne}
                  onRegen={doRegen}
                  copied={copied}
                />
              ))}
            </ul>

            <div className="pg-output-ft">
              <div className="pg-count">
                <button
                  type="button"
                  className="pg-count-btn"
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  disabled={count <= 1}
                  aria-label="Fewer passwords"
                >
                  <i className="ti ti-minus" aria-hidden="true" />
                </button>
                <span className="pg-count-val" aria-live="polite">
                  {count}
                </span>
                <button
                  type="button"
                  className="pg-count-btn"
                  onClick={() => setCount((c) => Math.min(50, c + 1))}
                  disabled={count >= 50}
                  aria-label="More passwords"
                >
                  <i className="ti ti-plus" aria-hidden="true" />
                </button>
                <span className="pg-count-label">password{count !== 1 ? "s" : ""}</span>
              </div>
              <button
                type="button"
                className="pg-generate"
                onClick={doGenerate}
                disabled={noneOn}
                aria-label="Generate passwords"
              >
                <i className="ti ti-refresh" aria-hidden="true" />
                Generate
              </button>
            </div>
          </div>
        </div>

        <div className="pg-mobile">
          <div className="pg-mobile-header">
            <div className="pg-mobile-info">
              <div className="pg-mobile-meta">
                <span className="pg-mobile-count">
                  {passwords.length} password{passwords.length !== 1 ? "s" : ""}
                </span>
                <span className="pg-mobile-config">
                  {cfg.length} chars · {activeChars || "None"}
                </span>
              </div>
              <div className="pg-mobile-strength">
                <div className="pg-mobile-strength-bar">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="pg-mobile-strength-seg"
                      style={{
                        background: i <= str.score ? str.color : "var(--border)",
                        opacity: i <= str.score ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <div className="pg-mobile-strength-info">
                  <span className="pg-mobile-strength-label" style={{ color: str.color }}>
                    {str.label}
                  </span>
                  <span className="pg-mobile-strength-bits">{str.bits} bits</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="pg-mobile-options-btn"
              onClick={() => setShowOptions(true)}
            >
              <i className="ti ti-settings" />
              <span>Options</span>
            </button>
          </div>

          <div className="pg-mobile-body">
            <ul className="pg-mobile-list">
              {passwords.map((pw, i) => (
                <PwRow
                  key={i}
                  pw={pw}
                  index={i}
                  onCopy={doCopyOne}
                  onRegen={doRegen}
                  copied={copied}
                />
              ))}
            </ul>
          </div>

          <div className="pg-mobile-footer">
            <div className="pg-mobile-actions">
              <div className="pg-mobile-count-ctrl">
                <button
                  type="button"
                  className="pg-mobile-count-btn"
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  disabled={count <= 1}
                >
                  <i className="ti ti-minus" />
                </button>
                <span className="pg-mobile-count-val">{count}</span>
                <button
                  type="button"
                  className="pg-mobile-count-btn"
                  onClick={() => setCount((c) => Math.min(50, c + 1))}
                  disabled={count >= 50}
                >
                  <i className="ti ti-plus" />
                </button>
              </div>
              {passwords.length > 1 && (
                <button
                  type="button"
                  className={`pg-mobile-action-btn${copiedAll ? " is-success" : ""}`}
                  onClick={doCopyAll}
                >
                  <i className={`ti ${copiedAll ? "ti-check" : "ti-copy"}`} />
                </button>
              )}
              {passwords.length > 0 && (
                <button
                  type="button"
                  className="pg-mobile-action-btn pg-mobile-clear-btn"
                  onClick={doClearAll}
                >
                  <i className="ti ti-trash" />
                </button>
              )}
              <button type="button" className="pg-mobile-action-btn" onClick={doDownload}>
                <i className="ti ti-download" />
              </button>
            </div>
            <button
              type="button"
              className="pg-mobile-generate"
              onClick={doGenerate}
              disabled={noneOn}
            >
              <i className="ti ti-refresh" />
              Generate
            </button>
          </div>
        </div>
      </div>

      {showOptions && (
        <OptionsModal
          cfg={cfg}
          update={update}
          onClose={() => setShowOptions(false)}
          onGenerate={doGenerate}
          noneOn={noneOn}
        />
      )}

      <style>{`
        .pg {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          min-height: 560px;
        }

        .pg-desktop {
          display: grid;
          grid-template-columns: 320px 1fr;
          min-height: 560px;
        }

        .pg-mobile {
          display: none;
        }

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

        .pg-strip { display: flex; gap: 3px; }
        .pg-strip-seg {
          flex: 1; height: 4px; border-radius: 2px;
          transition: background 0.3s;
        }

        .pg-strength-meta { display: flex; flex-direction: column; gap: 5px; }
        .pg-meta-row { display: flex; align-items: baseline; justify-content: space-between; }
        .pg-meta-key { font-size: 10.5px; color: var(--text-tertiary); font-family: var(--font-sans); }
        .pg-meta-val { font-size: 11.5px; font-weight: 700; color: var(--text); font-family: var(--font-mono); transition: color 0.3s; }

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
        .pg-hd-btn-danger { background: rgba(239, 68, 68, 0.08); color: #EF4444; border-color: rgba(239, 68, 68, 0.2); }
        .pg-hd-btn-danger:hover { background: rgba(239, 68, 68, 0.15); }

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
          min-height: 48px;
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
          padding: 8px 0;
          min-width: 0;
          line-height: 1.4;
          cursor: pointer;
          transition: color 0.15s;
          user-select: none;
        }

        .pg-row-pw:hover {
          color: var(--brand);
        }

        .pg-row-pw.is-expanded {
          white-space: normal;
          word-break: break-all;
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

        .pg-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 999;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pg-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          max-width: 480px;
          max-height: calc(100vh - 80px);
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pg-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 0.5px solid var(--border);
        }

        .pg-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
          letter-spacing: -0.4px;
        }

        .pg-modal-close {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .pg-modal-close:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .pg-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
        }

        .pg-modal .pg-section {
          padding: 16px 20px;
          border-bottom: 0.5px solid var(--border-faint);
        }

        .pg-modal .pg-section:last-child {
          border-bottom: none;
        }

        .pg-modal .pg-presets {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .pg-modal .pg-preset {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s;
        }

        .pg-modal .pg-preset:hover {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        .pg-preset-len {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .pg-chars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pg-char-opt {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }

        .pg-char-opt input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .pg-char-opt:hover {
          border-color: var(--text-disabled);
        }

        .pg-char-opt.is-on {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .pg-char-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .pg-char-opt.is-on .pg-char-icon {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .pg-char-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pg-char-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .pg-char-sub {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .pg-char-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--border);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: transparent;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .pg-char-check.is-on {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .pg-adv-opt {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }

        .pg-adv-opt input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .pg-adv-opt:hover {
          border-color: var(--text-disabled);
        }

        .pg-adv-opt.is-on {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .pg-adv-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .pg-adv-opt.is-on .pg-adv-icon {
          background: var(--brand);
          border-color: var(--brand);
          color: white;
        }

        .pg-adv-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .pg-adv-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .pg-adv-sub {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          line-height: 1.5;
        }

        .pg-modal .pg-warn {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 20px 0;
          padding: 12px 14px;
          font-size: 12px;
          color: #D97706;
          font-family: var(--font-sans);
          background: rgba(217, 119, 6, 0.08);
          border: 0.5px solid rgba(217, 119, 6, 0.2);
          border-radius: var(--radius-md);
        }

        @media (prefers-color-scheme: dark) {
          .pg-modal .pg-warn {
            color: #FCD34D;
          }
        }

        .pg-modal .pg-warn i {
          font-size: 14px;
          flex-shrink: 0;
        }

        .pg-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px 20px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .pg-modal-btn-sec {
          height: 38px;
          padding: 0 18px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s;
        }

        .pg-modal-btn-sec:hover {
          background: var(--bg-card);
          color: var(--text);
        }

        .pg-modal-btn-pri {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 38px;
          padding: 0 20px;
          border-radius: var(--radius-md);
          border: none;
          background: var(--brand);
          color: white;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s;
        }

        .pg-modal-btn-pri:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .pg-modal-btn-pri:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pg-modal-btn-pri i {
          font-size: 15px;
        }

        @media (max-width: 900px) {
          .pg-desktop {
            display: none;
          }

          .pg-mobile {
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 200px);
            max-height: calc(100vh - 200px);
          }

          .pg-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 16px;
            border-bottom: 0.5px solid var(--border);
            background: var(--bg-surface);
          }

          .pg-mobile-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 0;
          }

          .pg-mobile-meta {
            display: flex;
            align-items: baseline;
            gap: 10px;
            flex-wrap: wrap;
          }

          .pg-mobile-count {
            font-size: 15px;
            font-weight: 600;
            color: var(--text);
            font-family: var(--font-sans);
            letter-spacing: -0.3px;
          }

          .pg-mobile-config {
            font-size: 12px;
            color: var(--text-tertiary);
            font-family: var(--font-mono);
          }

          .pg-mobile-strength {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pg-mobile-strength-bar {
            display: flex;
            gap: 3px;
            flex: 1;
            max-width: 180px;
          }

          .pg-mobile-strength-seg {
            flex: 1;
            height: 4px;
            border-radius: 2px;
            transition: background 0.3s, opacity 0.3s;
          }

          .pg-mobile-strength-info {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pg-mobile-strength-label {
            font-size: 12px;
            font-weight: 600;
            font-family: var(--font-sans);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .pg-mobile-strength-bits {
            font-size: 11px;
            color: var(--text-tertiary);
            font-family: var(--font-mono);
          }

          .pg-mobile-options-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 36px;
            padding: 0 14px;
            border-radius: var(--radius-md);
            border: 0.5px solid var(--border);
            background: var(--bg-card);
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-sans);
            cursor: pointer;
            transition: all 0.15s;
            flex-shrink: 0;
          }

          .pg-mobile-options-btn:hover {
            background: var(--bg-surface);
            border-color: var(--text-disabled);
            color: var(--text);
          }

          .pg-mobile-options-btn i {
            font-size: 16px;
          }

          .pg-mobile-body {
            flex: 1;
            overflow-y: auto;
            background: var(--bg-card);
          }

          .pg-mobile-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .pg-mobile-list .pg-row {
            padding: 16px;
            gap: 12px;
            min-height: 60px;
          }

          .pg-mobile-list .pg-row-num {
            display: none;
          }

          .pg-mobile-list .pg-row-pw {
            font-size: 15px;
            letter-spacing: 0.04em;
          }

          .pg-mobile-list .pg-row-pw.is-expanded {
            font-size: 16px;
          }

          .pg-mobile-list .pg-row-actions {
            opacity: 1;
            align-self: flex-start;
            gap: 4px;
          }

          .pg-mobile-list .pg-row-btn {
            width: 32px;
            height: 32px;
            font-size: 15px;
          }

          .pg-mobile-footer {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 14px 16px;
            border-top: 0.5px solid var(--border);
            background: var(--bg-surface);
          }

          .pg-mobile-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pg-mobile-count-ctrl {
            display: flex;
            align-items: center;
            border: 0.5px solid var(--border);
            border-radius: var(--radius-md);
            overflow: hidden;
            background: var(--bg-card);
          }

          .pg-mobile-count-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.12s;
          }

          .pg-mobile-count-btn:hover:not(:disabled) {
            background: var(--bg-surface);
          }

          .pg-mobile-count-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .pg-mobile-count-val {
            min-width: 44px;
            text-align: center;
            font-size: 15px;
            font-weight: 700;
            color: var(--text);
            font-family: var(--font-mono);
            border-left: 0.5px solid var(--border);
            border-right: 0.5px solid var(--border);
            line-height: 40px;
          }

          .pg-mobile-action-btn {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            border: 0.5px solid var(--border);
            background: var(--bg-card);
            color: var(--text-secondary);
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.12s;
          }

          .pg-mobile-action-btn:hover {
            background: var(--bg-surface);
            color: var(--text);
          }

          .pg-mobile-action-btn.is-success {
            background: var(--brand-light);
            color: var(--brand-text);
            border-color: var(--brand-border);
          }

          .pg-mobile-clear-btn {
            background: rgba(239, 68, 68, 0.08);
            color: #EF4444;
            border-color: rgba(239, 68, 68, 0.2);
          }

          .pg-mobile-clear-btn:hover {
            background: rgba(239, 68, 68, 0.15);
          }

          .pg-mobile-generate {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 46px;
            padding: 0 20px;
            border-radius: var(--radius-md);
            border: none;
            background: var(--brand);
            color: white;
            font-size: 15px;
            font-weight: 600;
            font-family: var(--font-sans);
            letter-spacing: -0.2px;
            cursor: pointer;
            transition: all 0.15s;
          }

          .pg-mobile-generate:hover:not(:disabled) {
            background: var(--brand-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(20, 92, 60, 0.25);
          }

          .pg-mobile-generate:active:not(:disabled) {
            transform: translateY(0);
          }

          .pg-mobile-generate:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pg-mobile-generate i {
            font-size: 18px;
          }

          .pg-modal {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            transform: none;
            width: 100%;
            max-width: 100%;
            max-height: 90vh;
            border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pg-modal-overlay,
          .pg-modal,
          .pg-strength-seg,
          .pg-mobile-strength-seg,
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
