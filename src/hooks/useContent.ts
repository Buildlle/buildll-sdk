import { useEffect, useState } from 'react';
import { useBuildll } from '../provider/BuildllProvider';
import type { ContentResponse } from '../types';

function mergeDefaults<T>(defaults: T | undefined, fetched: ContentResponse<T> | null): T {
  if (!fetched) return defaults as T;
  return { ...(defaults || {}), ...(fetched.data || {}) } as T;
}

export function useContent<T = unknown>(
  sectionId: string,
  options?: { defaults?: T; revalidate?: boolean }
) {
  const { client, editorMode } = useBuildll();
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
  }, [client, sectionId, options?.defaults]);

  async function updateContent(patch: Partial<T>, writeToken?: string) {
    if (!editorMode && !writeToken) throw new Error('Not in editor mode or missing write token');
    // call client.updateContent
    await client.updateContent(sectionId, patch, writeToken as string);
    // optimistically merge
    setData(prev => ({ ...(prev as T), ...patch } as T));
  }

  return { data: (data as T), isLoading, error, updateContent: editorMode ? updateContent : undefined };
}
