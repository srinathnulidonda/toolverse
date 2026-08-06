// features/finance/invoice-generator/ClientForm.tsx
"use client";

import styles from "./style/ClientForm.module.css";

type ClientFormProps = {
  clientName: string;
  clientAddress: string;
  clientGSTIN: string;
  clientEmail: string;
  clientPhone: string;
  onClientNameChange: (value: string) => void;
  onClientAddressChange: (value: string) => void;
  onClientGSTINChange: (value: string) => void;
  onClientEmailChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
  savedClients: Array<{ id: string; name: string }>;
  onLoadClient: (clientId: string) => void;
  onSaveClient: () => void;
};

export function ClientForm({
  clientName,
  clientAddress,
  clientGSTIN,
  clientEmail,
  clientPhone,
  onClientNameChange,
  onClientAddressChange,
  onClientGSTINChange,
  onClientEmailChange,
  onClientPhoneChange,
  savedClients,
  onLoadClient,
  onSaveClient,
}: ClientFormProps) {
  return (
    <div className={styles.invClientForm}>
      <div className={styles.invFormHeader}>
        <h3 className={styles.invFormTitle}>
          <i className="ti ti-user" aria-hidden="true" />
          Bill To (Client)
        </h3>
        {savedClients.length > 0 && (
          <select
            className={styles.invProfileSelect}
            onChange={(e) => e.target.value && onLoadClient(e.target.value)}
            defaultValue=""
          >
            <option value="">Load saved client...</option>
            {savedClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.invFormGrid}>
        <div className={`${styles.invField} ${styles.invFieldFull}`}>
          <label htmlFor="client-name" className={styles.invLabel}>
            Client Name
            <span className={styles.invRequired}>*</span>
          </label>
          <input
            id="client-name"
            type="text"
            className={styles.invInput}
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder="Client Company Name"
            required
          />
        </div>

        <div className={`${styles.invField} ${styles.invFieldFull}`}>
          <label htmlFor="client-address" className={styles.invLabel}>
            Address
          </label>
          <textarea
            id="client-address"
            className={styles.invTextarea}
            value={clientAddress}
            onChange={(e) => onClientAddressChange(e.target.value)}
            placeholder="Street address, city, state, postal code"
            rows={3}
          />
        </div>

        <div className={styles.invField}>
          <label htmlFor="client-gstin" className={styles.invLabel}>
            GSTIN / Tax ID
          </label>
          <input
            id="client-gstin"
            type="text"
            className={`${styles.invInput} ${styles.invInputMono}`}
            value={clientGSTIN}
            onChange={(e) => onClientGSTINChange(e.target.value.toUpperCase())}
            placeholder="Optional"
            maxLength={15}
          />
        </div>

        <div className={styles.invField}>
          <label htmlFor="client-email" className={styles.invLabel}>
            Email
          </label>
          <input
            id="client-email"
            type="email"
            className={styles.invInput}
            value={clientEmail}
            onChange={(e) => onClientEmailChange(e.target.value)}
            placeholder="client@company.com"
          />
        </div>

        <div className={`${styles.invField} ${styles.invFieldFull}`}>
          <label htmlFor="client-phone" className={styles.invLabel}>
            Phone
          </label>
          <input
            id="client-phone"
            type="tel"
            className={styles.invInput}
            value={clientPhone}
            onChange={(e) => onClientPhoneChange(e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </div>
      </div>

      <div className={styles.invFormActions}>
        <button type="button" className={`${styles.invBtn} ${styles.invBtnSecondary}`} onClick={onSaveClient}>
          <i className="ti ti-device-floppy" aria-hidden="true" />
          Save Client
        </button>
      </div>
    </div>
  );
}