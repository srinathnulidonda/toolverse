// features/finance/invoice-generator/CompanyProfileForm.tsx
"use client";

import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import styles from "./style/CompanyProfileForm.module.css";

type CompanyProfileFormProps = {
  companyName: string;
  companyAddress: string;
  companyGSTIN: string;
  companyEmail: string;
  companyPhone: string;
  companyLogo: string;
  onCompanyNameChange: (value: string) => void;
  onCompanyAddressChange: (value: string) => void;
  onCompanyGSTINChange: (value: string) => void;
  onCompanyEmailChange: (value: string) => void;
  onCompanyPhoneChange: (value: string) => void;
  onCompanyLogoChange: (value: string) => void;
  savedProfiles: Array<{ id: string; name: string; businessName: string }>;
  onLoadProfile: (profileId: string) => void;
  onSaveProfile: () => void;
};

export function CompanyProfileForm({
  companyName,
  companyAddress,
  companyGSTIN,
  companyEmail,
  companyPhone,
  companyLogo,
  onCompanyNameChange,
  onCompanyAddressChange,
  onCompanyGSTINChange,
  onCompanyEmailChange,
  onCompanyPhoneChange,
  onCompanyLogoChange,
  savedProfiles,
  onLoadProfile,
  onSaveProfile,
}: CompanyProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        logger.error("Invalid file type. Please upload an image.");
        return;
      }

      if (file.size > 500000) {
        logger.error("Image too large. Please upload an image smaller than 500KB.");
        return;
      }

      setIsUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onCompanyLogoChange(base64);
        setIsUploading(false);
      };
      reader.onerror = () => {
        logger.error("Failed to read image file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [onCompanyLogoChange]
  );

  const handleRemoveLogo = useCallback(() => {
    onCompanyLogoChange("");
  }, [onCompanyLogoChange]);

  return (
    <div className={styles.invCompanyForm}>
      <div className={styles.invFormHeader}>
        <h3 className={styles.invFormTitle}>
          <i className="ti ti-building" aria-hidden="true" />
          Your Business Details
        </h3>
        {savedProfiles.length > 0 && (
          <select
            className={styles.invProfileSelect}
            onChange={(e) => e.target.value && onLoadProfile(e.target.value)}
            defaultValue=""
          >
            <option value="">Load saved profile...</option>
            {savedProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.invLogoSection}>
        {companyLogo ? (
          <div className={styles.invLogoPreview}>
            <img src={companyLogo} alt="Company logo" className={styles.invLogoImg} />
            <button
              type="button"
              className={styles.invLogoRemove}
              onClick={handleRemoveLogo}
              aria-label="Remove logo"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className={styles.invLogoUpload}>
            <input
              type="file"
              id="logo-upload"
              className={styles.invLogoInput}
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
            <label htmlFor="logo-upload" className={styles.invLogoLabel}>
              <i className="ti ti-upload" aria-hidden="true" />
              <span>{isUploading ? "Uploading..." : "Upload Logo"}</span>
              <span className={styles.invLogoHint}>PNG, JPG (max 500KB)</span>
            </label>
          </div>
        )}
      </div>

      <div className={styles.invFormGrid}>
        <div className={`${styles.invField} ${styles.invFieldFull}`}>
          <label htmlFor="company-name" className={styles.invLabel}>
            Business Name
            <span className={styles.invRequired}>*</span>
          </label>
          <input
            id="company-name"
            type="text"
            className={styles.invInput}
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="Your Company Name"
            required
          />
        </div>

        <div className={`${styles.invField} ${styles.invFieldFull}`}>
          <label htmlFor="company-address" className={styles.invLabel}>
            Address
          </label>
          <textarea
            id="company-address"
            className={styles.invTextarea}
            value={companyAddress}
            onChange={(e) => onCompanyAddressChange(e.target.value)}
            placeholder="Street address, city, state, postal code"
            rows={3}
          />
        </div>

        <div className={styles.invField}>
          <label htmlFor="company-gstin" className={styles.invLabel}>
            GSTIN / Tax ID
          </label>
          <input
            id="company-gstin"
            type="text"
            className={`${styles.invInput} ${styles.invInputMono}`}
            value={companyGSTIN}
            onChange={(e) => onCompanyGSTINChange(e.target.value.toUpperCase())}
            placeholder="27AAPFU0939F1ZV"
            maxLength={15}
          />
        </div>

        <div className={styles.invField}>
          <label htmlFor="company-email" className={styles.invLabel}>
            Email
          </label>
          <input
            id="company-email"
            type="email"
            className={styles.invInput}
            value={companyEmail}
            onChange={(e) => onCompanyEmailChange(e.target.value)}
            placeholder="billing@company.com"
          />
        </div>

        <div className={`${styles.invField} ${styles.invFieldFull}`}>
          <label htmlFor="company-phone" className={styles.invLabel}>
            Phone
          </label>
          <input
            id="company-phone"
            type="tel"
            className={styles.invInput}
            value={companyPhone}
            onChange={(e) => onCompanyPhoneChange(e.target.value)}
            placeholder="+91 80 1234 5678"
          />
        </div>
      </div>

      <div className={styles.invFormActions}>
        <button type="button" className={`${styles.invBtn} ${styles.invBtnSecondary}`} onClick={onSaveProfile}>
          <i className="ti ti-device-floppy" aria-hidden="true" />
          Save as Profile
        </button>
      </div>
    </div>
  );
}