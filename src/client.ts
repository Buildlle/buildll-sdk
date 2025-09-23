import type { BuildllClientOptions, ContentResponse } from './types';

export class BuildllClient {
  baseUrl: string;
  siteId: string;
  publicApiKey?: string;
  serverApiKey?: string;

  constructor(opts: BuildllClientOptions) {
    this.baseUrl = typeof window !== 'undefined' ? 'http://localhost:3000/api' : (opts.baseUrl ?? 'https://api.buildll.com');
    this.siteId = opts.siteId;
    this.publicApiKey = opts.publicApiKey;
    this.serverApiKey = opts.serverApiKey;
  }

  async getContent<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null> {
    const url = `${this.baseUrl}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'x-buildll-key': this.publicApiKey ?? ''},
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }

  // server-side method with serverApiKey
  async getContentServer<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null> {
    if (!this.serverApiKey) throw new Error('serverApiKey required for getContentServer');
    const url = `${this.baseUrl}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${this.serverApiKey}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }

  async updateContent<T = unknown>(sectionId: string, patch: Partial<T>, writeToken: string) {
    const url = `${this.baseUrl}/content/${sectionId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${writeToken}`,
      },
      body: JSON.stringify({ patch }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update content: ${res.status} ${text}`);
    }
    return res.json();
  }
}

// small factory
export function buildllClient(opts: BuildllClientOptions) {
  return new BuildllClient(opts);
}
