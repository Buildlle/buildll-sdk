import React, { createContext, useContext, useEffect } from 'react';
import { buildllClient, BuildllClient } from '../client';

const BuildllContext = createContext<{ client: BuildllClient; siteId: string } | null>(null);

export interface BuildllProviderProps {
  siteId: string;
  publicApiKey?: string;
  baseUrl?: string;
  children: React.ReactNode;
}

/**
 * BuildllProvider - Production-only content provider
 *
 * Provides content fetching capabilities to Buildll components.
 * NO editing functionality - purely for content display.
 * Editing happens only in Buildll Dashboard.
 */
export function BuildllProvider({
  siteId,
  publicApiKey,
  baseUrl,
  children,
}: BuildllProviderProps) {
  const client = buildllClient({ siteId, publicApiKey, baseUrl });

  // Check if we're in editor mode and inject editor script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const isEditorMode = urlParams.get('buildll_editor') === 'true';

    if (isEditorMode) {
      // Dynamically load the editor script
      const script = document.createElement('script');
      script.src = baseUrl ? `${baseUrl}/buildll-editor.js` : 'https://buildll.com/buildll-editor.js';
      script.async = true;
      script.onload = () => {
        console.log('Buildll editor script loaded');
      };
      script.onerror = () => {
        console.warn('Failed to load Buildll editor script from:', script.src);
        // Try fallback URL for development
        if (!script.src.includes('localhost')) {
          const fallbackScript = document.createElement('script');
          fallbackScript.src = '/buildll-editor.js';
          fallbackScript.async = true;
          fallbackScript.onerror = () => {
            console.warn('Failed to load fallback editor script');
          };
          document.head.appendChild(fallbackScript);
        }
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup if needed
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }

    return () => {
      // No cleanup needed if not in editor mode
    };
  }, []);

  return (
    <BuildllContext.Provider value={{ client, siteId }}>
      {children}
    </BuildllContext.Provider>
  );
}

export function useBuildll() {
  const ctx = useContext(BuildllContext);
  if (!ctx) throw new Error('useBuildll must be used inside BuildllProvider');
  return ctx;
}