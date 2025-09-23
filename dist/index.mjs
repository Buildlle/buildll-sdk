// src/provider/BuildllProvider.tsx
import { createContext, useContext, useEffect } from "react";

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

// src/lib/event-bus.ts
import mitt from "mitt";
var eventBus = mitt();

// src/provider/BuildllProvider.tsx
import { jsx } from "react/jsx-runtime";
var BuildllContext = createContext(null);
function BuildllProvider({
  siteId,
  publicApiKey,
  children,
  editorMode,
  baseUrl
}) {
  const client = buildllClient({ siteId, publicApiKey, baseUrl });
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(BuildllContext.Provider, { value: { client, editorMode: !!editorMode }, children });
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
  const { client, editorMode } = useBuildll();
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
  }, [client, sectionId, options?.defaults]);
  async function updateContent(patch, writeToken) {
    if (!editorMode && !writeToken) throw new Error("Not in editor mode or missing write token");
    await client.updateContent(sectionId, patch, writeToken);
    setData((prev) => ({ ...prev, ...patch }));
  }
  useEffect2(() => {
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
import { jsx as jsx2 } from "react/jsx-runtime";
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
  const handleClick = () => {
    if (isEditor) {
      window.parent.postMessage({ type: "buildll-edit", id, contentType: type }, "*");
    }
  };
  if (!isEditor) {
    return /* @__PURE__ */ jsx2(Component, { "data-buildll-id": id, "data-buildll-type": type, className, ...rest, children });
  }
  return /* @__PURE__ */ jsx2(
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
      children
    }
  );
}
function EditableText(props) {
  return /* @__PURE__ */ jsx2(Editable, { ...props, type: "text", as: "span" });
}
function EditableImage({
  alt,
  ...props
}) {
  return /* @__PURE__ */ jsx2(Editable, { ...props, type: "image", as: "img", alt });
}
function EditableVideo(props) {
  return /* @__PURE__ */ jsx2(Editable, { ...props, type: "video", as: "video", controls: true });
}
function EditableRichText(props) {
  return /* @__PURE__ */ jsx2(Editable, { ...props, type: "richtext", as: "div" });
}
export {
  BuildllProvider,
  Editable,
  EditableImage,
  EditableRichText,
  EditableText,
  EditableVideo,
  buildllClient,
  useContent
};
