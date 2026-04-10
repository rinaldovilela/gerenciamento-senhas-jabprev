---
name: ux-ui-complete
description: "Complete UX/UI workflow for cross-platform design. Use when: building design systems, auditing accessibility, implementing responsive layouts, optimizing Core Web Vitals, designing forms, conducting user research, or architecting information architecture. Covers web, mobile, and desktop platforms."
argument-hint: "Specify the UX/UI task: 'design system audit', 'accessibility check', 'responsive redesign', 'form validation', 'A/B test setup', etc."
---

# Complete UX/UI Skill

Comprehensive workflow for designing, implementing, and auditing user interfaces across web, mobile, and desktop platforms. This skill guides you through industry-standard practices and provides checklists, templates, and automation scripts.

## When to Use

- **Design System Development**: Creating or maintaining component libraries, design tokens, documentation
- **Accessibility Audits**: WCAG compliance, semantic HTML, screen reader testing, keyboard navigation
- **Responsive Design**: Mobile-first layouts, breakpoint strategy, fluid typography
- **Performance & UX**: Core Web Vitals optimization, loading states, animation performance
- **User Research**: Usability testing, user interviews, feedback collection, iteration
- **Form Design**: Input validation patterns, error messaging, accessibility for forms
- **Navigation & IA**: Information architecture, wayfinding, menu systems, sitemaps

## Quick Start: Choose Your Path

### 1. Design System & Components
Design scalable, maintainable component libraries with consistent design language.
- Start: [Design System Guide](./references/design-system.md)
- Checklist: [Component Audit](./checklists/design-system-checklist.md)
- Template: [Component Template](./templates/component-template.md)

### 2. Accessibility (A11y)
Ensure compliance with WCAG 2.1 AA standards and universal design principles.
- Start: [Accessibility Guide](./references/accessibility.md)
- Checklist: [A11y Audit](./checklists/accessibility-checklist.md)
- Script: [Run A11y Scanner](./scripts/a11y-audit.js)

### 3. Responsive Design
Build interfaces that work seamlessly across devices and screen sizes.
- Start: [Responsive Design Guide](./references/responsive-design.md)
- Checklist: [Responsive Audit](./checklists/responsive-checklist.md)
- Template: [Breakpoint System](./templates/breakpoint-system.md)

### 4. Performance & UX
Optimize loading performance, animations, and user perception of speed.
- Start: [Performance Guide](./references/performance.md)
- Checklist: [Performance Audit](./checklists/performance-checklist.md)
- Script: [Core Web Vitals Check](./scripts/cwv-audit.js)

### 5. User Research & Testing
Gather insights through structured user research and usability testing.
- Start: [User Research Guide](./references/user-research.md)
- Checklist: [Research Planning](./checklists/research-checklist.md)
- Template: [Interview Guide](./templates/research-template.md)

### 6. Form Design & Validation
Create user-friendly forms with robust validation and clear error messaging.
- Start: [Form Design Guide](./references/form-design.md)
- Checklist: [Form Audit](./checklists/form-checklist.md)
- Template: [Form Component](./templates/form-template.md)

### 7. Navigation & IA
Structure information hierarchies and create intuitive navigation systems.
- Start: [Navigation Guide](./references/navigation.md)
- Checklist: [IA Audit](./checklists/ia-checklist.md)
- Template: [Sitemap Template](./templates/sitemap-template.md)

## Step-by-Step Workflow

### Phase 1: Assessment
1. Identify your current design maturity level
2. Run relevant audit scripts ([a11y-audit.js](./scripts/a11y-audit.js), [cwv-audit.js](./scripts/cwv-audit.js))
3. Review baseline metrics

### Phase 2: Planning
1. Review relevant guide documents
2. Use checklists to identify gaps
3. Prioritize improvements by impact

### Phase 3: Implementation
1. Use templates and component samples
2. Follow best practices from guides
3. Validate changes with checklists

### Phase 4: Validation & Testing
1. Test across target devices/browsers
2. Conduct user research with guidelines
3. Measure Core Web Vitals and performance
4. Audit accessibility compliance

## Key UX/UI Principles (All Platforms)

### 1. **Consistency**
- Same design language across all surfaces
- Predictable component behavior
- Consistent terminology

### 2. **Clarity**
- Clear visual hierarchy
- Obvious call-to-action elements
- Understandable error messages

### 3. **Accessibility**
- WCAG 2.1 AA compliance minimum
- Keyboard navigation
- Screen reader compatibility

### 4. **Performance**
- Under 3 second load time target
- Smooth animations (60fps)
- Optimized images and assets

### 5. **Responsiveness**
- Mobile-first approach
- Adaptive layouts
- Touch-friendly targets

### 6. **Feedback**
- Clear loading states
- Confirmation messages
- Real-time validation feedback

### 7. **User-Centered**
- Based on research insights
- Tested with real users
- Iterative improvement

## Cross-Platform Considerations

### Web
- Progressive enhancement
- CSS Grid/Flexbox layouts
- Service workers for offline
- SEO optimization

### Mobile (iOS/Android)
- Native platform conventions
- Touch gestures
- Safe areas/notches
- Battery optimization

### Desktop (Electron/Tauri)
- Window management
- System integration
- Keyboard shortcuts
- High-DPI displays

## Tools & Resources

### Design Systems
- [Storybook](https://storybook.js.org/) - Component development
- [Figma](https://figma.com) - Design collaboration
- [Zeroheight](https://zeroheight.com/) - Documentation

### Accessibility Testing
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Performance
- [Web Vitals](https://web.dev/vitals/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### User Research
- [UserTesting](https://www.usertesting.com/)
- [Maze](https://maze.design/)
- [Figma Surveys](https://help.figma.com/hc/en-us/articles/9033014305559)

## Quick Recommendations by Role

### Product Designer
- Read: Design System Guide, User Research Guide
- Run: [a11y-audit.js](./scripts/a11y-audit.js), Design System Checklist
- Use: Component Template, Sitemap Template

### Frontend Developer
- Read: Responsive Design Guide, Accessibility Guide, Performance Guide
- Run: [cwv-audit.js](./scripts/cwv-audit.js) regularly
- Use: Form Template, Breakpoint System

### QA/Tester
- Run: All audit scripts
- Use: All checklists
- Review: Accessibility & Performance guides

### Product Manager
- Read: User Research Guide, Navigation Guide
- Use: Research Template, IA Checklist
- Track: User satisfaction metrics

## Success Metrics

Track these metrics to measure UX/UI quality:

| Metric | Target | Platform |
|--------|--------|----------|
| Lighthouse Score | >90 | Web |
| Core Web Vitals (all green) | 100% | Web |
| WCAG Compliance | AA (min) | All |
| Mobile Performance (FCP) | <1.8s | Mobile/Web |
| Form Completion Rate | >70% | All |
| User Satisfaction (CSAT) | >4.5/5 | All |
| Task Success Rate | >85% | All |

## Next Steps

1. **Choose your priority**: Pick the most impactful area from the 7 workflows
2. **Read the guide**: Start with the relevant reference document
3. **Run the audit**: Execute the checklist systematically
4. **Implement**: Use templates and follow best practices
5. **Measure**: Track success metrics and iterate

---

**For detailed information, see the specific guides in [references](./references/) folder.**

