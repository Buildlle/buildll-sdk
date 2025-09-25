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

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  EditableText: () => EditableText,
  useBuildllEditable: () => useBuildllEditable
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
function useBuildllEditable(id, text, type = "text") {
  const ref = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (ref.current) {
      ref.current.setAttribute("data-buildll-id", id);
      ref.current.setAttribute("data-buildll-text", text);
      ref.current.setAttribute("data-buildll-type", type);
    }
  }, [id, text, type]);
  return ref;
}
function EditableText({
  id,
  children,
  tag = "p",
  ...props
}) {
  return (0, import_react.createElement)(
    tag,
    {
      "data-buildll-id": id,
      "data-buildll-text": children,
      "data-buildll-type": "text",
      ...props
    },
    children
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EditableText,
  useBuildllEditable
});
//# sourceMappingURL=index.js.map