import { useEffect, useState } from 'react';
import { useBuildll } from '../provider/BuildllProvider';
import type { ContentResponse } from '../types';

function mergeDefaults<T>(defaults: T | undefined, fetched: ContentResponse<T> | null): T {
  if (!fetched) return defaults as T;
  return { ...(defaults || {}), ...(fetched.data || {}) } as T;
}

/**
 * useContent - Production-only content hook
 *
 * Fetches and returns content from Buildll CMS.
 * NO editing functionality - purely for content display.
 * Editing happens only in Buildll Dashboard.
 */
export function useContent<T = unknown>(
  sectionId: string,
  options?: { defaults?: T; revalidate?: boolean }
) {
  const { client } = useBuildll();
  const [data, setData] = useState<T | undefined>(options?.defaults);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    client.getContent<T>(sectionId)
      .then((res) => {
        if (!mounted) return;
        const merged = mergeDefaults(options?.defaults, res);
        setData(merged);
      })
      .catch((err) => { if (mounted) setError(err); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [client, sectionId, JSON.stringify(options?.defaults)]);

  return { data: (data as T), isLoading, error };
}

/**
 * useBatchContent - Production-only batch content hook
 *
 * Fetches multiple content sections in a single request.
 * NO editing functionality - purely for content display.
 * Editing happens only in Buildll Dashboard.
 */
export function useBatchContent<T = Record<string, unknown>>(
  sectionIds: string[],
  options?: { defaults?: T; revalidate?: boolean }
) {
  const { client } = useBuildll();
  const [data, setData] = useState<T | undefined>(options?.defaults);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    client.getBatchContent(sectionIds)
      .then((batchResults) => {
        if (!mounted) return;

        const mergedData: Record<string, any> = {};

        sectionIds.forEach((sectionId) => {
          const result = batchResults[sectionId];
          const defaultValue = options?.defaults?.[sectionId as keyof T];
          mergedData[sectionId] = mergeDefaults(defaultValue, result);
        });

        setData(mergedData as T);
      })
      .catch((err) => { if (mounted) setError(err); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [client, JSON.stringify(sectionIds), JSON.stringify(options?.defaults)]);

  return {
    data: (data as T),
    isLoading,
    error
  };
}