
export interface TextProps {
  contentId: string;
  fallback: string;
  className?: string;
  children?: React.ReactNode;
}

export function Text({ contentId, fallback, className }: TextProps) {
  // For now, just return the fallback text
  // In production, this would fetch from the API
  return (
    <span
      className={className}
      data-buildll-id={contentId}
      data-buildll-text={fallback}
      data-buildll-type="text"
    >
      {fallback}
    </span>
  );
}