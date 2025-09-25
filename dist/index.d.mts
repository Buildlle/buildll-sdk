import * as react from 'react';

/**
 * Props interface for EditableText component
 */
interface EditableTextProps {
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
declare function useBuildllEditable(id: string, text: string, type?: string): react.RefObject<HTMLElement | null>;
/**
 * React component that renders editable text with required Buildll attributes
 *
 * @param props - EditableTextProps
 * @returns JSX element with data-buildll-* attributes
 */
declare function EditableText({ id, children, tag, ...props }: EditableTextProps): react.ReactElement<{
    /** CSS class name */
    className?: string;
    'data-buildll-id': string;
    'data-buildll-text': string;
    'data-buildll-type': string;
}, string | react.JSXElementConstructor<any>>;

export { EditableText, type EditableTextProps, useBuildllEditable };
