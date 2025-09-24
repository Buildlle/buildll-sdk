import type { BuildllClientOptions, ContentResponse } from './types';

export class BuildllClient {
  baseUrl: string;
  siteId: string;
  publicApiKey?: string;
  serverApiKey?: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(opts: BuildllClientOptions) {
    this.baseUrl = typeof window !== 'undefined' ? '/api' : (opts.baseUrl ?? 'https://api.buildll.com');
    console.log('BuildllClient baseUrl:', this.baseUrl);
    this.siteId = opts.siteId;
    this.publicApiKey = opts.publicApiKey;
    this.serverApiKey = opts.serverApiKey;
  }

  private getCacheKey(key: string): string {
    return `${this.siteId}:${key}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCachedData<T>(key: string, data: T): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  private invalidateCache(key?: string): void {
    if (key) {
      const cacheKey = this.getCacheKey(key);
      this.cache.delete(cacheKey);
    } else {
      // Clear all cache for this siteId
      const sitePrefix = `${this.siteId}:`;
      for (const [cacheKey] of this.cache) {
        if (cacheKey.startsWith(sitePrefix)) {
          this.cache.delete(cacheKey);
        }
      }
    }
  }

  async getContent<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null> {
    // Check cache first
    const cached = this.getCachedData<ContentResponse<T> | null>(`content:${sectionId}`);
    if (cached !== null) {
      return cached;
    }

    const url = `${this.baseUrl}/projects/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'x-buildll-key': this.publicApiKey ?? ''},
    });
    if (res.status === 404) {
      this.setCachedData(`content:${sectionId}`, null);
      return null;
    }
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);

    const result = await res.json();
    this.setCachedData(`content:${sectionId}`, result);
    return result;
  }

  async getBatchContent<T = unknown>(sectionIds: string[]): Promise<Record<string, ContentResponse<T> | null>> {
    // Create a batch cache key
    const batchKey = `batch:${sectionIds.sort().join(',')}`;
    const cached = this.getCachedData<Record<string, ContentResponse<T> | null>>(batchKey);
    if (cached) {
      return cached;
    }

    // Check individual caches first to avoid unnecessary API calls
    const result: Record<string, ContentResponse<T> | null> = {};
    const uncachedIds: string[] = [];

    for (const sectionId of sectionIds) {
      const cachedItem = this.getCachedData<ContentResponse<T> | null>(`content:${sectionId}`);
      if (cachedItem !== null) {
        result[sectionId] = cachedItem;
      } else {
        uncachedIds.push(sectionId);
      }
    }

    // If all items are cached, return immediately
    if (uncachedIds.length === 0) {
      return result;
    }

    // Fetch only uncached items
    const url = `${this.baseUrl}/projects/${this.siteId}/content/batch`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-buildll-key': this.publicApiKey ?? ''
      },
      body: JSON.stringify({ sectionIds: uncachedIds }),
    });
    if (!res.ok) throw new Error(`Failed to fetch batch content: ${res.status}`);

    const data = await res.json();

    // Cache individual results and merge with existing results
    data.results.forEach((item: { sectionId: string; content: ContentResponse<T> | null }) => {
      this.setCachedData(`content:${item.sectionId}`, item.content);
      result[item.sectionId] = item.content;
    });

    // Cache the entire batch result
    this.setCachedData(batchKey, result);

    return result;
  }

  // server-side method with serverApiKey
  async getContentServer<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null> {
    if (!this.serverApiKey) throw new Error('serverApiKey required for getContentServer');
    const url = `${this.baseUrl}/projects/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${this.serverApiKey}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }

  async updateContent<T = unknown>(sectionId: string, patch: Partial<T>, writeToken: string) {
    const url = `${this.baseUrl}/projects/${this.siteId}/content`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${writeToken}`,
      },
      body: JSON.stringify({ contentId: sectionId, data: patch }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update content: ${res.status} ${text}`);
    }

    // Invalidate cache for this section and all batch caches
    this.invalidateCache(`content:${sectionId}`);
    // Clear all batch caches as they may contain this section
    this.invalidateCache();

    return res.json();
  }

  async updateBatchContent<T = unknown>(
    updates: Array<{ contentId: string; data: Partial<T> }>,
    writeToken: string
  ) {
    const url = `${this.baseUrl}/projects/${this.siteId}/content/batch-update`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${writeToken}`,
      },
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update batch content: ${res.status} ${text}`);
    }

    // Invalidate cache for all updated sections
    updates.forEach(({ contentId }) => {
      this.invalidateCache(`content:${contentId}`);
    });
    // Clear all batch caches
    this.invalidateCache();

    return res.json();
  }
}

// small factory
export function buildllClient(opts: BuildllClientOptions) {
  return new BuildllClient(opts);
}
