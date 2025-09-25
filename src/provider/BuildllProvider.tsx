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
      // Inject the editor script inline to avoid CORS issues
      const script = document.createElement('script');
      script.textContent = `
        /**
         * Buildll Editor Script - Inline Version
         * Makes elements with data-buildll-* attributes clickable for editing.
         */
        (function() {
          'use strict';

          let isEditorEnabled = false;
          let hoveredElement = null;

          // Check if we're in editor mode
          const urlParams = new URLSearchParams(window.location.search);
          const isEditorMode = urlParams.get('buildll_editor') === 'true';

          if (!isEditorMode) {
            return; // Exit if not in editor mode
          }

          // Initialize editor when parent sends init message
          window.addEventListener('message', function(event) {
            // Allow messages from Buildll dashboard origins
            const allowedOrigins = [
              'https://www.buildll.com',
              'https://buildll.com',
              'http://localhost:3000',
              'http://localhost:3001'
            ];

            // Skip origin check for same-origin messages or allowed origins
            if (event.origin !== window.location.origin &&
                !allowedOrigins.includes(event.origin)) {
              return;
            }

            const { type, data } = event.data;

            switch (type) {
              case 'BUILDLL_INIT_EDITOR':
                initializeEditor(data);
                break;

              case 'BUILDLL_CONTENT_UPDATED':
                updateElementContent(data);
                break;
            }
          });

          function initializeEditor(config) {
            isEditorEnabled = true;

            // Add visual indicators for editable elements
            addEditorStyles();

            // Make elements clickable
            setupElementInteractions();

            // Notify parent that editor is ready
            notifyParent('BUILDLL_READY');

            console.log('Buildll Editor initialized (inline)');
          }

          function addEditorStyles() {
            const style = document.createElement('style');
            style.textContent = \`
              [data-buildll-id] {
                position: relative;
                cursor: pointer !important;
                transition: all 0.2s ease;
              }

              [data-buildll-id]:hover {
                background-color: rgba(59, 130, 246, 0.1) !important;
                outline: 2px solid rgba(59, 130, 246, 0.5) !important;
                outline-offset: 2px;
              }

              [data-buildll-id]:hover::after {
                content: 'Click to edit';
                position: absolute;
                top: -30px;
                left: 0;
                background: rgba(59, 130, 246, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-family: system-ui, sans-serif;
                white-space: nowrap;
                z-index: 10000;
                pointer-events: none;
              }

              .buildll-editing {
                background-color: rgba(34, 197, 94, 0.1) !important;
                outline: 2px solid rgba(34, 197, 94, 0.8) !important;
              }
            \`;
            document.head.appendChild(style);
          }

          function setupElementInteractions() {
            // Find all editable elements
            const editableElements = document.querySelectorAll('[data-buildll-id]');

            editableElements.forEach(element => {
              // Click handler
              element.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const buildllId = element.getAttribute('data-buildll-id');
                const buildllText = element.getAttribute('data-buildll-text');
                const buildllType = element.getAttribute('data-buildll-type') || 'text';

                // Get element rectangle for positioning
                const rect = element.getBoundingClientRect();

                // Highlight the editing element
                clearEditingHighlights();
                element.classList.add('buildll-editing');

                // Notify parent of element click
                notifyParent('BUILDLL_ELEMENT_CLICKED', {
                  id: buildllId,
                  elementType: buildllType,
                  text: buildllText || element.textContent?.trim() || '',
                  rect: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                  }
                });
              });

              // Hover handlers
              element.addEventListener('mouseenter', function(e) {
                hoveredElement = element;
                notifyParent('BUILDLL_ELEMENT_HOVER', {
                  id: element.getAttribute('data-buildll-id'),
                  entering: true
                });
              });

              element.addEventListener('mouseleave', function(e) {
                hoveredElement = null;
                notifyParent('BUILDLL_ELEMENT_HOVER', {
                  id: element.getAttribute('data-buildll-id'),
                  entering: false
                });
              });
            });

            // Prevent default link behavior in editor mode
            document.addEventListener('click', function(e) {
              if (e.target.closest('a[href]') && isEditorEnabled) {
                e.preventDefault();
              }
            });
          }

          function updateElementContent(data) {
            const { id, text } = data;
            const element = document.querySelector(\`[data-buildll-id="\${id}"]\`);

            if (element) {
              // Find the Text component child and update it
              const textElement = element.querySelector('span, div');
              if (textElement) {
                textElement.textContent = text;
              } else {
                element.textContent = text;
              }

              // Update the data attribute
              element.setAttribute('data-buildll-text', text);

              // Clear editing highlight
              element.classList.remove('buildll-editing');

              console.log(\`Updated content for \${id}:\`, text);
            }
          }

          function clearEditingHighlights() {
            const editingElements = document.querySelectorAll('.buildll-editing');
            editingElements.forEach(el => el.classList.remove('buildll-editing'));
          }

          function notifyParent(type, data = null) {
            // Send to all possible Buildll dashboard origins
            const targetOrigins = [
              'https://www.buildll.com',
              'https://buildll.com'
            ];

            targetOrigins.forEach(origin => {
              try {
                window.parent.postMessage({ type, data }, origin);
              } catch (e) {
                // Silent fail if origin is not accessible
              }
            });

            // Also send to wildcard as fallback
            window.parent.postMessage({ type, data }, '*');
          }

          // Auto-inject if the script is loaded directly
          if (isEditorMode) {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                  initializeEditor({ siteId: urlParams.get('siteId') });
                }, 100);
              });
            } else {
              setTimeout(() => {
                initializeEditor({ siteId: urlParams.get('siteId') });
              }, 100);
            }
          }
        })();
      `;
      document.head.appendChild(script);
      console.log('Buildll editor script injected inline');

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