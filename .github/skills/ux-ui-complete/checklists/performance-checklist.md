# Performance Audit Checklist

## Quick Performance Check (10 min)

- [ ] Lighthouse score > 70
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Mobile load time < 3 seconds

## Complete Performance Audit (1-2 hours)

### Core Web Vitals

#### Largest Contentful Paint (LCP < 2.5s)
- [ ] Hero image is preloaded
- [ ] Render-blocking JavaScript removed
- [ ] Render-blocking CSS deferred
- [ ] Font loading is optimized
- [ ] Server response time < 600ms
- [ ] JavaScript doesn't delay rendering
- [ ] Images are optimized

#### First Input Delay (FID < 100ms)
- [ ] Long JavaScript tasks broken up
- [ ] Heavy computation deferred
- [ ] requestIdleCallback used for non-critical work
- [ ] Third-party scripts are deferred
- [ ] Framework code is optimized
- [ ] Main thread isn't blocked

#### Cumulative Layout Shift (CLS < 0.1)
- [ ] Image dimensions specified (width/height)
- [ ] Ad/embed space reserved
- [ ] Font loads don't cause shift (font-display: swap)
- [ ] Animations use transform, not layout properties
- [ ] Top-fixed elements don't shift
- [ ] Late-loaded content causes no shift

### Images & Media

#### Image Optimization
- [ ] All images use WebP or modern format
- [ ] JPEG quality is optimized (75%)
- [ ] PNG is compressed
- [ ] Images are sized for display resolution
- [ ] Responsive images use srcset
- [ ] Image sizes attribute is correct
- [ ] Unnecessary images are removed
- [ ] Lazy loading used where appropriate
- [ ] Image CDN is used
- [ ] Aspect ratio is maintained (no shift)

#### Video
- [ ] Video is optimized for web
- [ ] Poster image specified
- [ ] Video is encoded in multiple codecs
- [ ] Autoplay doesn't download full video
- [ ] Video dimensions prevent layout shift
- [ ] Preload attribute is set appropriately

### CSS & Styling

- [ ] CSS is minified
- [ ] Unused CSS is removed
- [ ] CSS is deferred if non-critical
- [ ] Critical CSS is inlined
- [ ] CSS Grid/Flexbox used (not floats)
- [ ] Animations use GPU (transform, opacity)
- [ ] Media queries optimize for devicepixel-ratio
- [ ] No layout thrashing in CSS

### JavaScript

- [ ] Scripts are minified
- [ ] Unused JavaScript is removed
- [ ] Code splitting implemented
- [ ] Tree-shaking is enabled
- [ ] Async/defer attributes used appropriately
- [ ] Heavy libraries have lighter alternatives
- [ ] Framework is optimized for size
- [ ] Source maps removed from production

### Fonts

- [ ] Web fonts are subset to used characters
- [ ] Font file format is optimized (WOFF2)
- [ ] Font loading strategy is optimized
  - [ ] font-display: swap (avoid invisible text)
  - [ ] Preload critical fonts
  - [ ] Limit to 2-3 fonts
- [ ] Local fonts fallback
- [ ] Variable fonts used where applicable

### Compression & Delivery

- [ ] gzip compression enabled
- [ ] Brotli compression enabled
- [ ] HTTP/2 is enabled
- [ ] HTTP/3 (QUIC) is enabled
- [ ] CDN is configured
- [ ] Cache headers are set appropriately
- [ ] Service workers cache strategy is optimized
- [ ] Static assets have long expiration

### Monitoring

- [ ] Real User Monitoring (RUM) enabled
- [ ] Core Web Vitals tracked
- [ ] Performance budget defined
- [ ] Lighthouse CI set up
- [ ] Synthetic monitoring in place
- [ ] Alerts configured for regressions

### Testing Tools

- [ ] Google Lighthouse (>70 score)
- [ ] WebPageTest (waterfall analysis)
- [ ] GTmetrix (visual metrics)
- [ ] PageSpeed Insights (lab + field)
- [ ] Chrome DevTools (Lighthouse, Network)
- [ ] WebVitals.js (RUM tracking)

### Mobile-Specific

- [ ] Performance on slow 4G
- [ ] Performance on slow 3G
- [ ] Battery impact minimized
- [ ] Data usage optimized
- [ ] Works offline/slow network
- [ ] Mobile Lighthouse score > 70

### Specific Metrics

**Load Time**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Total Blocking Time (TBT) < 300ms

**Asset Sizes**
- [ ] HTML < 100kb
- [ ] CSS < 50kb
- [ ] JavaScript < 100kb (mobile)
- [ ] Images < 300kb per page
- [ ] Total page size < 500kb (mobile)

### Browser DevTools Checks

**Network Tab**
- [ ] No unused resources
- [ ] Compression is enabled
- [ ] Cache is working
- [ ] No redirect chains
- [ ] No duplicate requests

**Performance Tab**
- [ ] No jank (60fps maintained)
- [ ] No long tasks
- [ ] Main thread is not blocked
- [ ] Animations smooth
- [ ] Interactions responsive

**Lighthouse**
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90
- [ ] All recommendations reviewed

### Third-Party Scripts

- [ ] Analytics loaded async
- [ ] Ads are lazy loaded
- [ ] Chat widgets are deferred
- [ ] Social embeds are lazy
- [ ] Third-party impact measured
- [ ] Unused scripts removed

### Optimization Priorities

**High Impact (Do First)**
- [ ] Optimize images (often 50% of size)
- [ ] Remove unused CSS/JS
- [ ] Minimize main JavaScript bundle
- [ ] Implement lazy loading
- [ ] Set up CDN

**Medium Impact**
- [ ] Optimize fonts
- [ ] Implement code splitting
- [ ] Remove heavy dependencies
- [ ] Optimize database queries
- [ ] Enable compression (gzip/Brotli)

**Lower Impact**
- [ ] Minify code (usually 10-15%)
- [ ] Remove unused packages
- [ ] Tree-shake imports
- [ ] Optimize critical rendering path

### Measurement Strategy

1. **Establish Baseline**
   - Run Lighthouse and Web Vitals
   - Document current metrics

2. **Set Targets**
   - FCP: < 1.8s
   - LCP: < 2.5s
   - TTI: < 3.8s

3. **Implement Changes**
   - One optimization at a time
   - Measure after each change

4. **Monitor Continuously**
   - Set up RUM
   - Track trends
   - Alert on regressions

