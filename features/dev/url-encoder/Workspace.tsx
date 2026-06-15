// features/dev/url-encoder/Workspace.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";

/*  Types  */
type Mode = "encode" | "decode";
type EncodeMethod = "component" | "full" | "query";
type OutputTab = "result" | "breakdown" | "diff";

interface UrlParts {
    protocol: string; username: string; password: string;
    hostname: string; port: string; pathname: string;
    searchParams: [string, string][]; hash: string; raw: string;
}
interface DiffChar { char: string; changed: boolean; }

/*  Pure helpers  */
function parseUrl(raw: string): UrlParts | null {
    try {
        const u = new URL(raw.includes("://") ? raw : "https://" + raw);
        const sp: [string, string][] = [];
        u.searchParams.forEach((v, k) => sp.push([k, v]));
        return {
            protocol: u.protocol.replace(":", ""), username: u.username, password: u.password,
            hostname: u.hostname, port: u.port, pathname: u.pathname, searchParams: sp,
            hash: u.hash.replace("#", ""), raw: u.href
        };
    } catch { return null; }
}

function encodeUrl(str: string, method: EncodeMethod): string {
    if (!str.trim()) return "";
    switch (method) {
        case "component": return encodeURIComponent(str);
        case "query": return str.replace(/[^A-Za-z0-9 \-_.~]/g, c => encodeURIComponent(c)).replace(/ /g, "+");
        case "full": return str.split("").map(c => /[A-Za-z0-9\-_.~:/?#[\]@!$&'()*+,;=%]/.test(c) ? c : encodeURIComponent(c)).join("");
    }
}

function decodeUrl(str: string): { result: string; error?: string } {
    try { return { result: decodeURIComponent(str.replace(/\+/g, " ")) }; }
    catch { try { return { result: unescape(str) }; } catch { return { result: "", error: "Invalid percent-encoded sequence" }; } }
}

function diffChars(a: string, b: string): { input: DiffChar[]; output: DiffChar[] } {
    if (!a || !b) return { input: [], output: [] };
    const inp: DiffChar[] = [], out: DiffChar[] = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
        const ca = a[i] ?? "", cb = b[i] ?? "";
        if (ca) inp.push({ char: ca, changed: ca !== cb });
        if (cb) out.push({ char: cb, changed: ca !== cb });
    }
    return { input: inp, output: out };
}

function countPct(s: string) { return (s.match(/%[0-9A-Fa-f]{2}/g) ?? []).length; }

function safetyScore(s: string): { score: number; label: string; hue: string } {
    if (!s) return { score: 0, label: "—", hue: "neutral" };
    const r = countPct(s) / Math.max(s.length, 1);
    if (r === 0) return { score: 100, label: "Clean", hue: "green" };
    if (r < 0.1) return { score: 85, label: "Mostly clean", hue: "green" };
    if (r < 0.3) return { score: 60, label: "Partially encoded", hue: "amber" };
    return { score: 30, label: "Heavily encoded", hue: "red" };
}

/*  Static data  */
const PRESETS = [
    { id: "search", label: "Search", icon: "ti-search", encode: "https://example.com/search?q=hello world&lang=en&price>100", decode: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den" },
    { id: "api", label: "API", icon: "ti-api", encode: "https://api.example.com/v1/users?filter=name:João & role=admin", decode: "https%3A%2F%2Fapi.example.com%2Fv1%2Fusers%3Ffilter%3Dname%3AJo%C3%A3o%20%26%20role%3Dadmin" },
    { id: "redirect", label: "Redirect", icon: "ti-arrow-forward", encode: "https://auth.example.com/login?redirect=https://app.example.com/dashboard?tab=analytics", decode: "https%3A%2F%2Fauth.example.com%2Flogin%3Fredirect%3Dhttps%3A%2F%2Fapp.example.com%2Fdashboard%3Ftab%3Danalytics" },
];

const METHODS: { id: EncodeMethod; label: string; short: string; icon: string; desc: string }[] = [
    { id: "component", label: "Component", short: "URI", icon: "ti-brackets", desc: "encodeURIComponent — encodes everything including / and ?" },
    { id: "full", label: "Full URL", short: "URL", icon: "ti-world", desc: "Preserves URL structure (/, ?, &, =) — only unsafe chars encoded" },
    { id: "query", label: "Query", short: "QS", icon: "ti-forms", desc: "Query-string safe — spaces become +" },
];

/*  Component  */
export default function UrlEncoderWorkspace({ tool }: { tool: Tool }) {
    const [mode, setMode] = useState<Mode>("encode");
    const [method, setMethod] = useState<EncodeMethod>("component");
    const [input, setInput] = useState("");
    const [copiedKey, setCopiedKey] = useState("");
    const [activeTab, setActiveTab] = useState<OutputTab>("result");
    const [showMethods, setShowMethods] = useState(false);
    const [activePane, setActivePane] = useState<"input" | "output">("input");

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    /* Auto-grow textarea */
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(Math.max(el.scrollHeight, 96), 260) + "px";
    }, [input]);

    /* Computed values */
    const output = useMemo(() => {
        if (!input.trim()) return "";
        return mode === "encode" ? encodeUrl(input, method) : decodeUrl(input).result;
    }, [mode, method, input]);

    const decodeError = useMemo(() =>
        mode === "decode" && input.trim() ? (decodeUrl(input).error ?? "") : "",
        [mode, input]);

    const parsedUrl = useMemo(() => {
        const src = mode === "decode" ? output : input;
        return src.trim() ? parseUrl(src) : null;
    }, [mode, output, input]);

    const diff = useMemo(() =>
        input && output ? diffChars(input, output) : null,
        [input, output]);

    const stats = useMemo(() => ({
        pct: countPct(output),
        safety: safetyScore(mode === "decode" ? output : input),
        ratio: input.length ? Math.round((output.length / input.length) * 100) : 0,
        delta: output.length - input.length,
    }), [input, output, mode]);

    /* Actions */
    const copy = useCallback(async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1800);
    }, []);

    const switchMode = (m: Mode) => { setMode(m); setInput(""); setActiveTab("result"); setActivePane("input"); };

    const swapIO = () => {
        if (!output) return;
        setInput(output);
        setMode(m => m === "encode" ? "decode" : "encode");
        setActivePane("input");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    const goOutput = () => {
        setActivePane("output");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    const goInput = () => {
        setActivePane("input");
        setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    const currentMethod = METHODS.find(m => m.id === method)!;

    return (
        <>
            <div className="uw-root" ref={rootRef}>

                {/*  COMMAND BAR  */}
                <div className="uw-cmd">

                    {/* Left cluster: mode + method */}
                    <div className="uw-cmd-left">
                        {/* Mode pill toggle */}
                        <div className="uw-pill-group" role="group" aria-label="Mode">
                            <button className={`uw-pill${mode === "encode" ? " --on" : ""}`} onClick={() => switchMode("encode")} aria-pressed={mode === "encode"}>
                                <i className="ti ti-lock" aria-hidden="true" />Encode
                            </button>
                            <button className={`uw-pill${mode === "decode" ? " --on" : ""}`} onClick={() => switchMode("decode")} aria-pressed={mode === "decode"}>
                                <i className="ti ti-lock-open" aria-hidden="true" />Decode
                            </button>
                        </div>

                        {/* Method selector — encode only */}
                        {mode === "encode" && (
                            <div className="uw-method-cluster">
                                <div className="uw-pill-group" role="group" aria-label="Encoding method">
                                    {METHODS.map(m => (
                                        <button key={m.id} className={`uw-pill${method === m.id ? " --on" : ""}`}
                                            onClick={() => setMethod(m.id)} title={m.desc} aria-pressed={method === m.id}>
                                            <i className={`ti ${m.icon}`} aria-hidden="true" />
                                            <span className="uw-method-full">{m.label}</span>
                                            <span className="uw-method-short">{m.short}</span>
                                        </button>
                                    ))}
                                </div>
                                <button className={`uw-icon-btn${showMethods ? " --on" : ""}`}
                                    onClick={() => setShowMethods(v => !v)} aria-label="Method details" title="About methods">
                                    <i className="ti ti-info-circle" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right cluster: examples */}
                    <div className="uw-cmd-right">
                        <span className="uw-cmd-label">Try</span>
                        {PRESETS.map(p => (
                            <button key={p.id} className="uw-example-btn"
                                onClick={() => { setInput(mode === "encode" ? p.encode : p.decode); setActivePane("input"); }}
                                title={p.label}>
                                <i className={`ti ${p.icon}`} aria-hidden="true" />
                                <span className="uw-example-label">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/*  METHOD INFO PANEL  */}
                {showMethods && mode === "encode" && (
                    <div className="uw-methods-panel" role="region" aria-label="Encoding method details">
                        {METHODS.map(m => (
                            <button key={m.id} className={`uw-method-card${method === m.id ? " --on" : ""}`}
                                onClick={() => { setMethod(m.id); setShowMethods(false); }}>
                                <div className="uw-method-card-top">
                                    <div className="uw-method-card-icon">
                                        <i className={`ti ${m.icon}`} aria-hidden="true" />
                                    </div>
                                    <span className="uw-method-card-name">{m.label}</span>
                                    {method === m.id && <span className="uw-chip-active">Active</span>}
                                </div>
                                <p className="uw-method-card-desc">{m.desc}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/*  MOBILE PANE SWITCHER  */}
                <div className="uw-switcher" role="tablist" aria-label="Panel">
                    <button role="tab" aria-selected={activePane === "input"} className={`uw-switcher-tab${activePane === "input" ? " --on" : ""}`} onClick={goInput}>
                        <i className="ti ti-pencil" aria-hidden="true" />
                        {mode === "encode" ? "Plain URL" : "Encoded"}
                    </button>
                    <div className="uw-switcher-div" aria-hidden="true" />
                    <button role="tab" aria-selected={activePane === "output"} className={`uw-switcher-tab${activePane === "output" ? " --on" : ""}`} onClick={goOutput}>
                        <i className="ti ti-sparkles" aria-hidden="true" />
                        Result
                        {output && activePane !== "output" && <span className="uw-ready-dot" aria-label="Ready" />}
                    </button>
                </div>

                {/*  MAIN SPLIT  */}
                <div className="uw-body">

                    {/*  INPUT PANE  */}
                    <div className={`uw-pane uw-pane-in${activePane === "input" ? " --mob-show" : ""}`} aria-label="Input">

                        {/* Pane chrome */}
                        <div className="uw-pane-bar">
                            <span className="uw-pane-bar-label">
                                <i className={`ti ${mode === "encode" ? "ti-pencil" : "ti-code-dots"}`} aria-hidden="true" />
                                {mode === "encode" ? "Plain URL" : "Encoded string"}
                            </span>
                            <div className="uw-pane-bar-actions">
                                {input && <span className="uw-len">{input.length.toLocaleString()} ch</span>}
                                <button className="uw-ghost" onClick={() => setInput("")} disabled={!input} aria-label="Clear">
                                    <i className="ti ti-x" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                            ref={inputRef}
                            className="uw-ta"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={mode === "encode" ? "https://example.com/search?q=hello world&lang=en" : "https%3A%2F%2Fexample.com%2F..."}
                            spellCheck={false} autoCorrect="off" autoCapitalize="off"
                            aria-label={mode === "encode" ? "URL to encode" : "Encoded string to decode"}
                            aria-invalid={!!decodeError}
                        />

                        {/* URL anatomy chips */}
                        {input && !decodeError && parsedUrl && (
                            <div className="uw-anatomy" aria-label="URL parts">
                                <span className="uw-anatomy-chip --proto" title="Protocol">{parsedUrl.protocol}://</span>
                                <span className="uw-anatomy-chip --host" title="Hostname">{parsedUrl.hostname}</span>
                                {parsedUrl.port && <span className="uw-anatomy-chip --port" title="Port">:{parsedUrl.port}</span>}
                                {parsedUrl.pathname !== "/" && (
                                    <span className="uw-anatomy-chip --path" title={parsedUrl.pathname}>
                                        {parsedUrl.pathname.length > 22 ? parsedUrl.pathname.slice(0, 22) + "…" : parsedUrl.pathname}
                                    </span>
                                )}
                                {parsedUrl.searchParams.length > 0 && (
                                    <span className="uw-anatomy-chip --params">
                                        ?{parsedUrl.searchParams.length} param{parsedUrl.searchParams.length !== 1 ? "s" : ""}
                                    </span>
                                )}
                                {parsedUrl.hash && <span className="uw-anatomy-chip --hash" title={parsedUrl.hash}>#{parsedUrl.hash.slice(0, 8)}{parsedUrl.hash.length > 8 ? "…" : ""}</span>}
                            </div>
                        )}

                        {/* Error */}
                        {decodeError && (
                            <div className="uw-error" role="alert">
                                <i className="ti ti-alert-triangle" aria-hidden="true" />
                                {decodeError}
                            </div>
                        )}

                        {/* Mobile: "View result" CTA */}
                        {output && !decodeError && (
                            <div className="uw-mob-cta">
                                <button className="uw-view-result" onClick={goOutput}>
                                    <i className="ti ti-sparkles" aria-hidden="true" />
                                    View result
                                    <i className="ti ti-chevron-right" aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/*  DESKTOP GUTTER  */}
                    <div className="uw-gutter" aria-hidden="true">
                        <div className="uw-gutter-line" />
                        <button className={`uw-swap${output ? "" : " --off"}`} onClick={swapIO} disabled={!output}
                            aria-label="Swap — use output as input" title="Swap">
                            <i className="ti ti-arrows-exchange" aria-hidden="true" />
                        </button>
                        <div className="uw-gutter-line" />
                    </div>

                    {/*  OUTPUT PANE  */}
                    <div className={`uw-pane uw-pane-out${activePane === "output" ? " --mob-show" : ""}`} aria-label="Output">

                        {/* Output tab bar */}
                        <div className="uw-pane-bar">
                            <div className="uw-out-tabs" role="tablist">
                                {([{ id: "result" as OutputTab, icon: "ti-eye", label: "Result" },
                                { id: "breakdown" as OutputTab, icon: "ti-layout-list", label: "Breakdown" },
                                { id: "diff" as OutputTab, icon: "ti-git-compare", label: "Diff" },
                                ]).map(t => (
                                    <button key={t.id} role="tab" aria-selected={activeTab === t.id}
                                        className={`uw-out-tab${activeTab === t.id ? " --on" : ""}`}
                                        onClick={() => setActiveTab(t.id)}>
                                        <i className={`ti ${t.icon}`} aria-hidden="true" />{t.label}
                                    </button>
                                ))}
                            </div>
                            <div className="uw-pane-bar-actions">
                                {output && <>
                                    <button className={`uw-copy-btn${copiedKey === "main" ? " --done" : ""}`}
                                        onClick={() => copy(output, "main")} aria-label="Copy result">
                                        <i className={`ti ${copiedKey === "main" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                        {copiedKey === "main" ? "Copied" : "Copy"}
                                    </button>
                                </>}
                            </div>
                        </div>

                        {/* Tab panels */}
                        <div className="uw-out-body" role="tabpanel">

                            {/* RESULT */}
                            {activeTab === "result" && (
                                <>
                                    {!output && !decodeError && (
                                        <div className="uw-empty">
                                            <div className="uw-empty-ico"><i className="ti ti-link" aria-hidden="true" /></div>
                                            <p className="uw-empty-h">Result appears here</p>
                                            <p className="uw-empty-p">Paste a URL on the left or pick an example above</p>
                                            <button className="uw-go-input-mob" onClick={goInput}>
                                                <i className="ti ti-pencil" aria-hidden="true" />Go to input
                                            </button>
                                        </div>
                                    )}
                                    {output && !decodeError && <pre className="uw-pre">{output}</pre>}
                                </>
                            )}

                            {/* BREAKDOWN */}
                            {activeTab === "breakdown" && (
                                <div className="uw-bd">
                                    {!parsedUrl ? (
                                        <div className="uw-empty">
                                            <div className="uw-empty-ico"><i className="ti ti-layout-list" aria-hidden="true" /></div>
                                            <p className="uw-empty-h">No URL to parse</p>
                                            <p className="uw-empty-p">Enter a valid URL to see its components</p>
                                        </div>
                                    ) : (
                                        <div className="uw-bd-inner">
                                            <section className="uw-bd-sec">
                                                <header className="uw-bd-sec-head">Components</header>
                                                <ul className="uw-bd-list">
                                                    {[
                                                        parsedUrl.protocol ? { k: "Protocol", v: parsedUrl.protocol, icon: "ti-shield-check", mod: "proto" } : null,
                                                        parsedUrl.hostname ? { k: "Host", v: parsedUrl.hostname, icon: "ti-world", mod: "host" } : null,
                                                        parsedUrl.port ? { k: "Port", v: parsedUrl.port, icon: "ti-plug", mod: "" } : null,
                                                        parsedUrl.pathname !== "/" ? { k: "Path", v: parsedUrl.pathname, icon: "ti-route", mod: "path" } : null,
                                                        parsedUrl.hash ? { k: "Fragment", v: parsedUrl.hash, icon: "ti-hash", mod: "" } : null,
                                                        parsedUrl.username ? { k: "Username", v: parsedUrl.username, icon: "ti-user", mod: "" } : null,
                                                    ].filter(Boolean).map((row, i) => (
                                                        <li key={i} className="uw-bd-row">
                                                            <span className={`uw-bd-ico --${row!.mod || "def"}`}>
                                                                <i className={`ti ${row!.icon}`} aria-hidden="true" />
                                                            </span>
                                                            <span className="uw-bd-key">{row!.k}</span>
                                                            <span className="uw-bd-val">{row!.v}</span>
                                                            <button className={`uw-mini-copy${copiedKey === `r${i}` ? " --ok" : ""}`}
                                                                onClick={() => copy(row!.v as string, `r${i}`)} aria-label={`Copy ${row!.k}`}>
                                                                <i className={`ti ${copiedKey === `r${i}` ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>

                                            {parsedUrl.searchParams.length > 0 && (
                                                <section className="uw-bd-sec">
                                                    <header className="uw-bd-sec-head">
                                                        Query parameters
                                                        <span className="uw-count-badge">{parsedUrl.searchParams.length}</span>
                                                    </header>
                                                    <div className="uw-table-wrap">
                                                        <table className="uw-table">
                                                            <thead>
                                                                <tr><th>#</th><th>Key</th><th>Value</th><th /></tr>
                                                            </thead>
                                                            <tbody>
                                                                {parsedUrl.searchParams.map(([k, v], i) => (
                                                                    <tr key={i}>
                                                                        <td className="uw-t-num">{i + 1}</td>
                                                                        <td className="uw-t-key">{k}</td>
                                                                        <td className="uw-t-val">{v || <em className="uw-t-empty">empty</em>}</td>
                                                                        <td>
                                                                            <button className={`uw-mini-copy${copiedKey === `p${i}` ? " --ok" : ""}`}
                                                                                onClick={() => copy(`${k}=${v}`, `p${i}`)} aria-label={`Copy ${k}`}>
                                                                                <i className={`ti ${copiedKey === `p${i}` ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="uw-export-row">
                                                        <button className="uw-export-btn"
                                                            onClick={() => copy(JSON.stringify(Object.fromEntries(parsedUrl.searchParams), null, 2), "json")}>
                                                            <i className="ti ti-braces" aria-hidden="true" />
                                                            {copiedKey === "json" ? "Copied!" : "Copy as JSON"}
                                                        </button>
                                                        <button className="uw-export-btn"
                                                            onClick={() => copy(parsedUrl.searchParams.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&"), "qs")}>
                                                            <i className="ti ti-forms" aria-hidden="true" />
                                                            {copiedKey === "qs" ? "Copied!" : "Copy as query string"}
                                                        </button>
                                                    </div>
                                                </section>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* DIFF */}
                            {activeTab === "diff" && (
                                <div className="uw-diff">
                                    {!diff ? (
                                        <div className="uw-empty">
                                            <div className="uw-empty-ico"><i className="ti ti-git-compare" aria-hidden="true" /></div>
                                            <p className="uw-empty-h">Character diff</p>
                                            <p className="uw-empty-p">Enter a URL to see input vs output side-by-side</p>
                                        </div>
                                    ) : (
                                        <div className="uw-diff-inner">
                                            <div className="uw-diff-track">
                                                <span className="uw-diff-rail --in">IN</span>
                                                <div className="uw-diff-chars">
                                                    {diff.input.map((c, i) => (
                                                        <span key={i} className={`uw-dc${c.changed ? " --rm" : ""}`}>{c.char === " " ? "·" : c.char}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="uw-diff-track">
                                                <span className="uw-diff-rail --out">OUT</span>
                                                <div className="uw-diff-chars">
                                                    {diff.output.map((c, i) => (
                                                        <span key={i} className={`uw-dc${c.changed ? " --add" : ""}`}>{c.char === " " ? "·" : c.char}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="uw-diff-legend">
                                                <span className="uw-dl --rm"><span className="uw-dl-swatch" />Original chars changed</span>
                                                <span className="uw-dl --add"><span className="uw-dl-swatch" />New or modified chars</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats footer */}
                        {output && (
                            <div className="uw-stats">
                                <div className="uw-stat">
                                    <span className="uw-stat-k">Length</span>
                                    <span className="uw-stat-v">{output.length.toLocaleString()} ch</span>
                                </div>
                                <div className="uw-stat">
                                    <span className="uw-stat-k">Delta</span>
                                    <span className={`uw-stat-v${stats.delta > 0 ? " --warn" : stats.delta < 0 ? " --good" : ""}`}>
                                        {stats.delta >= 0 ? "+" : ""}{stats.delta}
                                    </span>
                                </div>
                                {mode === "encode" && (
                                    <div className="uw-stat">
                                        <span className="uw-stat-k">% seqs</span>
                                        <span className="uw-stat-v">{stats.pct}</span>
                                    </div>
                                )}
                                <div className="uw-stat">
                                    <span className="uw-stat-k">Size ratio</span>
                                    <span className="uw-stat-v">{stats.ratio}%</span>
                                </div>
                                {mode === "encode" && (
                                    <div className="uw-stat">
                                        <span className="uw-stat-k">Method</span>
                                        <span className="uw-stat-v --mono">{currentMethod.short}</span>
                                    </div>
                                )}
                                {/* Safety meter */}
                                <div className={`uw-safety --${stats.safety.hue}`}>
                                    <i className="ti ti-shield-check" aria-hidden="true" />
                                    <span className="uw-safety-label">{stats.safety.label}</span>
                                    <div className="uw-safety-track" aria-hidden="true">
                                        <div className="uw-safety-fill" style={{ width: `${stats.safety.score}%` }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile: swap action in output pane */}
                        {output && (
                            <div className="uw-mob-swap">
                                <button className={`uw-copy-btn${copiedKey === "main" ? " --done" : ""}`}
                                    onClick={() => copy(output, "main")} aria-label="Copy result">
                                    <i className={`ti ${copiedKey === "main" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                    {copiedKey === "main" ? "Copied" : "Copy"}
                                </button>
                                <button className="uw-swap-mob-btn" onClick={swapIO}>
                                    <i className="ti ti-arrows-exchange" aria-hidden="true" />
                                    Use as new input
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/*  FOOTER  */}
                <div className="uw-footer">
                    <i className="ti ti-shield-lock" aria-hidden="true" />
                    <span>Everything runs in your browser — no data ever leaves this page.</span>
                </div>

            </div>

            <style>{`
        /*  Design tokens (local overrides where vars missing)  */
        .uw-root {
          --uw-radius-sm: 6px;
          --uw-radius-md: 8px;
          --uw-radius-lg: 12px;
          --uw-radius-xl: 16px;
          --uw-space-1: 4px;
          --uw-space-2: 8px;
          --uw-space-3: 12px;
          --uw-space-4: 16px;
          --uw-space-5: 20px;
          --uw-space-6: 24px;
          /* Semantic hue vars */
          --uw-green-text: #166534;
          --uw-green-bg: #F0FDF4;
          --uw-green-border: #BBF7D0;
          --uw-amber-text: #92400E;
          --uw-amber-bg: #FFFBEB;
          --uw-amber-border: #FDE68A;
          --uw-red-text: #991B1B;
          --uw-red-bg: #FEF2F2;
          --uw-red-border: #FECACA;
          --uw-blue-text: #1D4ED8;
          --uw-blue-bg: #EFF6FF;
          --uw-blue-border: #BFDBFE;
        }
        @media (prefers-color-scheme: dark) {
          .uw-root {
            --uw-green-text: #4ADE80; --uw-green-bg: #052e16; --uw-green-border: #166534;
            --uw-amber-text: #FCD34D; --uw-amber-bg: #1c1400; --uw-amber-border: #78350F;
            --uw-red-text: #F87171; --uw-red-bg: #1c0a0a; --uw-red-border: #7F1D1D;
            --uw-blue-text: #93C5FD; --uw-blue-bg: #0a1628; --uw-blue-border: #1E3A5F;
          }
        }

        /*  Root shell  */
        .uw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl, 16px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          isolation: isolate;
        }

        /*  Command bar  */
        .uw-cmd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--uw-space-2);
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          min-height: 52px;
          flex-wrap: wrap;
        }
        .uw-cmd-left {
          display: flex; align-items: center; gap: var(--uw-space-2); flex-wrap: wrap; flex: 1; min-width: 0;
        }
        .uw-cmd-right {
          display: flex; align-items: center; gap: var(--uw-space-1); flex-shrink: 0;
        }
        .uw-method-cluster { display: flex; align-items: center; gap: var(--uw-space-1); }

        /* Pill group */
        .uw-pill-group {
          display: inline-flex;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--uw-radius-md);
          padding: 2px;
          gap: 2px;
        }
        .uw-pill {
          display: inline-flex; align-items: center; gap: 5px;
          height: 26px; padding: 0 10px;
          border: none; border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; white-space: nowrap;
          transition: background 0.12s, color 0.12s, box-shadow 0.12s;
          letter-spacing: -0.1px;
        }
        .uw-pill i { font-size: 13px; }
        .uw-pill:hover { background: var(--bg-surface); color: var(--text); }
        .uw-pill.--on {
          background: var(--bg-card);
          color: var(--text);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px var(--border);
        }
        @media (prefers-color-scheme: dark) {
          .uw-pill.--on { box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 0.5px var(--border); }
        }

        /* Icon button */
        .uw-icon-btn {
          width: 30px; height: 30px; border-radius: var(--uw-radius-md);
          border: 0.5px solid var(--border); background: transparent;
          color: var(--text-tertiary); font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.12s; flex-shrink: 0;
        }
        .uw-icon-btn:hover { color: var(--text); background: var(--bg-surface); }
        .uw-icon-btn.--on { color: var(--brand); background: var(--brand-light); border-color: var(--brand-border); }

        /* Example buttons */
        .uw-cmd-label {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--text-disabled);
          font-family: var(--font-sans); margin-right: 1px;
        }
        .uw-example-btn {
          display: inline-flex; align-items: center; gap: 4px;
          height: 26px; padding: 0 8px;
          border-radius: var(--uw-radius-md); border: 0.5px solid var(--border);
          background: transparent; color: var(--text-secondary);
          font-size: 11.5px; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.12s; white-space: nowrap;
        }
        .uw-example-btn i { font-size: 12px; }
        .uw-example-btn:hover { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }

        /*  Method info panel  */
        .uw-methods-panel {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--uw-space-2);
          padding: 12px 14px;
          background: var(--bg-surface); border-bottom: 0.5px solid var(--border);
        }
        .uw-method-card {
          display: flex; flex-direction: column; gap: 6px;
          padding: 10px 12px; border-radius: var(--uw-radius-md);
          border: 0.5px solid var(--border); background: var(--bg-card);
          cursor: pointer; text-align: left; transition: border-color 0.12s, background 0.12s;
        }
        .uw-method-card:hover { border-color: var(--brand-border); }
        .uw-method-card.--on { border-color: var(--brand-border); background: var(--brand-light); }
        .uw-method-card-top {
          display: flex; align-items: center; gap: 6px;
        }
        .uw-method-card-icon {
          width: 22px; height: 22px; border-radius: 5px; flex-shrink: 0;
          background: var(--bg-surface); border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: var(--text-secondary);
        }
        .uw-method-card-name {
          font-size: 12px; font-weight: 600; color: var(--text);
          font-family: var(--font-sans); flex: 1;
        }
        .uw-chip-active {
          font-size: 9.5px; font-weight: 700; padding: 1px 6px;
          border-radius: 99px; letter-spacing: 0.04em;
          background: var(--brand-light); color: var(--brand-text);
          border: 0.5px solid var(--brand-border); font-family: var(--font-sans);
        }
        .uw-method-card-desc {
          font-size: 10.5px; color: var(--text-tertiary); line-height: 1.5;
          font-family: var(--font-sans); margin: 0;
        }

        /*  Mobile pane switcher  */
        .uw-switcher {
          display: none;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }
        .uw-switcher-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          height: 46px; border: none; border-bottom: 2px solid transparent;
          background: transparent; color: var(--text-tertiary);
          font-size: 13px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; transition: color 0.12s, border-color 0.12s;
          position: relative;
        }
        .uw-switcher-tab i { font-size: 15px; }
        .uw-switcher-tab:hover { color: var(--text-secondary); }
        .uw-switcher-tab.--on { color: var(--text); border-bottom-color: var(--text); }
        .uw-switcher-div { width: 0.5px; background: var(--border); align-self: stretch; margin: 10px 0; }
        .uw-ready-dot {
          position: absolute; top: 11px;
          right: calc(50% - 30px);
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--brand);
          border: 1.5px solid var(--bg-surface);
        }

        /*  Main body: split  */
        .uw-body {
          display: grid;
          grid-template-columns: 1fr 44px 1fr;
          flex: 1;
          min-height: 300px;
        }

        /*  Gutter (desktop divider)  */
        .uw-gutter {
          display: flex; flex-direction: column; align-items: center;
          border-left: 0.5px solid var(--border); border-right: 0.5px solid var(--border);
          background: var(--bg-surface); padding: 16px 0;
        }
        .uw-gutter-line { flex: 1; width: 0.5px; background: var(--border); }
        .uw-swap {
          width: 30px; height: 30px; border-radius: 50%;
          border: 0.5px solid var(--border); background: var(--bg-card);
          color: var(--text-secondary); font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; margin: 8px 0; flex-shrink: 0;
          transition: all 0.15s;
        }
        .uw-swap:hover { background: var(--brand-light); color: var(--brand); border-color: var(--brand-border); transform: rotate(180deg); }
        .uw-swap.--off { opacity: 0.3; cursor: not-allowed; transform: none !important; }

        /*  Pane  */
        .uw-pane {
          display: flex; flex-direction: column; min-height: 300px; overflow: hidden;
        }

        /* Pane bar (header strip) */
        .uw-pane-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px; height: 40px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface); gap: 8px; flex-shrink: 0;
        }
        .uw-pane-bar-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; color: var(--text-tertiary);
          text-transform: uppercase; letter-spacing: 0.1em;
          font-family: var(--font-sans);
        }
        .uw-pane-bar-label i { font-size: 12px; }
        .uw-pane-bar-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .uw-len {
          font-size: 10.5px; color: var(--text-disabled); font-family: var(--font-mono); letter-spacing: 0.02em;
        }
        .uw-ghost {
          width: 24px; height: 24px; border-radius: 5px; border: none;
          background: transparent; color: var(--text-disabled); font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.1s;
        }
        .uw-ghost:hover { background: var(--border); color: var(--text); }
        .uw-ghost:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Textarea */
        .uw-ta {
          flex: 1; width: 100%;
          min-height: 96px; max-height: 260px;
          padding: 14px 16px;
          font-family: var(--font-mono); font-size: 13px; line-height: 1.75;
          background: transparent; border: none; outline: none;
          color: var(--text); resize: none; overflow-y: auto;
          white-space: pre-wrap; word-break: break-all;
        }
        .uw-ta::placeholder { color: var(--text-disabled); font-family: var(--font-sans); font-size: 12px; line-height: 1.5; }

        /* URL anatomy chips */
        .uw-anatomy {
          display: flex; flex-wrap: wrap; gap: 3px;
          padding: 6px 14px 10px;
          border-top: 0.5px solid var(--border);
        }
        .uw-anatomy-chip {
          font-size: 10px; font-weight: 600; padding: 2px 7px;
          border-radius: 99px; font-family: var(--font-mono);
          border: 0.5px solid transparent;
          display: inline-flex; align-items: center;
        }
        .uw-anatomy-chip.--proto { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }
        .uw-anatomy-chip.--host  { background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border); }
        .uw-anatomy-chip.--port  { background: var(--bg-surface); color: var(--text-tertiary); border-color: var(--border); }
        .uw-anatomy-chip.--path  { background: var(--bg-surface); color: var(--text-tertiary); border-color: var(--border); }
        .uw-anatomy-chip.--params {
          background: var(--uw-amber-bg); color: var(--uw-amber-text); border-color: var(--uw-amber-border);
        }
        .uw-anatomy-chip.--hash {
          background: var(--bg-surface); color: var(--text-tertiary); border-color: var(--border);
        }

        /* Error */
        .uw-error {
          display: flex; align-items: center; gap: 7px;
          margin: 0 14px 10px; padding: 9px 12px; border-radius: var(--uw-radius-md);
          background: var(--uw-red-bg); border: 0.5px solid var(--uw-red-border);
          font-size: 12px; color: var(--uw-red-text); font-family: var(--font-sans); line-height: 1.4;
        }
        .uw-error i { font-size: 14px; flex-shrink: 0; }

        /* Mobile CTA */
        .uw-mob-cta { display: none; padding: 10px 14px; border-top: 0.5px solid var(--border); }
        .uw-view-result {
          width: 100%; height: 42px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          border-radius: var(--uw-radius-md); border: 0.5px solid var(--border);
          background: var(--bg-surface); color: var(--text);
          font-size: 13px; font-weight: 600; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.12s;
        }
        .uw-view-result:hover { background: var(--bg-card); border-color: var(--border); }
        .uw-view-result i:first-child { color: var(--brand); }
        .uw-view-result i:last-child { color: var(--text-tertiary); margin-left: auto; }

        /*  Output tab bar  */
        .uw-out-tabs { display: flex; flex: 1; overflow: hidden; }
        .uw-out-tab {
          display: inline-flex; align-items: center; gap: 4px;
          height: 40px; padding: 0 11px;
          border: none; border-bottom: 2px solid transparent;
          background: transparent; color: var(--text-tertiary);
          font-size: 11.5px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; transition: color 0.12s, border-color 0.12s;
          white-space: nowrap; margin-bottom: -0.5px;
        }
        .uw-out-tab i { font-size: 12.5px; }
        .uw-out-tab:hover { color: var(--text-secondary); }
        .uw-out-tab.--on { color: var(--text); border-bottom-color: var(--text); }

        /* Copy button */
        .uw-copy-btn {
          display: inline-flex; align-items: center; gap: 3px;
          height: 22px; padding: 0 7px;
          border-radius: var(--uw-radius-md); border: 0.5px solid var(--border);
          background: var(--bg-card); color: var(--text-secondary);
          font-size: 10px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.12s; white-space: nowrap; flex-shrink: 0;
        }
        .uw-copy-btn i { font-size: 10px; }
        .uw-copy-btn:hover { background: var(--bg-surface); color: var(--text); }
        .uw-copy-btn.--done { color: var(--brand); border-color: var(--brand-border); background: var(--brand-light); }

        /*  Output body  */
        .uw-out-body { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
        }

        /* Result pre */
        .uw-pre {
          flex: 1; margin: 0; padding: 16px; overflow: auto;
          font-family: var(--font-mono); font-size: 13px; line-height: 1.75;
          color: var(--text); white-space: pre-wrap; word-break: break-all;
        }

        /* Empty state */
        .uw-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 24px; gap: 8px; text-align: center;
        }
        .uw-empty-ico {
          width: 44px; height: 44px; border-radius: 13px;
          background: var(--bg-surface); border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: var(--text-disabled); margin-bottom: 4px;
        }
        .uw-empty-h { font-size: 13px; font-weight: 600; color: var(--text-secondary); font-family: var(--font-sans); margin: 0; letter-spacing: -0.2px; }
        .uw-empty-p { font-size: 12px; color: var(--text-tertiary); font-family: var(--font-sans); margin: 0; max-width: 220px; line-height: 1.55; }
        .uw-go-input-mob {
          display: none; align-items: center; gap: 5px; margin-top: 4px;
          height: 32px; padding: 0 12px; border-radius: var(--uw-radius-md);
          border: 0.5px solid var(--border); background: var(--bg-card);
          color: var(--text-secondary); font-size: 12px; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.12s;
        }
        .uw-go-input-mob:hover { background: var(--bg-surface); color: var(--text); }

        /*  Stats footer  */
        .uw-stats {
          display: flex; align-items: center; flex-wrap: wrap; gap: 6px;
          padding: 8px 14px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
        }
        .uw-stat {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 99px;
          background: var(--bg-card); border: 0.5px solid var(--border);
        }
        .uw-stat-k { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-disabled); font-family: var(--font-sans); }
        .uw-stat-v { font-size: 11px; font-weight: 600; color: var(--text-secondary); font-family: var(--font-sans); }
        .uw-stat-v.--mono { font-family: var(--font-mono); font-size: 10.5px; }
        .uw-stat-v.--warn { color: var(--uw-amber-text); }
        .uw-stat-v.--good { color: var(--uw-green-text); }

        /* Safety meter */
        .uw-safety {
          display: flex; align-items: center; gap: 6px; margin-left: auto;
          padding: 3px 10px; border-radius: 99px;
          border: 0.5px solid var(--border); background: var(--bg-card);
        }
        .uw-safety i { font-size: 13px; }
        .uw-safety-label { font-size: 10.5px; font-weight: 600; font-family: var(--font-sans); white-space: nowrap; }
        .uw-safety-track { width: 48px; height: 3px; border-radius: 99px; background: var(--border); overflow: hidden; }
        .uw-safety-fill { height: 100%; border-radius: 99px; transition: width 0.35s ease; }
        .uw-safety.--green { color: var(--uw-green-text); }
        .uw-safety.--green .uw-safety-fill { background: #22c55e; }
        .uw-safety.--amber { color: var(--uw-amber-text); }
        .uw-safety.--amber .uw-safety-fill { background: #f59e0b; }
        .uw-safety.--red { color: var(--uw-red-text); }
        .uw-safety.--red .uw-safety-fill { background: #ef4444; }
        .uw-safety.--neutral { color: var(--text-disabled); }
        .uw-safety.--neutral .uw-safety-fill { background: var(--border); }

        /*  Breakdown  */
        .uw-bd { flex: 1; overflow-y: auto; }
        .uw-bd-inner { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
        .uw-bd-sec { display: flex; flex-direction: column; gap: 8px; }
        .uw-bd-sec-head {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--text-tertiary); font-family: var(--font-sans);
        }
        .uw-count-badge {
          font-size: 10px; font-weight: 700; padding: 0 5px; border-radius: 99px;
          background: var(--bg-surface); border: 0.5px solid var(--border);
          color: var(--text-tertiary); font-family: var(--font-sans);
        }
        .uw-bd-list { display: flex; flex-direction: column; gap: 1px; list-style: none; margin: 0; padding: 0; }
        .uw-bd-row {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 8px; border-radius: var(--uw-radius-sm);
          transition: background 0.1s;
        }
        .uw-bd-row:hover { background: var(--bg-surface); }
        .uw-bd-ico {
          width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12.5px;
          background: var(--bg-surface); border: 0.5px solid var(--border); color: var(--text-tertiary);
        }
        .uw-bd-ico.--proto { background: var(--brand-light); border-color: var(--brand-border); color: var(--brand); }
        .uw-bd-ico.--host  { background: var(--uw-blue-bg); border-color: var(--uw-blue-border); color: var(--uw-blue-text); }
        .uw-bd-ico.--path  { background: var(--bg-surface); border-color: var(--border); color: var(--text-secondary); }
        .uw-bd-key {
          width: 62px; font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--text-tertiary); font-family: var(--font-sans); flex-shrink: 0;
        }
        .uw-bd-val {
          flex: 1; font-size: 12.5px; color: var(--brand); font-family: var(--font-mono);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          letter-spacing: -0.1px;
        }
        .uw-mini-copy {
          width: 24px; height: 24px; border-radius: 5px; border: none;
          background: transparent; color: var(--text-disabled); font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.1s, color 0.1s; flex-shrink: 0;
        }
        .uw-bd-row:hover .uw-mini-copy,
        .uw-table tbody tr:hover .uw-mini-copy { opacity: 1; }
        .uw-mini-copy:hover { color: var(--brand); }
        .uw-mini-copy.--ok { opacity: 1; color: var(--brand); }

        /* Params table */
        .uw-table-wrap {
          background: var(--bg-card); border: 0.5px solid var(--border);
          border-radius: var(--uw-radius-md); overflow: hidden;
        }
        .uw-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .uw-table thead th {
          text-align: left; padding: 7px 10px;
          font-size: 10px; font-weight: 700; color: var(--text-disabled);
          text-transform: uppercase; letter-spacing: 0.08em; font-family: var(--font-sans);
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }
        .uw-table thead th:first-child { width: 30px; text-align: center; }
        .uw-table thead th:last-child  { width: 30px; }
        .uw-table tbody tr { transition: background 0.1s; }
        .uw-table tbody tr:hover { background: var(--bg-surface); }
        .uw-table td { padding: 8px 10px; border-bottom: 0.5px solid var(--border); vertical-align: middle; }
        .uw-table tbody tr:last-child td { border-bottom: none; }
        .uw-t-num { color: var(--text-disabled); font-family: var(--font-mono); font-size: 10.5px; text-align: center; }
        .uw-t-key { color: var(--brand); font-weight: 600; font-family: var(--font-mono); }
        .uw-t-val { color: var(--text-secondary); font-family: var(--font-mono); word-break: break-all; }
        .uw-t-empty { color: var(--text-disabled); font-style: normal; font-size: 11px; }
        .uw-export-row { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 6px; }
        .uw-export-btn {
          display: inline-flex; align-items: center; gap: 5px;
          height: 28px; padding: 0 10px; border-radius: 99px;
          border: 0.5px solid var(--border); background: var(--bg-card);
          color: var(--text-secondary); font-size: 11px; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.12s;
        }
        .uw-export-btn i { font-size: 12px; }
        .uw-export-btn:hover { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }

        /*  Diff  */
        .uw-diff { flex: 1; overflow-y: auto; }
        .uw-diff-inner { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .uw-diff-track { display: flex; gap: 10px; align-items: flex-start; }
        .uw-diff-rail {
          font-size: 9.5px; font-weight: 700; letter-spacing: 0.06em;
          font-family: var(--font-mono); padding: 3px 5px; border-radius: 4px; flex-shrink: 0; margin-top: 1px;
        }
        .uw-diff-rail.--in  { background: var(--bg-surface); color: var(--text-tertiary); border: 0.5px solid var(--border); }
        .uw-diff-rail.--out { background: var(--brand-light); color: var(--brand-text); border: 0.5px solid var(--brand-border); }
        .uw-diff-chars { display: flex; flex-wrap: wrap; gap: 1px; font-family: var(--font-mono); font-size: 12px; line-height: 1.8; }
        .uw-dc { color: var(--text-secondary); }
        .uw-dc.--rm  { background: var(--uw-amber-bg); color: var(--uw-amber-text); border-radius: 2px; padding: 0 1px; }
        .uw-dc.--add { background: var(--uw-green-bg); color: var(--uw-green-text); border-radius: 2px; padding: 0 1px; }
        .uw-diff-legend {
          display: flex; gap: 14px; padding-top: 8px;
          border-top: 0.5px solid var(--border); flex-wrap: wrap;
        }
        .uw-dl { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-tertiary); font-family: var(--font-sans); }
        .uw-dl-swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
        .uw-dl.--rm  .uw-dl-swatch { background: var(--uw-amber-bg); border: 0.5px solid var(--uw-amber-border); }
        .uw-dl.--add .uw-dl-swatch { background: var(--uw-green-bg); border: 0.5px solid var(--uw-green-border); }

        /*  Mobile swap  */
        .uw-mob-swap { 
          display: none; 
          padding: 10px 14px; 
          border-top: 0.5px solid var(--border); 
          gap: 8px;
        }
        .uw-swap-mob-btn {
          flex: 1;
          height: 38px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border-radius: var(--uw-radius-md); border: 0.5px solid var(--border);
          background: var(--bg-surface); color: var(--text-secondary);
          font-size: 13px; font-weight: 500; font-family: var(--font-sans);
          cursor: pointer; transition: all 0.12s;
        }
        .uw-swap-mob-btn i { font-size: 15px; }
        .uw-swap-mob-btn:hover { background: var(--bg-card); color: var(--text); }

        /* Mobile action buttons */
        .uw-mob-swap .uw-copy-btn {
          flex: 1;
          height: 38px;
          font-size: 13px;
          gap: 6px;
        }
        .uw-mob-swap .uw-copy-btn i { font-size: 14px; }

        /*  Footer  */
        .uw-footer {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          font-size: 11px; color: var(--text-disabled); font-family: var(--font-sans);
          line-height: 1;
        }
        .uw-footer i { font-size: 13px; flex-shrink: 0; }

        /*  MOBILE  */
        @media (max-width: 768px) {
          /* Show pane switcher */
          .uw-switcher { display: flex; }

          /* Hide desktop gutter */
          .uw-gutter { display: none; }

          /* Stack panes, hide inactive */
          .uw-body { display: block; min-height: unset; }
          .uw-pane { display: none; min-height: unset; }
          .uw-pane.--mob-show { display: flex; }

          /* Show mobile-only elements */
          .uw-mob-cta { display: block; }
          .uw-mob-swap { display: flex; }
          .uw-go-input-mob { display: flex; }

          /* Hide copy button from tab bar on mobile */
          .uw-pane-bar-actions .uw-copy-btn { display: none; }

          /* Method panel: single column */
          .uw-methods-panel { grid-template-columns: 1fr; }

          /* Topbar adjustments */
          .uw-cmd { padding: 9px 12px; }
          .uw-cmd-label { display: none; }
          .uw-example-label { display: none; }
          .uw-example-btn { padding: 0 8px; min-width: 32px; justify-content: center; }
          .uw-method-full { display: none; }
          .uw-method-short { display: inline; }

          /* Bigger touch targets */
          .uw-ta { font-size: 14px; min-height: 120px; }
          .uw-pane-bar { height: 44px; }

          /* Stats: allow wrapping but safety stays inline */
          .uw-stats { gap: 5px; }
          .uw-safety { margin-left: 0; }
          .uw-safety-track { width: 36px; }

          /* Output tabs: scroll horizontally + no shrink */
          .uw-out-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .uw-out-tabs::-webkit-scrollbar { display: none; }
          .uw-out-tab {
            flex-shrink: 0;
            padding: 0 9px;
            font-size: 11px;
          }
        }

        /* Very narrow: icon-only pills */
        @media (max-width: 380px) {
          .uw-pill { padding: 0 8px; font-size: 11px; }
          .uw-method-short { display: none; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .uw-pill, .uw-example-btn, .uw-copy-btn, .uw-swap,
          .uw-view-result, .uw-out-tab, .uw-safety-fill { transition: none; }
          .uw-swap:hover { transform: none; }
        }
      `}</style>
        </>
    );
}