// components/widgets/widgetTypes.ts

export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  context?: string;
};

export type NoteColor = "default" | "yellow" | "green" | "blue" | "pink" | "purple";

export type Note = {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type WidgetVariant = "compact" | "full";

// Storage keys are unchanged from the original widget, so tasks/notes people
// already have saved in their browser keep working after this upgrade.
export const TASKS_STORAGE_KEY = "tv:tasks-v3";
export const NOTES_STORAGE_KEY = "tv:notes-v1";

export const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

export const PRIORITY_META: Record<Priority, { color: string; label: string }> = {
  high: { color: "#E05252", label: "High" },
  medium: { color: "#E0943A", label: "Medium" },
  low: { color: "#4CAF82", label: "Low" },
};

export const NOTE_COLORS: {
  value: NoteColor;
  label: string;
  swatch: string;
  cardBg: string;
  editorBg: string;
}[] = [
  { value: "default", label: "Default", swatch: "var(--bg-card)", cardBg: "var(--bg-card)", editorBg: "var(--bg-surface)" },
  { value: "yellow", label: "Yellow", swatch: "#FFF9C4", cardBg: "#FFF9C4", editorBg: "#FFFDE7" },
  { value: "green", label: "Green", swatch: "#C8E6C9", cardBg: "#C8E6C9", editorBg: "#F1F8E9" },
  { value: "blue", label: "Blue", swatch: "#BBDEFB", cardBg: "#BBDEFB", editorBg: "#E3F2FD" },
  { value: "pink", label: "Pink", swatch: "#F8BBD0", cardBg: "#F8BBD0", editorBg: "#FCE4EC" },
  { value: "purple", label: "Purple", swatch: "#E1BEE7", cardBg: "#E1BEE7", editorBg: "#F3E5F5" },
];

/** A task's priority, defaulting older stored records saved before this field existed. */
export function getPriority(task: Task): Priority {
  return task.priority ?? "medium";
}

/** Compact "time ago" label — "Just now", "12m ago", "3h ago", "5d ago", or a short date. */
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}