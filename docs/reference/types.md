# Reference

This page provides reference information for Buildll content editing.

## Data Attributes

### Required Attributes

All editable elements must include these data attributes:

**`data-buildll-id`**
- Type: string
- Required: Yes
- Description: Unique identifier for the content element
- Example: `"hero-title"`, `"feature-1-description"`

**`data-buildll-text`**
- Type: string
- Required: Yes
- Description: Current text content (must match repository content exactly)
- Example: `"Welcome to Our Website"`

**`data-buildll-type`**
- Type: `"text"`
- Required: Yes
- Description: Content type (currently only "text" supported)
- Example: `"text"`

## Helper Component Types

### EditableTextProps

```tsx
interface EditableTextProps {
  id: string;                           // Unique content identifier
  children: string;                     // Text content
  tag?: keyof JSX.IntrinsicElements;    // HTML tag (default: 'p')
  className?: string;                   // CSS classes
  [key: string]: any;                   // Additional props
}
```

### Hook Parameters

```tsx
useBuildllEditable(
  id: string,      // Unique content identifier
  text: string,    // Current text content
  type?: string    // Content type (default: 'text')
): React.RefObject<HTMLElement>
```

## Content Management

### Deployment Configuration

```tsx
interface DeploymentConfig {
  githubUrl: string;           // GitHub repository URL
  githubToken: string;         // Personal access token
  deployHookUrl?: string;      // Webhook URL for auto-deploy
  hostingProvider: 'vercel' | 'netlify' | 'other';
}
```

### Content Update Flow

1. Content edited in Buildll Dashboard
2. Saved to database
3. Repository searched for matching text
4. Files updated with new content
5. Git commit created
6. Deploy webhook triggered
7. Site rebuilds and deploys

## Best Practices

### ID Naming Convention

Use descriptive, hierarchical naming:

```
hero-title
hero-subtitle
about-section-title
feature-1-title
feature-1-description
footer-copyright
```

### Content Guidelines

- Keep content under 200 characters for better performance
- Ensure `data-buildll-text` matches repository content exactly
- Use unique IDs across the entire site
- Test in development environment first