# Next.js Example

This guide shows how to integrate Buildll content editing in a Next.js application.

## 1. Create a Next.js App

Follow the official Next.js documentation to create a new app:

```bash
npx create-next-app@latest my-website
cd my-website
```

## 2. Add the Editor Script

Add the Buildll editor script to your layout. Choose the method based on your Next.js setup:

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Website',
  description: 'A website with editable content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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

### Pages Router

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
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

## 3. Create Editable Content

Add `data-buildll-*` attributes to elements you want to be editable:

```tsx
// app/page.tsx (App Router)
// or pages/index.tsx (Pages Router)
export default function HomePage() {
  return (
    <div>
      <header>
        <h1
          data-buildll-id="hero-title"
          data-buildll-text="Welcome to My Amazing Website"
          data-buildll-type="text"
        >
          Welcome to My Amazing Website
        </h1>
        <p
          data-buildll-id="hero-subtitle"
          data-buildll-text="We build incredible digital experiences"
          data-buildll-type="text"
        >
          We build incredible digital experiences
        </p>
      </header>

      <main>
        <section>
          <h2
            data-buildll-id="about-title"
            data-buildll-text="About Our Company"
            data-buildll-type="text"
          >
            About Our Company
          </h2>
          <p
            data-buildll-id="about-description"
            data-buildll-text="We are passionate about creating solutions that make a difference in people's lives."
            data-buildll-type="text"
          >
            We are passionate about creating solutions that make a difference in people's lives.
          </p>
        </section>

        <section>
          <h2
            data-buildll-id="services-title"
            data-buildll-text="Our Services"
            data-buildll-type="text"
          >
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3
                data-buildll-id="service-1-title"
                data-buildll-text="Web Development"
                data-buildll-type="text"
              >
                Web Development
              </h3>
              <p
                data-buildll-id="service-1-description"
                data-buildll-text="Modern, responsive websites built with the latest technologies."
                data-buildll-type="text"
              >
                Modern, responsive websites built with the latest technologies.
              </p>
            </div>
            <div>
              <h3
                data-buildll-id="service-2-title"
                data-buildll-text="Mobile Apps"
                data-buildll-type="text"
              >
                Mobile Apps
              </h3>
              <p
                data-buildll-id="service-2-description"
                data-buildll-text="Native and cross-platform mobile applications."
                data-buildll-type="text"
              >
                Native and cross-platform mobile applications.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
```

## 4. Create Helper Components (Optional)

Create reusable components to make adding editable content easier:

```tsx
// components/EditableText.tsx
interface EditableTextProps {
  id: string;
  children: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

export function EditableText({
  id,
  children,
  tag: Tag = 'p',
  ...props
}: EditableTextProps) {
  return (
    <Tag
      data-buildll-id={id}
      data-buildll-text={children}
      data-buildll-type="text"
      {...props}
    >
      {children}
    </Tag>
  );
}
```

Now use the helper component in your pages:

```tsx
// app/page.tsx
import { EditableText } from '@/components/EditableText';

export default function HomePage() {
  return (
    <div>
      <EditableText id="hero-title" tag="h1" className="text-4xl font-bold">
        Welcome to My Amazing Website
      </EditableText>

      <EditableText id="hero-subtitle" className="text-xl text-gray-600">
        We build incredible digital experiences
      </EditableText>

      <section>
        <EditableText id="about-title" tag="h2" className="text-2xl font-semibold">
          About Our Company
        </EditableText>

        <EditableText id="about-description">
          We are passionate about creating solutions that make a difference in people's lives.
        </EditableText>
      </section>
    </div>
  );
}
```

## 5. Custom Hook (Advanced)

Create a custom hook for even more flexibility:

```tsx
// hooks/useBuildllEditable.ts
import { useEffect, useRef } from 'react';

export function useBuildllEditable(id: string, text: string, type: string = 'text') {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-buildll-id', id);
      ref.current.setAttribute('data-buildll-text', text);
      ref.current.setAttribute('data-buildll-type', type);
    }
  }, [id, text, type]);

  return ref;
}
```

Use the hook in your components:

```tsx
// components/MyComponent.tsx
import { useBuildllEditable } from '@/hooks/useBuildllEditable';

export function MyComponent() {
  const titleRef = useBuildllEditable('company-mission', 'Our mission is to innovate');
  const descRef = useBuildllEditable('company-vision', 'We envision a better future');

  return (
    <div>
      <h2 ref={titleRef} className="text-2xl font-bold">
        Our mission is to innovate
      </h2>
      <p ref={descRef} className="text-gray-600">
        We envision a better future
      </p>
    </div>
  );
}
```

## 6. Environment Setup (Optional)

If you plan to implement custom content management, you can add environment variables:

```bash
# .env.local
NEXT_PUBLIC_BUILDLL_SITE_ID=your-site-id
NEXT_PUBLIC_BUILDLL_API_KEY=your-api-key
```

## 7. Deploy and Configure

1. **Deploy your site** to Vercel, Netlify, or your preferred hosting provider
2. **Register your site** in the Buildll dashboard
3. **Configure deployment** (optional):
   - Add your GitHub repository URL
   - Create a GitHub personal access token with `repo` permissions
   - Add deploy webhook from your hosting provider

## How It Works

1. **Development**: Your site works normally with all content visible
2. **Production**: Content displays normally, editor script stays dormant
3. **Buildll Dashboard**: When loaded in the dashboard, elements become clickable
4. **Editing**: Click any marked element to edit content
5. **Deployment**: Changes automatically update your repository and redeploy your site

## Best Practices

### Unique IDs
Use descriptive, hierarchical IDs:

```tsx
// Good
<EditableText id="hero-title">Welcome</EditableText>
<EditableText id="hero-subtitle">Subtitle</EditableText>
<EditableText id="about-title">About Us</EditableText>
<EditableText id="service-web-dev-title">Web Development</EditableText>

// Avoid generic IDs
<EditableText id="title">Welcome</EditableText>
<EditableText id="text">Subtitle</EditableText>
```

### Content Organization
Group related content logically:

```tsx
// Group by page sections
<EditableText id="header-logo-text">Company Name</EditableText>
<EditableText id="header-nav-home">Home</EditableText>
<EditableText id="header-nav-about">About</EditableText>

<EditableText id="hero-title">Welcome</EditableText>
<EditableText id="hero-description">Description</EditableText>

<EditableText id="footer-copyright">© 2024 Company</EditableText>
```

### TypeScript Support
For better type safety, create typed interfaces:

```tsx
// types/editable.ts
export interface EditableContentProps {
  id: string;
  children: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
}

// components/EditableText.tsx
import { EditableContentProps } from '@/types/editable';

export function EditableText({
  id,
  children,
  tag: Tag = 'p',
  ...props
}: EditableContentProps) {
  return (
    <Tag
      data-buildll-id={id}
      data-buildll-text={children}
      data-buildll-type="text"
      {...props}
    >
      {children}
    </Tag>
  );
}
```

That's it! Your Next.js application now supports inline content editing with automatic deployment through the Buildll dashboard.