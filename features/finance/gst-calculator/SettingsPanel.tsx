// features/finance/gst-calculator/SettingsPanel.tsx
"use client";

import { GST_SLABS, GST_CALCULATION_RULES, CESS_CATEGORIES } from "./ts/gstRules.config";
import styles from "./style/SettingsPanel.module.css";

type SettingsPanelProps = {
  onClose?: () => void;
};

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className={styles.gstSettings} role="region" aria-label="Settings">
      <div className={styles.gstSettingsInner}>
        <div className={styles.gstSettingsSection}>
          <h3 className={styles.gstSettingsHeading}>
            <i className="ti ti-percentage" aria-hidden="true" />
            Standard GST Rates
          </h3>
          <p className={styles.gstSettingsDesc}>
            Current GST slabs applicable in India as per latest tax structure
          </p>

          <div className={styles.gstRateGrid}>
            {GST_SLABS.map((slab) => (
              <div key={slab.rate} className={styles.gstRateCard}>
                <div className={styles.gstRateBadge}>{slab.rate}%</div>
                <p className={styles.gstRateDesc}>{slab.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.gstSettingsSection}>
          <h3 className={styles.gstSettingsHeading}>
            <i className="ti ti-alert-circle" aria-hidden="true" />
            Cess Categories
          </h3>
          <p className={styles.gstSettingsDesc}>
            Additional cess applicable on specific goods beyond standard GST
          </p>

          <div className={styles.gstCessList}>
            {CESS_CATEGORIES.map((category) => (
              <div key={category.id} className={styles.gstCessItem}>
                <div className={styles.gstCessHeader}>
                  <strong>{category.label}</strong>
                  {category.commonRate > 0 && (
                    <span className={styles.gstCessRate}>{category.commonRate}% cess</span>
                  )}
                </div>
                <p className={styles.gstCessNote}>{category.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.gstSettingsSection}>
          <h3 className={styles.gstSettingsHeading}>
            <i className="ti ti-book" aria-hidden="true" />
            Calculation Rules Reference
          </h3>

          <div className={styles.gstRulesGrid}>
            <div className={styles.gstRuleCard}>
              <div className={styles.gstRuleHeader}>
                <i className="ti ti-plus" aria-hidden="true" />
                <strong>Forward Calculation</strong>
              </div>
              <p className={styles.gstRuleText}>{GST_CALCULATION_RULES.forward.description}</p>
              <div className={styles.gstRuleFormula}>
                <code>{GST_CALCULATION_RULES.forward.formula}</code>
              </div>
              <span className={styles.gstRuleExample}>{GST_CALCULATION_RULES.forward.example}</span>
            </div>

            <div className={styles.gstRuleCard}>
              <div className={styles.gstRuleHeader}>
                <i className="ti ti-minus" aria-hidden="true" />
                <strong>Reverse Calculation</strong>
              </div>
              <p className={styles.gstRuleText}>{GST_CALCULATION_RULES.reverse.description}</p>
              <div className={styles.gstRuleFormula}>
                <code>{GST_CALCULATION_RULES.reverse.formula}</code>
              </div>
              <span className={styles.gstRuleExample}>{GST_CALCULATION_RULES.reverse.example}</span>
            </div>

            <div className={styles.gstRuleCard}>
              <div className={styles.gstRuleHeader}>
                <i className="ti ti-divide" aria-hidden="true" />
                <strong>Intra-State Split</strong>
              </div>
              <p className={styles.gstRuleText}>{GST_CALCULATION_RULES.intraSplit.description}</p>
              <div className={styles.gstRuleFormula}>
                <code>{GST_CALCULATION_RULES.intraSplit.formula}</code>
              </div>
              <span className={styles.gstRuleExample}>{GST_CALCULATION_RULES.intraSplit.example}</span>
            </div>

            <div className={styles.gstRuleCard}>
              <div className={styles.gstRuleHeader}>
                <i className="ti ti-plus-minus" aria-hidden="true" />
                <strong>Cess Calculation</strong>
              </div>
              <p className={styles.gstRuleText}>{GST_CALCULATION_RULES.cess.description}</p>
              <div className={styles.gstRuleFormula}>
                <code>{GST_CALCULATION_RULES.cess.formula}</code>
              </div>
              <span className={styles.gstRuleExample}>{GST_CALCULATION_RULES.cess.example}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}