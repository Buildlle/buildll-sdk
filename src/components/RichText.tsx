
export interface RichTextProps {
  contentId: string;
  fallback: string;
  className?: string;
}

export function RichText({ contentId, fallback, className }: RichTextProps) {
  return (
    <div
      className={className}
      data-buildll-id={contentId}
      data-buildll-text={fallback}
      data-buildll-type="richtext"
      dangerouslySetInnerHTML={{ __html: fallback }}
    />
  );
}