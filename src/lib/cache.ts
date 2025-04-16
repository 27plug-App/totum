// Cache configuration
const CACHE_PREFIX = 'totum_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// Cache interface
interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

// Cache implementation
class Cache {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl
    };
    this.storage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  }

  get<T>(key: string): T | null {
    const item = this.storage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const { value, timestamp, ttl }: CacheItem<T> = JSON.parse(item);
    if (Date.now() - timestamp > ttl) {
      this.remove(key);
      return null;
    }

    return value;
  }

  remove(key: string): void {
    this.storage.removeItem(CACHE_PREFIX + key);
  }

  clear(): void {
    Object.keys(this.storage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        this.storage.removeItem(key);
      }
    });
  }
}

// Memory cache for frequently accessed data
class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export instances
export const persistentCache = new Cache();
export const memoryCache = new MemoryCache();

// Cache decorator
export function cacheable(ttl: number = DEFAULT_TTL) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}_${JSON.stringify(args)}`;
      const cached = memoryCache.get(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      memoryCache.set(key, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}