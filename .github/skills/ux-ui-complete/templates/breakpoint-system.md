# Breakpoint System Template

## CSS Custom Properties (Recommended)

```css
:root {
  /* BREAKPOINTS */
  --breakpoint-mobile: 0px;
  --breakpoint-tablet: 600px;
  --breakpoint-desktop: 1024px;
  --breakpoint-large: 1440px;
  
  /* VIEWPORT STATE */
  --viewport: mobile;
  --column-count: 1;
}

/* TABLET */
@media (min-width: 600px) {
  :root {
    --viewport: tablet;
    --column-count: 2;
  }
}

/* DESKTOP */
@media (min-width: 1024px) {
  :root {
    --viewport: desktop;
    --column-count: 3;
  }
}

/* LARGE */
@media (min-width: 1440px) {
  :root {
    --viewport: large;
    --column-count: 4;
  }
}
```

## Mixin-Based System (Sass/SCSS)

```scss
// Define breakpoints
$breakpoints: (
  'mobile': 0px,
  'tablet': 600px,
  'desktop': 1024px,
  'large': 1440px,
);

// Mixin for media queries
@mixin media($name) {
  @media (min-width: map-get($breakpoints, $name)) {
    @content;
  }
}

// Usage
.card-grid {
  display: grid;
  grid-template-columns: 1fr; // Mobile
  gap: 16px;
  
  @include media('tablet') {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  @include media('desktop') {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
```

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        'mobile': '0px',
        'tablet': '600px',
        'desktop': '1024px',
        'large': '1440px',
      },
    },
  },
}

// Usage
<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  {/* Content */}
</div>
```

## React Hook for Viewport

```jsx
import { useState, useEffect } from 'react';

function useViewport() {
  const [screen, setScreen] = useState('mobile');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 600) {
        setScreen('mobile');
      } else if (width < 1024) {
        setScreen('tablet');
      } else if (width < 1440) {
        setScreen('desktop');
      } else {
        setScreen('large');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return screen;
}

// Usage
function MyComponent() {
  const screen = useViewport();
  
  if (screen === 'mobile') {
    return <MobileLayout />;
  }
  
  return <DesktopLayout />;
}
```

## Container Queries (Modern Approach)

```css
/* Define container */
.card-container {
  container-type: inline-size;
}

/* Style based on container width, not viewport */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@container (min-width: 600px) {
  .card {
    grid-template-columns: 1fr 2fr;
  }
}
```

## Responsive Typography

```css
/* Fluid font size - scales with viewport */
h1 {
  font-size: clamp(24px, 5vw, 48px);
  /* Min: 24px | Preferred: 5% viewport width | Max: 48px */
}

body {
  font-size: clamp(14px, 2vw, 18px);
}

/* Line length scales with font size */
p {
  max-width: 65ch; /* Characters, not pixels */
}
```

## Mobile-First Grid System

```css
/* 1 column by default (mobile) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 2 columns on tablet */
@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* 3 columns on desktop */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* 4 columns on large screens */
@media (min-width: 1440px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }
}
```

## Flexible Container

```css
/* Automatically fills available space */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px; /* Mobile padding */
}

@media (min-width: 600px) {
  .container {
    padding: 0 24px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 32px;
  }
}
```

## Auto-Fit vs Auto-Fill

```css
/* Auto-fit: Items shrink to fit */
.grid--fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Auto-fill: Items stay at minimum size */
.grid--fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
```

## Recommended Breakpoints

| Name | Width | Use Case |
|------|-------|----------|
| Mobile | 0-599px | Phones, small devices |
| Tablet | 600-1023px | Tablets, large phones |
| Desktop | 1024-1439px | Laptops, monitors |
| Large | 1440px+ | Large monitors, TV |

**Note:** Use content-driven breakpoints where your design actually needs to change, not device-specific breakpoints.

