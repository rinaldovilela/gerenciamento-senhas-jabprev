# Accessibility Audit Checklist

## Quick A11y Check (10 min)

- [ ] All images have alt text
- [ ] All buttons are keyboard accessible (Tab key works)
- [ ] Color alone doesn't convey meaning
- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Focus indicator is visible

## WCAG 2.1 Level AA Audit (1-2 hours)

### Perceivable: Can users see and hear content?

#### Color & Contrast
- [ ] Text contrast ratio meets 4.5:1 (AA) or 7:1 (AAA)
- [ ] Color isn't the only way to convey information
- [ ] Icon colors have sufficient contrast
- [ ] Form errors aren't communicated by color alone
- [ ] Links are distinguished from regular text

#### Text Alternatives
- [ ] All images have descriptive alt text
- [ ] Decorative images have empty alt="" or aria-hidden
- [ ] Alt text is meaningful (not "image of" or "photo1")
- [ ] Form icons have labels or titles
- [ ] Charts/graphs have data tables or descriptions

#### Audio & Video
- [ ] Videos have captions (deaf users)
- [ ] Videos have audio descriptions (blind users)
- [ ] Audio content has transcripts
- [ ] No auto-playing audio/video

#### Adaptable
- [ ] Reflow works at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] Information relationships preserved when zoomed
- [ ] Text resizing works without cutting off content

### Operable: Can users navigate and interact?

#### Keyboard Accessible
- [ ] All functionality is keyboard operable
- [ ] Tab order is logical
- [ ] Focus is not trapped
- [ ] Keyboard shortcuts don't override browser shortcuts
- [ ] Skip links exist for repetitive navigation
- [ ] Keyboard shortcuts have alternative methods

#### Focus Visible
- [ ] Focus indicator is visible on all interactive elements
- [ ] Focus outline has 3px thickness and adequate contrast
- [ ] Focus indicator is clearly visible (not hidden)
- [ ] Outline offset doesn't hide content

#### Navigation
- [ ] Navigation is consistent across pages
- [ ] Current page is indicated
- [ ] Purpose of each link is clear from context or text
- [ ] Breadcrumbs show location (if applicable)

#### Timing
- [ ] No time limits (or user can extend)
- [ ] No auto-advancing carousels (or pausable)
- [ ] No flashing content (> 3 times per second)
- [ ] No seizure-inducing animations

### Understandable: Is content clear?

#### Readable
- [ ] Language is clear and simple
- [ ] Jargon is defined or avoided
- [ ] Abbreviations are spelled out on first use
- [ ] Reading level is appropriate

#### Predictable
- [ ] Navigation behavior is consistent
- [ ] Submit buttons are clearly labeled
- [ ] Opening a new window is disclosed
- [ ] Changing context requires user action

#### Input Help
- [ ] Form fields have visible labels
- [ ] Error messages are specific and actionable
- [ ] Required fields are marked
- [ ] Help text explains what's expected
- [ ] Auto-correction suggestions are provided

### Robust: Works with assistive tech?

#### Valid Code
- [ ] HTML is valid (run through W3C validator)
- [ ] No duplicate IDs
- [ ] ARIA attributes are used correctly
- [ ] Roles are semantically appropriate

#### Semantics
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Buttons use `<button>`, links use `<a>`
- [ ] Form controls use `<label>` associations
- [ ] Landmarks used: main, nav, aside, footer

#### ARIA (when necessary)
- [ ] ARIA only used when native HTML not available
- [ ] aria-label for icon buttons
- [ ] aria-describedby for additional context
- [ ] aria-hidden for decorative elements
- [ ] role="alert" for important messages
- [ ] aria-live for dynamic updates
- [ ] aria-expanded for toggles
- [ ] aria-current for current page

### Screen Reader Testing

- [ ] Page title describes purpose
- [ ] Headings define structure
- [ ] Form fields are properly labeled
- [ ] Error messages announce with role="alert"
- [ ] Skip links work
- [ ] Navigation landmarks are identified
- [ ] Images have useful alt text (tested with NVDA/JAWS)
- [ ] Tables have proper `<thead>`, `<tbody>`, `<caption>`
- [ ] Modal dialogs trap focus and announce
- [ ] Dynamic content updates are announced

### Tools to Use

- [ ] axe DevTools (browser extension)
- [ ] Lighthouse (Chrome DevTools)
- [ ] WAVE (webaim.org)
- [ ] NVDA (free screen reader, Windows)
- [ ] JAWS (commercial screen reader)
- [ ] VoiceOver (Mac/iOS)
- [ ] Color Contrast Analyzer
- [ ] Landmarks extension
- [ ] W3C Validators

### Mobile Accessibility

- [ ] Touch targets are 44x44px minimum
- [ ] Touch targets have spacing between them
- [ ] Works with system accessibility features
  - [ ] iOS VoiceOver
  - [ ] Android TalkBack
  - [ ] Zoom features
  - [ ] Color inversion
  - [ ] Captions

### Scoring

**0-20 issues: Green (Excellent)**
- Continue monitoring
- Focus on edge cases

**21-50 issues: Yellow (Good)**
- Create action plan
- Fix high-impact items first

**50+ issues: Red (Needs Work)**
- Prioritize fixes
- Consider redesign
- Get expert help

### Priority Matrix

Fix immediately:
1. ❌ Missing alt text on meaningful images
2. ❌ Keyboard inaccessible critical features
3. ❌ Color-only information conveyance
4. ❌ Low contrast text (< 3:1)

Fix soon:
5. ⚠️ Missing form labels
6. ⚠️ Poor focus indicators
7. ⚠️ Missing skip links
8. ⚠️ Non-semantic HTML

Fix eventually:
9. ℹ️ Missing optional ARIA
10. ℹ️ Complex heading structure

