export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.log(...args);
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.info(...args);
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.warn(...args);
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.error(...args);
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.debug(...args);
  },
};