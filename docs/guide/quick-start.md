# Quick Start

Get started with the Buildll SDK in a few simple steps.

## 1. Wrap your app with BuildllProvider

Wrap your application with the `BuildllProvider` to provide the SDK context to your components.

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

## 2. Use the useContent hook

Use the `useContent` hook to fetch content from Buildll.

```tsx
// app/page.tsx
"use client";

import { useContent } from '@buildll/sdk';

export default function Page() {
  const { data, isLoading } = useContent('hero', {
    defaults: { title: 'Hello World' },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <h1>{data.title}</h1>;
}
```

## 3. Make your content editable

Use the `Editable` components to make your content editable.

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
