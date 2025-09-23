import React from "react";
import { useBuildll } from "../provider/BuildllProvider";

/**
 * Core props shared by all Editable components.
 */
export interface EditableProps {
  id: string;                     // Unique content ID
  type?: "text" | "image" | "video" | "richtext" | "custom"; 
  as?: React.ElementType; // HTML tag override
  children?: React.ReactNode;     
  className?: string;
}

/**
 * Universal Editable component
 * - Acts as the base building block for content editing.
 * - In non-editor mode: just renders children or content.
 * - In editor mode: adds data attributes + inline styles to hook into Buildll dashboard overlays.
 */
export function Editable({
  id,
  type = "text",
  as: Component = "span",
  children,
  className,
  ...rest
}: EditableProps & { [key: string]: unknown }) {
  const ctx = useBuildll();
  const isEditor = ctx.editorMode;

  const handleClick = () => {
    if (isEditor) {
      window.parent.postMessage({ type: 'buildll-edit', id, contentType: type }, '*');
    }
  };

  if (!isEditor) {
    return (
      <Component data-buildll-id={id} data-buildll-type={type} className={className} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      data-buildll-id={id}
      data-buildll-type={type}
      className={className}
      style={{
        outline: "1px dashed rgba(0,0,0,0.2)",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={handleClick}
      {...rest}
    >
      {children}
      {/* Buildll dashboard will detect these attributes and render editing overlays */}
    </Component>
  );
}

/**
 * Sugar wrappers for common content types
 * - These improve DX (developer experience) by enforcing clearer props.
 */

/** EditableText — simple text block */
export function EditableText(props: Omit<EditableProps, "type" | "as">) {
  return <Editable {...props} type="text" as="span" />;
}

/** EditableImage — image with alt, width, height, etc. */
export function EditableImage({
  alt,
  ...props
}: Omit<EditableProps, "type" | "as"> & { alt?: string }) {
  return <Editable {...props} type="image" as="img" alt={alt} />;
}

/** EditableVideo — for video embeds */
export function EditableVideo(
  props: Omit<EditableProps, "type" | "as">
) {
  return <Editable {...props} type="video" as="video" controls />;
}

/** EditableRichText — for larger text blocks */
export function EditableRichText(props: Omit<EditableProps, "type" | "as">) {
  return <Editable {...props} type="richtext" as="div" />;
}
