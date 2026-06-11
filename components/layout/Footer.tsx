// components/layout/Footer.tsx
import Link from "next/link";

const footerLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "About", href: "/about" },
    { label: "Sitemap", href: "/sitemap.xml" },
];

export default function Footer() {
    return (
        <footer style={{
            background: "#1A1A18",
            borderTop: "0.5px solid #2C2C28",
            width: "100%",
            height: "52px",
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
        }}>

            {/* Left — logo */}
            <Link href="/" style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                textDecoration: "none",
                flexShrink: 0,
            }}>
                <span style={{ fontSize: "16px", lineHeight: 1 }}>⚡</span>
                <span style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#6B6A62",
                    letterSpacing: "-0.3px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                }}>
                    Toolverse
                </span>
            </Link>

            {/* Centre — links */}
            <nav style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
                flex: 1,
                justifyContent: "center",
            }}>
                {footerLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="tv-footer-link"
                        style={{
                            fontSize: "14px",
                            color: "#6B6A62",
                            textDecoration: "none",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                        }}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Right — copyright */}
            <p style={{
                fontSize: "13px",
                color: "#3C3B35",
                flexShrink: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                whiteSpace: "nowrap",
            }}>
                © 2025 Toolverse · No sign-up ever
            </p>

            <style>{`
        .tv-footer-link:hover { color: #A8A79E !important; transition: color 0.15s; }
        @media (max-width: 640px) {
          footer {
            height: auto !important;
            padding-top: 16px !important;
            padding-bottom: 16px !important;
            flex-wrap: wrap;
            gap: 12px;
          }
          footer > p { width: 100%; text-align: center; }
        }
      `}</style>
        </footer>
    );
}