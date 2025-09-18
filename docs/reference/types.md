# Types Reference

This page provides a reference for the main types used in the Buildll SDK.

## ContentResponse<T>

An object representing the response from the Buildll API.

-   `id` (string): The ID of the content.
-   `data` (T): The content data.
-   `meta` (object): An object with metadata about the content.

## BuildllClientOptions

An object with options for the Buildll client.

-   `baseUrl` (string): The base URL of the Buildll API.
-   `siteId` (string, required): Your Buildll site ID.
-   `publicApiKey` (string): Your Buildll public API key.
-   `serverApiKey` (string): Your Buildll server API key.
