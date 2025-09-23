# Buildll SDK

The official SDK for interacting with the Buildll platform.

## Installation

Install the package using your favorite package manager:

```bash
pnpm install @buildll/sdk
```

or

```bash
npm install @buildll/sdk
```

or

```bash
yarn add @buildll/sdk
```

## Usage

To use the SDK, you need to wrap your application with the `BuildllProvider` and then use the `useContent` hook to fetch and manage your content.

Here is an example of how to use it in a Next.js application:

**`app/layout.tsx`**
```tsx
import { BuildllProvider } from "@buildll/sdk";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BuildllProvider
          siteId="your-site-id"
          publicApiKey="your-public-api-key"
        >
          {children}
        </BuildllProvider>
      </body>
    </html>
  );
}
```

**`app/page.tsx`**
```tsx
"use client";

import { useContent, Editable, EditableText, EditableImage } from "@buildll/sdk";

const defaults = {
  title: "My Awesome Website",
  description: "This is the default description.",
};

export default function HomePage() {
  const { data, isLoading } = useContent("home-page", { defaults });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <h1>
        <EditableText id="home-page.title">{data.title}</EditableText>
      </h1>
      <p>
        <EditableText id="home-page.description">{data.description}</EditableText>
      </p>
    </main>
  );
}
```

## API Reference

### Components

*   `BuildllProvider`: Provides the Buildll context to your application.
*   `Editable`: A component that makes its children editable in the Buildll editor.
*   `EditableText`: A component for editable text content.
*   `EditableImage`: A component for editable image content.

### Hooks

*   `useContent`: A hook to fetch and manage content from the Buildll API.

## License

This project is licensed under the MIT License.
