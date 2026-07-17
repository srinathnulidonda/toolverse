// app/(marketing)/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import styles from "./Contact.module.css";

interface ContactFormProps {
  // No props needed for now
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Form Section */}
      <div className={styles.contactFormSection}>
        <div className={styles.formSectionWrapper}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <p className={styles.formSubtitle}>
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label
                  htmlFor="name"
                  className={`${styles.formLabel} ${
                    focusedField === "name" || formData.name ? styles.active : ""
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
                  className={`${styles.formLabel} ${
                    focusedField === "email" || formData.email ? styles.active : ""
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
                className={`${styles.formLabel} ${
                  focusedField === "subject" || formData.subject ? styles.active : ""
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
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Product Feedback</option>
                  <option value="other">Something Else</option>
                </select>
              </div>
            </div>

            <div className={styles.formField}>
              <label
                htmlFor="message"
                className={`${styles.formLabel} ${
                  focusedField === "message" || formData.message ? styles.active : ""
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
                className={`${styles.formSubmit} ${status === "success" ? styles.success : ""}`}
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
                      We'll review your message and get back to you within 24-48 hours.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}