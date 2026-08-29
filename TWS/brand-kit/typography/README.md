# HousesBase Typography

## Final hierarchy

- Manrope: marketing and display headings
- Geist: product UI, body copy, navigation, forms, and documentation
- JetBrains Mono: identifiers, keyboard shortcuts, data labels, technical
  metadata, and the `Software House OS` descriptor

The HousesBase logo is custom outlined artwork. Never recreate the wordmark by
typing “HousesBase” in Manrope or another font.

## Implementation

```css
:root {
  --housesbase-font-display: "Manrope", sans-serif;
  --housesbase-font-ui: "Geist", sans-serif;
  --housesbase-font-mono: "JetBrains Mono", monospace;
}

body {
  font-family: var(--housesbase-font-ui);
}

h1,
h2,
h3 {
  font-family: var(--housesbase-font-display);
  font-weight: 700;
  letter-spacing: -0.04em;
}
```

Use sentence case. Keep headings compact and operational. Reserve uppercase for
short descriptors, identifiers, and technical labels.

