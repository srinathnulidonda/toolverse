// lib/useLocalStorage.ts
"use client";
import { logger } from "@/lib/logger";
import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from "react";

const STORAGE_EVENT_NAME = "local-storage-change";
const CURRENT_VERSION = 1;

interface StorageChangeDetail {
  key: string;
  newValue: string | null;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function broadcastChange(key: string, newValue: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StorageChangeDetail>(STORAGE_EVENT_NAME, { detail: { key, newValue } })
  );
}

function parseStored<T>(
  item: string | null,
  key: string
): { data: T; version: number; isNew: boolean } | null {
  if (item === null) return { data: null as any, version: -1, isNew: true };

  try {
    const parsed = JSON.parse(item);
    if (typeof parsed === "object" && parsed !== null && "v" in parsed && "data" in parsed) {
      const version = Number(parsed.v);
      if (!Number.isNaN(version)) return { data: parsed.data as T, version, isNew: false };
    }
    return { data: parsed as T, version: 0, isNew: false };
  } catch (error) {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      logger.warn(`Failed to parse storage for key "${key}". Data may be corrupt.`, error);
    }
    return null;
  }
}

function migrateData<T>(parsed: { data: T; version: number }, defaultValue: T, key: string): T {
  if (parsed.version === CURRENT_VERSION) return parsed.data;
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    logger.warn(`Migrating storage for key "${key}" from v${parsed.version} to v${CURRENT_VERSION}.`);
  }
  if (parsed.version === 0) return parsed.data;
  return defaultValue;
}

function writeDefault<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: CURRENT_VERSION, data: value }));
  } catch (writeError) {
    if (process.env.NODE_ENV !== "production") {
      logger.warn(`Failed to write default value to localStorage:`, writeError);
    }
  }
}

function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const keyRef = useRef(key);
  const latestValueRef = useRef<T>();
  const writeTimeoutRef = useRef<NodeJS.Timeout>();

  const initialValueRef = useRef<T>();
  if (initialValueRef.current === undefined) {
    initialValueRef.current =
      typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
  }

  const writeToStorageSync = useCallback((value: T, targetKey: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(targetKey, JSON.stringify({ v: CURRENT_VERSION, data: value }));
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        logger.warn(`Error writing to localStorage key "${targetKey}":`, error);
      }
      if (error instanceof Error && error.name === "QuotaExceededError") {
        logger.error("localStorage quota exceeded. Unable to save new data.");
      }
    }
  }, []);

  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValueRef.current!;

    try {
      const item = window.localStorage.getItem(key);
      const parsed = parseStored<T>(item, key);

      if (parsed === null || parsed.isNew) {
        const defaultValue = initialValueRef.current!;
        writeDefault(key, defaultValue);
        return defaultValue;
      }

      const migratedData = migrateData(parsed, initialValueRef.current!, key);
      if (parsed.version !== CURRENT_VERSION) writeDefault(key, migratedData);
      return migratedData;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        logger.warn(`Error reading localStorage key "${key}":`, error);
      }
      const defaultValue = initialValueRef.current!;
      writeDefault(key, defaultValue);
      return defaultValue;
    }
  });

  const writeToStorage = useCallback(
    (value: T, targetKey: string) => {
      if (typeof window === "undefined") return;
      latestValueRef.current = value;
      if (writeTimeoutRef.current) clearTimeout(writeTimeoutRef.current);
      writeTimeoutRef.current = setTimeout(() => {
        writeToStorageSync(value, targetKey);
      }, 50);
    },
    [writeToStorageSync]
  );

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      let nextValue: T;
      let didChange = false;

      setState((prevState) => {
        nextValue = typeof value === "function" ? (value as (prev: T) => T)(prevState) : value;
        if (deepEqual(prevState, nextValue)) {
          nextValue = prevState;
          return prevState;
        }
        didChange = true;
        return nextValue;
      });

      if (didChange) {
        latestValueRef.current = nextValue!;
        broadcastChange(keyRef.current, JSON.stringify({ v: CURRENT_VERSION, data: nextValue! }));
        writeToStorage(nextValue!, keyRef.current);
      }
    },
    [writeToStorage]
  );

  useEffect(() => {
    if (keyRef.current === key) return;

    if (writeTimeoutRef.current) {
      clearTimeout(writeTimeoutRef.current);
      writeTimeoutRef.current = undefined;
    }
    keyRef.current = key;

    try {
      const item = window.localStorage.getItem(key);
      const parsed = parseStored<T>(item, key);

      if (parsed === null || parsed.isNew) {
        const defaultValue = initialValueRef.current!;
        writeDefault(key, defaultValue);
        setState(defaultValue);
        latestValueRef.current = defaultValue;
      } else {
        const migratedData = migrateData(parsed, initialValueRef.current!, key);
        if (parsed.version !== CURRENT_VERSION) writeDefault(key, migratedData);
        setState(migratedData);
        latestValueRef.current = migratedData;
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        logger.warn(`Error reading new key "${key}":`, error);
      }
      const defaultValue = initialValueRef.current!;
      writeDefault(key, defaultValue);
      setState(defaultValue);
      latestValueRef.current = defaultValue;
    }
  }, [key]);

  useEffect(() => {
    const handleUnload = () => {
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        if (latestValueRef.current !== undefined) {
          writeToStorageSync(latestValueRef.current, keyRef.current);
        }
      }
    };
    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
      handleUnload();
    };
  }, [writeToStorageSync]);

  const applyIncomingValue = useCallback((newValue: T | null) => {
    setState((prevState) => {
      const valueToUse = newValue === null ? initialValueRef.current! : newValue;
      if (deepEqual(prevState, valueToUse)) return prevState;
      latestValueRef.current = valueToUse;
      return valueToUse;
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== keyRef.current) return;
      try {
        if (e.newValue === null) {
          applyIncomingValue(null);
          return;
        }
        const parsed = parseStored<T>(e.newValue, keyRef.current);
        if (parsed === null || parsed.isNew) {
          applyIncomingValue(initialValueRef.current!);
        } else {
          applyIncomingValue(migrateData(parsed, initialValueRef.current!, keyRef.current));
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          logger.warn(`Error parsing storage change for key "${keyRef.current}":`, error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [applyIncomingValue]);

  useEffect(() => {
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<StorageChangeDetail>;
      if (customEvent.detail.key !== keyRef.current) return;
      try {
        if (customEvent.detail.newValue === null) {
          applyIncomingValue(null);
          return;
        }
        const parsed = parseStored<T>(customEvent.detail.newValue, keyRef.current);
        if (parsed === null || parsed.isNew) return;
        applyIncomingValue(migrateData(parsed, initialValueRef.current!, keyRef.current));
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          logger.warn(`Error parsing custom storage change for key "${keyRef.current}":`, error);
        }
      }
    };
    window.addEventListener(STORAGE_EVENT_NAME, handleCustomStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT_NAME, handleCustomStorageChange);
  }, [applyIncomingValue]);

  return [state, setValue];
}

export default useLocalStorage;