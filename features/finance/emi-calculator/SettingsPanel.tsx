// features/finance/emi-calculator/SettingsPanel.tsx
"use client";
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
  const handleUsageChange = (
    field: "taxable" | "exempt" | "nonBusiness",
    value: number
  ) => {
    onUsageChange(field, value);
  };

  return (
    <div className={styles.emiSettingsPanel}>
      <div className={styles.emiSettingsSection}>
        <h4 className={styles.emiSettingsTitle}>
          <i className="ti ti-info" aria-hidden="true" />
          Loan Type Reference
        </h4>
        <div className={styles.emiSettingsGrid}>
          <div className={styles.emiSettingItem}>
            <span className={styles.emiSettingLabel}>Home Loan</span>
            <span className={styles.emiSettingValue}>7.5% - 9.5% p.a.</span>
          </div>
          <div className={styles.emiSettingItem}>
            <span className={styles.emiSettingLabel}>Car Loan</span>
            <span className={styles.emiSettingValue}>7.0% - 12.0% p.a.</span>
          </div>
          <div className={styles.emiSettingItem}>
            <span className={styles.emiSettingLabel}>Personal Loan</span>
            <span className={styles.emiSettingValue}>10.5% - 24.0% p.a.</span>
          </div>
          <div className={styles.emiSettingItem}>
            <span className={styles.emiSettingLabel}>Education Loan</span>
            <span className={styles.emiSettingValue}>8.0% - 15.0% p.a.</span>
          </div>
        </div>
      </div>

      <div className={styles.emiSettingsSection}>
        <h4 className={styles.emiSettingsTitle}>
          <i className="ti ti-help" aria-hidden="true" />
          About Amortization
        </h4>
        <p className={styles.emiSettingsDesc}>
          EMI (Equated Monthly Installment) is calculated using the reducing balance method.
          Each EMI comprises both principal and interest components. Initially, the interest
          component is higher, but as the loan progresses, the principal component increases.
        </p>
        <p className={styles.emiSettingsDesc}>
          Making prepayments reduces the outstanding principal, which in turn reduces the
          interest burden and can shorten the loan tenure.
        </p>
      </div>

      <div className={styles.emiSettingsSection}>
        <h4 className={styles.emiSettingsTitle}>
          <i className="ti ti-settings" aria-hidden="true" />
          Advanced Settings
        </h4>
        <div className={styles.emiSettingsGroup}>
          <label className={styles.emiSettingsLabel}>
            <input
              type="checkbox"
              className={styles.emiSettingsInput}
              checked={false}
              onChange={() => { }}
            />
            <span className={styles.emiSettingsCheckboxBox}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
            <span className={styles.emiSettingsLabelText}>
              Show amortization formula details
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}