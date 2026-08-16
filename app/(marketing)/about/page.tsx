// app/(marketing)/about/page.tsx
import Link from "next/link";
import { TOOLS } from "@/lib/tools";
import { values, features, useCases, widgetFeatures } from "./data";
import styles from "./About.module.css";

export const metadata = {
  title: "About Toolverse — Privacy-First Productivity Platform",
  description:
    "Learn how Toolverse is revolutionizing online tools with browser-based processing, zero data collection, and unlimited free access to professional utilities.",
  openGraph: {
    title: "About Toolverse — Privacy-First Productivity Platform",
    description:
      "Discover our mission to make powerful tools accessible to everyone, with complete privacy and zero barriers.",
    type: "website",
  },
};

export default function AboutPage() {
  const toolCount = TOOLS.length;

  return (
    <div className={styles.aboutPage}>
      {/* Hero */}
      <section className={styles.aboutHero}>
        <div className={styles.container}>
          <div className={styles.aboutHeroContent}>
            <h1 className={styles.aboutHeroTitle}>
              The privacy-first toolkit
              <br />
              <span className={styles.heroAccentText}>for everyday work</span>
            </h1>

            <p className={styles.aboutHeroDescription}>
              {toolCount}+ browser-based tools for PDFs, images, code, finance, and resumes.
              Nothing is uploaded, nothing is tracked — everything runs locally on your device.
            </p>

            <div className={styles.aboutHeroActions}>
              <Link href="/tools" className={styles.heroBtnPrimary}>
                <i className="ti ti-apps" />
                Explore {toolCount}+ Tools
                <i className="ti ti-arrow-right" />
              </Link>
              <a
                href="https://github.com/srinathnulidonda/toolverse"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroBtnSecondary}
              >
                <i className="ti ti-brand-github" />
                Star on GitHub
              </a>
            </div>

            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <i className="ti ti-user-off" />
                <span>No sign-up</span>
              </div>
              <div className={styles.trustItem}>
                <i className="ti ti-cloud-off" />
                <span>No uploads</span>
              </div>
              <div className={styles.trustItem}>
                <i className="ti ti-code" />
                <span>Open source</span>
              </div>
              <div className={styles.trustItem}>
                <i className="ti ti-infinity" />
                <span>Free forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <div className={styles.missionContent}>
              <div className={styles.missionBadge}>
                <i className="ti ti-target" />
                Our Mission
              </div>
              <h2 className={styles.missionTitle}>
                Making professional tools accessible to everyone, everywhere
              </h2>
              <p className={styles.missionDescription}>
                We believe powerful productivity tools shouldn't be locked behind paywalls,
                require account creation, or compromise your privacy. Toolverse processes
                everything locally in your browser using cutting-edge WebAssembly and modern
                APIs—delivering professional-grade results without ever touching our servers.
              </p>
              <div className={styles.missionMetrics}>
                <div className={styles.missionMetric}>
                  <strong>100%</strong>
                  <span>Client-side processing</span>
                </div>
                <div className={styles.missionMetric}>
                  <strong>0 bytes</strong>
                  <span>Data collected</span>
                </div>
                <div className={styles.missionMetric}>
                  <strong>∞</strong>
                  <span>Usage limits</span>
                </div>
              </div>
            </div>

            <div className={styles.missionVisual}>
              <div className={styles.visualCard}>
                <div className={styles.visualCardHeader}>
                  <div className={styles.visualCardDots}>
                    <span className={styles.dotRed} />
                    <span className={styles.dotYellow} />
                    <span className={styles.dotGreen} />
                  </div>
                  <span className={styles.visualCardTitle}>Your Browser</span>
                </div>
                <div className={styles.visualCardBody}>
                  <div className={styles.processFlow}>
                    <div className={styles.flowStep}>
                      <i className="ti ti-file-upload" />
                      <span>Select File</span>
                    </div>
                    <div className={styles.flowArrow}>
                      <i className="ti ti-arrow-right" />
                    </div>
                    <div className={styles.flowStep}>
                      <i className="ti ti-cpu" />
                      <span>Process Locally</span>
                    </div>
                    <div className={styles.flowArrow}>
                      <i className="ti ti-arrow-right" />
                    </div>
                    <div className={styles.flowStep}>
                      <i className="ti ti-download" />
                      <span>Download Result</span>
                    </div>
                  </div>
                  <div className={styles.flowNote}>
                    <i className="ti ti-shield-check" />
                    <span>Your files never leave your device</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Widget showcase */}
      <section className={styles.widgetSection}>
        <div className={styles.container}>
          <div className={styles.widgetGrid}>
            <div className={styles.widgetVisual}>
              <div className={styles.widgetMockup}>
                <div className={styles.widgetMockupHeader}>
                  <span className={`${styles.widgetTab} ${styles.widgetTabActive}`}>
                    <i className="ti ti-checklist" />
                    Tasks
                  </span>
                  <span className={styles.widgetTab}>
                    <i className="ti ti-notes" />
                    Notes
                  </span>
                </div>
                <div className={styles.widgetMockupBody}>
                  <div className={styles.widgetTaskRow}>
                    <span className={styles.widgetCheckbox} />
                    <span className={styles.widgetTaskText}>Review Q3 budget report</span>
                    <span className={`${styles.priorityDot} ${styles.priorityHigh}`} />
                  </div>
                  <div className={styles.widgetTaskRow}>
                    <span className={`${styles.widgetCheckbox} ${styles.checked}`}>
                      <i className="ti ti-check" />
                    </span>
                    <span className={`${styles.widgetTaskText} ${styles.done}`}>
                      Compress presentation images
                    </span>
                    <span className={`${styles.priorityDot} ${styles.priorityLow}`} />
                  </div>
                  <div className={styles.widgetTaskRow}>
                    <span className={styles.widgetCheckbox} />
                    <span className={styles.widgetTaskText}>Generate invoice for client</span>
                    <span className={`${styles.priorityDot} ${styles.priorityMedium}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.widgetContent}>
              <div className={styles.missionBadge}>
                <i className="ti ti-layout-bottombar-expand" />
                Built-In Widget
              </div>
              <h2 className={styles.missionTitle}>
                Stay organized while you work — no extra app needed
              </h2>
              <p className={styles.missionDescription}>
                Every page includes a floating widget for quick tasks and notes. Jot down ideas,
                track your to-dos, and keep checklists — all saved locally to your browser, right
                alongside the tool you're using.
              </p>
              <ul className={styles.widgetFeatureList}>
                {widgetFeatures.map((f, i) => (
                  <li key={i} className={styles.widgetFeatureItem}>
                    <i className={`ti ${f.icon}`} />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.aboutValues}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <i className="ti ti-heart" />
              Our Principles
            </div>
            <h2 className={styles.sectionTitle}>Six core values that guide every decision</h2>
            <p className={styles.sectionDescription}>
              Built on a foundation of privacy, performance, and accessibility
            </p>
          </div>

          <div className={styles.valuesGrid}>
            {values.map((value, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueHeader}>
                  <div className={styles.valueIconWrapper}>
                    <i className={`ti ${value.icon}`} />
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                </div>
                <p className={styles.valueDescription}>{value.description}</p>
                <div className={styles.valueFooter}>
                  <span className={styles.valueTag}>{value.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={styles.useCasesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <i className="ti ti-users" />
              Who Uses Toolverse
            </div>
            <h2 className={styles.sectionTitle}>Trusted by professionals across industries</h2>
            <p className={styles.sectionDescription}>
              From developers to designers, students to enterprises
            </p>
          </div>

          <div className={styles.useCasesGrid}>
            {useCases.map((useCase, i) => (
              <div key={i} className={styles.useCaseCard}>
                <div className={styles.useCaseHeader}>
                  <div className={styles.useCaseIconWrapper}>
                    <i className={`ti ${useCase.icon}`} />
                  </div>
                  <h3 className={styles.useCaseTitle}>{useCase.title}</h3>
                </div>
                <p className={styles.useCaseDescription}>{useCase.description}</p>
                <div className={styles.useCaseTools}>
                  <span className={styles.useCaseToolsLabel}>Popular tools</span>
                  <div className={styles.useCaseToolsList}>
                    {useCase.tools.map((tool, j) => (
                      <span key={j} className={styles.useCaseTool}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <i className="ti ti-chart-bar" />
              Why Choose Toolverse
            </div>
            <h2 className={styles.sectionTitle}>See how we compare</h2>
            <p className={styles.sectionDescription}>
              We're not just another online tool platform—we're different by design
            </p>
          </div>

          <div className={styles.comparisonWrap}>
            <div className={styles.comparisonCard}>
              <div className={styles.comparisonHead}>
                <div className={styles.comparisonHeadCell}>
                  <span className={styles.comparisonHeadLabel}>Feature</span>
                </div>
                <div className={`${styles.comparisonHeadCell} ${styles.comparisonHeadActive}`}>
                  <span className={styles.comparisonBrand}>Toolverse</span>
                  <span className={styles.comparisonBadge}>Recommended</span>
                </div>
                <div className={styles.comparisonHeadCell}>
                  <span className={styles.comparisonOtherLabel}>Other Tools</span>
                </div>
              </div>

              <div className={styles.comparisonBody}>
                {features.map((feature, i) => (
                  <div key={i} className={styles.comparisonRow}>
                    <div className={styles.comparisonCell}>
                      <span className={styles.featureName}>{feature.name}</span>
                    </div>
                    <div className={`${styles.comparisonCell} ${styles.comparisonCellActive}`}>
                      {feature.toolverse === true ? (
                        <i className={`ti ti-check ${styles.iconCheck}`} />
                      ) : (
                        <span className={styles.featureValueStrong}>{feature.toolverse}</span>
                      )}
                    </div>
                    <div className={styles.comparisonCell}>
                      {feature.others === false ? (
                        <i className={`ti ti-x ${styles.iconCross}`} />
                      ) : (
                        <span className={styles.featureValue}>{feature.others}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className={styles.openSourceSection}>
        <div className={styles.container}>
          <div className={styles.openSourceContent}>
            <div className={styles.openSourceBadge}>
              <i className="ti ti-code" />
              Open Source
            </div>
            <h2 className={styles.openSourceTitle}>Built in the open, for everyone</h2>
            <p className={styles.openSourceDescription}>
              Toolverse is 100% open source. View our code, contribute features, report bugs, or
              fork it for your own use. We believe in transparency and community-driven
              development.
            </p>
            <div className={styles.openSourceActions}>
              <a
                href="https://github.com/srinathnulidonda/toolverse"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openSourceBtn}
              >
                <i className="ti ti-brand-github" />
                View on GitHub
              </a>
              <a
                href="https://github.com/srinathnulidonda/toolverse/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openSourceBtnSecondary}
              >
                Contributing Guide
                <i className="ti ti-external-link" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.aboutCTA}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to work smarter?</h2>
            <p className={styles.ctaDescription}>
              No sign-up required. No file uploads. Just powerful tools that work instantly in
              your browser, completely free—forever.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/tools" className={styles.ctaPrimaryButton}>
                Browse All Tools
                <i className="ti ti-arrow-right" />
              </Link>
              <Link href="/categories" className={styles.ctaSecondaryButton}>
                Explore by Category
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Help */}
      <section className={styles.helpSection}>
        <div className={styles.container}>
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>
              <i className="ti ti-help-circle" />
            </div>
            <div className={styles.helpContent}>
              <h3 className={styles.helpTitle}>Still have questions?</h3>
              <p className={styles.helpText}>
                Check our FAQ for common questions, or reach out to us directly.
              </p>
            </div>
            <div className={styles.helpActions}>
              <Link href="/faq" className={styles.helpLinkSecondary}>
                View FAQ
              </Link>
              <Link href="/contact" className={styles.helpLinkPrimary}>
                Contact Us
                <i className="ti ti-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}