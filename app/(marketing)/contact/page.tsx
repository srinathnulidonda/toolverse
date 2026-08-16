// app/(marketing)/contact/page.tsx
import Link from "next/link";
import { contactMethods } from "./data";
import styles from "./Contact.module.css";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Toolverse",
  description: "Get in touch with the Toolverse team – we're here to help.",
};

export default function ContactPage() {
  return (
    <div className={styles.contactPage}>
      {/* Hero */}
      <section className={styles.contactHero}>
        <div className={styles.container}>
          <div className={styles.contactHeroContent}>
            <div className={styles.contactHeroBadge}>
              <i className="ti ti-message-circle" />
              <span>Get in Touch</span>
            </div>
            <h1 className={styles.contactHeroTitle}>Let's start a conversation</h1>
            <p className={styles.contactHeroDescription}>
              Whether you have a question, feedback, or just want to say hello—we're here and
              happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content — Grid Layout (Methods + Form side by side) */}
      <section className={styles.contactMain}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {/* Contact Methods Column */}
            <div className={styles.methodsColumn}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Choose your channel</h2>
                <p className={styles.sectionSubtitle}>Pick the way that works best for you</p>
              </div>

              <div className={styles.contactMethodsList}>
                {contactMethods.map((method, i) => (
                  <a
                    key={i}
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={styles.contactMethodCard}
                  >
                    <div className={styles.methodIconSmall}>
                      <i className={`ti ${method.icon}`} />
                    </div>
                    <div className={styles.methodInfo}>
                      <h3 className={styles.methodTitleSmall}>{method.title}</h3>
                      <div className={styles.methodMetaRow}>
                        <span className={styles.methodValueSmall}>{method.value}</span>
                        <span className={styles.methodAvailabilitySmall}>
                          <i className="ti ti-clock" />
                          {method.availability}
                        </span>
                      </div>
                    </div>
                    <i className={`ti ti-arrow-right ${styles.methodArrow}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Form Column */}
            <div className={styles.formColumn}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Help Section — Same as About page */}
      <section className={styles.helpSection}>
        <div className={styles.container}>
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>
              <i className="ti ti-help-circle" />
            </div>
            <div className={styles.helpContent}>
              <h3 className={styles.helpTitle}>Still have questions?</h3>
              <p className={styles.helpText}>
                Check our FAQ for common questions, or learn more about how Toolverse works.
              </p>
            </div>
            <div className={styles.helpActions}>
              <Link href="/faq" className={styles.helpLinkSecondary}>
                View FAQ
              </Link>
              <Link href="/about" className={styles.helpLinkPrimary}>
                Learn More
                <i className="ti ti-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}