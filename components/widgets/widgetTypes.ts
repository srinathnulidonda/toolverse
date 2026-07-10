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

export type Note = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type WidgetVariant = "compact" | "full";

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
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function validateTask(task: any): task is Task {
  return (
    task &&
    typeof task.id === 'string' &&
    typeof task.text === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'number' &&
    (task.priority === undefined || PRIORITY_ORDER.includes(task.priority)) &&
    (task.context === undefined || typeof task.context === 'string')
  );
}

export function validateNote(note: any): note is Note {
  return (
    note &&
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    typeof note.pinned === 'boolean' &&
    typeof note.createdAt === 'number' &&
    typeof note.updatedAt === 'number'
  );
}

export function cleanTasks(tasks: any[]): Task[] {
  if (!Array.isArray(tasks)) {
    console.warn('cleanTasks: expected array, got', typeof tasks);
    return [];
  }
  
  const cleaned = tasks.filter(validateTask).map(task => ({
    ...task,
    priority: getPriority(task),
  }));
  
  if (cleaned.length < tasks.length) {
    console.warn(`cleanTasks: dropped ${tasks.length - cleaned.length} invalid task(s)`);
  }
  
  return cleaned;
}

export function cleanNotes(notes: any[]): Note[] {
  if (!Array.isArray(notes)) {
    console.warn('cleanNotes: expected array, got', typeof notes);
    return [];
  }
  
  const cleaned = notes.filter(validateNote);
  
  if (cleaned.length < notes.length) {
    console.warn(`cleanNotes: dropped ${notes.length - cleaned.length} invalid note(s)`);
  }
  
  return cleaned;
}