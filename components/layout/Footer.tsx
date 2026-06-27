// components/layout/Footer.tsx
import Link from "next/link";

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
            <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
        ),
    },
    {
        label: "Twitter",
        href: "https://twitter.com/toolverse",
        icon: (
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
];

export default function Footer() {
    return (
        <footer className="footer">
            {/* page-container centres content and adds horizontal padding */}
            <div className="page-container">

                {/* ── Top ─────────────────────────────────────────────── */}
                <div className="footer-top">

                    {/* Brand column */}
                    <div className="footer-brand">
                        <Link
                            href="/"
                            className="footer-logo"
                            aria-label="Toolverse home"
                        >
                            <img
                                src="/logo.png"
                                alt="Toolverse"
                                className="footer-logo-image"
                            />
                        </Link>

                        <p className="footer-description">
                            Fast, private tools for work, study, and everyday productivity.
                        </p>

                        <div className="footer-socials">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social"
                                    aria-label={`Visit our ${s.label} profile (opens in new tab)`}
                                >
                                    {s.icon}
                                    <span className="footer-social-label">{s.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns — 4-column CSS grid, fills full width */}
                    <div className="footer-links">
                        {columns.map((col) => (
                            <div key={col.heading} className="footer-column">
                                <p className="footer-column-heading">{col.heading}</p>
                                <ul className="footer-column-links">
                                    {col.links.map((link) => (
                                        <li key={link.href}>
                                            <Link href={link.href} className="footer-link">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>
                {/* ── End Top ─────────────────────────────────────────── */}

                {/* ── Bottom bar ──────────────────────────────────────── */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2025 Toolverse — Privacy-focused browser tools
                    </p>
                </div>

            </div>
            {/* ── End page-container ────────────────────────────────── */}
        </footer>
    );
}