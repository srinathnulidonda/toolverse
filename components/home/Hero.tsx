// components/home/Hero.tsx
import SearchBar from "./SearchBar";
import SocialProof from "./SocialProof";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function Hero() {
  return (
    <section
      className="hero-section"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "28px 40px 44px",
        minHeight: "260px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "640px",
          width: "100%",
        }}
      >
        {/* Eyebrow */}
        <p
          className="hero-eyebrow"
          style={{
            fontSize: "12px",
            color: "var(--text-disabled)",
            marginBottom: "14px",
            fontFamily: font,
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          PDF · Images · Finance · Dev · Resume
        </p>

        {/* Headline */}
        <h1
          className="hero-title"
          style={{
            fontSize: "clamp(28px, 4.5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-1.2px",
            lineHeight: 1.15,
            color: "var(--text)",
            marginBottom: "16px",
            fontFamily: font,
          }}
        >
          One tab. <span style={{ color: "var(--brand)" }}>Every file task.</span>
        </h1>

        {/* Body */}
        <p
          className="hero-body"
          style={{
            fontSize: "clamp(14px, 1.6vw, 15px)",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "28px",
            maxWidth: "400px",
            fontFamily: font,
            fontWeight: 400,
          }}
        >
          Built for speed — zero setup, zero friction.
        </p>

        {/* Search bar */}
        <SearchBar />

        {/* Social proof strip */}
        <SocialProof />
      </div>

      <style>{`
                @media (max-width: 480px) {
                    .hero-section { padding: 16px 20px 36px !important; }
                    .hero-eyebrow { font-size: 10px !important; letter-spacing: 0.2px !important; margin-bottom: 10px !important; }
                    .hero-title {
                        font-size: 27px !important;
                        letter-spacing: -0.6px !important;
                        line-height: 1.2 !important;
                        margin-bottom: 8px !important;
                        white-space: nowrap !important;
                    }
                    .hero-body { font-size: 10px !important; line-height: 1.5 !important; margin-bottom: 18px !important; }
                }

                @media (max-width: 340px) {
                    .hero-title { font-size: 25px !important; letter-spacing: -0.4px !important; margin-bottom: 6px !important; }
                    .hero-body { font-size: 9.5px !important; }
                }
            `}</style>
    </section>
  );
}