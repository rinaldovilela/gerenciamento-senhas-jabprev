# Complete UX/UI Skill for All Platforms

A comprehensive, production-ready UX/UI skill covering design systems, accessibility, responsive design, performance optimization, user research, form design, and information architecture. This skill provides everything you need to design and audit user interfaces across web, mobile, and desktop platforms.

## 📦 What's Included

### 1. **SKILL.md** - Main Documentation
Central hub with quick-start guides for all 7 UX/UI workflows:
- Design System & Components
- Accessibility (WCAG 2.1 AA)
- Responsive Design
- Performance & UX Optimization
- User Research & Testing
- Form Design & Validation
- Navigation & Information Architecture

### 2. **Reference Guides** (`references/`)
In-depth guides for each workflow:
- `design-system.md` - Building component libraries and design tokens
- `accessibility.md` - WCAG compliance and A11y best practices
- `responsive-design.md` - Mobile-first, breakpoints, and fluid layouts
- `performance.md` - Core Web Vitals, optimization techniques
- `user-research.md` - Interviews, usability testing, A/B testing
- `form-design.md` - Forms, validation, accessibility
- `navigation.md` - IA, navigation patterns, wayfinding

Each guide includes:
- Principles and best practices
- Code examples and templates
- Common pitfalls to avoid
- Tools and resources
- Platform-specific notes

### 3. **Checklists** (`checklists/`)
Practical, actionable audit checklists for quick assessment and deeper audits:
- `design-system-checklist.md` - Component library assessment
- `accessibility-checklist.md` - WCAG 2.1 Level AA audit
- `responsive-checklist.md` - Mobile and multi-device testing
- `performance-checklist.md` - Core Web Vitals and optimization
- `research-checklist.md` - User research planning and execution
- `form-checklist.md` - Form design and usability
- `ia-checklist.md` - Information architecture and navigation

Each checklist includes:
- Quick 10-minute assessment
- Complete 1-2 hour deep audit
- Scoring system
- Prioritization matrix
- Next steps and recommendations

### 4. **Templates** (`templates/`)
Ready-to-use templates and code samples:
- `component-template.md` - Reusable React button component with accessibility
- `form-template.md` - Form field component with validation and error handling
- `breakpoint-system.md` - CSS and Tailwind breakpoint strategies
- `sitemap-template.md` - Visual information architecture template
- `research-template.md` - User interview guide with scripts

### 5. **Audit Scripts** (`scripts/`)
Automated audit tools for measuring and validating:
- `a11y-audit.js` - Accessibility audit using Axe Core
- `cwv-audit.js` - Core Web Vitals measurement via Lighthouse

## 🚀 Quick Start

### Choose Your Path

**For Designers:**
1. Read: [Design System Guide](./references/design-system.md)
2. Use: [Component Template](./templates/component-template.md)
3. Run: [Design System Checklist](./checklists/design-system-checklist.md)

**For Frontend Developers:**
1. Read: [Responsive Design Guide](./references/responsive-design.md)
2. Use: [Breakpoint System](./templates/breakpoint-system.md)
3. Run: [cwv-audit.js](./scripts/cwv-audit.js)

**For QA/Testers:**
1. Read: [Accessibility Guide](./references/accessibility.md)
2. Run: [a11y-audit.js](./scripts/a11y-audit.js)
3. Use: [All Checklists](./checklists/)

**For Product Managers:**
1. Read: [User Research Guide](./references/user-research.md)
2. Use: [Research Template](./templates/research-template.md)
3. Review: [IA Checklist](./checklists/ia-checklist.md)

## 📋 How to Use This Skill

### Phase 1: Assessment (30 minutes)
1. Pick the relevant checklist (quick 10-minute version)
2. Identify top 3-5 issues
3. Calculate baseline score

### Phase 2: Deep Audit (1-2 hours)
1. Run the complete checklist
2. Document findings
3. Prioritize by impact

### Phase 3: Implementation (varies)
1. Read relevant guide for context
2. Use templates as starting point
3. Apply recommendations
4. Test with script or manually

### Phase 4: Validation (1-4 weeks)
1. Re-run audits to measure improvement
2. Test with real users
3. Track success metrics

## 🎯 Success Metrics by Domain

### Design System
- ✅ Documentation complete
- ✅ 20+ components built
- ✅ Design-to-code workflow established

### Accessibility
- ✅ 0 critical violations
- ✅ WCAG 2.1 AA compliance
- ✅ Screen reader compatible

### Responsive Design
- ✅ Works at 320px-1920px
- ✅ No horizontal scrolling
- ✅ Touch targets 44x44px+

### Performance
- ✅ Lighthouse > 80
- ✅ LCP < 2.5s
- ✅ CLS < 0.1

### User Research
- ✅ 5+ user interviews conducted
- ✅ Key insights documented
- ✅ Recommendations prioritized

### Forms
- ✅ Completion rate > 70%
- ✅ Error rate < 10%
- ✅ WCAG AA compliant

### Information Architecture
- ✅ Top tasks findable in < 2 clicks
- ✅ Navigation consistent
- ✅ Tested with 5+ users

## 🛠️ Tools Referenced

### Design & Documentation
- Storybook
- Figma
- Zeroheight

### Testing & Auditing (Scripts Included)
- axe DevTools (a11y-audit.js)
- Lighthouse (cwv-audit.js)
- WAVE, Lighthouse, NVDA

### Research & User Testing
- UserTesting
- Maze
- Figma Surveys

### Performance
- Google PageSpeed Insights
- WebPageTest
- GTmetrix

## 💡 Tips for Maximum Impact

1. **Start with one workflow** - Don't try to fix everything at once
2. **Use checklists first** - Quick wins build momentum
3. **Measure everything** - Before and after metrics
4. **Test with real users** - Automation + human testing
5. **Document as you go** - Track decisions and learnings
6. **Iterate regularly** - UX/UI is never "done"
7. **Cross-platform testing** - Mobile, tablet, desktop, accessibility

## 🔄 Recommended Workflow

```
Week 1: Assessment
├─ Pick priority area (from SKILL.md)
├─ Run quick checklist (10 min)
├─ Deep audit (1-2 hours)
└─ Prioritize top 5 issues

Week 2-3: Implementation
├─ Read relevant guide
├─ Use templates
├─ Apply fixes
└─ Test with script/manually

Week 4: Validation
├─ Re-audit
├─ Test with users (if Forms/IA)
├─ Measure improvement
└─ Document learnings

Ongoing: Maintenance
├─ Monthly audits
├─ User feedback loop
├─ Component library updates
└─ Performance monitoring
```

## 📊 Skill Maturity Levels

**Level 1 (Emerging)** - 30-40% items complete
- Pick one workflow
- Complete basic checklist
- Implement top 3 recommendations

**Level 2 (Developing)** - 60-70% items complete
- Cover 3-4 workflows
- Run full audits
- Establish regular testing

**Level 3 (Mature)** - 80-90% items complete
- All 7 workflows optimized
- Automated testing in place
- User research ongoing

**Level 4 (Advanced)** - 90%+ items complete
- Design system fully realized
- Accessibility excellence
- Performance benchmarked
- User-centered design culture

## 🎓 Learning Path

### For New Team Members
1. Read SKILL.md overview
2. Pick your role's quick start
3. Review one reference guide
4. Run one audit script

### For Experienced Practitioners
1. Review relevant guides for depth
2. Run full checklists
3. Use templates as inspiration
4. Refer to checklists during code review

### For Design Leaders
1. Assess all 7 domains
2. Prioritize 2-3 high-impact areas
3. Set team targets and timelines
4. Use checklists for team alignment

## ❓ Frequently Used Scenarios

**"How do I audit accessibility?"**
→ [accessibility-checklist.md](./checklists/accessibility-checklist.md) + [a11y-audit.js](./scripts/a11y-audit.js)

**"How do I build a design system?"**
→ [design-system.md](./references/design-system.md) + [design-system-checklist.md](./checklists/design-system-checklist.md)

**"How do I make my site faster?"**
→ [performance.md](./references/performance.md) + [cwv-audit.js](./scripts/cwv-audit.js)

**"How do I test forms?"**
→ [form-design.md](./references/form-design.md) + [form-checklist.md](./checklists/form-checklist.md)

**"How do I organize content?"**
→ [navigation.md](./references/navigation.md) + [sitemap-template.md](./templates/sitemap-template.md)

**"How do I research users?"**
→ [user-research.md](./references/user-research.md) + [research-template.md](./templates/research-template.md)

**"How do I make responsive designs?"**
→ [responsive-design.md](./references/responsive-design.md) + [breakpoint-system.md](./templates/breakpoint-system.md)

## 📝 Version History

- **v1.0** (2026-03-30) - Initial comprehensive UX/UI skill
  - 7 complete workflows
  - 7 reference guides
  - 7 audit checklists
  - 5 templates
  - 2 automation scripts

## 🤝 Contributing

Found an issue or have a suggestion? This skill is designed to be maintained and improved over time based on team needs. Add new templates, audit scripts, or workflows as your team evolves.

## 📞 Support

For questions about specific techniques:
1. Check the relevant reference guide
2. Review the associated checklist
3. Test with provided script
4. Refer to tools and resources section

---

**Happy designing, building, and testing! 🚀**

Made with ❤️ for cross-platform UX/UI excellence.
