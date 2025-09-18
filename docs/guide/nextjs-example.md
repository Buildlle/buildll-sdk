# Next.js Example

This guide shows how to use the Buildll SDK in a Next.js application.

## 1. Create a Next.js app

Follow the official Next.js documentation to create a new app.

## 2. Install the SDK

```bash
pnpm add @buildll/sdk
```

## 3. Configure the Provider

Wrap your `app/layout.tsx` with the `BuildllProvider`.

```tsx
// app/layout.tsx
import { BuildllProvider } from '@buildll/sdk';

export default function RootLayout({ children }) {
  return (
    <BuildllProvider
      siteId="my-site"
      publicApiKey={process.env.NEXT_PUBLIC_BUILDLL_KEY}
    >
      {children}
    </BuildllProvider>
  );
}
```

## 4. Use the SDK

Use the `useContent` hook and `Editable` components in your pages.

```tsx
// app/page.tsx
"use client";

import { useContent, EditableText } from '@buildll/sdk';

export default function Page() {
  const { data, isLoading } = useContent('hero', {
    defaults: { title: 'Hello World' },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <EditableText id="hero.title" as="h1">
      {data.title}
    </EditableText>
  );
}
```
