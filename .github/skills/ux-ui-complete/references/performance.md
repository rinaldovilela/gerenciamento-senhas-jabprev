# Performance & UX Optimization

## Overview

User experience is directly impacted by performance. Slow sites frustrate users, increase bounce rates, and hurt conversions. Optimize for speed and responsiveness.

## Core Web Vitals (Google's Metrics)

### LCP - Largest Contentful Paint
**Target: < 2.5 seconds**

Time until the largest visible content element is rendered.

**Optimize:**
```js
// Preload critical resources
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="hero.jpg" as="image">

// Use modern image formats
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Hero">
</picture>

// Remove render-blocking JavaScript
<script async src="analytics.js"></script>
<script defer src="app.js"></script>
```

### FID - First Input Delay
**Target: < 100 milliseconds**

Responsiveness to user input (click, tap, keyboard).

**Optimize:**
```js
// Break up long tasks
function processLongTask(items) {
  return new Promise(resolve => {
    let index = 0;
    function processChunk() {
      const chunk = items.slice(index, index + 50);
      chunk.forEach(item => process(item));
      index += 50;
      
      if (index < items.length) {
        setTimeout(processChunk, 0); // Yield to browser
      } else {
        resolve();
      }
    }
    processChunk();
  });
}

// Use requestIdleCallback for non-critical work
requestIdleCallback(() => {
  // Analytics, non-critical logging
});
```

### CLS - Cumulative Layout Shift
**Target: < 0.1**

Visual stability—no unexpected layout changes.

**Avoid:**
```css
/* ❌ Bad: Font loads late, causing shift */
body {
  font-family: 'CustomFont', sans-serif;
}

/* ✅ Good: Reserve space upfront */
body {
  font-family: sans-serif;
  font-display: swap; /* Use fallback immediately */
}

/* ❌ Bad: Ad loads and shifts content */
<div id="ad"></div>

/* ✅ Good: Reserve space */
<div id="ad" style="min-height: 250px;"></div>
```

## Loading States & Perceived Performance

### Skeleton Screens
```jsx
// Show placeholder while loading
function Card({ isLoading }) {
  if (isLoading) {
    return (
      <div className="card skeleton">
        <div className="skeleton-head"></div>
        <div className="skeleton-text"></div>
      </div>
    );
  }
  return <div className="card">{content}</div>;
}

<style>
  .skeleton {
    background: linear-gradient(
      90deg,
      #f0f0f0 0%,
      #e0e0e0 50%,
      #f0f0f0 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
```

### Progress Indicators
```jsx
// Show progress for long operations
function FileUpload() {
  const [progress, setProgress] = useState(0);

  return (
    <div>
      <progress value={progress} max="100" />
      <p>{progress}% uploaded</p>
    </div>
  );
}
```

## Animation Performance

### 60fps Rule
Use CSS transforms and opacity for smooth animations:

```css
/* ❌ Bad: Triggers layout recalculations */
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ Good: Only transform, no reflow */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* ✅ Good: Use opacity */
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Debouncing Expensive Operations
```js
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// Usage: Debounce search input (300ms)
const handleSearch = debounce((query) => {
  // API call or expensive operation
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

## Asset Optimization

### Images
```html
<!-- Responsive images -->
<img 
  src="image-400w.jpg"
  srcset="image-400w.jpg 400w,
          image-800w.jpg 800w,
          image-1200w.jpg 1200w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  alt="Description"
>

<!-- Modern formats -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Fallback">
</picture>

<!-- Lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">
```

### Fonts
```css
/* Load only needed weights/languages */
@font-face {
  font-family: 'Roboto';
  src: url('roboto-regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap; /* Don't wait for font */
  size-adjust: 100%;
}

/* Use system fonts as fallback */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### JavaScript Splitting
```js
// Dynamic imports for code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loader />}>
  <HeavyComponent />
</Suspense>
```

## Monitoring Performance

### Measuring
```js
// Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Tools
- **Lighthouse**: In Chrome DevTools
- **WebPageTest**: Detailed waterfall charts
- **GTmetrix**: Visual metrics
- **Core Web Vitals API**: Real user metrics

## Quick Wins (High Impact)

1. **Compress images** (usually 30-50% savings)
2. **Enable gzip compression** (usually 50-70% savings)
3. **Minify CSS/JS** (usually 20-30% savings)
4. **Use CDN** (especially for images)
5. **Remove unused CSS** (PurgeCSS, tree-shaking)
6. **Lazy load non-critical resources**
7. **Upgrade to HTTP/2 or HTTP/3**

