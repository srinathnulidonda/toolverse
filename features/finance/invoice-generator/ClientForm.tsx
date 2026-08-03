// features/finance/invoice-generator/ClientForm.tsx

"use client";

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
        <div className="inv-client-form">
            <div className="inv-form-header">
                <h3 className="inv-form-title">
                    <i className="ti ti-user" aria-hidden="true" />
                    Bill To (Client)
                </h3>
                {savedClients.length > 0 && (
                    <select
                        className="inv-profile-select"
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

            <div className="inv-form-grid">
                <div className="inv-field inv-field-full">
                    <label htmlFor="client-name" className="inv-label">
                        Client Name
                        <span className="inv-required">*</span>
                    </label>
                    <input
                        id="client-name"
                        type="text"
                        className="inv-input"
                        value={clientName}
                        onChange={(e) => onClientNameChange(e.target.value)}
                        placeholder="Client Company Name"
                        required
                    />
                </div>

                <div className="inv-field inv-field-full">
                    <label htmlFor="client-address" className="inv-label">
                        Address
                    </label>
                    <textarea
                        id="client-address"
                        className="inv-textarea"
                        value={clientAddress}
                        onChange={(e) => onClientAddressChange(e.target.value)}
                        placeholder="Street address, city, state, postal code"
                        rows={3}
                    />
                </div>

                <div className="inv-field">
                    <label htmlFor="client-gstin" className="inv-label">
                        GSTIN / Tax ID
                    </label>
                    <input
                        id="client-gstin"
                        type="text"
                        className="inv-input inv-input-mono"
                        value={clientGSTIN}
                        onChange={(e) => onClientGSTINChange(e.target.value.toUpperCase())}
                        placeholder="Optional"
                        maxLength={15}
                    />
                </div>

                <div className="inv-field">
                    <label htmlFor="client-email" className="inv-label">
                        Email
                    </label>
                    <input
                        id="client-email"
                        type="email"
                        className="inv-input"
                        value={clientEmail}
                        onChange={(e) => onClientEmailChange(e.target.value)}
                        placeholder="client@company.com"
                    />
                </div>

                <div className="inv-field inv-field-full">
                    <label htmlFor="client-phone" className="inv-label">
                        Phone
                    </label>
                    <input
                        id="client-phone"
                        type="tel"
                        className="inv-input"
                        value={clientPhone}
                        onChange={(e) => onClientPhoneChange(e.target.value)}
                        placeholder="+1 555 123 4567"
                    />
                </div>
            </div>

            <div className="inv-form-actions">
                <button type="button" className="inv-btn inv-btn-secondary" onClick={onSaveClient}>
                    <i className="ti ti-device-floppy" aria-hidden="true" />
                    Save Client
                </button>
            </div>

            <style jsx>{`
        .inv-client-form {
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
        }

        @media (prefers-reduced-motion: reduce) {
          .inv-input,
          .inv-textarea,
          .inv-profile-select,
          .inv-btn {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}