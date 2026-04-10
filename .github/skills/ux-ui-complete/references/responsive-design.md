# Responsive Design

## Overview

Responsive Design makes interfaces work seamlessly across all devices and screen sizes—from mobile phones to ultra-wide desktop monitors.

## Core Principles

### 1. Mobile-First Approach
Start designing for mobile, then enhance for larger screens:

```css
/* Mobile first */
.card {
  width: 100%;
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 600px) {
  .card {
    width: calc(50% - 8px);
    font-size: 16px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card {
    width: calc(33.333% - 8px);
    font-size: 18px;
  }
}
```

### 2. Breakpoint Strategy

Define clear, content-driven breakpoints:

```
Mobile: 0px - 599px
Tablet: 600px - 1023px
Desktop: 1024px - 1439px
Large: 1440px+
```

**Mobile First CSS Variables:**
```css
:root {
  --viewport: mobile; /* updated via JavaScript */
  --gap: 8px;
  --column-count: 1;
}

@media (min-width: 600px) {
  :root {
    --viewport: tablet;
    --gap: 16px;
    --column-count: 2;
  }
}

@media (min-width: 1024px) {
  :root {
    --viewport: desktop;
    --gap: 24px;
    --column-count: 3;
  }
}
```

### 3. Flexible Grid Systems

**CSS Grid:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--gap);
}
```

**Flexbox:**
```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.flex-item {
  flex: 1 1 300px; /* grow, shrink, basis */
}
```

### 4. Fluid Typography

Scales dynamically with viewport:

```css
/* Fluid sizing */
h1 {
  font-size: clamp(24px, 5vw, 48px);
  /* Min: 24px, preferred: 5% of viewport width, max: 48px */
}

body {
  font-size: clamp(14px, 2vw, 18px);
}
```

### 5. Touch-Friendly Design

For mobile interfaces:

```
Minimum Touch Target: 44x44px (iOS) or 48x48px (Android)
Spacing Between Targets: 8px minimum
Tap Area: Generous, not cramped
```

### 6. Views & Orientation

```css
/* Landscape */
@media (orientation: landscape) {
  .sidebar {
    display: none; /* Hide on small landscape screens */
  }
}

/* Notch support (iOS) */
@supports (padding: max(0px)) {
  body {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
}
```

## Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Page</title>
  <style>
    * {
      box-sizing: border-box;
    }

    :root {
      --gap: 8px;
    }

    @media (min-width: 600px) {
      :root {
        --gap: 16px;
      }
    }

    body {
      margin: 0;
      font-size: clamp(14px, 2vw, 18px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--gap);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--gap);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="grid">
      <!-- Content -->
    </div>
  </div>
</body>
</html>
```

## Testing Across Devices

### Viewport Sizes to Test
- Mobile: 375px, 414px (common widths)
- Tablet: 600px, 768px
- Desktop: 1024px, 1440px, 1920px

### Responsive Testing Tools
- **Chrome DevTools**: Device emulation
- **Firefox DevTools**: Responsive mode
- **BrowserStack**: Real devices
- **Responsively**: Desktop app

### Testing Checklist
- [ ] Test at all breakpoints
- [ ] Verify no horizontal scrolling
- [ ] Check touch targets (44x44px+)
- [ ] Test orientation changes
- [ ] Verify images scale properly
- [ ] Check text readability at all sizes
- [ ] Test form inputs on mobile
- [ ] Verify navigation accessibility

## Common Responsive Patterns

### Pattern 1: Hero Section
```html
<section class="hero">
  <h1>Welcome</h1>
  <button>Get Started</button>
</section>

<style>
  .hero {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url(hero.jpg);
    background-size: cover;
  }

  @media (min-width: 600px) {
    .hero {
      min-height: 600px;
    }
  }
</style>
```

### Pattern 2: Two-Column Layout
```html
<div class="layout">
  <aside class="sidebar">Navigation</aside>
  <main class="content">Content</main>
</div>

<style>
  .layout {
    display: grid;
    gap: 20px;
  }

  @media (min-width: 1024px) {
    .layout {
      grid-template-columns: 250px 1fr;
    }
  }
</style>
```

### Pattern 3: Card Grid
```html
<div class="cards">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<style>
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
</style>
```

## Performance Considerations

1. **Image Optimization**: Use `srcset` and `<picture>`
2. **Lazy Loading**: Load images only when needed
3. **CSS Media Queries**: Don't load all CSS at once
4. **Viewport Meta Tag**: Always include `<meta name="viewport">`
5. **Minimize Repaints**: Use CSS containment

## Platform-Specific Notes

### iOS
- Safe area insets (notches)
- 100vh issues on mobile Safari
- Smooth scrolling

### Android
- System navigation bars
- Various screen sizes and DPI
- Back button handling

### Web
- Wide range of device sizes
- Desktop browsers
- Accessibility priorities

