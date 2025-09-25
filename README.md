# Buildll Content Editor

**Inline content editing with persistent deployment**

Transform any website into an editable CMS that automatically deploys changes to your live site. Edit content through the Buildll dashboard and watch changes go live instantly.

## **How It Works**

### 1. Add Editor Script to Your Website

Include the Buildll editor script in your website's `<head>`:

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

### 2. Mark Content as Editable

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

### 3. Configure Deployment (Optional)

To enable automatic deployment when content is edited:

1. **GitHub Repository**: Provide your GitHub repository URL
2. **GitHub Token**: Personal access token with `repo` permissions
3. **Deploy Hook**: Webhook URL from Vercel/Netlify for automatic builds

## **Required Attributes**

Each editable element needs these attributes:

- `data-buildll-id`: Unique identifier for the content element
- `data-buildll-text`: Current text content (used for matching in repository)
- `data-buildll-type`: Content type (currently only "text" supported)

## **Content Editing Process**

1. **Client opens Buildll dashboard**
2. **Site loads in editor iframe** with visual editing overlay
3. **Click any marked element** to open edit modal
4. **Edit content** and save changes
5. **Automatic deployment**:
   - Content saved to database
   - GitHub repository updated with new content
   - Deploy webhook triggered (if configured)
   - Live site updates with changes

## **Deployment Flow**

When content is edited and saved:

```
Content saved to database
    ↓
Buildll searches GitHub repository for matching text
    ↓
Updates found files with new content
    ↓
Creates git commit: "Update content via Buildll editor"
    ↓
Triggers deploy webhook (if configured)
    ↓
Hosting provider rebuilds and deploys
    ↓
Live website updates with new content
```

## **Integration Examples**

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

## **Deployment Configuration**

### GitHub Setup

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate new token with `repo` scope
   - Copy token for Buildll configuration

### Hosting Provider Webhooks

**For Vercel:**
1. Project Settings > Git > Deploy Hooks
2. Create new deploy hook
3. Copy webhook URL

**For Netlify:**
1. Site Settings > Build & Deploy > Build Hooks
2. Add build hook
3. Copy webhook URL

## **Troubleshooting**

### Editor Shows Cross-Origin Warning

**Problem**: Editor shows "Note: This site is hosted on a different domain..."

**Solution**: Add the Buildll editor script to your website as shown above.

### Content Changes Don't Deploy

**Solutions**:
1. Verify GitHub repository URL and token are correct
2. Ensure `data-buildll-text` matches repository content exactly
3. Check deploy webhook URL is configured correctly
4. Verify GitHub token has `repo` permissions

### Elements Not Clickable

**Solutions**:
1. Verify `data-buildll-*` attributes are present
2. Check editor script is loading correctly
3. Ensure `data-buildll-text` contains exact current text

## **Best Practices**

1. **Unique IDs**: Use descriptive, unique IDs for each editable element
2. **Exact Text Matching**: Ensure `data-buildll-text` matches repository content exactly
3. **Test Environment**: Test integration in development before production
4. **Limited Scope**: Only make essential content editable to maintain site integrity
5. **Backup Strategy**: Maintain backups before enabling auto-deployment

## **Security Notes**

- GitHub tokens are stored securely and encrypted
- Content changes are validated before committing
- Only authorized users can access the Buildll dashboard
- All integrations require HTTPS for secure communication

## **Support**

- [Documentation](https://buildll.com/docs)
- [GitHub Issues](https://github.com/buildll/sdk/issues)

---

**Made by the Buildll team**