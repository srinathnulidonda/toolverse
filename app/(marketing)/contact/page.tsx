// app/(marketing)/contact/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { contactMethods, quickLinks } from "./data";
import styles from "./Contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1800));

    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setStatus("idle"), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.contactHero}>
        <div className={styles.contactHeroContainer}>
          <div className={styles.contactHeroContent}>
            <div className={styles.contactHeroBadge}>
              <i className="ti ti-message-circle" />
              <span>Get in Touch</span>
            </div>
            <h1 className={styles.contactHeroTitle}>
              Let's start a conversation
            </h1>
            <p className={styles.contactHeroDescription}>
              Whether you have a question, feedback, or just want to say
              hello—we're here and happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.contactMain}>
        <div className={styles.contactMainContainer}>
          {/* Contact Methods Grid */}
          <div className={styles.contactMethodsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Choose your channel</h2>
              <p className={styles.sectionSubtitle}>
                Pick the way that works best for you
              </p>
            </div>

            <div className={styles.contactMethodsGrid}>
              {contactMethods.map((method, i) => (
                <a
                  key={i}
                  href={method.href}
                  target={
                    method.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    method.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={styles.contactMethodCard}
                >
                  <div className={styles.methodCardHeader}>
                    <div className={styles.methodIcon}>
                      <i className={`ti ${method.icon}`} />
                    </div>
                    <div className={styles.methodContent}>
                      <h3 className={styles.methodTitle}>{method.title}</h3>
                      <p className={styles.methodDescription}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <div className={styles.methodCardBody}>
                    <div className={styles.methodValue}>{method.value}</div>
                    <div className={styles.methodAvailability}>
                      <i className="ti ti-clock" />
                      {method.availability}
                    </div>
                  </div>
                  <div className={styles.methodCardFooter}>
                    <span className={styles.methodCta}>
                      Get started
                      <i className="ti ti-arrow-right" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className={styles.contactFormSection}>
            <div className={styles.formSectionWrapper}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Send us a message</h2>
                <p className={styles.formSubtitle}>
                  Fill out the form below and we'll get back to you within 24
                  hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label
                      htmlFor="name"
                      className={`${styles.formLabel} ${focusedField === "name" || formData.name
                        ? styles.active
                        : ""
                        }`}
                    >
                      Full Name
                    </label>
                    <div className={styles.formInputWrapper}>
                      <i className="ti ti-user" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={styles.formInput}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <label
                      htmlFor="email"
                      className={`${styles.formLabel} ${focusedField === "email" || formData.email
                        ? styles.active
                        : ""
                        }`}
                    >
                      Email Address
                    </label>
                    <div className={styles.formInputWrapper}>
                      <i className="ti ti-mail" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={styles.formInput}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label
                    htmlFor="subject"
                    className={`${styles.formLabel} ${focusedField === "subject" || formData.subject
                      ? styles.active
                      : ""
                      }`}
                  >
                    Subject
                  </label>
                  <div className={styles.formInputWrapper}>
                    <i className="ti ti-tag" />
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`${styles.formInput} ${styles.formSelect}`}
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="partnership">
                        Partnership Opportunity
                      </option>
                      <option value="feedback">Product Feedback</option>
                      <option value="other">Something Else</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label
                    htmlFor="message"
                    className={`${styles.formLabel} ${focusedField === "message" || formData.message
                      ? styles.active
                      : ""
                      }`}
                  >
                    Message
                  </label>
                  <div className={styles.formInputWrapper}>
                    <i className="ti ti-message-2" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      required
                      rows={6}
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder="Tell us more about how we can help..."
                    />
                  </div>
                </div>

                <div className={styles.formFooter}>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={`${styles.formSubmit} ${status === "success" ? styles.success : ""
                      }`}
                  >
                    {status === "sending" && (
                      <>
                        <i className={`ti ti-loader ${styles.spinner}`} />
                        Sending message...
                      </>
                    )}
                    {status === "success" && (
                      <>
                        <i className="ti ti-circle-check" />
                        Message sent successfully!
                      </>
                    )}
                    {(status === "idle" || status === "error") && (
                      <>
                        Send message
                        <i className="ti ti-send" />
                      </>
                    )}
                  </button>

                  {status === "success" && (
                    <div className={styles.successMessage}>
                      <div className={styles.successIcon}>
                        <i className="ti ti-check" />
                      </div>
                      <div className={styles.successContent}>
                        <strong>Thanks for reaching out!</strong>
                        <span>
                          We'll review your message and get back to you within
                          24-48 hours.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.quickLinksSection}>
            <h3 className={styles.quickLinksTitle}>Quick Links</h3>
            <div className={styles.quickLinksGrid}>
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.href} className={styles.quickLinkCard}>
                  <i className={`ti ${link.icon}`} />
                  <span>{link.label}</span>
                  <i className="ti ti-arrow-right" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compact Elite CTA */}
      <section className={styles.contactFooterCta}>
        <div className={styles.footerCtaContainer}>
          <div className={styles.footerCtaContent}>
            <div className={styles.ctaMainContent}>
              <div className={styles.ctaHeader}>
                <div className={styles.ctaEyebrow}>
                  <i className="ti ti-help-circle" />
                  Help Center
                </div>
                <h2 className={styles.footerCtaTitle}>
                  Find answers instantly in our FAQ
                </h2>
                <p className={styles.footerCtaDescription}>
                  Browse our comprehensive knowledge base with detailed solutions to common questions. Most issues resolved in under 2 minutes.
                </p>
              </div>

              <div className={styles.ctaMainActions}>
                <Link href="/faq" className={styles.ctaPrimaryButton}>
                  Browse FAQ
                  <i className="ti ti-arrow-right" />
                </Link>
                <Link href="/about" className={styles.ctaSecondaryButton}>
                  Learn More
                </Link>
              </div>
            </div>

            <div className={styles.ctaVisualPanel}>
              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-search" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Smart Search</h3>
                  <p className={styles.ctaFeatureText}>Find what you need instantly</p>
                </div>
              </div>

              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-category" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Organized Topics</h3>
                  <p className={styles.ctaFeatureText}>Browse by category</p>
                </div>
              </div>

              <div className={styles.ctaFeature}>
                <div className={styles.ctaFeatureIcon}>
                  <i className="ti ti-clock-check" />
                </div>
                <div className={styles.ctaFeatureContent}>
                  <h3 className={styles.ctaFeatureTitle}>Always Updated</h3>
                  <p className={styles.ctaFeatureText}>Fresh content daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}