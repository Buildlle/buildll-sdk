# Quick Start

Get started with the Buildll SDK in a few simple steps.

## 1. Install Buildll SDK

```bash
npm install @buildll/sdk
# or
pnpm add @buildll/sdk
```

## 2. Add Buildll Plugin to Next.js

```js
// next.config.js
const withBuildll = require('@buildll/sdk/plugin');

module.exports = withBuildll({
  // Your existing Next.js config
});
```

## 3. Add Buildll Provider

Wrap your application with the `BuildllProvider`:

```tsx
// app/layout.tsx (App Router) or _app.tsx (Pages Router)
import { BuildllProvider } from '@buildll/sdk';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BuildllProvider
          siteId={process.env.NEXT_PUBLIC_BUILDLL_SITE_ID}
          publicApiKey={process.env.NEXT_PUBLIC_BUILDLL_API_KEY}
        >
          {children}
        </BuildllProvider>
      </body>
    </html>
  );
}
```

## 4. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BUILDLL_SITE_ID=your-site-id
NEXT_PUBLIC_BUILDLL_API_KEY=your-api-key
```

## 5. Write Normal JSX - That's It!

No special components or configuration needed. Just write normal JSX:

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Your Website</h1>
      <p>This content is automatically editable in Buildll Dashboard</p>

      <div className="features">
        <div>
          <h2>Feature One</h2>
          <p>All text content becomes editable automatically</p>
        </div>
        <div>
          <h2>Feature Two</h2>
          <p>Zero boilerplate, zero cognitive overhead</p>
        </div>
      </div>
    </div>
  );
}
```

## How It Works

1. **Build Time**: Buildll plugin automatically detects text content and transforms it
2. **Production**: Your site works normally with zero editing UI
3. **Dashboard**: Load your site in Buildll Dashboard to edit content visually
4. **Editing**: Click any text → edit inline → save → deploys automatically

That's it! No manual IDs, no special components, no configuration. Just install, configure once, and code normally.