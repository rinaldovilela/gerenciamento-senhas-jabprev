# Responsive Design Audit Checklist

## Quick Responsive Check (10 min)

- [ ] Page displays correctly on 375px width (iPhone)
- [ ] Page displays correctly on 1024px width (tablet)
- [ ] Page displays correctly on 1920px width (desktop)
- [ ] No horizontal scrolling at any breakpoint
- [ ] Touch targets are at least 44x44px

## Complete Responsive Audit (1-2 hours)

### Desktop (1024px+)

- [ ] Layout utilizes full width appropriately
- [ ] Multi-column layouts work
- [ ] Hover states are visible
- [ ] No content is cut off
- [ ] Proper spacing at 1440px+

### Tablet (600px - 1023px)

- [ ] Two-column layouts adapt well
- [ ] Navigation adapts (hamburger or tabs)
- [ ] Content is readable without zooming
- [ ] Spacing is appropriate
- [ ] Images scale properly

### Mobile (0px - 599px)

- [ ] Single column layout works
- [ ] Text is readable (16px+)
- [ ] Buttons/links are touchable (44x44px+)
- [ ] Navigation is accessible (hamburger, tabs, or drawer)
- [ ] No horizontal scrolling
- [ ] Images/videos scale to fit
- [ ] Form fields are large enough
- [ ] Spacing accommodates touch

### Breakpoints

- [ ] Breakpoints are content-based, not device-based
- [ ] Breakpoints defined: 600px, 1024px, 1440px minimum
- [ ] Transitions between breakpoints are smooth
- [ ] CSS media queries only use min-width (mobile-first)

### Typography

- [ ] Font sizes scale with viewport
- [ ] Use fluid sizing (clamp) where appropriate
- [ ] Headings are proportional at all sizes
- [ ] Line lengths are readable (40-60 characters in body)
- [ ] Line height is appropriate (1.5-1.7)
- [ ] No text is cut off at any breakpoint

### Images & Media

- [ ] Images use srcset for multiple resolutions
- [ ] Images use modern formats (WebP with fallback)
- [ ] Images are optimized for screen size
- [ ] Videos are responsive (aspect ratio maintained)
- [ ] Images are lazy loaded where appropriate
- [ ] Background images scale properly

### Touch Interactions

- [ ] Touch targets are 44x44px+ minimum
- [ ] Touch targets have 8px+ spacing
- [ ] No hover-only interactions
- [ ] Touch feedback is visible
- [ ] Double-tap zoom works
- [ ] Pinch zoom works
- [ ] Long-press interactions accessible

### Layout Components

**Navigation**
- [ ] Hamburger menu on mobile
- [ ] Top navigation on desktop
- [ ] Mobile menu is fully accessible
- [ ] Active state clear at all sizes

**Sidebar**
- [ ] Hidden or drawer pattern on mobile
- [ ] Fixed or sticky on desktop
- [ ] Doesn't overlap main content on mobile
- [ ] Scrollable independently

**Cards/Grid**
- [ ] Grid adapts: 1 column mobile, 2+ desktop
- [ ] Aspect ratios maintained
- [ ] No content overflow
- [ ] Touch-friendly on mobile

**Forms**
- [ ] Inputs are full-width on mobile
- [ ] Labels above inputs on mobile
- [ ] Font size is 16px+ (prevents zoom)
- [ ] Error messages don't hide inputs

**Tables**
- [ ] Scrollable horizontally on mobile
- [ ] Headers visible or sticky
- [ ] Cells wrap text appropriately
- [ ] No important data hidden

### Viewport Configuration

- [ ] Viewport meta tag present
- [ ] Correct viewport meta tag:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ```
- [ ] Zoom is not disabled
- [ ] Maximum scale is appropriate

### Orientation

- [ ] Portrait orientation works
- [ ] Landscape orientation works
- [ ] Orientation change doesn't break layout
- [ ] Content reflows smoothly

### Safe Areas (iOS Notch)

- [ ] Content doesn't hide behind notch
- [ ] Safe area insets respected
  ```css
  padding-left: env(safe-area-inset-left);
  ```

### Testing Tools

- [ ] Chrome DevTools (mobile emulation)
- [ ] Firefox DevTools (responsive mode)
- [ ] Responsively (desktop app)
- [ ] BrowserStack (real devices)
- [ ] Phone/tablet devices
- [ ] Feature phones (if applicable)

### Performance at Mobile

- [ ] Core Web Vitals are good on 4G
- [ ] Load time under 3 seconds
- [ ] No performance regressions on mobile
- [ ] Mobile images are optimized

### Specific Breakpoints to Test

- [ ] 320px (small phones)
- [ ] 375px (iPhone SE, common phone)
- [ ] 414px (iPhone XR, common phone)
- [ ] 600px (tablet minimum)
- [ ] 768px (iPad)
- [ ] 1024px (desktop minimum)
- [ ] 1440px (large desktop)
- [ ] 1920px (HD displays)

### Orientation-Specific

- [ ] Portrait at all widths
- [ ] Landscape at tablet width (600px)
- [ ] Landscape at mobile width (414px)

### Browser/Device Testing

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Firefox mobile
- [ ] Samsung Internet
- [ ] Desktop Chrome
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Edge desktop

### Content Visibility

- [ ] No horizontal scrolling
- [ ] All critical content visible without scrolling
- [ ] Content hierarchy is clear
- [ ] CTA buttons are visible

### Scoring

**Excellent (90-100%)**
- All major breakpoints work
- Touch-friendly throughout
- No horizontal scrolling
- Good mobile performance

**Good (70-89%)**
- Most breakpoints work
- Some mobile optimization needed
- Minor scrolling issues

**Fair (50-69%)**
- Basic responsiveness
- Needs mobile optimization
- Accessibility issues

**Poor (<50%)**
- Significant responsiveness issues
- No mobile optimization
- Major redesign needed

