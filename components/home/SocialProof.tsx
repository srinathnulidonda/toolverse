// components/home/SocialProof.tsx
const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const stats = [
  { icon: "ti-shield-check", title: "100% Private", label: "Stays on device" },
  { icon: "ti-bolt", title: "Instant", label: "Zero wait time" },
  { icon: "ti-user-off", title: "No Sign-up", label: "Start instantly" },
  { icon: "ti-infinity", title: "Free Forever", label: "No hidden costs" },
];

export default function SocialProof() {
  return (
    <>
      <div className="proof-card-row" aria-label="Toolverse benefits">
        {stats.map((s) => (
          <div key={s.title} className="proof-card">
            <span className="proof-icon">
              <i className={`ti ${s.icon}`} aria-hidden="true" />
            </span>

            <span className="proof-text">
              <span className="proof-title">{s.title}</span>
              <span className="proof-label">{s.label}</span>
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .proof-card-row {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 520px;
          margin-top: 24px;
        }

        .proof-card {
          flex: 1;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          min-width: 0;
        }

        .proof-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .proof-icon i {
          font-size: 17px;
          color: var(--brand);
        }

        .proof-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          min-width: 0;
        }

        .proof-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.2px;
          line-height: 1.2;
          font-family: ${font};
        }

        .proof-label {
          font-size: 10.5px;
          color: var(--text-secondary);
          font-weight: 500;
          font-family: ${font};
          line-height: 1.3;
        }

        /* Mobile design */
        @media (max-width: 560px) {
          .proof-card-row {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            max-width: 360px;
            margin-top: 20px;
          }

          .proof-card {
            flex: none;
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: 8px;
            padding: 9px 10px;
            border-radius: 10px;
            min-height: 50px;
          }

          .proof-icon {
            width: 26px;
            height: 26px;
            border-radius: 7px;
            background: var(--bg-surface);
            flex-shrink: 0;
          }

          .proof-icon i {
            font-size: 14px;
            color: var(--text-secondary);
          }

          .proof-text {
            align-items: flex-start;
            gap: 1px;
            flex: 1;
          }

          .proof-title {
            font-size: 12.5px;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .proof-label {
            font-size: 10px;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
        }

        @media (max-width: 340px) {
          .proof-card-row {
            gap: 6px;
          }

          .proof-card {
            padding: 8px;
            gap: 7px;
          }

          .proof-icon {
            width: 24px;
            height: 24px;
          }

          .proof-title {
            font-size: 12px;
          }

          .proof-label {
            font-size: 9.5px;
          }
        }
      `}</style>
    </>
  );
}