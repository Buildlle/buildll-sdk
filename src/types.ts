export type FieldType = 'text'|'image'|'richtext'|'link'|'array'|'video';

export interface ContentResponse<T = unknown> {
  id: string;
  data: T;
  meta?: { createdAt?: string; updatedAt?: string; version?: number; };
}

export interface BuildllClientOptions {
  baseUrl?: string; // e.g. https://api.buildll.com
  siteId: string;
  publicApiKey?: string;
  serverApiKey?: string; // only server-side usage
}
