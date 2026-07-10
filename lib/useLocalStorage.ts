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
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

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

function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const keyRef = useRef(key);
  const latestValueRef = useRef<T>();

  const initialValueRef = useRef<T>();
  if (initialValueRef.current === undefined) {
    initialValueRef.current = typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }

  const parseStored = (item: string | null): { data: T; version: number } | null => {
    if (item === null) return null;
    try {
      const parsed = JSON.parse(item);
      if (typeof parsed === 'object' && parsed !== null && 'v' in parsed && 'data' in parsed) {
        const version = Number(parsed.v);
        if (!Number.isNaN(version)) {
          return { data: parsed.data as T, version: version };
        }
      }
      // Legacy format: raw value (not wrapped)
      return { data: parsed as T, version: 0 };
    } catch {
      return null;
    }
  };

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValueRef.current!;
    }

    try {
      const item = window.localStorage.getItem(key);
      const parsed = parseStored(item);
      if (parsed === null) {
        console.warn(`Failed to parse storage for key "${key}". Using default value.`);
        const defaultValue = initialValueRef.current!;
        const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: defaultValue });
        try {
          window.localStorage.setItem(key, wrapped);
        } catch (writeError) {
          console.warn(`Failed to write default value to localStorage:`, writeError);
        }
        return defaultValue;
      }

      if (parsed.version === CURRENT_VERSION) {
        return parsed.data;
      }

      // Handle legacy version (v0) or unknown version
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        console.warn(`Detected legacy or unknown storage version for key "${key}". Migrating to v${CURRENT_VERSION}.`);
      }
      const dataToStore = parsed.version === 0 ? parsed.data : initialValueRef.current!;
      const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: dataToStore });
      try {
        window.localStorage.setItem(key, wrapped);
      } catch (e) {
        console.warn(`Failed to migrate storage for key "${key}":`, e);
      }
      return dataToStore;
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

  const writeTimeoutRef = useRef<NodeJS.Timeout>();

  const writeToStorageSync = useCallback((value: T, shouldBroadcast: boolean) => {
    if (typeof window === 'undefined') return;

    try {
      const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: value });
      window.localStorage.setItem(keyRef.current, wrapped);

      if (shouldBroadcast) {
        broadcastChange(keyRef.current, wrapped);
      }
    } catch (error) {
      console.warn(`Error writing to localStorage key "${keyRef.current}":`, error);

      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Clearing old tv:* keys.');

        try {
          Object.keys(localStorage).forEach(k => {
            if (k.startsWith('tv:')) {
              localStorage.removeItem(k);
            }
          });

          const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: value });
          window.localStorage.setItem(keyRef.current, wrapped);

          if (shouldBroadcast) {
            broadcastChange(keyRef.current, wrapped);
          }
        } catch (retryError) {
          console.error(`Failed to write to localStorage after cleanup:`, retryError);
        }
      }
    }
  }, []);

  const writeToStorage = useCallback((value: T) => {
    if (typeof window === 'undefined') return;

    latestValueRef.current = value;

    if (writeTimeoutRef.current) {
      clearTimeout(writeTimeoutRef.current);
    }

    writeTimeoutRef.current = setTimeout(() => {
      writeToStorageSync(value, false);
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

      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify({ v: CURRENT_VERSION, data: newValue });
        broadcastChange(keyRef.current, serialized);
      }

      writeToStorage(newValue);

      return newValue;
    });
  }, [writeToStorage]);

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;

      try {
        const item = window.localStorage.getItem(key);
        const parsed = parseStored(item);
        if (parsed === null) {
          console.warn(`Failed to parse storage for key "${key}". Using default value.`);
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
          if (parsed.version === CURRENT_VERSION) {
            setState(parsed.data);
            latestValueRef.current = parsed.data;
          } else {
            // Legacy or unknown version: migrate
            if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
              console.warn(`Detected legacy or unknown storage version for key "${key}". Migrating to v${CURRENT_VERSION}.`);
            }
            const dataToStore = parsed.version === 0 ? parsed.data : initialValueRef.current!;
            const wrapped = JSON.stringify({ v: CURRENT_VERSION, data: dataToStore });
            try {
              window.localStorage.setItem(key, wrapped);
            } catch (e) {
              console.warn(`Failed to migrate storage for key "${key}":`, e);
            }
            setState(dataToStore);
            latestValueRef.current = dataToStore;
          }
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

  useEffect(() => {
    const handleUnload = () => {
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
        if (latestValueRef.current !== undefined) {
          writeToStorageSync(latestValueRef.current, false);
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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === keyRef.current) {
        try {
          if (e.newValue === null) {
            setTimeout(() => {
              setState(prevState => {
                const newValue = initialValueRef.current!;
                if (deepEqual(prevState, newValue)) return prevState;
                latestValueRef.current = newValue;
                return newValue;
              });
            }, 0);
          } else {
            const parsed = parseStored(e.newValue);
            if (parsed === null) {
              console.warn(`Failed to parse storage change for key "${keyRef.current}". Using as-is.`);
              const newValue = initialValueRef.current!;

              setTimeout(() => {
                setState(prevState => {
                  if (deepEqual(prevState, newValue)) return prevState;
                  latestValueRef.current = newValue;
                  return newValue;
                });
              }, 0);
            } else {
              let newValue: T;
              if (parsed.version === CURRENT_VERSION) {
                newValue = parsed.data;
              } else {
                // Legacy or unknown version in incoming storage change
                if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
                  console.warn(`Received legacy/unknown version from storage for key "${key}". Using as-is.`);
                }
                newValue = parsed.data;
              }

              setTimeout(() => {
                setState(prevState => {
                  if (deepEqual(prevState, newValue)) return prevState;
                  latestValueRef.current = newValue;
                  return newValue;
                });
              }, 0);
            }
          }
        } catch (error) {
          console.warn(`Error parsing storage change for key "${keyRef.current}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<StorageChangeDetail>;
      if (customEvent.detail.key === keyRef.current) {
        try {
          if (customEvent.detail.newValue === null) {
                setTimeout(() => {
                  setState(prevState => {
                    const newValue = initialValueRef.current!;
                    if (deepEqual(prevState, newValue)) return prevState;
                    latestValueRef.current = newValue;
                    return newValue;
                  });
                }, 0);
              } else {
            const parsed = parseStored(customEvent.detail.newValue);
            if (parsed === null) {
              console.warn(`Failed to parse custom storage change for key "${key}". Ignoring change.`);
              return;
            }

            let newValue: T;
            if (parsed.version === CURRENT_VERSION) {
              newValue = parsed.data;
            } else {
              // Legacy or unknown version in custom event
              if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
                console.warn(`Received legacy/unknown version from custom event for key "${key}". Using as-is.`);
              }
              newValue = parsed.data;
            }

            setTimeout(() => {
                setState(prevState => {
                  if (deepEqual(prevState, newValue)) return prevState;
                  latestValueRef.current = newValue;
                  return newValue;
                });
              }, 0);
          }
        } catch (error) {
          console.warn(`Error parsing custom storage change for key "${keyRef.current}":`, error);
        }
      }
    };

    window.addEventListener(STORAGE_EVENT_NAME, handleCustomStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT_NAME, handleCustomStorageChange);
  }, []);

  return [state, setValue];
}

export default useLocalStorage;