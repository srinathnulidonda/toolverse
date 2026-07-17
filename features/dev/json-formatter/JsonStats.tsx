// features/dev/json-formatter/JsonStats.tsx
"use client";

type StatsProps = {
  value: unknown;
  rawText: string;
};

type Stats = {
  bytes: number;
  keys: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  totalNodes: number;
};

function analyzeJson(value: unknown, depth = 0): Omit<Stats, "bytes"> {
  const acc: Omit<Stats, "bytes"> = {
    keys: 0,
    depth,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    totalNodes: 1,
  };
  if (value === null) {
    acc.nulls = 1;
    return acc;
  }
  if (typeof value === "string") {
    acc.strings = 1;
    return acc;
  }
  if (typeof value === "number") {
    acc.numbers = 1;
    return acc;
  }
  if (typeof value === "boolean") {
    acc.booleans = 1;
    return acc;
  }
  if (Array.isArray(value)) {
    acc.arrays = 1;
    for (const v of value) {
      const c = analyzeJson(v, depth + 1);
      acc.keys += c.keys;
      acc.depth = Math.max(acc.depth, c.depth);
      acc.arrays += c.arrays;
      acc.objects += c.objects;
      acc.strings += c.strings;
      acc.numbers += c.numbers;
      acc.booleans += c.booleans;
      acc.nulls += c.nulls;
      acc.totalNodes += c.totalNodes;
    }
    return acc;
  }
  if (typeof value === "object") {
    acc.objects = 1;
    const entries = Object.entries(value as Record<string, unknown>);
    acc.keys = entries.length;
    for (const [, v] of entries) {
      const c = analyzeJson(v, depth + 1);
      acc.keys += c.keys;
      acc.depth = Math.max(acc.depth, c.depth);
      acc.arrays += c.arrays;
      acc.objects += c.objects;
      acc.strings += c.strings;
      acc.numbers += c.numbers;
      acc.booleans += c.booleans;
      acc.nulls += c.nulls;
      acc.totalNodes += c.totalNodes;
    }
    return acc;
  }
  return acc;
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

type StatItem = {
  label: string;
  value: string | number;
  icon: string;
  group: "structure" | "type";
};

export default function JsonStats({ value, rawText }: StatsProps) {
  const stats: Stats = {
    bytes: new Blob([rawText]).size,
    ...analyzeJson(value),
  };

  const structure: StatItem[] = [
    { label: "File size", value: fmtBytes(stats.bytes), icon: "ti-file", group: "structure" },
    {
      label: "Total nodes",
      value: stats.totalNodes.toLocaleString(),
      icon: "ti-box",
      group: "structure",
    },
    { label: "Max depth", value: stats.depth, icon: "ti-layers-subtract", group: "structure" },
    { label: "Keys", value: stats.keys.toLocaleString(), icon: "ti-key", group: "structure" },
  ];

  const types: StatItem[] = [
    { label: "Objects", value: stats.objects.toLocaleString(), icon: "ti-braces", group: "type" },
    { label: "Arrays", value: stats.arrays.toLocaleString(), icon: "ti-brackets", group: "type" },
    { label: "Strings", value: stats.strings.toLocaleString(), icon: "ti-quote", group: "type" },
    { label: "Numbers", value: stats.numbers.toLocaleString(), icon: "ti-123", group: "type" },
    {
      label: "Booleans",
      value: stats.booleans.toLocaleString(),
      icon: "ti-toggle-left",
      group: "type",
    },
    {
      label: "Nulls",
      value: stats.nulls.toLocaleString(),
      icon: "ti-circle-dashed",
      group: "type",
    },
  ];

  return (
    <>
      <div className="jst-root" role="region" aria-label="JSON statistics">
        <div className="jst-section">
          <p className="jst-section-label">Structure</p>
          <div className="jst-grid jst-grid-4">
            {structure.map((item) => (
              <div key={item.label} className="jst-card">
                <div className="jst-card-header">
                  <i className={`ti ${item.icon}`} aria-hidden="true" />
                  <span className="jst-card-label">{item.label}</span>
                </div>
                <div className="jst-card-val" aria-label={`${item.label}: ${item.value}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="jst-section">
          <p className="jst-section-label">Value types</p>
          <div className="jst-grid jst-grid-6">
            {types.map((item) => (
              <div key={item.label} className="jst-card">
                <div className="jst-card-header">
                  <i className={`ti ${item.icon}`} aria-hidden="true" />
                  <span className="jst-card-label">{item.label}</span>
                </div>
                <div className="jst-card-val" aria-label={`${item.label}: ${item.value}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .jst-root {
          flex: 1;
          overflow: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .jst-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .jst-section-label {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-family: var(--font-sans);
          margin: 0;
        }

        .jst-grid {
          display: grid;
          gap: 8px;
        }
        .jst-grid-4 { grid-template-columns: repeat(4, 1fr); }
        .jst-grid-6 { grid-template-columns: repeat(6, 1fr); }

        .jst-card {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 12px 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.12s, background 0.12s;
        }
        .jst-card:hover {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .jst-card-header {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .jst-card-header i {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .jst-card-label {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .jst-card-val {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.8px;
          line-height: 1;
        }

        @media (max-width: 520px) {
          .jst-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .jst-grid-6 { grid-template-columns: repeat(3, 1fr); }
        }

        @media (prefers-reduced-motion: reduce) {
          .jst-card { transition: none; }
        }
      `}</style>
    </>
  );
}
