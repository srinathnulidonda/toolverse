// features/finance/itc-calculator/SettingsPanel.tsx
"use client";

import { BLOCKED_CREDIT_CATEGORIES, TIME_LIMIT_RULE, REVERSAL_RULES } from "./ts/itcRules.config";
import styles from "./style/SettingsPanel.module.css";

type SettingsPanelProps = {
  usageTaxable: string;
  usageExempt: string;
  usageNonBusiness: string;
  blockedCategory: string | undefined;
  onUsageChange: (field: "taxable" | "exempt" | "nonBusiness", value: number) => void;
  onBlockedCategoryChange: (value: string | undefined) => void;
};

export function SettingsPanel({
  usageTaxable,
  usageExempt,
  usageNonBusiness,
  blockedCategory,
  onUsageChange,
  onBlockedCategoryChange,
}: SettingsPanelProps) {
  const parsed = {
    taxable: parseFloat(usageTaxable) || 0,
    exempt: parseFloat(usageExempt) || 0,
    nonBusiness: parseFloat(usageNonBusiness) || 0,
  };

  const total = parsed.taxable + parsed.exempt + parsed.nonBusiness;
  const isValid = Math.abs(total - 100) < 0.01;

  return (
    <div className={styles.itcSettings} role="region" aria-label="Settings">
      <div className={styles.itcSettingsInner}>
        <div className={styles.itcSettingsSection}>
          <h3 className={styles.itcSettingsHeading}>
            <i className="ti ti-chart-pie" aria-hidden="true" />
            Usage Split Distribution
          </h3>
          <p className={styles.itcSettingsDesc}>
            Allocate input usage across taxable, exempt, and non-business supplies. This affects Rule 42/43 calculations.
          </p>

          <div className={styles.itcUsageGrid}>
            <div className={styles.itcUsageField}>
              <label htmlFor="usage-taxable" className={styles.itcUsageLabel}>
                <i className="ti ti-circle-check" aria-hidden="true" />
                <span>Taxable Supply</span>
              </label>
              <div className={styles.itcUsageInputWrap}>
                <input
                  id="usage-taxable"
                  type="number"
                  className={styles.itcUsageInput}
                  value={usageTaxable}
                  onChange={(e) => onUsageChange("taxable", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className={styles.itcUsageSuffix}>%</span>
              </div>
            </div>

            <div className={styles.itcUsageField}>
              <label htmlFor="usage-exempt" className={styles.itcUsageLabel}>
                <i className="ti ti-circle-x" aria-hidden="true" />
                <span>Exempt Supply</span>
              </label>
              <div className={styles.itcUsageInputWrap}>
                <input
                  id="usage-exempt"
                  type="number"
                  className={styles.itcUsageInput}
                  value={usageExempt}
                  onChange={(e) => onUsageChange("exempt", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className={styles.itcUsageSuffix}>%</span>
              </div>
            </div>

            <div className={styles.itcUsageField}>
              <label htmlFor="usage-nonbusiness" className={styles.itcUsageLabel}>
                <i className="ti ti-circle-dashed" aria-hidden="true" />
                <span>Non-Business</span>
              </label>
              <div className={styles.itcUsageInputWrap}>
                <input
                  id="usage-nonbusiness"
                  type="number"
                  className={styles.itcUsageInput}
                  value={usageNonBusiness}
                  onChange={(e) => onUsageChange("nonBusiness", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className={styles.itcUsageSuffix}>%</span>
              </div>
            </div>
          </div>

          <div className={`${styles.itcUsageTotal} ${isValid ? "valid" : "error"}`}>
            <i className={`ti ${isValid ? "ti-check" : "ti-alert-circle"}`} aria-hidden="true" />
            <span>
              Total: {total.toFixed(1)}%{isValid ? " ✓" : " (Must equal 100%)"}
            </span>
          </div>

          {parsed.exempt > 0 || parsed.nonBusiness > 0 ? (
            <div className={styles.itcUsageImpact}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              <span>
                {parsed.exempt > 0 && `${parsed.exempt}% ITC will be reversed under Rule 42/43 for exempt supply. `}
                {parsed.nonBusiness > 0 && `${parsed.nonBusiness}% ITC cannot be claimed for non-business use.`}
              </span>
            </div>
          ) : (
            <div className={`${styles.itcUsageImpact} success`}>
              <i className="ti ti-check" aria-hidden="true" />
              <span>100% taxable supply - Full ITC eligible (subject to other conditions).</span>
            </div>
          )}
        </div>

        <div className={styles.itcSettingsSection}>
          <h3 className={styles.itcSettingsHeading}>
            <i className="ti ti-ban" aria-hidden="true" />
            Blocked Credit Category
          </h3>
          <p className={styles.itcSettingsDesc}>Select if this invoice falls under Section 17(5) restrictions</p>

          <select
            className={styles.itcSelectFull}
            value={blockedCategory || ""}
            onChange={(e) => onBlockedCategoryChange(e.target.value || undefined)}
            aria-label="Select blocked credit category"
          >
            <option value="">None - Fully eligible for ITC</option>
            {BLOCKED_CREDIT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
                {cat.note && ` — ${cat.note}`}
              </option>
            ))}
          </select>

          {blockedCategory && (
            <div className={styles.itcBlockedWarning}>
              <i className="ti ti-alert-triangle" aria-hidden="true" />
              <span>
                This category is blocked under Section 17(5). No ITC can be claimed regardless of other factors.
              </span>
            </div>
          )}
        </div>

        <div className={styles.itcSettingsSection}>
          <h3 className={styles.itcSettingsHeading}>
            <i className="ti ti-book" aria-hidden="true" />
            Applicable Rules Reference
          </h3>

          <div className={styles.itcRulesGrid}>
            <div className={styles.itcRuleCard}>
              <div className={styles.itcRuleHeader}>
                <i className="ti ti-clock" aria-hidden="true" />
                <strong>Section 16(4)</strong>
              </div>
              <p className={styles.itcRuleText}>{TIME_LIMIT_RULE.description}</p>
              <span className={styles.itcRuleTag}>Time Limit</span>
            </div>

            <div className={styles.itcRuleCard}>
              <div className={styles.itcRuleHeader}>
                <i className="ti ti-refresh" aria-hidden="true" />
                <strong>Rule 42 & 43</strong>
              </div>
              <p className={styles.itcRuleText}>{REVERSAL_RULES.rule42_43.description}</p>
              <span className={styles.itcRuleTag}>Common Credit</span>
            </div>

            <div className={styles.itcRuleCard}>
              <div className={styles.itcRuleHeader}>
                <i className="ti ti-clock-pause" aria-hidden="true" />
                <strong>Rule 37</strong>
              </div>
              <p className={styles.itcRuleText}>{REVERSAL_RULES.rule37.description}</p>
              <span className={styles.itcRuleTag}>{REVERSAL_RULES.rule37.daysLimit} Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}