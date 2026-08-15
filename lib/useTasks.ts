// lib/useTasks.ts
"use client";

import { useCallback, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import {
  Task,
  Priority,
  TASKS_STORAGE_KEY,
  MAX_STORED_TASKS,
  cleanTasks,
  uid,
  getCurrentToolContext,
} from "@/components/widgets/widgetTypes";

export interface UseTasksResult {
  tasks: Task[];
  addTask: (text: string, priority?: Priority, context?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: (ids?: string[]) => void;
}

export function useTasks(): UseTasksResult {
  const [rawTasks, setRawTasks] = useLocalStorage<Task[]>(TASKS_STORAGE_KEY, []);

  const tasks = useMemo(() => cleanTasks(rawTasks), [rawTasks]);

  const addTask = useCallback(
    (text: string, priority: Priority = "medium", context?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const newTask: Task = {
        id: uid(),
        text: trimmed,
        completed: false,
        priority,
        createdAt: Date.now(),
        context: context ?? getCurrentToolContext(),
      };

      setRawTasks((prev) => [newTask, ...cleanTasks(prev)].slice(0, MAX_STORED_TASKS));
    },
    [setRawTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setRawTasks((prev) =>
        cleanTasks(prev).map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    },
    [setRawTasks]
  );

  const removeTask = useCallback(
    (id: string) => {
      setRawTasks((prev) => cleanTasks(prev).filter((t) => t.id !== id));
    },
    [setRawTasks]
  );

  const clearCompleted = useCallback(
    (ids?: string[]) => {
      setRawTasks((prev) => {
        const cleaned = cleanTasks(prev);
        if (ids) {
          const idSet = new Set(ids);
          return cleaned.filter((t) => !idSet.has(t.id));
        }
        return cleaned.filter((t) => !t.completed);
      });
    },
    [setRawTasks]
  );

  return { tasks, addTask, toggleTask, removeTask, clearCompleted };
}