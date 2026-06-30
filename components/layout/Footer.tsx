// components/layout/Footer.tsx
import Link from "next/link";

const columns = [
    {
        heading: "Categories",
        links: [
            { label: "PDF Tools", href: "/tools/pdf" },
            { label: "Image Tools", href: "/tools/image" },
            { label: "Developer Tools", href: "/tools/dev" },
            { label: "Finance Tools", href: "/tools/finance" },
            { label: "Resume Tools", href: "/tools/resume" },
            { label: "Social Tools", href: "/tools/social" },
        ],
    },
    {
        heading: "Quick Links",
        links: [
            { label: "All Tools", href: "/tools" },
            { label: "Categories", href: "/categories" },
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
            { label: "Blog", href: "/blog" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Cookie Policy", href: "/cookies" },
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
            <div className="page-container">
                {/* Top section */}
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
                            51 privacy-first tools that run entirely in your browser. No uploads, no accounts, no limits.
                        </p>

                        <div className="footer-socials">
                            {socials.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social"
                                    aria-label={`Visit our ${social.label} profile (opens in new tab)`}
                                >
                                    {social.icon}
                                    <span className="footer-social-label">{social.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="footer-links">
                        {columns.map((column) => (
                            <div key={column.heading} className="footer-column">
                                <h3 className="footer-column-heading">{column.heading}</h3>
                                <ul className="footer-column-links">
                                    {column.links.map((link) => (
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

                {/* Bottom section */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2025 Toolverse. Built with privacy in mind.
                    </p>
                </div>
            </div>
        </footer>
    );
}