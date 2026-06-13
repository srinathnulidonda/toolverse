// components/layout/Footer.tsx
import Link from "next/link";

const font =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif";

const columns = [
    {
        heading: "Categories",
        links: [
            { label: "PDF Tools", href: "/tools/pdf" },
            { label: "Image Tools", href: "/tools/image" },
            { label: "Developer Tools", href: "/tools/developer" },
            { label: "Finance Tools", href: "/tools/finance" },
            { label: "Resume Tools", href: "/tools/resume" },
            { label: "Social Tools", href: "/tools/social" },
        ],
    },
    {
        heading: "Quick Links",
        links: [
            { label: "All Tools", href: "/tools" },
            { label: "All Categories", href: "/categories" },
            { label: "Popular Tools", href: "/tools?filter=popular" },
            { label: "New Tools", href: "/tools?filter=new" },
        ],
    },
    {
        heading: "Resources",
        links: [
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "FAQ", href: "/faq" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Sitemap", href: "/sitemap.xml" },
        ],
    },
];

const socials = [
    {
        label: "GitHub",
        href: "https://github.com/srinathnulidonda/toolverse",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
        ),
    },
    {
        label: "X",
        href: "https://twitter.com/toolverse",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
];

export default function Footer() {
    return (
        <footer
            style={{
                background: "#1A1A18",
                borderTop: "0.5px solid #2C2C28",
                fontFamily: font,
            }}
        >
            {/* ── Top ─────────────────────────────────────────────────────── */}
            <div style={{ width: "100%", padding: "52px 40px 44px" }}>
                <div className="footer-inner">
                    {/* Brand */}
                    <div className="footer-brand">
                        {/* Logo */}
                        <Link
                            href="/"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                textDecoration: "none",
                                marginBottom: 16,
                            }}
                        >
                            <img
                                src="/logo.png"
                                alt="Toolverse"
                                style={{
                                    height: 32,
                                    width: "auto",
                                    objectFit: "contain",
                                }}
                            />
                        </Link>

                        {/* Description */}
                        <p
                            style={{
                                fontSize: 13,
                                color: "#6B6A62",
                                lineHeight: 1.75,
                                marginBottom: 24,
                                maxWidth: 210,
                            }}
                        >
                            Fast, private tools for work, study, and everyday productivity.
                        </p>

                        {/* Social links */}
                        <div style={{ display: "flex", gap: 8 }}>
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social"
                                    aria-label={s.label}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "6px 10px",
                                        borderRadius: 7,
                                        border: "0.5px solid #2C2C28",
                                        color: "#6B6A62",
                                        fontSize: 12,
                                        fontWeight: 500,
                                        textDecoration: "none",
                                    }}
                                >
                                    {s.icon}
                                    {s.label}
                                    <svg
                                        width="9"
                                        height="9"
                                        viewBox="0 0 10 10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 8L8 2M5 2h3v3" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="footer-cols">
                        {columns.map((col) => (
                            <div key={col.heading}>
                                <p
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        color: "#A8A79E",
                                        marginBottom: 14,
                                    }}
                                >
                                    {col.heading}
                                </p>
                                <ul
                                    style={{
                                        listStyle: "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}
                                >
                                    {col.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="footer-link"
                                                style={{
                                                    fontSize: 13,
                                                    color: "#6B6A62",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom bar ──────────────────────────────────────────────── */}
            <div style={{ borderTop: "0.5px solid #2C2C28" }}>
                <div
                    className="footer-bottom"
                    style={{
                        width: "100%",
                        padding: "14px 40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <p style={{ fontSize: 12, color: "#3C3B35" }}>
                        © 2025 Toolverse — Privacy-focused browser tools
                    </p>
                </div>
            </div>

            <style>{`
        .footer-inner {
          display: flex;
          gap: 64px;
          align-items: flex-start;
        }
        .footer-brand {
          flex-shrink: 0;
          width: 210px;
          display: flex;
          flex-direction: column;
        }
        .footer-cols {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        .footer-link:hover {
          color: #a8a79e !important;
          transition: color 0.15s ease;
        }
        .footer-social:hover {
          color: #a8a79e !important;
          border-color: #3c3b35 !important;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        @media (max-width: 900px) {
          .footer-inner {
            flex-direction: column;
            gap: 36px;
          }
          .footer-brand {
            width: 100%;
          }
          .footer-cols {
            width: 100%;
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .footer-cols {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start !important;
            padding: 16px 24px !important;
          }
          footer > div:first-child {
            padding: 36px 24px 32px !important;
          }
        }
      `}</style>
        </footer>
    );
}