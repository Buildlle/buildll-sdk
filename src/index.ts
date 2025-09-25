// Production-only Buildll SDK
// NO editing UI - purely for content display
// Editing happens only in Buildll Dashboard

export { BuildllProvider } from './provider/BuildllProvider';
export { useContent, useBatchContent } from './hooks/useContent';
export { Text } from './components/Text';
export { Image } from './components/Image';
export { RichText } from './components/RichText';
export { buildllClient } from './client';
export type { BuildllClientOptions, ContentResponse } from './types';

// Manual components (fallback when plugin fails)
export { EditableText } from './components/manual/EditableText';
export { EditableImage } from './components/manual/EditableImage';

// Export interfaces for TypeScript users
export type { TextProps } from './components/Text';
export type { ImageProps } from './components/Image';
export type { RichTextProps } from './components/RichText';
export type { EditableTextProps } from './components/manual/EditableText';
export type { EditableImageProps } from './components/manual/EditableImage';
export type { BuildllProviderProps } from './provider/BuildllProvider';
