// lib/useLocalStorage.ts
"use client";

import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';

const STORAGE_EVENT_NAME = 'local-storage-change';

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
  setTimeout(() => {
    const event = new CustomEvent<StorageChangeDetail>(STORAGE_EVENT_NAME, {
      detail: { key, newValue }
    });
    window.dispatchEvent(event);
  }, 0);
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
  
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValueRef.current!;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        const defaultValue = initialValueRef.current!;
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      
      const parsed = JSON.parse(item) as T;
      
      if (parsed === null || parsed === undefined) {
        throw new Error('Invalid data');
      }
      
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      const defaultValue = initialValueRef.current!;
      
      try {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
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
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(keyRef.current, serialized);
      
      if (shouldBroadcast) {
        broadcastChange(keyRef.current, serialized);
      }
    } catch (error) {
      console.warn(`Error writing to localStorage key "${keyRef.current}":`, error);
      
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Consider clearing old data.');
        
        try {
          Object.keys(localStorage).forEach(k => {
            if (k.startsWith('tv:') && (k.includes('-v1') || k.includes('-v2'))) {
              localStorage.removeItem(k);
            }
          });
          
          const serialized = JSON.stringify(value);
          window.localStorage.setItem(keyRef.current, serialized);
          
          if (shouldBroadcast) {
            broadcastChange(keyRef.current, serialized);
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
        const serialized = JSON.stringify(newValue);
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
        if (item !== null) {
          const parsed = JSON.parse(item) as T;
          setState(parsed);
          latestValueRef.current = parsed;
        } else {
          setState(initialValueRef.current!);
          latestValueRef.current = initialValueRef.current;
        }
      } catch (error) {
        console.warn(`Error reading new key "${key}":`, error);
        setState(initialValueRef.current!);
        latestValueRef.current = initialValueRef.current;
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
            setState(prevState => {
              const newValue = initialValueRef.current!;
              if (deepEqual(prevState, newValue)) return prevState;
              latestValueRef.current = newValue;
              return newValue;
            });
          } else {
            const newValue = JSON.parse(e.newValue) as T;
            setState(prevState => {
              if (deepEqual(prevState, newValue)) return prevState;
              latestValueRef.current = newValue;
              return newValue;
            });
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
            setState(prevState => {
              const newValue = initialValueRef.current!;
              if (deepEqual(prevState, newValue)) return prevState;
              latestValueRef.current = newValue;
              return newValue;
            });
          } else {
            const newValue = JSON.parse(customEvent.detail.newValue) as T;
            setState(prevState => {
              if (deepEqual(prevState, newValue)) return prevState;
              latestValueRef.current = newValue;
              return newValue;
            });
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