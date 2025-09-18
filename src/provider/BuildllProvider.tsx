import React, { createContext, useContext } from 'react';
import { buildllClient, BuildllClient } from '../client';

const BuildllContext = createContext<{ client: BuildllClient; editorMode: boolean } | null>(null);

export function BuildllProvider({
  siteId,
  publicApiKey,
  children,
  editorMode,
  baseUrl
}: {
  siteId: string;
  publicApiKey?: string;
  editorMode?: boolean;
  baseUrl?: string;
  children: React.ReactNode;
}) {
  const client = buildllClient({ siteId, publicApiKey, baseUrl });
  return (
    <BuildllContext.Provider value={{ client, editorMode: !!editorMode }}>
      {children}
    </BuildllContext.Provider>
  );
}

export function useBuildll() {
  const ctx = useContext(BuildllContext);
  if (!ctx) throw new Error('useBuildll must be used inside BuildllProvider');
  return ctx;
}
