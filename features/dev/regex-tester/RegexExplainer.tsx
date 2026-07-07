// features/dev/regex-tester/RegexExplainer.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { explainPattern, generateCode, type RegexFlags, type CodeLanguage } from "./utils";

interface RegexExplainerProps {
    pattern: string;
    flags: RegexFlags;
    onLoadExample?: (pattern: string, testString: string, flags?: Partial<RegexFlags>) => void;
}

interface RefExample {
    syntax: string;
    desc: string;
    example: {
        pattern: string;
        test: string;
        flags?: Partial<RegexFlags>;
    };
}

const REGEX_REFERENCE: Array<{ category: string; icon: string; items: RefExample[] }> = [
    {
        category: "Anchors",
        icon: "ti-anchor",
        items: [
            {
                syntax: "^",
                desc: "Start of string or line",
                example: { pattern: "^Hello", test: "Hello World\nGoodbye World" },
            },
            {
                syntax: "$",
                desc: "End of string or line",
                example: { pattern: "World$", test: "Hello World\nGoodbye Universe" },
            },
            {
                syntax: "\\b",
                desc: "Word boundary",
                example: { pattern: "\\bcat\\b", test: "cat category concatenate cat" },
            },
            {
                syntax: "\\B",
                desc: "Not a word boundary",
                example: { pattern: "\\Bcat\\B", test: "cat concatenate scatter" },
            },
        ],
    },
    {
        category: "Character Classes",
        icon: "ti-letter-a",
        items: [
            {
                syntax: ".",
                desc: "Any character except newline",
                example: { pattern: "h.t", test: "hat hit hot heat" },
            },
            {
                syntax: "\\d",
                desc: "Digit (0-9)",
                example: { pattern: "\\d+", test: "Order #12345 shipped on 2024-01-15" },
            },
            {
                syntax: "\\D",
                desc: "Not a digit",
                example: { pattern: "\\D+", test: "Room 42B, Floor 3" },
            },
            {
                syntax: "\\w",
                desc: "Word character (a-z, A-Z, 0-9, _)",
                example: { pattern: "\\w+", test: "hello_world 123 !@# test-case" },
            },
            {
                syntax: "\\W",
                desc: "Not a word character",
                example: { pattern: "\\W+", test: "hello, world! how-are you?" },
            },
            {
                syntax: "\\s",
                desc: "Whitespace",
                example: { pattern: "\\s+", test: "hello   world\ttab\nnewline" },
            },
            {
                syntax: "\\S",
                desc: "Not whitespace",
                example: { pattern: "\\S+", test: "hello   world   foo" },
            },
            {
                syntax: "[abc]",
                desc: "Any of a, b, or c",
                example: { pattern: "[aeiou]", test: "hello world", flags: { g: true } },
            },
            {
                syntax: "[^abc]",
                desc: "Not a, b, or c",
                example: { pattern: "[^aeiou\\s]", test: "hello world", flags: { g: true } },
            },
            {
                syntax: "[a-z]",
                desc: "Character between a and z",
                example: { pattern: "[a-z]+", test: "Hello World 123 FOO bar" },
            },
        ],
    },
    {
        category: "Quantifiers",
        icon: "ti-repeat",
        items: [
            {
                syntax: "*",
                desc: "0 or more",
                example: { pattern: "ab*c", test: "ac abc abbc abbbc" },
            },
            {
                syntax: "+",
                desc: "1 or more",
                example: { pattern: "ab+c", test: "ac abc abbc abbbc" },
            },
            {
                syntax: "?",
                desc: "0 or 1 (optional)",
                example: { pattern: "colou?r", test: "color colour flavor" },
            },
            {
                syntax: "{n}",
                desc: "Exactly n times",
                example: { pattern: "\\d{3}", test: "12 123 1234 12345" },
            },
            {
                syntax: "{n,}",
                desc: "n or more times",
                example: { pattern: "\\d{3,}", test: "12 123 1234 12345" },
            },
            {
                syntax: "{n,m}",
                desc: "Between n and m times",
                example: { pattern: "\\d{2,4}", test: "1 12 123 1234 12345" },
            },
            {
                syntax: "*?",
                desc: "0 or more (lazy)",
                example: { pattern: "<.*?>", test: "<div><span>text</span></div>" },
            },
            {
                syntax: "+?",
                desc: "1 or more (lazy)",
                example: { pattern: "\".+?\"", test: '"first" and "second" quotes' },
            },
        ],
    },
    {
        category: "Groups",
        icon: "ti-brackets",
        items: [
            {
                syntax: "(abc)",
                desc: "Capture group",
                example: { pattern: "(\\w+)@(\\w+)\\.com", test: "Contact: john@example.com" },
            },
            {
                syntax: "(?:abc)",
                desc: "Non-capturing group",
                example: { pattern: "(?:Mr|Mrs|Ms)\\. \\w+", test: "Mr. Smith and Mrs. Jones" },
            },
            {
                syntax: "(?<name>abc)",
                desc: "Named capture group",
                example: { pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})", test: "Date: 2024-01-15" },
            },
            {
                syntax: "\\1",
                desc: "Backreference to group 1",
                example: { pattern: "(\\w+) \\1", test: "hello hello world foo bar bar" },
            },
        ],
    },
    {
        category: "Lookaround",
        icon: "ti-eye",
        items: [
            {
                syntax: "(?=abc)",
                desc: "Positive lookahead",
                example: { pattern: "\\d+(?=px)", test: "width: 100px height: 50em margin: 20px" },
            },
            {
                syntax: "(?!abc)",
                desc: "Negative lookahead",
                example: { pattern: "\\d+(?!px)", test: "width: 100px height: 50em" },
            },
            {
                syntax: "(?<=abc)",
                desc: "Positive lookbehind",
                example: { pattern: "(?<=\\$)\\d+", test: "Price: $100 Discount: 20%" },
            },
            {
                syntax: "(?<!abc)",
                desc: "Negative lookbehind",
                example: { pattern: "(?<!\\$)\\b\\d+\\b", test: "Price: $100 Quantity: 5" },
            },
        ],
    },
    {
        category: "Special",
        icon: "ti-sparkles",
        items: [
            {
                syntax: "|",
                desc: "Alternation (OR)",
                example: { pattern: "cat|dog|bird", test: "I have a cat, a dog, and a bird" },
            },
            {
                syntax: "\\",
                desc: "Escape special character",
                example: { pattern: "\\$\\d+\\.\\d{2}", test: "Total: $19.99" },
            },
            {
                syntax: "\\n",
                desc: "Newline",
                example: { pattern: "line\\d+", test: "line1\nline2\nline3" },
            },
            {
                syntax: "\\t",
                desc: "Tab",
                example: { pattern: "\\w+\\t\\w+", test: "name\tvalue\nfoo\tbar" },
            },
        ],
    },
];

// Full worked examples — real-world patterns with explanations
const WORKED_EXAMPLES = [
    {
        id: "email-extract",
        title: "Extract Email Addresses",
        icon: "ti-mail",
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        test: "Contact us at support@toolverse.app or sales@example.co.uk for help.",
        flags: { g: true, i: true },
        explanation: "Matches standard email formats by capturing alphanumeric characters, dots, and special symbols before @ and a valid domain after.",
    },
    {
        id: "phone-format",
        title: "Validate Phone Numbers",
        icon: "ti-phone",
        pattern: "^\\+?1?[-.\\s]?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$",
        test: "+1 (555) 123-4567",
        flags: { g: false, i: false },
        explanation: "Matches US phone numbers with optional country code, parentheses, dots, dashes, or spaces as separators.",
    },
    {
        id: "url-parse",
        title: "Parse URLs",
        icon: "ti-link",
        pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
        test: "Visit https://toolverse.app or http://example.com/path?query=1",
        flags: { g: true },
        explanation: "Matches HTTP/HTTPS URLs including optional www prefix, domain, and query parameters.",
    },
    {
        id: "html-strip",
        title: "Strip HTML Tags",
        icon: "ti-code",
        pattern: "<\\/?[a-z][a-z0-9]*[^<>]*>",
        test: "<div class=\"card\"><p>Hello <b>World</b>!</p></div>",
        flags: { g: true, i: true },
        explanation: "Matches opening and closing HTML tags including their attributes, useful for stripping markup.",
    },
    {
        id: "password-strength",
        title: "Strong Password Check",
        icon: "ti-lock",
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        test: "MyP@ssw0rd123",
        flags: {},
        explanation: "Uses lookaheads to require at least one lowercase, uppercase, digit, and special character with minimum 8 length.",
    },
    {
        id: "csv-line",
        title: "Parse CSV Line",
        icon: "ti-table",
        pattern: "(?:^|,)(\"(?:[^\"]|\"\")*\"|[^,]*)",
        test: "John,\"Doe, Jr.\",30,\"New York, NY\"",
        flags: { g: true },
        explanation: "Splits CSV data respecting quoted fields that may contain commas within them.",
    },
    {
        id: "duplicate-words",
        title: "Find Duplicate Words",
        icon: "ti-copy",
        pattern: "\\b(\\w+)\\s+\\1\\b",
        test: "This is is a test test of the the duplicate word finder",
        flags: { g: true, i: true },
        explanation: "Uses a backreference to detect immediately repeated words in text.",
    },
    {
        id: "markdown-links",
        title: "Extract Markdown Links",
        icon: "ti-brand-markdown",
        pattern: "\\[([^\\]]+)\\]\\(([^)]+)\\)",
        test: "Check out [Toolverse](https://toolverse.app) and [GitHub](https://github.com)",
        flags: { g: true },
        explanation: "Captures link text and URL separately from Markdown-style [text](url) syntax.",
    },
];

export default function RegexExplainer({ pattern, flags, onLoadExample }: RegexExplainerProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>("javascript");
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedExampleId, setCopiedExampleId] = useState("");
    const [activeSection, setActiveSection] = useState<"examples" | "reference">("examples");

    const explanation = useMemo(() => {
        if (!pattern) return null;
        return explainPattern(pattern);
    }, [pattern]);

    const codeSnippet = useMemo(() => {
        if (!pattern) return "";
        return generateCode(pattern, flags, selectedLanguage);
    }, [pattern, flags, selectedLanguage]);

    const languages: Array<{ id: CodeLanguage; label: string; icon: string }> = [
        { id: "javascript", label: "JavaScript", icon: "ti-brand-javascript" },
        { id: "python", label: "Python", icon: "ti-brand-python" },
        { id: "java", label: "Java", icon: "ti-coffee" },
        { id: "csharp", label: "C#", icon: "ti-code" },
        { id: "php", label: "PHP", icon: "ti-brand-php" },
        { id: "ruby", label: "Ruby", icon: "ti-diamond" },
        { id: "go", label: "Go", icon: "ti-brand-golang" },
    ];

    const handleCopyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(codeSnippet);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 1500);
        } catch {
            // Silent fail
        }
    }, [codeSnippet]);

    const handleTryExample = useCallback(
        (examplePattern: string, testString: string, exampleFlags?: Partial<RegexFlags>) => {
            onLoadExample?.(examplePattern, testString, exampleFlags);
        },
        [onLoadExample]
    );

    const handleCopyExample = useCallback(async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedExampleId(id);
            setTimeout(() => setCopiedExampleId(""), 1500);
        } catch {
            // Silent fail
        }
    }, []);

    return (
        <>
            <div className="rxe-root">
                {/* Section Switcher */}
                <div className="rxe-section-switcher">
                    <button
                        type="button"
                        className={`rxe-switch-btn${activeSection === "examples" ? " active" : ""}`}
                        onClick={() => setActiveSection("examples")}
                    >
                        <i className="ti ti-bulb" />
                        Worked Examples
                    </button>
                    <button
                        type="button"
                        className={`rxe-switch-btn${activeSection === "reference" ? " active" : ""}`}
                        onClick={() => setActiveSection("reference")}
                    >
                        <i className="ti ti-book" />
                        Syntax Reference
                    </button>
                </div>

                {/* Worked Examples Section */}
                {activeSection === "examples" && (
                    <div className="rxe-section">
                        <div className="rxe-section-header">
                            <div className="rxe-section-title">
                                <i className="ti ti-bulb" />
                                Real-World Examples
                            </div>
                            <span className="rxe-meta-text">Click "Try it" to load into tester</span>
                        </div>

                        <div className="rxe-examples-grid">
                            {WORKED_EXAMPLES.map((ex) => (
                                <div key={ex.id} className="rxe-example-card">
                                    <div className="rxe-example-header">
                                        <div className="rxe-example-icon">
                                            <i className={`ti ${ex.icon}`} />
                                        </div>
                                        <h4 className="rxe-example-title">{ex.title}</h4>
                                    </div>

                                    <p className="rxe-example-desc">{ex.explanation}</p>

                                    <div className="rxe-example-pattern">
                                        <code>
                                            /{ex.pattern}/
                                            {Object.entries(ex.flags)
                                                .filter(([, v]) => v)
                                                .map(([k]) => k)
                                                .join("")}
                                        </code>
                                        <button
                                            type="button"
                                            className={`rxe-mini-copy${copiedExampleId === ex.id ? " copied" : ""}`}
                                            onClick={() => handleCopyExample(ex.pattern, ex.id)}
                                            title="Copy pattern"
                                        >
                                            <i className={`ti ${copiedExampleId === ex.id ? "ti-check" : "ti-copy"}`} />
                                        </button>
                                    </div>

                                    <div className="rxe-example-test">
                                        <span className="rxe-test-label">Test string:</span>
                                        <span className="rxe-test-text">{ex.test}</span>
                                    </div>

                                    <button
                                        type="button"
                                        className="rxe-try-btn"
                                        onClick={() => handleTryExample(ex.pattern, ex.test, ex.flags)}
                                    >
                                        <i className="ti ti-player-play" />
                                        Try it in Tester
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reference Section */}
                {activeSection === "reference" && (
                    <>
                        {/* Code Generation */}
                        <div className="rxe-section">
                            <div className="rxe-section-header">
                                <div className="rxe-section-title">
                                    <i className="ti ti-code" />
                                    Code Generation
                                </div>
                                {codeSnippet && (
                                    <button
                                        type="button"
                                        className={`rxe-copy-btn${copiedCode ? " copied" : ""}`}
                                        onClick={handleCopyCode}
                                    >
                                        <i className={`ti ${copiedCode ? "ti-check" : "ti-copy"}`} />
                                        {copiedCode ? "Copied" : "Copy Code"}
                                    </button>
                                )}
                            </div>

                            <div className="rxe-language-selector">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.id}
                                        type="button"
                                        className={`rxe-lang-btn${selectedLanguage === lang.id ? " active" : ""}`}
                                        onClick={() => setSelectedLanguage(lang.id)}
                                    >
                                        <i className={`ti ${lang.icon}`} />
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </div>

                            {codeSnippet ? (
                                <div className="rxe-code-block">
                                    <pre className="rxe-code">
                                        <code>{codeSnippet}</code>
                                    </pre>
                                </div>
                            ) : (
                                <div className="rxe-empty-code">
                                    <i className="ti ti-code-off" />
                                    <p>Enter a regex pattern in the Test tab, or try an example above</p>
                                </div>
                            )}
                        </div>

                        {/* Pattern Breakdown */}
                        {explanation && explanation.length > 0 && (
                            <div className="rxe-section">
                                <div className="rxe-section-header">
                                    <div className="rxe-section-title">
                                        <i className="ti ti-analyze" />
                                        Your Pattern Breakdown
                                    </div>
                                </div>

                                <div className="rxe-breakdown-list">
                                    {explanation.map((node, idx) => (
                                        <div key={idx} className="rxe-breakdown-item">
                                            <div className="rxe-breakdown-header">
                                                <code className="rxe-breakdown-syntax">{node.value}</code>
                                                <span className={`rxe-breakdown-type ${node.type}`}>
                                                    {node.type}
                                                </span>
                                            </div>
                                            <p className="rxe-breakdown-desc">{node.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regex Reference with Interactive Examples */}
                        <div className="rxe-section">
                            <div className="rxe-section-header">
                                <div className="rxe-section-title">
                                    <i className="ti ti-book" />
                                    Interactive Syntax Reference
                                </div>
                                <span className="rxe-meta-text">Click any row to try it</span>
                            </div>

                            <div className="rxe-reference-grid">
                                {REGEX_REFERENCE.map((category) => (
                                    <div key={category.category} className="rxe-ref-category">
                                        <h4 className="rxe-ref-category-title">
                                            <i className={`ti ${category.icon}`} />
                                            {category.category}
                                        </h4>
                                        <div className="rxe-ref-items">
                                            {category.items.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="rxe-ref-item"
                                                    onClick={() =>
                                                        handleTryExample(
                                                            item.example.pattern,
                                                            item.example.test,
                                                            item.example.flags
                                                        )
                                                    }
                                                    title={`Try: /${item.example.pattern}/`}
                                                >
                                                    <code className="rxe-ref-syntax">{item.syntax}</code>
                                                    <span className="rxe-ref-desc">{item.desc}</span>
                                                    <i className="ti ti-player-play rxe-ref-play" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Flags Explanation */}
                        <div className="rxe-section">
                            <div className="rxe-section-header">
                                <div className="rxe-section-title">
                                    <i className="ti ti-flag" />
                                    Active Flags
                                </div>
                            </div>

                            <div className="rxe-flags-list">
                                {Object.entries(flags).filter(([, v]) => v).length === 0 ? (
                                    <div className="rxe-no-flags">
                                        <i className="ti ti-flag-off" />
                                        <p>No flags enabled — go to the Test tab to toggle flags</p>
                                    </div>
                                ) : (
                                    Object.entries(flags)
                                        .filter(([, v]) => v)
                                        .map(([flag]) => {
                                            const flagInfo = {
                                                g: { label: "Global", desc: "Find all matches instead of stopping after the first match", icon: "ti-world" },
                                                i: { label: "Case Insensitive", desc: "Ignore case when matching (A = a)", icon: "ti-letter-case" },
                                                m: { label: "Multiline", desc: "^ and $ match the beginning/end of each line", icon: "ti-line-height" },
                                                s: { label: "Dot All", desc: "Dot (.) matches newline characters", icon: "ti-dots" },
                                                u: { label: "Unicode", desc: "Treat pattern and subject as Unicode", icon: "ti-language" },
                                                y: { label: "Sticky", desc: "Match only from lastIndex position", icon: "ti-pin" },
                                            }[flag as keyof RegexFlags];

                                            return flagInfo ? (
                                                <div key={flag} className="rxe-flag-card">
                                                    <div className="rxe-flag-header">
                                                        <i className={`ti ${flagInfo.icon}`} />
                                                        <div className="rxe-flag-info">
                                                            <code className="rxe-flag-code">{flag}</code>
                                                            <span className="rxe-flag-label">{flagInfo.label}</span>
                                                        </div>
                                                    </div>
                                                    <p className="rxe-flag-desc">{flagInfo.desc}</p>
                                                </div>
                                            ) : null;
                                        })
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .rxe-root {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 16px;
                    overflow: auto;
                }

                .rxe-section-switcher {
                    display: flex;
                    gap: 4px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 4px;
                    width: fit-content;
                }

                .rxe-switch-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    height: 36px;
                    padding: 0 16px;
                    border: none;
                    border-radius: calc(var(--radius-lg) - 4px);
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .rxe-switch-btn i {
                    font-size: 15px;
                }

                .rxe-switch-btn:hover {
                    color: var(--text);
                }

                .rxe-switch-btn.active {
                    background: var(--bg-card);
                    color: var(--brand-text);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }

                .rxe-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .rxe-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .rxe-section-title {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-tertiary);
                }

                .rxe-section-title i {
                    font-size: 14px;
                }

                .rxe-meta-text {
                    font-size: 11px;
                    color: var(--text-disabled);
                    font-style: italic;
                }

                /* Worked Examples */
                .rxe-examples-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 14px;
                }

                .rxe-example-card {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    transition: all 0.15s;
                }

                .rxe-example-card:hover {
                    border-color: var(--brand-border);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
                }

                .rxe-example-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .rxe-example-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .rxe-example-icon i {
                    font-size: 17px;
                    color: var(--brand);
                }

                .rxe-example-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                }

                .rxe-example-desc {
                    font-size: 12.5px;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.6;
                }

                .rxe-example-pattern {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 10px 12px;
                    background: var(--brand-light);
                    border: 0.5px solid var(--brand-border);
                    border-radius: var(--radius-md);
                }

                .rxe-example-pattern code {
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--brand-text);
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                    word-break: break-all;
                    flex: 1;
                }

                .rxe-mini-copy {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: var(--brand);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: background 0.12s;
                }

                .rxe-mini-copy:hover {
                    background: rgba(0, 0, 0, 0.06);
                }

                .rxe-mini-copy.copied {
                    color: var(--brand);
                }

                .rxe-example-test {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                }

                .rxe-test-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .rxe-test-text {
                    font-family: var(--font-mono);
                    font-size: 11.5px;
                    color: var(--text);
                    line-height: 1.5;
                    word-break: break-word;
                }

                .rxe-try-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    height: 36px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--brand-border);
                    background: var(--brand);
                    color: white;
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.12s;
                    margin-top: 2px;
                }

                .rxe-try-btn:hover {
                    background: var(--brand-hover);
                }

                .rxe-try-btn i {
                    font-size: 14px;
                }

                /* Code Generation */
                .rxe-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 12px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxe-copy-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxe-copy-btn.copied {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .rxe-language-selector {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .rxe-lang-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 32px;
                    padding: 0 12px;
                    border-radius: var(--radius-md);
                    border: 0.5px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .rxe-lang-btn i {
                    font-size: 14px;
                }

                .rxe-lang-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .rxe-lang-btn.active {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                .rxe-code-block {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .rxe-code {
                    margin: 0;
                    padding: 16px 18px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    line-height: 1.7;
                    color: var(--text);
                    overflow-x: auto;
                }

                .rxe-code code {
                    font-family: inherit;
                    font-size: inherit;
                    color: inherit;
                    background: none;
                    border: none;
                    padding: 0;
                }

                .rxe-empty-code {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 48px 24px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    color: var(--text-disabled);
                    text-align: center;
                }

                .rxe-empty-code i {
                    font-size: 28px;
                }

                .rxe-empty-code p {
                    font-size: 13px;
                    margin: 0;
                    max-width: 320px;
                }

                .rxe-breakdown-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .rxe-breakdown-item {
                    padding: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .rxe-breakdown-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .rxe-breakdown-syntax {
                    font-family: var(--font-mono);
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--brand);
                    background: var(--brand-light);
                    padding: 4px 8px;
                    border-radius: 5px;
                    border: 0.5px solid var(--brand-border);
                }

                .rxe-breakdown-type {
                    display: inline-flex;
                    align-items: center;
                    height: 22px;
                    padding: 0 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .rxe-breakdown-type.anchor {
                    background: #DBEAFE;
                    color: #1E40AF;
                }

                .rxe-breakdown-type.charclass {
                    background: #D1FAE5;
                    color: #065F46;
                }

                .rxe-breakdown-type.quantifier {
                    background: #FEF3C7;
                    color: #92400E;
                }

                .rxe-breakdown-type.group {
                    background: #E9D5FF;
                    color: #6B21A8;
                }

                .rxe-breakdown-type.special {
                    background: #FCE7F3;
                    color: #9F1239;
                }

                @media (prefers-color-scheme: dark) {
                    .rxe-breakdown-type.anchor { background: #0A1628; color: #93C5FD; }
                    .rxe-breakdown-type.charclass { background: #022C22; color: #6EE7B7; }
                    .rxe-breakdown-type.quantifier { background: #1F1A08; color: #FCD34D; }
                    .rxe-breakdown-type.group { background: #1F0A2E; color: #D8B4FE; }
                    .rxe-breakdown-type.special { background: #2D0A1F; color: #FBCFE8; }
                }

                .rxe-breakdown-desc {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.6;
                }

                .rxe-reference-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 16px;
                }

                .rxe-ref-category {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .rxe-ref-category-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                }

                .rxe-ref-category-title i {
                    font-size: 14px;
                    color: var(--brand);
                }

                .rxe-ref-items {
                    display: flex;
                    flex-direction: column;
                }

                .rxe-ref-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border: none;
                    border-bottom: 0.5px solid var(--border-faint);
                    background: transparent;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    transition: background 0.12s;
                }

                .rxe-ref-item:last-child {
                    border-bottom: none;
                }

                .rxe-ref-item:hover {
                    background: var(--brand-light);
                }

                .rxe-ref-item:hover .rxe-ref-play {
                    opacity: 1;
                }

                .rxe-ref-syntax {
                    font-family: var(--font-mono);
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--brand);
                    min-width: 60px;
                    flex-shrink: 0;
                }

                .rxe-ref-desc {
                    font-size: 12.5px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    flex: 1;
                }

                .rxe-ref-play {
                    font-size: 13px;
                    color: var(--brand);
                    opacity: 0;
                    transition: opacity 0.12s;
                    flex-shrink: 0;
                }

                .rxe-flags-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 12px;
                }

                .rxe-no-flags {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 40px 24px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    color: var(--text-disabled);
                    text-align: center;
                }

                .rxe-no-flags i {
                    font-size: 24px;
                }

                .rxe-no-flags p {
                    font-size: 13px;
                    margin: 0;
                    max-width: 280px;
                }

                .rxe-flag-card {
                    padding: 14px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .rxe-flag-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .rxe-flag-header > i {
                    font-size: 20px;
                    color: var(--brand);
                    flex-shrink: 0;
                }

                .rxe-flag-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rxe-flag-code {
                    font-family: var(--font-mono);
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--brand);
                    background: var(--brand-light);
                    padding: 3px 7px;
                    border-radius: 4px;
                    border: 0.5px solid var(--brand-border);
                }

                .rxe-flag-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .rxe-flag-desc {
                    font-size: 12.5px;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .rxe-root {
                        padding: 12px;
                    }

                    .rxe-examples-grid {
                        grid-template-columns: 1fr;
                    }

                    .rxe-reference-grid {
                        grid-template-columns: 1fr;
                    }

                    .rxe-flags-list {
                        grid-template-columns: 1fr;
                    }

                    .rxe-switch-btn span {
                        display: none;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .rxe-switch-btn,
                    .rxe-copy-btn,
                    .rxe-lang-btn,
                    .rxe-ref-item,
                    .rxe-try-btn,
                    .rxe-mini-copy,
                    .rxe-example-card {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}