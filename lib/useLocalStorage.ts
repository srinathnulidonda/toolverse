// lib/useLocalStorage.ts
"use client";

import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';

const STORAGE_EVENT_NAME = 'local-storage-change';
const CURRENT_VERSION = 1;

interface StorageChangeDetail {
  key: string;
  newValue: string | null;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  // Handle NaN
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
  
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // Handle arrays vs objects differently
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
  if (typeof window === 'undefined') return;
  const event = new CustomEvent<StorageChangeDetail>(STORAGE_EVENT_NAME, {
    detail: { key, newValue }
  });
  window.dispatchEvent(event);
}

interface StorageData<T> {
  v: number;
  data: T;
}

function parseStored<T>(item: string | null, key: string): { data: T; version: number; isNew: boolean } | null {
  // Distinguish between new key (null) vs empty string or corrupt data
  const isNewKey = item === null;
  
  if (isNewKey) {
    return { data: null as any, version: -1, isNew: true };
  }

  try {
    const parsed = JSON.parse(item);
    if (typeof parsed === 'object' && parsed !== null && 'v' in parsed && 'data' in parsed) {
      const version = Number(parsed.v);
      if (!Number.isNaN(version)) {
        return { data: parsed.data as T, version: version, isNew: false };
      }
    }
    // Legacy format: raw value (not wrapped)
    return { data: parsed as T, version: 0, isNew: false };
  } catch (error) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to parse storage for key "${key}". Data may be corrupt.`, error);
    }
    return null;
  }
}

function migrateData<T>(parsed: { data: T; version: number }, defaultValue: T, key: string): T {
  if (parsed.version === CURRENT_VERSION) {
    return parsed.data;
  }

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`Migrating storage for key "${key}" from v${parsed.version} to v${CURRENT_VERSION}.`);
  }

  // Handle legacy version (v0) - use the data as-is
  if (parsed.version === 0) {
    return parsed.data;
  }

  // Unknown version - use default
  return defaultValue;
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
    initialValueRef.current = typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }

  const writeToStorageSync = useCallback((value: T, targetKey: string) => {
    if (typeof window === 'undefined') return;

    try {
      const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: value });
      window.localStorage.setItem(targetKey, wrapped);
    } catch (error) {
      console.warn(`Error writing to localStorage key "${targetKey}":`, error);

      if (error instanceof Error && error.name === 'QuotaExceededError') {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          console.error('localStorage quota exceeded. Attempting to clear space...');
        }

        try {
          // Only remove the current key we're trying to write, not all tv: keys
          // This is less destructive - let the user manage their storage
          const currentSize = window.localStorage.getItem(targetKey)?.length || 0;
          
          if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
            console.warn(`Current key "${targetKey}" size: ${currentSize} chars. Unable to save - quota exceeded.`);
            console.warn('Consider clearing old data from localStorage settings.');
          }
          
          // Don't auto-delete other keys - that's too destructive
          // Instead, just fail gracefully
        } catch (retryError) {
          console.error(`Failed to handle quota error for key "${targetKey}":`, retryError);
        }
      }
    }
  }, []);

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValueRef.current!;
    }

    try {
      const item = window.localStorage.getItem(key);
      const parsed = parseStored<T>(item, key);
      
      if (parsed === null) {
        // Corrupt data - use default
        const defaultValue = initialValueRef.current!;
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (writeError) {
          console.warn(`Failed to write default value to localStorage:`, writeError);
        }
        return defaultValue;
      }

      if (parsed.isNew) {
        // Brand new key - no warning needed
        const defaultValue = initialValueRef.current!;
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (writeError) {
          console.warn(`Failed to write default value to localStorage:`, writeError);
        }
        return defaultValue;
      }

      // Migrate if needed
      const migratedData = migrateData(parsed, initialValueRef.current!, key);
      
      if (parsed.version !== CURRENT_VERSION) {
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: migratedData });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (e) {
          console.warn(`Failed to migrate storage for key "${key}":`, e);
        }
      }
      
      return migratedData;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      const defaultValue = initialValueRef.current!;
      const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
      try {
        window.localStorage.setItem(key, wrapped);
      } catch (writeError) {
        console.warn(`Failed to write default value to localStorage:`, writeError);
      }
      return defaultValue;
    }
  });

  const writeToStorage = useCallback((value: T, targetKey: string) => {
    if (typeof window === 'undefined') return;

    latestValueRef.current = value;

    if (writeTimeoutRef.current) {
      clearTimeout(writeTimeoutRef.current);
    }

    writeTimeoutRef.current = setTimeout(() => {
      writeToStorageSync(value, targetKey);
    }, 50);
  }, [writeToStorageSync]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    setState(prevState => {
      const newValue = typeof value === 'function'
        ? (value as (prev: T) => T)(prevState)
        : value;

      if (deepEqual(prevState, newValue)) {
        return prevState;
      }

      latestValueRef.current = newValue;
      writeToStorage(newValue, keyRef.current);

      return newValue;
    });
  }, [writeToStorage]);

  // Handle key changes
  useEffect(() => {
    if (keyRef.current !== key) {
      // Clear any pending writes for the old key
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
          const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
          try {
            window.localStorage.setItem(key, wrapped);
          } catch (writeError) {
            console.warn(`Failed to write default value to localStorage:`, writeError);
          }
          setState(defaultValue);
          latestValueRef.current = defaultValue;
        } else {
          const migratedData = migrateData(parsed, initialValueRef.current!, key);
          
          if (parsed.version !== CURRENT_VERSION) {
            const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: migratedData });
            try {
              window.localStorage.setItem(key, wrapped);
            } catch (e) {
              console.warn(`Failed to migrate storage for key "${key}":`, e);
            }
          }
          
          setState(migratedData);
          latestValueRef.current = migratedData;
        }
      } catch (error) {
        console.warn(`Error reading new key "${key}":`, error);
        const defaultValue = initialValueRef.current!;
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (writeError) {
          console.warn(`Failed to write default value to localStorage:`, writeError);
        }
        setState(defaultValue);
        latestValueRef.current = defaultValue;
      }
    }
  }, [key]);

  // Flush pending writes on unload
  useEffect(() => {
    const handleUnload = () => {
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        if (latestValueRef.current !== undefined) {
          writeToStorageSync(latestValueRef.current, keyRef.current);
        }
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [writeToStorageSync]);

  const applyIncomingValue = useCallback((newValue: T | null) => {
    setTimeout(() => {
      setState(prevState => {
        const valueToUse = newValue === null ? initialValueRef.current! : newValue;
        if (deepEqual(prevState, valueToUse)) return prevState;
        latestValueRef.current = valueToUse;
        return valueToUse;
      });
    }, 0);
  }, []);

  // Handle cross-tab storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === keyRef.current) {
        try {
          if (e.newValue === null) {
            applyIncomingValue(null);
          } else {
            const parsed = parseStored<T>(e.newValue, keyRef.current);
            if (parsed === null || parsed.isNew) {
              applyIncomingValue(initialValueRef.current!);
            } else {
              const migratedData = migrateData(parsed, initialValueRef.current!, keyRef.current);
              applyIncomingValue(migratedData);
            }
          }
        } catch (error) {
          console.warn(`Error parsing storage change for key "${keyRef.current}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyIncomingValue]);

  // Handle same-tab custom events (but don't trigger on our own changes)
  useEffect(() => {
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<StorageChangeDetail>;
      if (customEvent.detail.key === keyRef.current) {
        try {
          if (customEvent.detail.newValue === null) {
            applyIncomingValue(null);
          } else {
            const parsed = parseStored<T>(customEvent.detail.newValue, keyRef.current);
            if (parsed === null || parsed.isNew) {
              return; // Ignore invalid custom events
            }

            const migratedData = migrateData(parsed, initialValueRef.current!, keyRef.current);
            applyIncomingValue(migratedData);
          }
        } catch (error) {
          console.warn(`Error parsing custom storage change for key "${keyRef.current}":`, error);
        }
      }
    };

    window.addEventListener(STORAGE_EVENT_NAME, handleCustomStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT_NAME, handleCustomStorageChange);
  }, [applyIncomingValue]);

  return [state, setValue];
}

export default useLocalStorage;