// lib/useLocalStorage.ts
"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * Custom hook that synchronizes state with localStorage.
 * Returns a stateful value and a setter, similar to useState.
 *
 * @param key - The localStorage key to use for storage.
 * @param initialValue - Initial value or a function that returns the initial value.
 * @returns [state, setter]
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      // During SSR, return the initial value directly
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item
        ? (JSON.parse(item) as T)
        : typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : initialValue;
    } catch {
      // If parsing fails, fall back to initial value
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    setState((prev) => {
      const newValue =
        typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch {
          // ignore write errors
        }
      }
      return newValue;
    });
  };

  // Keep in sync with other tabs/windows
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue) as T);
        } catch {
          // ignore malformed storage updates
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [state, setValue];
}

export default useLocalStorage;