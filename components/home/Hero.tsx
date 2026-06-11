// components/home/Hero.tsx
import Link from "next/link";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const trustItems = [
    "0 sign-ups",
    "No file size limits",
    "Results in <3s",
    "Works on any device",
];

export default function Hero() {
    return (
        <section style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111110",
            padding: "72px 40px 64px",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "680px",
                width: "100%",
            }}>

                {/* Headline */}
                <h1 style={{
                    fontSize: "clamp(32px, 5vw, 56px)",
                    fontWeight: 700,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.1,
                    color: "#EDEDEA",
                    marginBottom: "16px",
                    fontFamily: font,
                }}>
                    One tab.{" "}
                    <span style={{ color: "#4CAF82" }}>Every file task.</span>
                </h1>

                {/* Sub-headline */}
                <p style={{
                    fontSize: "clamp(15px, 1.8vw, 17px)",
                    color: "#A8A79E",
                    lineHeight: 1.6,
                    marginBottom: "32px",
                    maxWidth: "520px",
                    fontFamily: font,
                    fontWeight: 400,
                }}>
                    Compress, convert, merge and build — 51 tools that run entirely on
                    your device. Your files never touch a server.
                </p>

                {/* CTAs */}
                <div style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: "40px",
                }}>
                    <Link
                        href="/compress-pdf"
                        className="hero-cta-primary"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            padding: "11px 24px",
                            background: "#145C3C",
                            color: "#FFFFFF",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            textDecoration: "none",
                            letterSpacing: "-0.2px",
                            fontFamily: font,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Compress a PDF
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>

                    <Link
                        href="#tools"
                        className="hero-cta-secondary"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "11px 24px",
                            background: "transparent",
                            color: "#EDEDEA",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 500,
                            textDecoration: "none",
                            border: "0.5px solid #2C2C28",
                            fontFamily: font,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Browse all tools
                    </Link>
                </div>

                {/* Trust strip*/}
                <div className="trust-strip" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "nowrap",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                }}>
                    {trustItems.map((item, i) => (
                        <span key={item} style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontFamily: font,
                        }}>
                            <span className="trust-item" style={{
                                fontSize: "12px",
                                color: "#6B6A62",
                                whiteSpace: "nowrap",
                            }}>
                                {item}
                            </span>
                            {i < trustItems.length - 1 && (
                                <span style={{
                                    display: "inline-block",
                                    width: "3px",
                                    height: "3px",
                                    borderRadius: "50%",
                                    background: "#3C3B35",
                                    margin: "0 8px",
                                    flexShrink: 0,
                                }} />
                            )}
                        </span>
                    ))}
                </div>

            </div>

            <style>{`
        .hero-cta-primary:hover  { background: #1F7A52 !important; transition: background 0.15s; }
        .hero-cta-secondary:hover {
          background: #1A1A17 !important;
          border-color: #3C3B35 !important;
          transition: background 0.15s, border-color 0.15s;
        }
        @media (max-width: 480px) {
          .trust-strip { width: 100%; }
          .trust-item  { font-size: 11px !important; }
        }
      `}</style>
        </section>
    );
}