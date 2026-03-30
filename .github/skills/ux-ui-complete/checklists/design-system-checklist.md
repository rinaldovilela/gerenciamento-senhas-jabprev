# Design System Audit Checklist

## Quick Assessment (15 min)

- [ ] Do you have documented design tokens? (colors, spacing, typography)
- [ ] Are components documented somewhere? (Figma, Storybook, wiki)
- [ ] Do designers and developers follow the same guidelines?
- [ ] Are there duplicated/conflicting components?
- [ ] Do you have a naming convention?

## Complete Design System Audit (1-2 hours)

### Design Tokens
- [ ] Color palette defined (primary, secondary, accent, semantic)
- [ ] Typography documented (font family, sizes, weights, line heights)
- [ ] Spacing scale defined (4px, 8px, 16px, etc.)
- [ ] Border radius standardized
- [ ] Shadow/elevation system defined
- [ ] Animation/transition speeds defined
- [ ] Tokens stored in JSON or CSS variables
- [ ] Tokens versioned and documented

### Components
- [ ] Button component(s) defined
  - [ ] Sizes (small, medium, large)
  - [ ] States (default, hover, active, disabled, loading)
  - [ ] Variants (primary, secondary, danger, ghost)
  - [ ] Icons support
- [ ] Input field component(s)
  - [ ] Text input
  - [ ] Textarea
  - [ ] Error states
  - [ ] Placeholder behavior
  - [ ] Disabled state
- [ ] Form field wrapper (label + input + error)
- [ ] Card component
- [ ] Modal/Dialog component
- [ ] Navigation components (navbar, sidebar, tabs)
- [ ] Typography components (h1-h6, p, blockquote)
- [ ] List components (ordered, unordered, description)
- [ ] Badge/Chip component
- [ ] Alert/Toast component
- [ ] Dropdown/Select component
- [ ] Pagination component
- [ ] Loading spinner
- [ ] Empty state template
- [ ] Error state template

### Documentation
- [ ] Storybook or similar tool set up
- [ ] Each component has documentation
- [ ] Usage examples provided
- [ ] Accessibility notes documented
- [ ] Don'ts are explicitly listed
- [ ] Related components are linked
- [ ] Code snippets are available
- [ ] Props/parameters documented
- [ ] Theme customization documented

### Development
- [ ] Components are reusable across projects
- [ ] No hardcoded values (use tokens)
- [ ] Components are tested (unit + visual)
- [ ] TypeScript types defined
- [ ] Accessibility built-in (semantic HTML, ARIA)
- [ ] Responsive behavior defined
- [ ] All browser/device support defined

### Team & Process
- [ ] Design system has an owner
- [ ] Contribution guidelines documented
- [ ] Version numbering scheme (semantic versioning)
- [ ] Breaking changes documented
- [ ] Update process defined
- [ ] Usage tracking (which products use which components)
- [ ] Designer-developer workflow established
- [ ] Regular reviews (quarterly/biannually)

### Maturity Levels

**Level 1 (Emerging): 30-40% complete**
- Basic documentation
- Some reusable components
- Inconsistent practices

**Level 2 (Growing): 60-70% complete**
- Most components documented
- Clear contribution process
- Better consistency
- Used across products

**Level 3 (Mature): 80-90% complete**
- Comprehensive component library
- Strong ownership
- Regular updates
- Cross-team adoption

**Level 4 (Advanced): 90%+ complete**
- Design-to-code automation
- Flexible theming
- Performance optimized
- Industry recognition

### Next Steps

**If Level 1:** Start with 5 essential components (Button, Input, Card, Modal, Alert)
**If Level 2:** Expand component coverage and improve documentation
**If Level 3:** Automate workflows, improve tooling, grow adoption
**If Level 4:** Explore advanced features (design tokens automation, theming engine)

