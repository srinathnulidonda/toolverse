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

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="page-container">
          {/* Top section */}
          <div className="footer-top">
            {/* Brand column */}
            <div className="footer-brand">
              <Link href="/" className="footer-logo" aria-label="Toolverse home">
                <img src="/logo-light.png" alt="Toolverse" className="footer-logo-image" />
              </Link>

              <p className="footer-description">
                51 privacy-first tools that run entirely in your browser. No uploads, no accounts,
                no limits.
              </p>

              <div className="footer-socials">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social"
                    title={social.label}
                    aria-label={`Visit our ${social.label} profile (opens in new tab)`}
                  >
                    {social.icon}
                    <span className="sr-only">{social.label}</span>
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
            <p className="footer-copyright">© 2026 Toolverse. Built with privacy in mind.</p>

            <nav className="footer-legal" aria-label="Legal">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="footer-legal-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>

      <style>{`
        .footer {
          background-color: var(--bg-card);
          border-top: 0.5px solid var(--border-faint);
        }

        .footer .page-container {
          max-width: var(--max-width-wide);
        }

        .footer-top {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 80px;
          padding: 56px 0 32px;
          align-items: start;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .footer-logo-image {
          height: 32px;
          width: auto;
          object-fit: contain;
        }

        .footer-description {
          color: var(--text-tertiary);
          font-size: 0.8125rem;
          line-height: 1.6;
          max-width: 260px;
        }

        .footer-socials {
          display: flex;
          gap: 8px;
        }

        .footer-social {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 0.5px solid var(--border);
          color: var(--text-tertiary);
          text-decoration: none;
          transition: color 0.15s, background 0.15s, border-color 0.15s;
        }

        .footer-social:hover {
          color: var(--text);
          background: var(--bg-surface);
          border-color: var(--border-faint);
          text-decoration: none;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .footer-column-heading {
          color: var(--text-tertiary);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .footer-column-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link {
          display: inline-block;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8125rem;
          transition: color 0.15s, transform 0.15s;
        }

        .footer-link:hover {
          color: var(--text);
          text-decoration: none;
          transform: translateX(2px);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 10px 0 14px 0;
          border-top: 0.5px solid var(--border-faint);
          font-size: 0.8125rem;
          color: var(--text-tertiary);
        }

        .footer-copyright {
          color: var(--text-tertiary);
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .footer-legal-link {
          color: var(--text-tertiary);
          font-size: 0.8125rem;
          text-decoration: none;
          transition: color 0.15s;
        }

        .footer-legal-link:hover {
          color: var(--text);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 40px 0 28px;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px 24px;
          }

          .footer-description {
            max-width: 320px;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 4px;
            padding: 8px 0 12px 0;
          }

          .footer-legal {
            justify-content: center;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-top {
            grid-template-columns: 200px 1fr;
            gap: 36px;
          }
          .footer-links {
            gap: 24px;
          }
        }

        @media (min-width: 1025px) and (max-width: 1400px) {
          .footer-top {
            grid-template-columns: 240px 1fr;
            gap: 56px;
          }
          .footer-links {
            gap: 32px;
          }
        }

        @media (max-width: 420px) {
          .footer-links {
            grid-template-columns: 1fr 1fr;
            gap: 24px 14px;
          }
        }
      `}</style>
    </>
  );
}