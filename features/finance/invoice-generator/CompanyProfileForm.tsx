// features/finance/invoice-generator/CompanyProfileForm.tsx

"use client";

import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";

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
        <div className="inv-company-form">
            <div className="inv-form-header">
                <h3 className="inv-form-title">
                    <i className="ti ti-building" aria-hidden="true" />
                    Your Business Details
                </h3>
                {savedProfiles.length > 0 && (
                    <select
                        className="inv-profile-select"
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

            <div className="inv-logo-section">
                {companyLogo ? (
                    <div className="inv-logo-preview">
                        <img src={companyLogo} alt="Company logo" className="inv-logo-img" />
                        <button
                            type="button"
                            className="inv-logo-remove"
                            onClick={handleRemoveLogo}
                            aria-label="Remove logo"
                        >
                            <i className="ti ti-x" aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <div className="inv-logo-upload">
                        <input
                            type="file"
                            id="logo-upload"
                            className="inv-logo-input"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploading}
                        />
                        <label htmlFor="logo-upload" className="inv-logo-label">
                            <i className="ti ti-upload" aria-hidden="true" />
                            <span>{isUploading ? "Uploading..." : "Upload Logo"}</span>
                            <span className="inv-logo-hint">PNG, JPG (max 500KB)</span>
                        </label>
                    </div>
                )}
            </div>

            <div className="inv-form-grid">
                <div className="inv-field inv-field-full">
                    <label htmlFor="company-name" className="inv-label">
                        Business Name
                        <span className="inv-required">*</span>
                    </label>
                    <input
                        id="company-name"
                        type="text"
                        className="inv-input"
                        value={companyName}
                        onChange={(e) => onCompanyNameChange(e.target.value)}
                        placeholder="Your Company Name"
                        required
                    />
                </div>

                <div className="inv-field inv-field-full">
                    <label htmlFor="company-address" className="inv-label">
                        Address
                    </label>
                    <textarea
                        id="company-address"
                        className="inv-textarea"
                        value={companyAddress}
                        onChange={(e) => onCompanyAddressChange(e.target.value)}
                        placeholder="Street address, city, state, postal code"
                        rows={3}
                    />
                </div>

                <div className="inv-field">
                    <label htmlFor="company-gstin" className="inv-label">
                        GSTIN / Tax ID
                    </label>
                    <input
                        id="company-gstin"
                        type="text"
                        className="inv-input inv-input-mono"
                        value={companyGSTIN}
                        onChange={(e) => onCompanyGSTINChange(e.target.value.toUpperCase())}
                        placeholder="27AAPFU0939F1ZV"
                        maxLength={15}
                    />
                </div>

                <div className="inv-field">
                    <label htmlFor="company-email" className="inv-label">
                        Email
                    </label>
                    <input
                        id="company-email"
                        type="email"
                        className="inv-input"
                        value={companyEmail}
                        onChange={(e) => onCompanyEmailChange(e.target.value)}
                        placeholder="billing@company.com"
                    />
                </div>

                <div className="inv-field inv-field-full">
                    <label htmlFor="company-phone" className="inv-label">
                        Phone
                    </label>
                    <input
                        id="company-phone"
                        type="tel"
                        className="inv-input"
                        value={companyPhone}
                        onChange={(e) => onCompanyPhoneChange(e.target.value)}
                        placeholder="+91 80 1234 5678"
                    />
                </div>
            </div>

            <div className="inv-form-actions">
                <button type="button" className="inv-btn inv-btn-secondary" onClick={onSaveProfile}>
                    <i className="ti ti-device-floppy" aria-hidden="true" />
                    Save as Profile
                </button>
            </div>

            <style jsx>{`
        .inv-company-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .inv-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .inv-form-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .inv-form-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .inv-profile-select {
          height: 32px;
          padding: 0 32px 0 10px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 12px;
          font-family: var(--font-sans);
          cursor: pointer;
          outline: none;
          transition: all 0.12s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .inv-profile-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .inv-logo-section {
          display: flex;
          justify-content: center;
          padding: 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
        }

        .inv-logo-preview {
          position: relative;
          display: inline-block;
        }

        .inv-logo-img {
          max-width: 200px;
          max-height: 80px;
          object-fit: contain;
          border-radius: var(--radius-md);
        }

        .inv-logo-remove {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: #DC2626;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .inv-logo-remove:hover {
          background: #B91C1C;
          transform: scale(1.1);
        }

        .inv-logo-remove i {
          font-size: 14px;
        }

        .inv-logo-upload {
          width: 100%;
        }

        .inv-logo-input {
          display: none;
        }

        .inv-logo-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 20px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.12s;
        }

        .inv-logo-label:hover {
          border-color: var(--brand);
          background: var(--brand-light);
        }

        .inv-logo-label i {
          font-size: 24px;
          color: var(--text-secondary);
        }

        .inv-logo-label span:first-of-type {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .inv-logo-hint {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .inv-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .inv-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inv-field-full {
          grid-column: 1 / -1;
        }

        .inv-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-sans);
        }

        .inv-required {
          color: #B91C1C;
          font-size: 13px;
        }

        @media (prefers-color-scheme: dark) {
          .inv-required {
            color: #F87171;
          }
        }

        .inv-input,
        .inv-textarea {
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.12s;
        }

        .inv-input {
          height: 40px;
        }

        .inv-textarea {
          padding: 10px 12px;
          resize: vertical;
          min-height: 60px;
        }

        .inv-input:focus,
        .inv-textarea:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .inv-input-mono {
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .inv-form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 0.5px solid var(--border-faint);
        }

        .inv-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.12s;
          border: none;
          outline: none;
        }

        .inv-btn i {
          font-size: 15px;
        }

        .inv-btn-secondary {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
        }

        .inv-btn-secondary:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        @media (max-width: 768px) {
          .inv-form-grid {
            grid-template-columns: 1fr;
          }

          .inv-logo-img {
            max-width: 150px;
            max-height: 60px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .inv-input,
          .inv-textarea,
          .inv-profile-select,
          .inv-logo-label,
          .inv-logo-remove,
          .inv-btn {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}