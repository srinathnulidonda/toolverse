// features/dev/json-formatter/JsonStats.tsx
"use client";

import styles from "./style/JsonStats.module.css";

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
      <div className={styles.jstRoot} role="region" aria-label="JSON statistics">
        <div className={styles.jstSection}>
          <p className={styles.jstSectionLabel}>Structure</p>
          <div className={`${styles.jstGrid} ${styles.jstGrid4}`}>
            {structure.map((item) => (
              <div key={item.label} className={styles.jstCard}>
                <div className={styles.jstCardHeader}>
                  <i className={`ti ${item.icon}`} aria-hidden="true" />
                  <span className={styles.jstCardLabel}>{item.label}</span>
                </div>
                <div className={styles.jstCardVal} aria-label={`${item.label}: ${item.value}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.jstSection}>
          <p className={styles.jstSectionLabel}>Value types</p>
          <div className={`${styles.jstGrid} ${styles.jstGrid6}`}>
            {types.map((item) => (
              <div key={item.label} className={styles.jstCard}>
                <div className={styles.jstCardHeader}>
                  <i className={`ti ${item.icon}`} aria-hidden="true" />
                  <span className={styles.jstCardLabel}>{item.label}</span>
                </div>
                <div className={styles.jstCardVal} aria-label={`${item.label}: ${item.value}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}