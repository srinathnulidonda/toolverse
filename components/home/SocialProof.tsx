// components/home/SocialProof.tsx
const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const stats = [
  { icon: "ti-cloud-off", title: "No Uploads", label: "Files stay local" },
  { icon: "ti-bolt", title: "Fast", label: "Runs in browser" },
  { icon: "ti-user-off", title: "No Account", label: "Use instantly" },
  { icon: "ti-infinity", title: "Free Forever", label: "No limits" },
];

export default function SocialProof() {
  return (
    <div
      className="proof-card-row"
      style={{
        display: "flex",
        gap: "10px",
        width: "100%",
        maxWidth: "520px",
        marginTop: "24px",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.title}
          style={{
            flex: 1,
            background: "var(--bg-card)",
            border: "0.5px solid var(--border)",
            borderRadius: "10px",
            padding: "12px 8px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i
            className={`ti ${s.icon}`}
            aria-hidden="true"
            style={{ fontSize: "17px", color: "var(--brand)" }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.2px",
              lineHeight: 1.2,
              fontFamily: font,
            }}
          >
            {s.title}
          </span>
          <span
            style={{
              fontSize: "10.5px",
              color: "var(--text-secondary)",
              fontWeight: 500,
              fontFamily: font,
              lineHeight: 1.3,
            }}
          >
            {s.label}
          </span>
        </div>
      ))}

      <style>{`
                @media (max-width: 480px) {
                    .proof-card-row { gap: 8px !important; }
                }
            `}</style>
    </div>
  );
}
