// components/widgets/widgetTypes.ts
import { logger } from "@/lib/logger";

export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  context?: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  type?: "note" | "checklist";
  items?: ChecklistItem[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type WidgetVariant = "compact" | "full";
export type Filter = "all" | "active" | "completed";

export interface TasksDraft {
  input: string;
  priority: Priority;
  showPicker: boolean;
  filter: Filter;
  showCompleted: boolean;
}

export interface NotesDraft {
  activeNote: string | null;
  title: string;
  content: string;
  type: "note" | "checklist";
  items: ChecklistItem[];
  composerOpen: boolean;
  showCompleted: boolean;
}

export const TASKS_STORAGE_KEY = "tv:tasks-v3";
export const NOTES_STORAGE_KEY = "tv:notes-v1";
export const TASKS_DRAFT_KEY = "tv:tasks-draft";
export const NOTES_DRAFT_KEY = "tv:notes-draft";

export const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

export const PRIORITY_META: Record<Priority, { color: string; label: string }> = {
  high: { color: "#E05252", label: "High" },
  medium: { color: "#E0943A", label: "Medium" },
  low: { color: "#4CAF82", label: "Low" },
};

export const MAX_TASK_LENGTH = 120;
export const MAX_NOTE_TITLE_LENGTH = 100;
export const MAX_NOTE_CONTENT_LENGTH = 5000;
export const MAX_CHECKLIST_ITEM_LENGTH = 200;
export const MAX_STORED_TASKS = 500;
export const MAX_STORED_NOTES = 300;

export const DEFAULT_TASKS_DRAFT: TasksDraft = {
  input: "",
  priority: "medium",
  showPicker: false,
  filter: "all",
  showCompleted: true,
};

export const DEFAULT_NOTES_DRAFT: NotesDraft = {
  activeNote: null,
  title: "",
  content: "",
  type: "note",
  items: [],
  composerOpen: false,
  showCompleted: true,
};

export function getPriority(task: Task): Priority {
  return task.priority ?? "medium";
}

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
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function formatContext(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getCurrentToolContext(): string {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname.replace(/\/$/, "");
  if (!path.includes("/tools/")) return "";
  return path.split("/").pop() || "";
}

export function validateTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.text === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "number" &&
    (t.priority === undefined || PRIORITY_ORDER.includes(t.priority as Priority)) &&
    (t.context === undefined || typeof t.context === "string")
  );
}

export function validateChecklistItem(value: unknown): value is ChecklistItem {
  if (!value || typeof value !== "object") return false;
  const i = value as Record<string, unknown>;
  return typeof i.id === "string" && typeof i.text === "string" && typeof i.checked === "boolean";
}

export function validateNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.title === "string" &&
    typeof n.content === "string" &&
    typeof n.pinned === "boolean" &&
    typeof n.createdAt === "number" &&
    typeof n.updatedAt === "number" &&
    (n.type === undefined || n.type === "note" || n.type === "checklist") &&
    (n.items === undefined || (Array.isArray(n.items) && n.items.every(validateChecklistItem)))
  );
}

export function cleanTasks(tasks: unknown): Task[] {
  if (!Array.isArray(tasks)) {
    logger.warn("cleanTasks: expected array, got", typeof tasks);
    return [];
  }
  const cleaned = tasks.filter(validateTask).map((task) => ({
    ...task,
    priority: getPriority(task),
  }));
  if (cleaned.length < tasks.length) {
    logger.warn(`cleanTasks: dropped ${tasks.length - cleaned.length} invalid task(s)`);
  }
  return cleaned.slice(0, MAX_STORED_TASKS);
}

export function cleanNotes(notes: unknown): Note[] {
  if (!Array.isArray(notes)) {
    logger.warn("cleanNotes: expected array, got", typeof notes);
    return [];
  }
  const cleaned = notes.filter(validateNote).map((note) => ({
    ...note,
    type: note.type || "note",
    items: Array.isArray(note.items) ? note.items.filter(validateChecklistItem) : [],
  }));
  if (cleaned.length < notes.length) {
    logger.warn(`cleanNotes: dropped ${notes.length - cleaned.length} invalid note(s)`);
  }
  return cleaned.slice(0, MAX_STORED_NOTES);
}