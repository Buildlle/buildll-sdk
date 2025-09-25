// src/index.tsx
import { useEffect, useRef, createElement } from "react";
function useBuildllEditable(id, text, type = "text") {
  const ref = useRef(null);
  useEffect(() => {
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
  return createElement(
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
export {
  EditableText,
  useBuildllEditable
};
//# sourceMappingURL=index.mjs.map