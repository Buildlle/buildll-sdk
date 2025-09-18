"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BuildllProvider: () => BuildllProvider,
  Editable: () => Editable,
  EditableImage: () => EditableImage,
  EditableRichText: () => EditableRichText,
  EditableText: () => EditableText,
  EditableVideo: () => EditableVideo,
  buildllClient: () => buildllClient,
  useContent: () => useContent
});
module.exports = __toCommonJS(index_exports);

// src/provider/BuildllProvider.tsx
var import_react = require("react");

// src/client.ts
var BuildllClient = class {
  constructor(opts) {
    this.baseUrl = opts.baseUrl ?? "https://api.buildll.com";
    this.siteId = opts.siteId;
    this.publicApiKey = opts.publicApiKey;
    this.serverApiKey = opts.serverApiKey;
  }
  async getContent(sectionId) {
    const url = `${this.baseUrl}/v1/sites/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "x-buildll-key": this.publicApiKey ?? "" }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }
  // server-side method with serverApiKey
  async getContentServer(sectionId) {
    if (!this.serverApiKey) throw new Error("serverApiKey required for getContentServer");
    const url = `${this.baseUrl}/v1/sites/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "Authorization": `Bearer ${this.serverApiKey}` }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }
  async updateContent(sectionId, patch, writeToken) {
    const url = `${this.baseUrl}/v1/sites/${this.siteId}/content/${sectionId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${writeToken}`
      },
      body: JSON.stringify({ patch })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update content: ${res.status} ${text}`);
    }
    return res.json();
  }
};
function buildllClient(opts) {
  return new BuildllClient(opts);
}

// src/provider/BuildllProvider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var BuildllContext = (0, import_react.createContext)(null);
function BuildllProvider({
  siteId,
  publicApiKey,
  children,
  editorMode,
  baseUrl
}) {
  const client = buildllClient({ siteId, publicApiKey, baseUrl });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildllContext.Provider, { value: { client, editorMode: !!editorMode }, children });
}
function useBuildll() {
  const ctx = (0, import_react.useContext)(BuildllContext);
  if (!ctx) throw new Error("useBuildll must be used inside BuildllProvider");
  return ctx;
}

// src/hooks/useContent.ts
var import_react2 = require("react");
function mergeDefaults(defaults, fetched) {
  if (!fetched) return defaults;
  return { ...defaults || {}, ...fetched.data || {} };
}
function useContent(sectionId, options) {
  const { client, editorMode } = useBuildll();
  const [data, setData] = (0, import_react2.useState)(options?.defaults);
  const [isLoading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
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
  }, [client, sectionId, options?.defaults]);
  async function updateContent(patch, writeToken) {
    if (!editorMode && !writeToken) throw new Error("Not in editor mode or missing write token");
    await client.updateContent(sectionId, patch, writeToken);
    setData((prev) => ({ ...prev, ...patch }));
  }
  return { data, isLoading, error, updateContent: editorMode ? updateContent : void 0 };
}

// src/components/Editable.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function Editable({
  id,
  type = "text",
  as: Component = "span",
  children,
  className,
  ...rest
}) {
  const ctx = useBuildll();
  const isEditor = ctx.editorMode;
  if (!isEditor) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Component, { "data-buildll-id": id, "data-buildll-type": type, className, ...rest, children });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    Component,
    {
      "data-buildll-id": id,
      "data-buildll-type": type,
      className,
      style: {
        outline: "1px dashed rgba(0,0,0,0.2)",
        position: "relative",
        cursor: "pointer"
      },
      ...rest,
      children
    }
  );
}
function EditableText(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Editable, { ...props, type: "text", as: "span" });
}
function EditableImage({
  alt,
  ...props
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Editable, { ...props, type: "image", as: "img", alt });
}
function EditableVideo(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Editable, { ...props, type: "video", as: "video", controls: true });
}
function EditableRichText(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Editable, { ...props, type: "richtext", as: "div" });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BuildllProvider,
  Editable,
  EditableImage,
  EditableRichText,
  EditableText,
  EditableVideo,
  buildllClient,
  useContent
});
