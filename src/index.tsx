// Buildll Content Editor - Helper Components and Hooks for React/Next.js
//
// This package provides optional React helpers for the Buildll content editor.
// The core functionality requires only the editor script and data attributes.
//
// See: https://github.com/buildll/sdk#readme for full documentation

import { useEffect, useRef, createElement } from 'react';

/**
 * Props interface for EditableText component
 */
export interface EditableTextProps {
  /** Unique identifier for the content element */
  id: string;
  /** Text content */
  children: string;
  /** HTML tag to render (default: 'p') */
  tag?: keyof React.JSX.IntrinsicElements;
  /** CSS class name */
  className?: string;
  /** Additional props passed to the element */
  [key: string]: any;
}

/**
 * React hook for adding Buildll editable attributes to elements
 *
 * @param id - Unique identifier for the content element
 * @param text - Current text content (must match repository content exactly)
 * @param type - Content type (default: 'text')
 * @returns React ref to attach to your element
 */
export function useBuildllEditable(id: string, text: string, type: string = 'text') {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-buildll-id', id);
      ref.current.setAttribute('data-buildll-text', text);
      ref.current.setAttribute('data-buildll-type', type);
    }
  }, [id, text, type]);

  return ref;
}

/**
 * React component that renders editable text with required Buildll attributes
 *
 * @param props - EditableTextProps
 * @returns JSX element with data-buildll-* attributes
 */
export function EditableText({
  id,
  children,
  tag = 'p',
  ...props
}: EditableTextProps) {
  return createElement(
    tag,
    {
      'data-buildll-id': id,
      'data-buildll-text': children,
      'data-buildll-type': 'text',
      ...props,
    },
    children
  );
}