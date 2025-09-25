// src/provider/BuildllProvider.tsx
import { createContext, useContext, useEffect } from "react";

// src/client.ts
var BuildllClient = class {
  // 5 minutes
  constructor(opts) {
    this.cache = /* @__PURE__ */ new Map();
    this.CACHE_TTL = 5 * 60 * 1e3;
    this.baseUrl = typeof window !== "undefined" ? "/api" : opts.baseUrl ?? "https://api.buildll.com";
    console.log("BuildllClient baseUrl:", this.baseUrl);
    this.siteId = opts.siteId;
    this.publicApiKey = opts.publicApiKey;
    this.serverApiKey = opts.serverApiKey;
  }
  getCacheKey(key) {
    return `${this.siteId}:${key}`;
  }
  getCachedData(key) {
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
  setCachedData(key, data) {
    const cacheKey = this.getCacheKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  invalidateCache(key) {
    if (key) {
      const cacheKey = this.getCacheKey(key);
      this.cache.delete(cacheKey);
    } else {
      const sitePrefix = `${this.siteId}:`;
      for (const [cacheKey] of this.cache) {
        if (cacheKey.startsWith(sitePrefix)) {
          this.cache.delete(cacheKey);
        }
      }
    }
  }
  async getContent(sectionId) {
    const cached = this.getCachedData(`content:${sectionId}`);
    if (cached !== null) {
      return cached;
    }
    const url = `${this.baseUrl}/projects/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "x-buildll-key": this.publicApiKey ?? "" }
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
  async getBatchContent(sectionIds) {
    const batchKey = `batch:${sectionIds.sort().join(",")}`;
    const cached = this.getCachedData(batchKey);
    if (cached) {
      return cached;
    }
    const result = {};
    const uncachedIds = [];
    for (const sectionId of sectionIds) {
      const cachedItem = this.getCachedData(`content:${sectionId}`);
      if (cachedItem !== null) {
        result[sectionId] = cachedItem;
      } else {
        uncachedIds.push(sectionId);
      }
    }
    if (uncachedIds.length === 0) {
      return result;
    }
    const url = `${this.baseUrl}/projects/${this.siteId}/content/batch`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-buildll-key": this.publicApiKey ?? ""
      },
      body: JSON.stringify({ sectionIds: uncachedIds })
    });
    if (!res.ok) throw new Error(`Failed to fetch batch content: ${res.status}`);
    const data = await res.json();
    data.results.forEach((item) => {
      this.setCachedData(`content:${item.sectionId}`, item.content);
      result[item.sectionId] = item.content;
    });
    this.setCachedData(batchKey, result);
    return result;
  }
  // server-side method with serverApiKey
  async getContentServer(sectionId) {
    if (!this.serverApiKey) throw new Error("serverApiKey required for getContentServer");
    const url = `${this.baseUrl}/projects/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "Authorization": `Bearer ${this.serverApiKey}` }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }
  async updateContent(sectionId, patch, writeToken) {
    const url = `${this.baseUrl}/projects/${this.siteId}/content`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${writeToken}`
      },
      body: JSON.stringify({ contentId: sectionId, data: patch })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update content: ${res.status} ${text}`);
    }
    this.invalidateCache(`content:${sectionId}`);
    this.invalidateCache();
    return res.json();
  }
  async updateBatchContent(updates, writeToken) {
    const url = `${this.baseUrl}/projects/${this.siteId}/content/batch-update`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${writeToken}`
      },
      body: JSON.stringify({ updates })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update batch content: ${res.status} ${text}`);
    }
    updates.forEach(({ contentId }) => {
      this.invalidateCache(`content:${contentId}`);
    });
    this.invalidateCache();
    return res.json();
  }
};
function buildllClient(opts) {
  return new BuildllClient(opts);
}

// src/provider/BuildllProvider.tsx
import { jsx } from "react/jsx-runtime";
var BuildllContext = createContext(null);
function BuildllProvider({
  siteId,
  publicApiKey,
  baseUrl,
  children
}) {
  const client = buildllClient({ siteId, publicApiKey, baseUrl });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const isEditorMode = urlParams.get("buildll_editor") === "true";
    if (isEditorMode) {
      const script = document.createElement("script");
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
      console.log("Buildll editor script injected inline");
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
    return () => {
    };
  }, []);
  return /* @__PURE__ */ jsx(BuildllContext.Provider, { value: { client, siteId }, children });
}
function useBuildll() {
  const ctx = useContext(BuildllContext);
  if (!ctx) throw new Error("useBuildll must be used inside BuildllProvider");
  return ctx;
}

// src/hooks/useContent.ts
import { useEffect as useEffect2, useState } from "react";
function mergeDefaults(defaults, fetched) {
  if (!fetched) return defaults;
  return { ...defaults || {}, ...fetched.data || {} };
}
function useContent(sectionId, options) {
  const { client } = useBuildll();
  const [data, setData] = useState(options?.defaults);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect2(() => {
    let mounted = true;
    setLoading(true);
    client.getContent(sectionId).then((res) => {
      if (!mounted) return;
      const merged = mergeDefaults(options?.defaults, res);
      setData(merged);
    }).catch((err) => {
      if (mounted) setError(err);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [client, sectionId, JSON.stringify(options?.defaults)]);
  return { data, isLoading, error };
}
function useBatchContent(sectionIds, options) {
  const { client } = useBuildll();
  const [data, setData] = useState(options?.defaults);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect2(() => {
    if (sectionIds.length === 0) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    client.getBatchContent(sectionIds).then((batchResults) => {
      if (!mounted) return;
      const mergedData = {};
      sectionIds.forEach((sectionId) => {
        const result = batchResults[sectionId];
        const defaultValue = options?.defaults?.[sectionId];
        mergedData[sectionId] = mergeDefaults(defaultValue, result);
      });
      setData(mergedData);
    }).catch((err) => {
      if (mounted) setError(err);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [client, JSON.stringify(sectionIds), JSON.stringify(options?.defaults)]);
  return {
    data,
    isLoading,
    error
  };
}

// src/components/Text.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Text({ contentId, fallback, className }) {
  return /* @__PURE__ */ jsx2(
    "span",
    {
      className,
      "data-buildll-id": contentId,
      "data-buildll-text": fallback,
      "data-buildll-type": "text",
      children: fallback
    }
  );
}

// src/components/Image.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function Image({ contentId, src, alt, className, width, height }) {
  return /* @__PURE__ */ jsx3(
    "img",
    {
      src,
      alt,
      className,
      width,
      height,
      "data-buildll-id": contentId,
      "data-buildll-src": src,
      "data-buildll-type": "image"
    }
  );
}

// src/components/RichText.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
function RichText({ contentId, fallback, className }) {
  return /* @__PURE__ */ jsx4(
    "div",
    {
      className,
      "data-buildll-id": contentId,
      "data-buildll-text": fallback,
      "data-buildll-type": "richtext",
      dangerouslySetInnerHTML: { __html: fallback }
    }
  );
}

// src/components/manual/EditableText.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function EditableText({
  id,
  children,
  className,
  as: Component = "span"
}) {
  const textContent = typeof children === "string" ? children : "";
  return /* @__PURE__ */ jsx5(
    Component,
    {
      className,
      "data-buildll-id": id,
      "data-buildll-text": textContent,
      "data-buildll-type": "text",
      children
    }
  );
}

// src/components/manual/EditableImage.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
function EditableImage({
  id,
  src,
  alt,
  className,
  width,
  height
}) {
  return /* @__PURE__ */ jsx6(
    "img",
    {
      src,
      alt,
      className,
      width,
      height,
      "data-buildll-id": id,
      "data-buildll-src": src,
      "data-buildll-type": "image"
    }
  );
}
export {
  BuildllProvider,
  EditableImage,
  EditableText,
  Image,
  RichText,
  Text,
  buildllClient,
  useBatchContent,
  useContent
};
//# sourceMappingURL=index.mjs.map