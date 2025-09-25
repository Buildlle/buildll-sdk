# API Reference

This page provides reference documentation for using Buildll content editing.

## Required Attributes

All editable elements must include these data attributes:

### `data-buildll-id`
- **Type**: `string`
- **Required**: Yes
- **Description**: Unique identifier for the content element
- **Example**: `"hero-title"`, `"feature-1-description"`

### `data-buildll-text`
- **Type**: `string`
- **Required**: Yes
- **Description**: Current text content. Must match the exact text in your repository for deployment to work.
- **Example**: `"Welcome to Our Website"`, `"Click here to get started"`

### `data-buildll-type`
- **Type**: `"text"`
- **Required**: Yes
- **Description**: Content type. Currently only "text" is supported.
- **Example**: `"text"`

## HTML Example

```html
<h1
  data-buildll-id="hero-title"
  data-buildll-text="Welcome to Our Website"
  data-buildll-type="text"
>
  Welcome to Our Website
</h1>
```

## React Helper Components

### EditableText Component

A React component that automatically adds the required attributes:

```jsx
// components/EditableText.jsx
export function EditableText({
  id,
  children,
  tag: Tag = 'p',
  ...props
}) {
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

#### Props
- `id` (string, required): Unique identifier for the content
- `children` (string, required): The text content
- `tag` (string, optional): HTML tag to render (default: 'p')
- `...props`: Additional props passed to the element

#### Usage
```jsx
<EditableText id="hero-title" tag="h1" className="text-4xl">
  Welcome to Our Company
</EditableText>

<EditableText id="description">
  This is our company description.
</EditableText>
```

### useBuildllEditable Hook

A React hook for adding editable attributes to existing elements:

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
```

#### Parameters
- `id` (string, required): Unique identifier for the content
- `text` (string, required): Current text content
- `type` (string, optional): Content type (default: 'text')

#### Returns
- `ref`: React ref to attach to your element

#### Usage
```jsx
function MyComponent() {
  const titleRef = useBuildllEditable('hero-title', 'Welcome to Our Site');
  const descRef = useBuildllEditable('description', 'We build amazing products');

  return (
    <div>
      <h1 ref={titleRef}>Welcome to Our Site</h1>
      <p ref={descRef}>We build amazing products</p>
    </div>
  );
}
```

## Editor Script

The editor script must be included in your website's HTML:

```html
<script src="https://buildll.com/buildll-editor.js"></script>
```

### What the Script Does

The script automatically:
- Detects when loaded in Buildll editor mode (`?buildll_editor=true`)
- Finds elements with `data-buildll-*` attributes
- Adds visual hover effects and click handlers
- Enables communication with the Buildll dashboard
- Handles content updates from the editor

### Editor Mode Detection

The script only activates when:
1. The page URL contains `?buildll_editor=true`
2. The page is loaded within the Buildll dashboard iframe

On your production site, the script remains dormant and doesn't affect performance.

## Content Deployment

When content is edited through the Buildll dashboard:

1. **Content Validation**: Changes are validated for security
2. **Database Save**: Content is saved to Buildll database
3. **Repository Search**: Buildll searches your GitHub repository for matching text
4. **File Updates**: Found files are updated with new content
5. **Git Commit**: A new commit is created with message "Update content via Buildll editor"
6. **Webhook Trigger**: Deploy webhook is called (if configured)
7. **Site Deployment**: Your hosting provider rebuilds and deploys the site

## Best Practices

### Unique IDs
Use descriptive, unique IDs for each editable element:

```jsx
// Good
<EditableText id="hero-title">Welcome</EditableText>
<EditableText id="hero-subtitle">Subtitle</EditableText>
<EditableText id="feature-1-title">Feature One</EditableText>

// Avoid
<EditableText id="title">Welcome</EditableText>
<EditableText id="title2">Subtitle</EditableText>
<EditableText id="text">Feature One</EditableText>
```

### Exact Text Matching
Ensure `data-buildll-text` matches your repository content exactly:

```jsx
// If your repository has:
// <h1>Welcome to Our Amazing Platform</h1>

// Your editable element should be:
<EditableText
  id="hero-title"
  data-buildll-text="Welcome to Our Amazing Platform"
>
  Welcome to Our Amazing Platform
</EditableText>
```

### Content Length
Keep editable content reasonably short (under 200 characters) for better user experience and reliable text matching.

## Troubleshooting

### Common Issues

**Elements not clickable in editor:**
- Verify all three `data-buildll-*` attributes are present
- Check that the editor script is loading correctly
- Ensure the text content matches the `data-buildll-text` value exactly

**Content changes don't deploy:**
- Verify GitHub repository URL and token are correct
- Ensure `data-buildll-text` matches repository content exactly
- Check deploy webhook URL is configured correctly

**Cross-origin warnings:**
- Add the editor script to your website as shown above
- Ensure your site allows iframe embedding (no X-Frame-Options restrictions)