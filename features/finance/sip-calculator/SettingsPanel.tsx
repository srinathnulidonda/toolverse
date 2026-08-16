// features/finance/sip-calculator/SettingsPanel.tsx
"use client";
import styles from "./style/SettingsPanel.module.css";

const RETURN_RANGES = [
  { label: "Debt Funds", value: "6% – 9% p.a.", icon: "ti-shield-check" },
  { label: "Hybrid Funds", value: "8% – 12% p.a.", icon: "ti-scale" },
  { label: "Equity Funds", value: "10% – 15% p.a.", icon: "ti-chart-line" },
  { label: "Small Cap Funds", value: "12% – 18% p.a.", icon: "ti-rocket" },
];

const SIP_CONCEPTS = [
  {
    icon: "ti-repeat",
    title: "Regular SIP",
    text: "Invest a fixed amount every month regardless of market conditions, benefiting from rupee-cost averaging.",
    tag: "Disciplined",
  },
  {
    icon: "ti-trending-up",
    title: "Step-Up SIP",
    text: "Increase your SIP contribution every year in line with your income growth to build wealth faster.",
    tag: "Growth",
  },
  {
    icon: "ti-target",
    title: "Goal-Based SIP",
    text: "Work backwards from a target corpus to find the monthly SIP required to reach your financial goal.",
    tag: "Planning",
  },
];

export function SettingsPanel() {
  return (
    <div className={styles.sipSettings} role="region" aria-label="Settings">
      <div className={styles.sipSettingsInner}>
        <div className={styles.sipSettingsSection}>
          <h3 className={styles.sipSettingsHeading}>
            <i className="ti ti-chart-pie" aria-hidden="true" />
            Typical SIP Return Ranges
          </h3>
          <p className={styles.sipSettingsDesc}>
            Indicative annual return ranges by fund category. Actual returns depend on market performance.
          </p>

          <div className={styles.sipRangeGrid}>
            {RETURN_RANGES.map((r) => (
              <div key={r.label} className={styles.sipRangeCard}>
                <span className={styles.sipRangeIcon}>
                  <i className={`ti ${r.icon}`} aria-hidden="true" />
                </span>
                <div className={styles.sipRangeText}>
                  <strong>{r.label}</strong>
                  <span>{r.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sipSettingsSection}>
          <h3 className={styles.sipSettingsHeading}>
            <i className="ti ti-bulb" aria-hidden="true" />
            SIP Strategies Explained
          </h3>

          <div className={styles.sipConceptGrid}>
            {SIP_CONCEPTS.map((c) => (
              <div key={c.title} className={styles.sipConceptCard}>
                <div className={styles.sipConceptHeader}>
                  <i className={`ti ${c.icon}`} aria-hidden="true" />
                  <strong>{c.title}</strong>
                </div>
                <p className={styles.sipConceptText}>{c.text}</p>
                <span className={styles.sipConceptTag}>{c.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sipSettingsSection}>
          <h3 className={styles.sipSettingsHeading}>
            <i className="ti ti-info-circle" aria-hidden="true" />
            Good to Know
          </h3>
          <div className={styles.sipNotice}>
            <i className="ti ti-alert-triangle" aria-hidden="true" />
            <span>
              Mutual fund investments are subject to market risks. Past performance is not indicative of
              future returns. Please read all scheme-related documents carefully before investing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}