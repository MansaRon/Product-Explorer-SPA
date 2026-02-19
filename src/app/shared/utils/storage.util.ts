// Reviver function for JSON.parse to handle data objects
export function dateReviver(key: string, value: any) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
    }
    return value;
}

// Load data
export function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return defaultValue;

        return JSON.parse(stored, dateReviver) as T;
    } catch (error) {
        console.log(`Failed to load from storage (${key}):`, error);
        return defaultValue;
    }
}

// Save data
export function saveToStorage<T>(key: string, value: T): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.log(`Failed to save to storage (${key}):`, error);
        return false;
    }
}

// Remove data
export function removeFromStorage(key: string): boolean {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.log(`Failed to remove from storage (${key}):`, error);
        return false;
    }
}

// Check if storage is available
export function isStorageAvailable(): boolean {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.log('Local storage is not available:', error);
        return false;
    }
}

export function getStorageSize(): number {
    let size = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            size += key.length + localStorage.getItem(key)!.length || 0;
        }
    }
    return size;
}

