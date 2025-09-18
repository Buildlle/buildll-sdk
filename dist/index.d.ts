import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

interface ContentResponse<T = unknown> {
    id: string;
    data: T;
    meta?: {
        createdAt?: string;
        updatedAt?: string;
        version?: number;
    };
}
interface BuildllClientOptions {
    baseUrl?: string;
    siteId: string;
    publicApiKey?: string;
    serverApiKey?: string;
}

declare class BuildllClient {
    baseUrl: string;
    siteId: string;
    publicApiKey?: string;
    serverApiKey?: string;
    constructor(opts: BuildllClientOptions);
    getContent<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null>;
    getContentServer<T = unknown>(sectionId: string): Promise<ContentResponse<T> | null>;
    updateContent<T = unknown>(sectionId: string, patch: Partial<T>, writeToken: string): Promise<any>;
}
declare function buildllClient(opts: BuildllClientOptions): BuildllClient;

declare function BuildllProvider({ siteId, publicApiKey, children, editorMode, baseUrl }: {
    siteId: string;
    publicApiKey?: string;
    editorMode?: boolean;
    baseUrl?: string;
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;

declare function useContent<T = unknown>(sectionId: string, options?: {
    defaults?: T;
    revalidate?: boolean;
}): {
    data: T;
    isLoading: boolean;
    error: unknown;
    updateContent: ((patch: Partial<T>, writeToken?: string) => Promise<void>) | undefined;
};

/**
 * Core props shared by all Editable components.
 */
interface EditableProps {
    id: string;
    type?: "text" | "image" | "video" | "richtext" | "custom";
    as?: React.ElementType;
    children?: React.ReactNode;
    className?: string;
}
/**
 * Universal Editable component
 * - Acts as the base building block for content editing.
 * - In non-editor mode: just renders children or content.
 * - In editor mode: adds data attributes + inline styles to hook into Buildll dashboard overlays.
 */
declare function Editable({ id, type, as: Component, children, className, ...rest }: EditableProps & {
    [key: string]: unknown;
}): react_jsx_runtime.JSX.Element;
/**
 * Sugar wrappers for common content types
 * - These improve DX (developer experience) by enforcing clearer props.
 */
/** EditableText — simple text block */
declare function EditableText(props: Omit<EditableProps, "type" | "as">): react_jsx_runtime.JSX.Element;
/** EditableImage — image with alt, width, height, etc. */
declare function EditableImage({ alt, ...props }: Omit<EditableProps, "type" | "as"> & {
    alt?: string;
}): react_jsx_runtime.JSX.Element;
/** EditableVideo — for video embeds */
declare function EditableVideo(props: Omit<EditableProps, "type" | "as">): react_jsx_runtime.JSX.Element;
/** EditableRichText — for larger text blocks */
declare function EditableRichText(props: Omit<EditableProps, "type" | "as">): react_jsx_runtime.JSX.Element;

export { type BuildllClientOptions, BuildllProvider, type ContentResponse, Editable, EditableImage, EditableRichText, EditableText, EditableVideo, buildllClient, useContent };
