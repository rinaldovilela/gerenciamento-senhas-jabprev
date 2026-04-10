# Accessibility (A11y) & WCAG Compliance

## Overview

Web Accessibility means ensuring digital products are usable by everyone, including people with disabilities. WCAG 2.1 Level AA is the standard to target.

## WCAG 2.1 Principles (Remember: POUR)

### P - Perceivable
Users must be able to perceive information:
- **Color**: Don't rely on color alone to convey meaning
- **Contrast**: Text should have 4.5:1 contrast ratio (AA) or 7:1 (AAA)
- **Text Alternatives**: Images need alt text
- **Captions**: Video and audio need transcripts

### O - Operable
Users must navigate and interact:
- **Keyboard**: All functionality must be keyboard accessible
- **Focus Management**: Clear focus indicators
- **No Seizures**: No flashing content >3 times per second
- **Navigation**: Consistent, logical navigation patterns

### U - Understandable
Content and operation must be clear:
- **Language**: Clear language, defined jargon
- **Predictable**: Interactive elements behave as expected
- **Input Help**: Clear labels and instructions
- **Error Messages**: Specific, actionable error messages

### A - Robust
Content works with assistive technologies:
- **Valid HTML**: Semantic, well-formed markup
- **ARIA**: Proper ARIA labels for dynamic content
- **Screen Readers**: Compatible with assistive tech

## Implementation Guide

### 1. Semantic HTML
```html
<!-- ❌ Bad -->
<div onclick="navigate()">Click me</div>

<!-- ✅ Good -->
<button onclick="navigate()">Click me</button>
```

### 2. Alt Text
```html
<!-- ❌ Bad -->
<img src="chart.png">

<!-- ✅ Good -->
<img src="chart.png" alt="Sales growth 25% YoY">
```

### 3. Color Contrast
```css
/* ❌ Bad: 2.5:1 ratio */
color: #777; background: #fff;

/* ✅ Good: 4.5:1 ratio */
color: #555; background: #fff;
```

### 4. Keyboard Navigation
```jsx
// All interactive elements need keyboard support
<button 
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Close dialog"
>
  ✕
</button>
```

### 5. Focus Management
```jsx
// Show focus indicator
button:focus {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}
```

### 6. ARIA Labels
```html
<!-- Dialog with ARIA -->
<div 
  role="dialog" 
  aria-labelledby="dialog-title"
  aria-modal="true"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p aria-description="This action cannot be undone">
    Are you sure?
  </p>
</div>
```

### 7. Form Accessibility
```html
<!-- Proper form structure -->
<form>
  <label for="email">Email Address</label>
  <input 
    id="email" 
    type="email" 
    aria-required="true"
    aria-describedby="email-help"
  >
  <small id="email-help">We'll never share your email</small>
</form>
```

### 8. Error Messages
```jsx
// Clear, actionable errors
<input aria-invalid={hasError} aria-describedby="email-error">
{hasError && (
  <p id="email-error" role="alert">
    Please enter a valid email address (example@domain.com)
  </p>
)}
```

## Testing Tools

### Automated
- [Axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - In Chrome DevTools
- [WebAIM WAVE](https://wave.webaim.org/) - Browser extension

### Manual Testing
1. **Keyboard Navigation**: Tab through entire interface
2. **Screen Reader**: Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
3. **Zoom**: Test at 200% zoom level
4. **Color**: Use ColorBlindness simulator
5. **Mobile**: Test with mobile screen readers

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing alt text on images | Add descriptive alt attributes |
| Low color contrast | Increase contrast ratio to 4.5:1+ |
| Non-keyboard accessible buttons | Use `<button>` or add keyboard handlers |
| Missing form labels | Link labels with `for` attribute |
| Interactive divs | Use semantic HTML (`<button>`, `<a>`) |
| Unlabeled form fields | Add visible labels + aria-label |
| No focus indicators | Add `:focus` styles |
| Icon-only buttons | Add aria-label or title attribute |

## Priority: Start Here

1. Use semantic HTML (90% of issues)
2. Add proper labels and alt text
3. Ensure 4.5:1 contrast ratio
4. Make keyboard navigable
5. Test with screen readers
6. Add ARIA where needed

## Resources

- [WCAG 2.1 Official Docs](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)

