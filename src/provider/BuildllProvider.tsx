import React, { createContext, useContext, useEffect } from 'react';
import { buildllClient, BuildllClient } from '../client';
import { eventBus } from '../lib/event-bus';

const BuildllContext = createContext<{ client: BuildllClient; editorMode: boolean; siteId: string; } | null>(null);

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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SAVE_ELEMENT') {
        eventBus.emit('SAVE_ELEMENT', event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <BuildllContext.Provider value={{ client, editorMode: !!editorMode, siteId }}>
      {children}
    </BuildllContext.Provider>
  );
}

export function useBuildll() {
  const ctx = useContext(BuildllContext);
  if (!ctx) throw new Error('useBuildll must be used inside BuildllProvider');
  return ctx;
}
