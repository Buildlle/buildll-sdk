
export interface ImageProps {
  contentId: string;
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Image({ contentId, src, alt, className, width, height }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      data-buildll-id={contentId}
      data-buildll-src={src}
      data-buildll-type="image"
    />
  );
}