# TenantOrgLayout Component

## Overview

The `TenantOrgLayout` component is the main layout wrapper for the tenant organization portal. It provides navigation, header, sidebar, and content area structure for the ERP system.

## Features

- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Navigation**: Triple navigation system (icon sidebar, main sidebar, mobile menu)
- **Command Palette**: Quick search and navigation (Cmd/Ctrl+K)
- **Dynamic Header**: Auto-hides on scroll down, shows on scroll up
- **Theme Support**: Light/dark mode with smooth transitions
- **Accessibility**: WCAG 2.1 AA compliant with ARIA labels and keyboard navigation

## Props

```typescript
interface TenantOrgLayoutProps {
  children: React.ReactNode;
}
```

## Usage

```jsx
import TenantOrgLayout from '@/features/tenant/components/TenantOrgLayout';

function App() {
  return (
    <TenantOrgLayout>
      <YourPageContent />
    </TenantOrgLayout>
  );
}
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: Open command palette
- `Cmd/Ctrl + B`: Toggle sidebar collapse
- `Esc`: Close modals/dropdowns
- `F11`: Toggle fullscreen

## Architecture

### Components Structure

```
TenantOrgLayout
├── ErrorBoundary (error handling)
├── TenantThemeProvider (theme context)
├── Mobile Header (mobile only)
├── Desktop Header (desktop only)
├── ClickUp Sidebar (icon navigation)
├── Main Sidebar (full navigation)
├── Main Content Area
│   ├── Breadcrumbs
│   └── Children (page content)
├── CommandPalette (lazy loaded)
└── Toaster (notifications)
```

### State Management

- **Local State**: Menu open/closed, sidebar collapsed, header visibility
- **Context**: Theme, authentication, tenant data
- **URL**: Current route for active menu highlighting

## Styling

Uses CSS custom properties (design tokens) for consistent styling:
- Colors: `--color-primary-*`, `--color-gray-*`
- Spacing: `--spacing-*`
- Shadows: `--shadow-*`
- Border Radius: `--radius-*`
- Z-Index: `--z-*`

## Performance Optimizations

- Component memoization (useCallback, useMemo)
- Lazy loading (CommandPalette, ClickUpSidebar)
- Throttled scroll handlers
- GPU-accelerated animations
- Backdrop filter optimization for mobile

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Skip to main content link
- Screen reader friendly
- Reduced motion support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Backdrop filter fallbacks for older browsers
- ResizeObserver polyfill for header height

## Related Files

- `TenantOrgLayout.css` - Component styles
- `useMenuFiltering.js` - Menu filtering hook
- `Breadcrumbs.jsx` - Breadcrumb component
- `CommandPalette.js` - Command palette component

## Migration Notes

### Breaking Changes
None - all changes are backward compatible.

### New Features
- Breadcrumb navigation
- Command palette visual indicator
- Error boundaries
- Improved accessibility

## Testing

```bash
# Run component tests
npm test TenantOrgLayout

# Run accessibility tests
npm run test:a11y

# Visual regression tests
npm run test:visual
```

## Troubleshooting

### Sidebar not showing
- Check if `isDesktop` state is correct
- Verify breakpoint detection
- Check CSS z-index values

### Header height issues
- Verify `useHeaderHeight` hook is working
- Check ResizeObserver support
- Verify CSS custom property `--header-height`

### Performance issues
- Check React DevTools Profiler for re-renders
- Verify memoization is working
- Check bundle size

---

*Last Updated: February 11, 2026*
