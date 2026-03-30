# Sitemap Template

## Visual Sitemap Format

```
Website Name
│
├── HOME
│   └── Hero, featured content, CTAs
│
├── ABOUT
│   ├── Company Story
│   ├── Team
│   └── Careers
│
├── PRODUCTS/SERVICES
│   ├── Category 1
│   │   ├── Product 1
│   │   ├── Product 2
│   │   └── Product 3
│   ├── Category 2
│   │   ├── Product 4
│   │   └── Product 5
│   └── Category 3
│
├── RESOURCES
│   ├── Blog
│   │   ├── Article 1
│   │   └── Article 2
│   ├── Documentation
│   ├── FAQ
│   └── Guides
│
├── ACCOUNT (Logged In Users)
│   ├── Dashboard
│   ├── Profile
│   ├── Settings
│   └── Logout
│
└── FOOTER
    ├── Quick Links (repeating main categories)
    ├── Support Links
    │   ├── Contact
    │   ├── Help Center
    │   └── FAQ
    ├── Legal
    │   ├── Privacy Policy
    │   ├── Terms of Service
    │   └── Cookie Policy
    └── Social Links
```

## Detailed Sitemap with Descriptions

```
ROOT
│
├── Home
│   │ Description: Landing page with hero, value props
│   │ Navigation Items: Top nav shows All > Products > Pricing > About > Contact
│   │ Key Elements: CTA button (Sign Up), featured products carousel
│   │
│   └── Breadcrumb: None (home page)
│
├── Products
│   │ Description: Product category/listing page
│   │ Breadcrumb: Home > Products
│   │
│   ├── Product Category 1 (Software)
│   │   │ Description: Category landing page
│   │   │ Breadcrumb: Home > Products > Software
│   │   │
│   │   ├── Product Detail: Item 1
│   │   │   │ Description: Individual product page
│   │   │   │ Breadcrumb: Home > Products > Software > Item 1
│   │   │   │ CTA: "Add to Cart"
│   │   │   │
│   │   │   └── Related Products: Links to similar items
│   │   │
│   │   ├── Product Detail: Item 2
│   │   └── Product Detail: Item 3
│   │
│   ├── Product Category 2 (Hardware)
│   │   ├── Product Detail: Item 4
│   │   └── Product Detail: Item 5
│   │
│   └── Product Category 3 (Services)
│       ├── Product Detail: Item 6
│       └── Product Detail: Item 7
│
├── Pricing
│   │ Description: Pricing comparison page
│   │ Plans: Starter, Professional, Enterprise
│   │ CTA: "Start Free Trial"
│   │
│   └── FAQ (Pricing): Expandable Q&A
│
├── Blog
│   │ Description: Blog listing with search/filter
│   │ Breadcrumb: Home > Blog
│   │
│   ├── Blog Post: Article 1
│   │   │ Description: Individual blog post
│   │   │ Breadcrumb: Home > Blog > Category > Article 1
│   │   │ Meta: Author, Date, Reading Time
│   │   │
│   │   └── Related Posts: Links to similar topics
│   │
│   └── Blog Post: Article 2
│
├── About
│   │ Breadcrumb: Home > About
│   │
│   ├── Company Story
│   │   │ Breadcrumb: Home > About > Company Story
│   │   │
│   │   └── Leadership Team
│   │
│   ├── Team
│   │   │ Lists all team members
│   │   │
│   │   └── Individual Team Members
│   │       (Expandable profiles?)
│   │
│   └── Careers
│       │ Description: Job listings
│       │
│       └── Job Detail
│           │ Description: Individual job posting
│           │ CTA: "Apply Now"
│           │
│           └── Related Jobs
│
├── Contact
│   │ Description: Contact form + location info
│   │ CTA: "Send Message"
│   │
│   └── Thank You (after submission)
│
├── Account (if authenticated)
│   │
│   ├── Dashboard
│   │   │ Breadcrumb: None (main page for this section)
│   │   │ Overview of user data/stats
│   │   │
│   │   └── Quick Actions (Profile, Settings, Orders)
│   │
│   ├── Profile
│   │   │ Breadcrumb: Dashboard > Profile
│   │   │ Edit personal info
│   │   │
│   │   └── Upload Photo
│   │
│   ├── Settings
│   │   │ Breadcrumb: Dashboard > Settings
│   │   │
│   │   ├── Account Settings
│   │   │   └── Change Password
│   │   │
│   │   ├── Privacy Settings
│   │   │
│   │   ├── Notification Preferences
│   │   │
│   │   └── Billing
│   │       └── Payment Methods
│   │
│   └── Logout
│
└── Footer Navigation
    │
    ├── Company Links
    │   ├── About
    │   ├── Careers
    │   ├── Press
    │   └── Contact
    │
    ├── Support
    │   ├── Help Center
    │   ├── FAQ
    │   ├── Status Page
    │   └── Community
    │
    ├── Resources
    │   ├── Documentation
    │   ├── API Docs
    │   ├── Blog
    │   └── Guides
    │
    ├── Legal
    │   ├── Privacy Policy
    │   ├── Terms of Service
    │   ├── Cookie Policy
    │   └── GDPR
    │
    └── Social
        ├── Twitter
        ├── LinkedIn
        ├── GitHub
        └── Facebook
```

## Mobile-Specific Navigation

```
MOBILE SITEMAP

Hamburger Menu
│
├── Home
├── Products
├── Pricing
├── Blog
├── About
├── Contact
├── Account (or "Sign In")
└── Search

Bottom Tab Bar (alternative)
├── Home 🏠
├── Shop 🛍️
├── Search 🔍
├── Account 👤
└── Menu ☰
```

## Information Hierarchy Summary

| Section | Pages | Depth |
|---------|-------|-------|
| Main Navigation | 6-8 | Primary |
| Products | 1-3 categories | 2-3 deep |
| Resources | 3-5 sections | 2 deep |
| Account | 4-6 pages | 2-3 deep |
| Footer | 15-20 links | Mixed |

## Key Principles Applied

✅ **Shallow Hierarchy**: Max 3 clicks to any page
✅ **Consistent Naming**: Same terms used throughout
✅ **Clear Categories**: No overlapping sections
✅ **Mobile Consideration**: Hamburger or tab bar
✅ **User Tasks**: Primary tasks findable quickly
✅ **Search**: Available on main pages

## Validation Questions

- Can users reach main products in < 2 clicks? ✓
- Can users find company info in < 2 clicks? ✓
- Can users access account settings in < 2 clicks? ✓
- Can users find support/help in < 2 clicks? ✓
- Are there clear alternative paths? ✓

**If all items checked, sitemap is solid.**

