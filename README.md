# Buildll SDK

**Zero-boilerplate inline content editing for React/Next.js**

Transform any website into an editable CMS with zero code changes. Just install, configure, and code normally - Buildll makes everything editable automatically.

## ✨ **Ultimate Developer Experience**

```tsx
// Write normal JSX - no changes needed!
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

That's it! No special components, no IDs, no configuration. Buildll automatically:
- ✅ Detects all text content
- ✅ Generates semantic content IDs
- ✅ Makes everything editable in dashboard
- ✅ Preserves your existing styling
- ✅ Works with any React components

## 🚀 **Installation**

### 1. Install Buildll SDK
```bash
npm install @buildll/sdk
# or
pnpm add @buildll/sdk
```

### 2. Add Buildll Plugin to Next.js
```js
// next.config.js
const withBuildll = require('@buildll/sdk/plugin');

module.exports = withBuildll({
  // Your existing Next.js config
});
```

### 3. Add Buildll Provider
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

### 4. Add Environment Variables
```bash
# .env.local
NEXT_PUBLIC_BUILDLL_SITE_ID=your-site-id
NEXT_PUBLIC_BUILDLL_API_KEY=your-api-key
```

## 🎯 **How It Works**

### Build-Time Magic
Buildll uses a build-time plugin that automatically transforms your JSX:

**Before (what you write):**
```tsx
<h1>Welcome to Your Website</h1>
<p>This content is editable</p>
```

**After (what gets built):**
```tsx
<h1 data-buildll-id="home.hero.title" data-buildll-text="Welcome to Your Website">
  <Text contentId="home.hero.title" fallback="Welcome to Your Website" />
</h1>
<p data-buildll-id="home.hero.subtitle" data-buildll-text="This content is editable">
  <Text contentId="home.hero.subtitle" fallback="This content is editable" />
</p>
```

### Production vs Dashboard
- **Production Site**: Shows content normally, zero editing UI
- **Buildll Dashboard**: Loads your site in iframe with editing overlay
- **Editing**: Click any text in dashboard → edit inline → save → deploys

## 🎨 **Content Editing**

1. Go to [Buildll Dashboard](https://buildll.com/dashboard)
2. Navigate to your project's `/build` tab
3. Your site loads in the visual editor
4. Click any text to edit it inline
5. Changes save automatically and deploy instantly

### Visual Editor Features
- **Click-to-edit**: Click any text element to modify it
- **Live preview**: See changes in real-time as you edit
- **Secure editing**: Editing only available in dashboard, production site stays clean
- **Automatic deployment**: Changes go live immediately after saving

## 🔧 **API Reference**

### BuildllProvider
```tsx
interface BuildllProviderProps {
  siteId: string;          // Your site ID from Buildll Dashboard
  publicApiKey: string;    // Your public API key
  baseUrl?: string;        // Custom API base URL (optional)
  children: React.ReactNode;
}
```

### Environment Variables
```bash
NEXT_PUBLIC_BUILDLL_SITE_ID    # Required: Your site identifier
NEXT_PUBLIC_BUILDLL_API_KEY    # Required: Public API key for content fetching
```

## 🚀 **Framework Support**

- ✅ **Next.js** (App Router & Pages Router)
- 🔄 **React** (Coming soon)
- 🔄 **Vite** (Coming soon)
- 🔄 **Gatsby** (Coming soon)

## 📝 **Examples**

Check out the `/examples` directory for:
- Next.js App Router example
- Next.js Pages Router example
- E-commerce site example
- Blog example

## 🤝 **Support**

- [Documentation](https://buildll.com/docs)
- [Discord Community](https://discord.gg/buildll)
- [GitHub Issues](https://github.com/buildll/sdk/issues)

---

**Made with ❤️ by the Buildll team**
