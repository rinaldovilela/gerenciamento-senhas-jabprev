# Navigation & Information Architecture

## Overview

Information Architecture (IA) is how content and features are organized and labeled. Good IA makes it easy for users to find what they need.

## Principles

### 1. Clear Hierarchy
```
Primary navigation (main sections)
  └─ Secondary navigation (subsections)
    └─ Tertiary navigation (pages/content)
```

Example:
```
Products
  └─ Electronics
    └─ Laptop Details
```

### 2. Consistent Labeling
Use the same terms throughout:
- Don't mix "Sign In", "Log In", "Login"
- Pick one and stick with it
- Use user language, not internal jargon

### 3. Logical Organization

**By Task:**
- For task-focused users
- Example: "Buy", "Track Order", "Return Item"

**By Category:**
- For browsing
- Example: "Shirts", "Pants", "Shoes"

**By Audience:**
- For different user types
- Example: "For Businesses", "For Individuals"

**By Feature:**
- For platform-focused products
- Example: "Team Management", "Analytics", "Settings"

## Navigation Patterns

### Top Navigation Bar
```html
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

**Best for:** Broad categories (3-7 items), web

### Sidebar Navigation
```html
<aside aria-label="Sidebar navigation">
  <nav>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/profile">Profile</a></li>
      <li><a href="/settings">Settings</a></li>
      <li><a href="/help">Help</a></li>
    </ul>
  </nav>
</aside>
```

**Best for:** Admin panels, deep hierarchies, desktop

### Hamburger Menu
```html
<nav aria-label="Mobile navigation">
  <button id="menu-toggle" aria-expanded="false">
    ☰ Menu
  </button>

  <ul id="mobile-menu" hidden>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<script>
  const toggle = document.getElementById('menu-toggle');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    document.getElementById('mobile-menu').hidden = expanded;
  });
</script>
```

**Best for:** Mobile sites, space-constrained

### Breadcrumb Navigation
```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Laptop Details</li>
  </ol>
</nav>

<style>
  ;li::before {
    content: " / ";
    margin: 0 8px;
  }
</style>
```

**Best for:** Deep content hierarchies

### Tabs
```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2">
    Details
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel3">
    Reviews
  </button>
</div>

<div id="panel1" role="tabpanel" aria-labelledby="tab1">
  Overview content
</div>
<div id="panel2" role="tabpanel" aria-labelledby="tab2" hidden>
  Details content
</div>
```

### Footer Navigation
```html
<footer>
  <nav>
    <h3>Company</h3>
    <ul>
      <li><a href="/about">About Us</a></li>
      <li><a href="/careers">Careers</a></li>
      <li><a href="/press">Press</a></li>
    </ul>

    <h3>Support</h3>
    <ul>
      <li><a href="/help">Help Center</a></li>
      <li><a href="/contact">Contact Us</a></li>
      <li><a href="/faq">FAQ</a></li>
    </ul>

    <h3>Legal</h3>
    <ul>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/terms">Terms</a></li>
    </ul>
  </nav>
</footer>
```

## Creating a Sitemap

```
Website Structure:
- Home
  - About
  - Products
    - Category 1
      - Product Page 1
      - Product Page 2
    - Category 2
  - Blog
    - Article 1
    - Article 2
  - Contact
  - Account
    - Login
    - Sign Up
    - Profile
    - Settings
```

## Card Sorting (IA Validation)

Validate your IA with users:

1. **Open Card Sort**
   - Give users cards with content items
   - Let them organize freely into groups
   - Ask them to name categories

2. **Closed Card Sort**
   - Provide pre-defined categories
   - Ask users where items belong
   - Validates your existing IA

3. **Hybrid Card Sort**
   - Provide some categories
   - Let users add and adjust

## Search Design

For large information spaces:

```html
<form role="search">
  <label for="search">Search</label>
  <input 
    id="search" 
    type="search"
    placeholder="Search products..."
    aria-describedby="search-hint"
  >
  <small id="search-hint">
    Hint: Use quotes for exact match ("blue shirt")
  </small>
  <button type="submit">Search</button>
</form>
```

## Accessibility in Navigation

```html
<!-- Mark current page -->
<a href="/products" aria-current="page">Products</a>

<!-- Skip links for keyboard users -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Menu with keyboard support -->
<nav>
  <button aria-haspopup="menu">File</button>
  <ul role="menu">
    <li role="menuitem"><a href="/new">New</a></li>
    <li role="menuitem"><a href="/open">Open</a></li>
  </ul>
</nav>
```

## Mobile Navigation Considerations

- Hamburger menu for space efficiency
- Fat finger targets (44x44px minimum)
- Clear visual indicators for current section
- Quick access to home and search
- Avoid deep nesting (max 2-3 levels)

## Common IA Mistakes

- ❌ Too many top-level categories
- ❌ Unclear, jargony labels
- ❌ No "Home" link
- ❌ "Miscellaneous" category
- ❌ Inconsistent naming
- ❌ No search navigation
- ❌ Hidden important features

## IA Testing Checklist

- [ ] Users can find key information in < 2 clicks
- [ ] Navigation labels are clear and consistent
- [ ] Current page is always indicated
- [ ] Breadcrumbs show location in hierarchy
- [ ] Mobile menu works on all devices
- [ ] Keyboard navigation works
- [ ] Screen readers announce navigation
- [ ] No broken links
- [ ] Search function present (if needed)
- [ ] Help/FAQ easily accessible

