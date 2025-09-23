"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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
    this.baseUrl = typeof window !== "undefined" ? "http://localhost:3000/api" : opts.baseUrl ?? "https://api.buildll.com";
    this.siteId = opts.siteId;
    this.publicApiKey = opts.publicApiKey;
    this.serverApiKey = opts.serverApiKey;
  }
  async getContent(sectionId) {
    const url = `${this.baseUrl}/content/${sectionId}`;
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
    const url = `${this.baseUrl}/content/${sectionId}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "Authorization": `Bearer ${this.serverApiKey}` }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch content: ${res.status}`);
    return res.json();
  }
  async updateContent(sectionId, patch, writeToken) {
    const url = `${this.baseUrl}/content/${sectionId}`;
    const res = await fetch(url, {
      method: "PUT",
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

// src/lib/event-bus.ts
var import_mitt = __toESM(require("mitt"));
var eventBus = (0, import_mitt.default)();

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
  (0, import_react.useEffect)(() => {
    const handleMessage = (event) => {
      if (event.data.type === "SAVE_ELEMENT") {
        eventBus.emit("SAVE_ELEMENT", event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildllContext.Provider, { value: { client, editorMode: !!editorMode, siteId }, children });
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
  (0, import_react2.useEffect)(() => {
    const handleSave = (event) => {
      if (event.id === sectionId) {
        updateContent(event.content);
      }
    };
    eventBus.on("SAVE_ELEMENT", handleSave);
    return () => {
      eventBus.off("SAVE_ELEMENT", handleSave);
    };
  }, [sectionId]);
  return { data, isLoading, error, updateContent: editorMode ? updateContent : void 0 };
}

// src/components/Editable.tsx
var import_react3 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function Editable({
  id,
  type = "text",
  as: Component = "span",
  children,
  className,
  ...rest
}) {
  const { editorMode, siteId } = useBuildll();
  const [isEditing, setIsEditing] = (0, import_react3.useState)(false);
  const [content, setContent] = (0, import_react3.useState)(children);
  const handleClick = () => {
    if (editorMode) {
      setIsEditing(true);
    }
  };
  const handleSave = async () => {
    try {
      await fetch(
        `/api/content/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ data: content, siteId })
        }
      );
    } catch (error) {
      console.error("Error saving content:", error);
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setContent(children);
  };
  if (!editorMode) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      Component,
      {
        "data-buildll-id": id,
        "data-buildll-type": type,
        className,
        ...rest,
        children
      }
    );
  }
  if (isEditing) {
    if (type === "text") {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          type: "text",
          value: content,
          onChange: (e) => setContent(e.target.value),
          onBlur: handleSave,
          onKeyDown: (e) => e.key === "Enter" && handleSave(),
          autoFocus: true
        }
      );
    } else if (type === "image") {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            type: "file",
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setContent(event.target?.result);
                };
                reader.readAsDataURL(file);
              }
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: handleSave, children: "Save" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: handleCancel, children: "Cancel" })
      ] });
    }
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
      onClick: handleClick,
      ...rest,
      children: content
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
