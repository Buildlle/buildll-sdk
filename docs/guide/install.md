# Installation

To enable Buildll content editing on your website, you need to add the editor script and mark content as editable.

## Add Editor Script

Include the Buildll editor script in your website's `<head>` section:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://buildll.com/buildll-editor.js"></script>
</head>
<body>
    <!-- Your website content -->
</body>
</html>
```

## For React/Next.js Projects

Add the script to your main layout or HTML template:

```tsx
// app/layout.tsx (Next.js App Router)
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script src="https://buildll.com/buildll-editor.js" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

```tsx
// pages/_document.tsx (Next.js Pages Router)
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script src="https://buildll.com/buildll-editor.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

That's it! No npm packages or complex configuration required.
