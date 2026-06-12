// components/home/Hero.tsx
import SearchBar from "./SearchBar";
import SocialProof from "./SocialProof";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function Hero() {
    return (
        <section style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111110",
            padding: "28px 40px 44px",
            minHeight: "260px",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                maxWidth: "640px",
                width: "100%",
            }}>

                {/* Eyebrow */}
                <p className="hero-eyebrow" style={{
                    fontSize: "12px",
                    color: "#3C3B35",
                    marginBottom: "14px",
                    fontFamily: font,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    fontWeight: 500,
                }}>
                    PDF · Images · Finance · Dev · Resume
                </p>

                {/* Headline */}
                <h1 style={{
                    fontSize: "clamp(28px, 4.5vw, 48px)",
                    fontWeight: 700,
                    letterSpacing: "-1.2px",
                    lineHeight: 1.15,
                    color: "#EDEDEA",
                    marginBottom: "16px",
                    fontFamily: font,
                }}>
                    One tab.{" "}
                    <span style={{ color: "#4CAF82" }}>Every file task.</span>
                </h1>

                {/* Body */}
                <p className="hero-body" style={{
                    fontSize: "clamp(14px, 1.6vw, 15px)",
                    color: "#6B6A62",
                    lineHeight: 1.7,
                    marginBottom: "28px",
                    maxWidth: "400px",
                    fontFamily: font,
                    fontWeight: 400,
                }}>
                    51 privacy-first tools that run entirely in your browser.
                    <br />
                    No uploads. No waiting. No accounts required.
                </p>

                {/* Search bar */}
                <SearchBar />

                {/* Social proof strip */}
                <SocialProof />

            </div>

            <style>{`
                @media (max-width: 480px) {
                    section { padding: 16px 20px 36px !important; }
                    .hero-eyebrow { font-size: 10px !important; letter-spacing: 0.2px !important; margin-bottom: 10px !important; }
                    .hero-body { font-size: 12px !important; line-height: 1.6 !important; margin-bottom: 20px !important; }
                }
            `}</style>
        </section>
    );
}