import * as react_jsx_runtime from 'react/jsx-runtime';
import React$1 from 'react';

interface ContentResponse<T = unknown> {
    id: string;
    data: T;
    meta?: {
        createdAt?: string;
        updatedAt?: string;
        version?: number;
    };
}
interface BuildllClientOptions {
    baseUrl?: string;
    siteId: string;
    publicApiKey?: string;
    serverApiKey?: string;
}

declare class BuildllClient {
    baseUrl: string;
    siteId: string;
    publicApiKey?: string;
    serverApiKey?: string;
    private cache;
    private readonly CACHE_TTL;
    constructor(opts: BuildllClientOptions);
    private getCacheKey;
    private getCachedData;
    private setCachedData;
    private invalidateCache;
    getContent<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null>;
    getBatchContent<T = unknown>(sectionIds: string[]): Promise<Record<string, ContentResponse<T> | null>>;
    getContentServer<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null>;
    updateContent<T = unknown>(sectionId: string, patch: Partial<T>, writeToken: string): Promise<any>;
    updateBatchContent<T = unknown>(updates: Array<{
        contentId: string;
        data: Partial<T>;
    }>, writeToken: string): Promise<any>;
}
declare function buildllClient(opts: BuildllClientOptions): BuildllClient;

interface BuildllProviderProps {
    siteId: string;
    publicApiKey?: string;
    baseUrl?: string;
    children: React$1.ReactNode;
}
/**
 * BuildllProvider - Production-only content provider
 *
 * Provides content fetching capabilities to Buildll components.
 * NO editing functionality - purely for content display.
 * Editing happens only in Buildll Dashboard.
 */
declare function BuildllProvider({ siteId, publicApiKey, baseUrl, children, }: BuildllProviderProps): react_jsx_runtime.JSX.Element;

/**
 * useContent - Production-only content hook
 *
 * Fetches and returns content from Buildll CMS.
 * NO editing functionality - purely for content display.
 * Editing happens only in Buildll Dashboard.
 */
declare function useContent<T = unknown>(sectionId: string, options?: {
    defaults?: T;
    revalidate?: boolean;
}): {
    data: T;
    isLoading: boolean;
    error: unknown;
};
/**
 * useBatchContent - Production-only batch content hook
 *
 * Fetches multiple content sections in a single request.
 * NO editing functionality - purely for content display.
 * Editing happens only in Buildll Dashboard.
 */
declare function useBatchContent<T = Record<string, unknown>>(sectionIds: string[], options?: {
    defaults?: T;
    revalidate?: boolean;
}): {
    data: T;
    isLoading: boolean;
    error: unknown;
};

interface TextProps {
    contentId: string;
    fallback: string;
    className?: string;
    children?: React.ReactNode;
}
declare function Text({ contentId, fallback, className }: TextProps): react_jsx_runtime.JSX.Element;

interface ImageProps {
    contentId: string;
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
}
declare function Image({ contentId, src, alt, className, width, height }: ImageProps): react_jsx_runtime.JSX.Element;

interface RichTextProps {
    contentId: string;
    fallback: string;
    className?: string;
}
declare function RichText({ contentId, fallback, className }: RichTextProps): react_jsx_runtime.JSX.Element;

export { type BuildllClientOptions, BuildllProvider, type BuildllProviderProps, type ContentResponse, Image, type ImageProps, RichText, type RichTextProps, Text, type TextProps, buildllClient, useBatchContent, useContent };
