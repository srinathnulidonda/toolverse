<div align="center">
  <img src="public/logo-light.png" alt="Toolverse Logo" width="380" />
  <h1>Contributing to Toolverse</h1>
  <p><strong>Thank you for considering contributing to Toolverse! We welcome contributions from the community to help make this privacy-first utility hub even better.</strong></p>

  <div>
    <a href="https://toolverses.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_Site-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="./LICENSE" target="_blank">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
    <a href="https://github.com/srinathnulidonda/toolverse/issues" target="_blank">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge&logo=github" alt="PRs Welcome" />
    </a>
    <a href="https://nextjs.org/" target="_blank">
      <img src="https://img.shields.io/badge/Made%20with-Next.js-000000.svg?logo=nextdotjs" alt="Made with Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg" alt="TypeScript" />
    </a>
  </div>
</div>

<br />

## 📋 Table of Contents

- [🤝 How Can I Contribute?](#how-can-i-contribute)
- [🔧 Development Setup](#development-setup)
- [📥 Pull Request Process](#pull-request-process)
- [📚 Style Guides](#style-guides)
- [🐞 Reporting Bugs](#reporting-bugs)
- [💡 Feature Requests](#feature-requests)
- [📄 License](#license)
- [🎉 Thank You!](#thank-you)

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs
Before submitting a bug report, please check if it has already been reported. When you create a bug report, include as much detail as possible:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings if applicable
- Browser and OS information
- Toolverse version

### ✨ Suggesting Features
Feature requests are welcome! Please check if your idea has already been suggested. When submitting, provide:
- Clear description of the feature and its purpose
- Why it would be useful to users
- Any potential implementation considerations
- Mockups or examples if available

### 📚 Improving Documentation
Help us improve our documentation by:
- Fixing typos or grammatical errors
- Adding clarifications to existing documentation
- Writing tutorials or guides
- Improving code comments and docstrings

### 💻 Contributing Code
Whether it's fixing a bug, adding a new tool, or improving existing functionality, code contributions are greatly appreciated!

---

## 🔧 Development Setup

### 📦 Prerequisites
- Node.js ≥ 18
- 📋 pnpm (recommended) or npm/yarn
- 🔧 Git

### 🚀 Getting Started
```bash
# 1️⃣ Fork the repository on GitHub

# 2️⃣ Clone your fork
git clone https://github.com/your-username/toolverse.git
cd toolverse

# 3️⃣ Install dependencies
pnpm install          # or: npm install / yarn

# 4️⃣ Set up environment variables
cp .env.example .env
# Edit .env if you need to test external service integrations

# 5️⃣ Start the development server
pnpm dev              # Visit http://localhost:3000
```

### 📋 Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run Vitest tests
- `pnpm check` - Run TypeScript compiler (tsc --noEmit)

---

## 📥 Pull Request Process

### 🔄 Step-by-Step Guide
1. **Update your fork** with the latest changes from upstream
2. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes** following our style guides
4. **Test your changes** thoroughly
5. **Lint and format** your code: `pnpm lint && pnpm format`
6. **Commit your changes** using clear, descriptive messages:
   - `feat: add new tool for XYZ`
   - `fix: resolve issue with ABC in DEF tool`
   - `docs: update documentation for GHI`
   - `refactor: simplify JKL component`
   - `test: add tests for MNO feature`
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Open a Pull Request** against the `main` branch of the original repository

### ✅ What Makes a Good PR?
- 🎯 **Single Responsibility**: Each PR should address one issue or feature
- 🧪 **Well Tested**: Include tests for new functionality or bug fixes
- 📚 **Well Documented**: Update documentation as needed
- 🎨 **Follows Style**: Adheres to our coding standards
- 📝 **Clear Description**: PR description explains what, why, and how
- 🔗 **References Issues**: Links to related issues if applicable (`fixes #123`)

---

## 📚 Style Guides

### 💻 Code Style
- Follow the existing code style in the repository
- ESLint and Prettier will automatically catch most style issues
- Run `pnpm lint && pnpm format` before submitting
- Use meaningful variable and function names
- Keep functions focused and small
- Comment complex logic, but strive for self-documenting code

### 📝 Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Code refactoring (no feature change, no bug fix)
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
- `feat: add JWT decoder tool`
- `fix: resolve cookie banner focus trap on Safari`
- `docs: update installation instructions for Windows`
- `refactor: simplify upload zone component logic`
- `perf: optimize image compression algorithm`
- `test: add unit tests for color converter`
- `chore: update dependencies to latest versions`

### 🏗️ Component Structure
When adding new tools or components, follow the established pattern:
```
features/
  [category]/
    [tool-name]/
      [ComponentA].tsx
      [ComponentB].tsx
      ...
      ts/
        [tool]Engine.ts
        [tool]Store.ts
        [tool]PdfGenerator.ts (if applicable)
        [tool]Rules.config.ts
        sampleData.ts
      style/
        [ComponentA].module.css
        [ComponentB].module.css
```

---

## 🐞 Reporting Bugs

Before reporting a bug, please:
1. Check if the issue has already been reported
2. Try to reproduce the issue in the latest version
3. Isolate the problem to the specific tool or feature

When reporting a bug, please include:
- **Clear title** that summarizes the issue
- **Detailed description** of the problem
- **Steps to reproduce** (numbered list)
- **Expected behavior** vs **actual behavior**
- **Screenshots or screen recordings** (if applicable)
- **Environment details**:
  - Toolverse version (from footer or about page)
  - Browser and version (Chrome/Firefox/Safari/Edge)
  - Operating system and version
  - Device type (desktop/mobile/tablet)
- **Any error messages** from browser console (DevTools → Console)

---

## 💡 Feature Requests

When requesting a new feature, please consider:
- Does this align with Toolverse's privacy-first mission?
- Is this better suited as a client-side tool?
- Are there similar tools already in the application?
- How would users discover and access this feature?

Please include in your request:
- **Clear title** describing the feature
- **Detailed explanation** of what the feature does
- **Use cases** and **benefits** to users
- **Any dependencies** or considerations
- **Mockups, sketches, or examples** (if available)
- **Priority** (nice-to-have vs essential)

---

## 📄 License

By contributing to Toolverse, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Your contributions help make Toolverse better for everyone. Whether you're fixing a typo, adding a new tool, or improving documentation, we appreciate your effort!

Have questions? Feel free to ask in your pull request or open an issue for discussion.

Happy coding! 🚀