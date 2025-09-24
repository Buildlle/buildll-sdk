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

// Export interfaces for TypeScript users
export type { TextProps } from './components/Text';
export type { ImageProps } from './components/Image';
export type { RichTextProps } from './components/RichText';
export type { BuildllProviderProps } from './provider/BuildllProvider';
