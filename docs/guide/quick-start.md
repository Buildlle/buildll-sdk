# Quick Start

Get started with Buildll content editing in just a few steps.

## 1. Add Editor Script

Include the Buildll editor script in your website's `<head>`:

```html
<script src="https://buildll.com/buildll-editor.js"></script>
```

## 2. Mark Content as Editable

Add `data-buildll-*` attributes to elements you want to be editable:

```tsx
// React/Next.js Example
export default function HomePage() {
  return (
    <div>
      <h1
        data-buildll-id="hero-title"
        data-buildll-text="Welcome to Your Website"
        data-buildll-type="text"
      >
        Welcome to Your Website
      </h1>
      <p
        data-buildll-id="hero-description"
        data-buildll-text="This content is editable in Buildll Dashboard"
        data-buildll-type="text"
      >
        This content is editable in Buildll Dashboard
      </p>
    </div>
  );
}
```

```html
<!-- Static HTML Example -->
<div>
  <h1
    data-buildll-id="hero-title"
    data-buildll-text="Welcome to Your Website"
    data-buildll-type="text"
  >
    Welcome to Your Website
  </h1>
  <p
    data-buildll-id="hero-description"
    data-buildll-text="This content is editable"
    data-buildll-type="text"
  >
    This content is editable
  </p>
</div>
```

## 3. Configure Deployment (Optional)

To enable automatic deployment when content is edited:

1. **GitHub Repository**: Provide your GitHub repository URL in Buildll Dashboard
2. **GitHub Token**: Create a personal access token with `repo` permissions
3. **Deploy Hook**: Add webhook URL from Vercel/Netlify for automatic builds

## Required Attributes

Each editable element needs these attributes:

- `data-buildll-id`: Unique identifier for the content element
- `data-buildll-text`: Current text content (must match repository content exactly)
- `data-buildll-type`: Content type (currently only "text" supported)

## How It Works

1. **Client opens Buildll dashboard**
2. **Site loads in editor iframe** with visual editing overlay
3. **Click any marked element** to open edit modal
4. **Edit content** and save changes
5. **Automatic deployment**:
   - Content saved to database
   - GitHub repository updated with new content
   - Deploy webhook triggered (if configured)
   - Live site updates with changes

## Helper Components

### React Component Helper

```jsx
// components/EditableText.jsx
export function EditableText({ id, children, tag: Tag = 'p', ...props }) {
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

// Usage
<EditableText id="hero-title" tag="h1" className="text-4xl">
  Welcome to Our Company
</EditableText>
```

### Next.js Hook

```jsx
// hooks/useBuildllEditable.js
import { useEffect, useRef } from 'react';

export function useBuildllEditable(id, text, type = 'text') {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-buildll-id', id);
      ref.current.setAttribute('data-buildll-text', text);
      ref.current.setAttribute('data-buildll-type', type);
    }
  }, [id, text, type]);

  return ref;
}

// Usage
function MyComponent() {
  const ref = useBuildllEditable('hero-title', 'Welcome');
  return <h1 ref={ref}>Welcome</h1>;
}
```

That's it! Your website is now ready for inline content editing with automatic deployment.