// src/provider/BuildllProvider.tsx
import { createContext, useContext, useEffect } from "react";

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
  return /* @__PURE__ */ jsx(BuildllContext.Provider, { value: { client, editorMode: !!editorMode, siteId }, children });
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
import { useState as useState2 } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function Editable({
  id,
  type = "text",
  as: Component = "span",
  children,
  className,
  ...rest
}) {
  const { editorMode, siteId } = useBuildll();
  const [isEditing, setIsEditing] = useState2(false);
  const [content, setContent] = useState2(children);
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
    return /* @__PURE__ */ jsx2(
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
      return /* @__PURE__ */ jsx2(
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
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx2(
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
        /* @__PURE__ */ jsx2("button", { onClick: handleSave, children: "Save" }),
        /* @__PURE__ */ jsx2("button", { onClick: handleCancel, children: "Cancel" })
      ] });
    }
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
      children: content
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
