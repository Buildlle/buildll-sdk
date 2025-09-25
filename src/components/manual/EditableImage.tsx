
export interface EditableImageProps {
  id: string;
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Manual EditableImage component for when the Babel plugin fails
 */
export function EditableImage({
  id,
  src,
  alt,
  className,
  width,
  height
}: EditableImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      data-buildll-id={id}
      data-buildll-src={src}
      data-buildll-type="image"
    />
  );
}