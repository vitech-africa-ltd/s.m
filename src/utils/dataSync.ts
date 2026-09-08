/**
 * Data synchronization system with event listeners
 * Automatically syncs data across all components
 */

type Listener = () => void;
const listeners: Set<Listener> = new Set();

/**
 * Subscribe to data changes
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all subscribers of data changes
 */
export function notify(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('Error in data sync listener:', error);
    }
  });
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Local storage with sync
 */
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      notify();
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
      notify();
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
      notify();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

/**
 * Auto-save functionality
 */
export function createAutoSave<T>(
  key: string,
  getData: () => T,
  interval: number = 5000
): () => void {
  const save = debounce(() => {
    const data = getData();
    storage.set(key, data);
  }, 500);

  const intervalId = setInterval(save, interval);

  // Save on page unload
  const handleBeforeUnload = () => {
    const data = getData();
    storage.set(key, data);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/**
 * Cross-tab synchronization
 */
export function setupCrossTabSync(key: string, callback: (data: any) => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === key && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        callback(data);
      } catch (error) {
        console.error('Error parsing cross-tab sync data:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

/**
 * React hook for data sync
 */
export function useDataSync(callback: () => void): void {
  // This would be used in React components
  // Implementation depends on the framework
}
