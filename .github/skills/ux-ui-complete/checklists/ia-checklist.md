# Information Architecture Audit Checklist

## Quick IA Check (10 min)

- [ ] Homepage clearly states site purpose
- [ ] Main navigation is obvious
- [ ] Top 3 user tasks accessible in < 3 clicks
- [ ] Current page is clearly indicated
- [ ] Search is available (if needed)

## Complete IA Audit (2-3 hours)

### Navigation Structure

#### Main Navigation
- [ ] Primary navigation visible on every page
- [ ] 3-7 main categories (not too many)
- [ ] Categories are mutually exclusive
- [ ] Labels are clear and consistent
- [ ] Uses user language, not internal jargon

#### Secondary Navigation
- [ ] Sub-categories visible when relevant
- [ ] Sub-items organized logically
- [ ] Breadcrumbs show location
- [ ] No more than 2-3 levels deep
- [ ] Back navigation works

#### Footer Navigation
- [ ] Links to key pages and sections
- [ ] Organized by category
- [ ] Legal links included (privacy, terms)
- [ ] Contact/support easily accessible
- [ ] Social links if applicable

### Navigation Patterns

#### Top Navigation (Global/Web)
- [ ] Logo/home link in top-left
- [ ] 3-7 main categories
- [ ] User account in top-right
- [ ] Search in top-right
- [ ] Responsive on mobile (hamburger)

#### Sidebar Navigation (Admin/Complex)
- [ ] All major sections visible
- [ ] Active section highlighted
- [ ] Sub-items shown under active parent
- [ ] Collapsible sections
- [ ] Scrollable if content overflows

#### Hamburger Menu (Mobile)
- [ ] Icon obvious (three lines)
- [ ] Labeled "Menu" or similar
- [ ] Full-width overlay on mobile
- [ ] Close button/clicking outside closes
- [ ] Keyboard accessible

#### Breadcrumbs (Deep Content)
- [ ] Shows current location
- [ ] Each level is clickable
- [ ] Current page is not clickable
- [ ] Separators are clear
- [ ] Uses forward slashes or "»"

### Information Organization

#### By Topic/Category
- [ ] Categories are logical
- [ ] No overlapping categories
- [ ] Consistent naming
- [ ] Alphabetically sorted if no natural order
- [ ] Filtering/sorting available for large lists

#### By Task
- [ ] Main user tasks are primary
- [ ] Each task is 2-3 clicks maximum
- [ ] Related tasks grouped
- [ ] Alternative paths provided

#### By Audience
- [ ] Different user types supported
- [ ] Clear indication of which is which
- [ ] No forced nesting
- [ ] Easy to switch between audiences

#### By Metaphor
- [ ] Metaphor is clear
- [ ] Consistent with user mental models
- [ ] Doesn't hide functionality
- [ ] Intuitive navigation within metaphor

### Labeling & Nomenclature

#### Label Clarity
- [ ] Labels are specific, not vague
- [ ] No internal jargon
- [ ] No cute/clever names that obscure meaning
- [ ] Same terms used consistently
- [ ] Synonyms mapped to primary term

#### Label Consistency
- [ ] "Sign In" vs "Log In" - pick one
- [ ] "Products" vs "Store" - pick one
- [ ] Button text matches destination
- [ ] Verb tense consistent
- [ ] Capitalization consistent

#### Label Findability
- [ ] Scannable (not buried in text)
- [ ] Visual hierarchy clear
- [ ] Proximity groups related items
- [ ] Colors/icons consistent

### Information Hierarchy

#### Home Page
- [ ] Purpose of site clear immediately
- [ ] Main calls-to-action prominent
- [ ] Key information "above the fold"
- [ ] Search visible (if applicable)
- [ ] Navigation clear
- [ ] Path to major user tasks obvious

#### Category Pages
- [ ] Purpose of page clear from title
- [ ] Subcategories or items listed
- [ ] Filtering/sorting available
- [ ] Item count shown
- [ ] Empty state handled gracefully

#### Detail Pages
- [ ] Breadcrumbs show location
- [ ] Related items suggested
- [ ] Back navigation available
- [ ] Primary actions clear
- [ ] Secondary actions less prominent

### Search (If Applicable)

- [ ] Search box is visible
- [ ] Search box is in expected location
- [ ] Search is prominent
- [ ] Placeholder text is helpful
- [ ] Search results are relevant
- [ ] No results shows suggestions
- [ ] Can filter search results
- [ ] Can sort search results

### Wayfinding

#### Current Location
- [ ] Current page is highlighted
- [ ] Active category is highlighted
- [ ] Breadcrumbs show location
- [ ] Page title matches nav item
- [ ] Window title is descriptive

#### Visual Hierarchy
- [ ] Important content is prominent
- [ ] Whitespace used effectively
- [ ] Color highlights key areas
- [ ] Typography creates order
- [ ] Icons aid recognition

#### Landmarks
- [ ] Main content area identified
- [ ] Navigation landmarks present
- [ ] Sidebar/aside marked
- [ ] Footer identified
- [ ] Banner/header identified

### Mobile Navigation

- [ ] No horizontal navigation
- [ ] Main navigation accessible via hamburger
- [ ] Touch targets 44x44px+
- [ ] Tab bar or drawer pattern used
- [ ] Key sections accessible in 2-3 taps
- [ ] Search accessible
- [ ] Account/profile accessible

### Accessibility in IA

#### Semantic HTML
- [ ] `<nav>` used for navigation
- [ ] `<main>` used for main content
- [ ] `<aside>` used for sidebars
- [ ] `<footer>` used for footer
- [ ] Heading hierarchy correct (h1 → h2 → h3)

#### Landmarks (ARIA if needed)
- [ ] Navigation landmarks identified
- [ ] Role descriptions where needed
- [ ] aria-current="page" on active link
- [ ] aria-label for navigation regions

#### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Skip links present (skip to main content)
- [ ] All navigation keyboard accessible
- [ ] Focus visible on all links
- [ ] No keyboard traps

#### Screen Readers
- [ ] Structure announced correctly
- [ ] Navigation landmarks found
- [ ] Links have descriptive text (not "click here")
- [ ] Abbreviations explained
- [ ] Acronyms expanded

### Testing Navigation

#### User Testing
- [ ] 5 users tested
- [ ] Users can find 3 key tasks in < 3 clicks
- [ ] No major confusion points
- [ ] Task success rate > 80%
- [ ] Time on task reasonable

#### Card Sorting (Validate IA)
- [ ] Open card sort conducted
- [ ] User-generated categories documented
- [ ] Compared to your IA
- [ ] Major differences identified
- [ ] IA adjusted accordingly

#### Navigation Testing
- [ ] Breadcrumbs tested
- [ ] Search tested (if applicable)
- [ ] Mobile menu tested
- [ ] Keyboard navigation tested
- [ ] Screen reader tested

### Common Issues

❌ **Too Many Categories:**
- More than 7 top-level items
- Reduces scannability
- *Fix:* Group related items

❌ **Unclear Labels:**
- Internal jargon ("CRM" instead of "Sales")
- Vague ("Tools" instead of "Project Management")
- *Fix:* Use user language, test labels

❌ **Inconsistent Navigation:**
- Different on different pages
- Menu items inconsistently labeled
- *Fix:* Create style guide

❌ **Hidden Important Features:**
- Main tasks buried in menus
- Non-obvious where to start
- *Fix:* Surface key tasks prominently

❌ **No Current Location Indicator:**
- Users don't know where they are
- Active page not highlighted
- *Fix:* Add breadcrumbs and highlighting

❌ **Poor Mobile Navigation:**
- Hamburger with no clear indication
- Mobile menu hard to use
- *Fix:* Use clear patterns, test on device

### IA Maturity Levels

**Level 1 (Emerging)**
- Basic navigation works
- Some unclear labeling
- No testing with users

**Level 2 (Developing)**
- Most navigation works well
- Clear labeling
- Limited user testing
- Mobile navigation added

**Level 3 (Mature)**
- Comprehensive IA
- Tested with users
- Consistent patterns
- Accessible navigation
- Mobile and desktop optimized

**Level 4 (Advanced)**
- Data-driven organization
- Personalization where appropriate
- Advanced search/filters
- Multiple navigation paths
- Highly optimized

### IA Checklist Score

- [ ] All navigation methods working (4 pts)
- [ ] Labels are clear and consistent (4 pts)
- [ ] User tasks accessible in < 3 clicks (4 pts)
- [ ] Current location always clear (2 pts)
- [ ] Mobile navigation optimized (2 pts)
- [ ] Tested with 5+ users (2 pts)
- [ ] Accessible to screen readers (2 pts)

**28-24 pts: Excellent | 23-18: Good | 17-14: Fair | <14: Needs Work**

