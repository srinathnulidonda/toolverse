<div align="center">
  <img src="public/logo.png" alt="Toolverse Logo" width="380" />
  <h1>Toolverse</h1>
  <p><strong>A free, privacy-first utility hub — 50+ browser-based tools for PDF, image, developer, finance, resume, and social tasks. No sign-up. No uploads. No limits.</strong></p>

  <div>
    <a href="https://toolverses.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_Site-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="#readme" target="_blank">
      <img src="https://img.shields.io/badge/Documentation-Read_Docs-blue?style=for-the-badge&logo=readthedocs" alt="Documentation" />
    </a>
    <a href="https://github.com/srinathnulidonda/toolverse/issues" target="_blank">
      <img src="https://img.shields.io/badge/Report_Bug-Open_Issue-red?style=for-the-badge&logo=github" alt="Report Bug" />
    </a>
    <a href="https://github.com/srinathnulidonda/toolverse/issues" target="_blank">
      <img src="https://img.shields.io/badge/Request_Feature-Open_Issue-yellow?style=for-the-badge&logo=github" alt="Request Feature" />
    </a>
  </div>
</div>

<br />

<details>
  <summary><h3>Table of Contents</h3></summary>

  - [About](#about)
  - [Features](#features)
  - [Tool Categories](#tool-categories)
  - [Built-In Productivity Widget](#built-in-productivity-widget)
  - [Tech Stack](#tech-stack)
  - [Screenshots](#screenshots)
  - [Quick Start](#quick-start)
  - [Usage Examples](#usage-examples)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact & Support](#contact--support)
  - [Acknowledgments](#acknowledgments)

</details>

## About

Toolverse is a free utility platform for people who want things done fast without giving up their data. Every tool — from PDF compression to JSON formatting — runs entirely in your browser using modern JavaScript and WebAssembly. No file ever touches a server, no account is required, and there are no artificial usage limits.

Whether you're a developer, designer, student, or business professional, Toolverse gives you instant access to 50+ production-grade tools in one place.

## Features

- **Privacy-first** — 100% client-side processing; files never leave your device
- **Instant and fast** — built on the Next.js App Router with optimized, on-demand rendering
- **No sign-up, no limits** — every tool is free forever, with zero registration walls
- **Built-in task and notes widget** — a floating, draggable productivity widget available on every page
- **Installable as a PWA** — works offline once loaded, with a full app manifest
- **Light and dark mode** — automatic theme detection based on system preference
- **Accessible by design** — skip-to-content links, semantic HTML, keyboard-friendly navigation
- **Structured for search** — JSON-LD metadata, dynamic sitemap, and canonical URLs
- **Open source** — fully transparent codebase, open for review and contribution

## Tool Categories

Toolverse organizes 50+ tools into six focused categories:

| Category | Tools | Description |
|---|---|---|
| PDF | 9 tools | Compress, merge, split, convert, and rotate PDFs |
| Image | 8 tools | Compress, resize, convert, crop, and remove backgrounds |
| Developer | 24 tools | JSON utilities, formatters, validators, generators, converters |
| Finance | 10 tools | GST, EMI, SIP, tax calculators, currency converter |
| Resume | 5 tools | Resume builder, checker, cover letter, LinkedIn summary |
| Social | 4 tools | QR codes, meta tags, hashtag generator, tweet cards |

Browse the full list at [`/tools`](https://toolverses.vercel.app/tools) or explore by category.

## Built-In Productivity Widget

Every page on Toolverse includes a floating widget so you never have to leave your workflow to jot something down:

- Tasks with priority levels and quick search
- Notes and checklists with autosave
- Draggable — position it anywhere on screen
- Keyboard shortcut — press `Cmd+K` / `Ctrl+K` to open instantly
- Stored locally — nothing is ever synced to a server

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Icons:** [Tabler Icons](https://tabler.io/icons)
- **Deployment:** [Vercel](https://vercel.com/)

## Screenshots

<div align="center">
  <img src=".github/assets/screenshots/home.png" alt="Toolverse Home Page" width="800" />
  <p><em>Toolverse Home Page</em></p>
</div>

<div align="center">
  <img src=".github/assets/screenshots/qr-generator.png" alt="QR Code Generator Tool" width="400" />
  <img src=".github/assets/screenshots/html-formatter.png" alt="HTML Formatter Tool" width="400" />
  <p><em>QR Code Generator (left) and HTML Formatter (right)</em></p>
</div>

<div align="center">
  <img src=".github/assets/screenshots/gst-calculator.png" alt="GST Calculator Tool" width="400" />
  <p><em>GST Calculator in action</em></p>
</div>

<details>
  <summary><h3>Quick Start</h3></summary>

  ### Prerequisites

  - Node.js ≥ 18
  - pnpm (recommended) or npm/yarn

  ### Installation

  ```bash
  # Clone the repository
  git clone https://github.com/srinathnulidonda/toolverse.git
  cd toolverse

  # Install dependencies
  pnpm install          # or npm install / yarn

  # Start the development server
  pnpm dev              # http://localhost:3000
  ```

  ### Environment Variables

  Create a `.env.local` file in the project root:

  ```bash
  NEXT_PUBLIC_APP_URL=https://toolverses.vercel.app
  ```

  ### Production Build

  ```bash
  # Build for production
  pnpm build

  # Run the built app
  pnpm start
  ```

</details>

<details>
  <summary><h3>Usage Examples</h3></summary>

  ### Developer Tools

  ```bash
  pnpm dev
  # Format JSON          → /tools/json-formatter
  # Generate passwords   → /tools/password-generator
  # Convert timestamps   → /tools/timestamp-converter
  ```

  ### Finance Tools

  ```bash
  # Calculate GST         → /tools/gst-calculator
  # Generate invoices     → /tools/gst-invoice-generator
  # Calculate EMI         → /tools/emi-calculator
  ```

  ### PDF Tools

  ```bash
  # Merge PDFs            → /tools/pdf-merger
  # Compress PDFs         → /tools/pdf-compressor
  # Split PDFs            → /tools/pdf-splitter
  ```

</details>

<details>
  <summary><h3>Contributing</h3></summary>

  Contributions are welcome. To get started:

  1. **Fork** the repository
  2. **Create** your feature branch — `git checkout -b feature/amazing-feature`
  3. **Make** your changes
  4. **Lint and format** — `pnpm lint && pnpm format`
  5. **Test** — `pnpm test`
  6. **Commit** — `git commit -m "Add amazing feature"`
  7. **Push** — `git push origin feature/amazing-feature`
  8. **Open a Pull Request**

  ### Development Guidelines

  - Follow existing code style (ESLint + Prettier)
  - Use TypeScript strictly — avoid `any`
  - Keep components small and focused
  - Ensure accessibility compliance (WCAG 2.1)
  - Optimize for performance — minimize unnecessary re-renders

  ### Reporting Issues

  Use [GitHub Issues](https://github.com/srinathnulidonda/toolverse/issues) and include:

  - A clear description of the issue
  - Steps to reproduce
  - Expected vs. actual behavior
  - Screenshots, if applicable
  - Browser and OS details

</details>


## Contact & Support

- **Questions or bugs?** Open an [issue](https://github.com/srinathnulidonda/toolverse/issues) or email srinathnulidonda@gmail.com
- **Tool help?** Each tool page includes its own usage instructions
- **FAQ:** Visit [`/faq`](https://toolverses.vercel.app/faq) for common questions

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons by [Tabler Icons](https://tabler.io/icons)
- Inspired by the open-source developer tools community
- Thanks to all contributors and users

<div align="center">
  <sub>Built with care by <a href="https://github.com/srinathnulidonda">Srinath Nulidonda</a></sub>
</div>