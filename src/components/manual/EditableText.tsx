export interface EditableTextProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Manual EditableText component for when the Babel plugin fails
 * This provides a fallback for zero-boilerplate editing
 */
export function EditableText({
  id,
  children,
  className,
  as: Component = 'span'
}: EditableTextProps) {
  const textContent = typeof children === 'string' ? children : '';

  return (
    <Component
      className={className}
      data-buildll-id={id}
      data-buildll-text={textContent}
      data-buildll-type="text"
    >
      {children}
    </Component>
  );
}