# API Reference

This page provides a reference for the main components and hooks in the Buildll SDK.

## BuildllProvider

The `BuildllProvider` component provides the SDK context to your application. It should be placed at the root of your application.

### Props

-   `siteId` (string, required): Your Buildll site ID.
-   `publicApiKey` (string): Your Buildll public API key.
-   `editorMode` (boolean): Force editor mode.
-   `children` (React.ReactNode, required): The content of your application.

## useContent

The `useContent` hook fetches content from Buildll.

### Arguments

-   `sectionId` (string, required): The ID of the content section to fetch.
-   `options` (object):
    -   `defaults` (T): The default content to use while the content is loading.
    -   `revalidate` (boolean): Whether to revalidate the content on focus.

### Return Value

An object with the following properties:
-   `data` (T): The content data.
-   `isLoading` (boolean): Whether the content is loading.
-   `error` (any): An error object if the content failed to load.
-   `updateContent` (`(patch: Partial<T>) => Promise<void>`): A function to update the content. Only available in editor mode.

## Editable Components

The `Editable` components make your content editable.

### Editable

The generic `Editable` component can be used to make any element editable.

#### Props

-   `id` (string, required): The unique identifier for the content block.
-   `as` (keyof JSX.IntrinsicElements): The HTML tag to render.
-   Other props are passed through to the rendered element.

### EditableText

A specialized component for editing text.

#### Props

-   `id` (string, required): The unique identifier for the content block.
-   Other props are passed through to the rendered element.

### EditableImage

A specialized component for editing images.

#### Props

-   `id` (string, required): The unique identifier for the content block.
-   Other props are passed through to the rendered `img` element.
