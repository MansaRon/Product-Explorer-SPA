import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
 
  get(key: string): HttpResponse<unknown> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }
 
  set(key: string, response: HttpResponse<unknown>, ttl: number): void {
    this.cache.set(key, { response, expiresAt: Date.now() + ttl });
  }
 
  invalidate(urlPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(urlPattern)) this.cache.delete(key);
    }
  }
 
  clear(): void {
    this.cache.clear();
  }
}
