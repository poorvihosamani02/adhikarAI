# AdhikarAI — Visual Design System & UI Specification

**Document Version:** 1.0.0  
**Design Philosophy:** Modern Indian GovTech — Trustworthy, Authoritative, Approachable, and Clean.  
**Inspiration:** International civic interfaces (GOV.UK, USDS) blended with vibrant, modern Indian civic identity (Ashoka Navy, Tiranga Saffron, Assurance Emerald).

---

## 1. Brand Identity & Visual Language

AdhikarAI bridges complex legal acts and welfare bureaucracy for everyday citizens. The design must communicate **rock-solid institutional trust**, **statutory authority**, and **warm human approachability**. It must avoid looking like an outdated government portal with cluttered tables, while also avoiding frivolous neon gaming aesthetics that diminish citizen trust.

### 1.1 Brand Emblem & Logo
- **Primary Mark:** An emblem combining a stylized **Scales of Justice** intersecting with an open **Digital Shield** and a subtle **Wheel of Dharma** motif.
- **Brand Wordmark:** **Adhikar** in Bold Deep Navy (`#1e3a8a`), followed by **AI** in vibrant Saffron (`#f97316`) with an elevated pill: `CITIZEN ASSISTANT`.
- **Placement:** Top-left header across all screens, with 32px height on desktop and 28px height on mobile.

---

## 2. Color Palette & Semantic System

The color system uses tailored HSL and hex values engineered for high contrast (WCAG AAA compliant on body copy, WCAG AA compliant on UI accents).

```
+-----------------------------------------------------------------------------------------+
|                                    PRIMARY BRAND PALETTE                                |
+-----------------------------------------------------------------------------------------+
| Ashoka Navy 900  | #1e3a8a | Primary headers, active navigation, brand foundation       |
| Ashoka Navy 800  | #1e40af | Interactive link hover, gradient hero elements             |
| Ashoka Blue 600  | #2563eb | Primary action buttons, focused borders, active badges     |
| Ashoka Blue 50   | #eff6ff | Light primary card backgrounds, active table rows          |
+-----------------------------------------------------------------------------------------+
|                                      ACCENT PALETTE                                     |
+-----------------------------------------------------------------------------------------+
| Tiranga Saffron  | #f97316 | Key CTAs ("Find My Schemes"), high-importance badges       |
| Saffron Deep     | #c2410c | Saffron button hover, emphasis callouts                    |
| Saffron Light    | #fff7ed | Warning banners, needs-review scheme badges                |
| Assurance Emerald| #10b981 | Verified schemes, eligible indicators, success alerts      |
| Emerald Deep     | #059669 | Success CTAs, official portal status                       |
| Emerald Light    | #ecfdf5 | Eligible card background, verified document pills          |
| Threat Red       | #ef4444 | High-risk scam warnings, ineligible criteria markers       |
| Danger Light     | #fef2f2 | Scam alerts, form error banners                            |
+-----------------------------------------------------------------------------------------+
|                                  NEUTRALS & ELEVATIONS                                  |
+-----------------------------------------------------------------------------------------+
| Slate 900        | #0f172a | Headings, primary titles, highest contrast text            |
| Slate 700        | #334155 | Body paragraphs, form labels, secondary titles             |
| Slate 500        | #64748b | Metadata, timestamps, helper text, input placeholders      |
| Slate 200        | #e2e8f0 | Subtle borders, card separators, inactive switches         |
| Slate 50         | #f8fafc | Page background canvas                                     |
| Pure White       | #ffffff | Card surfaces, modal sheets, input backgrounds             |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Typography System & Hierarchy

The typography pairs **Outfit** (a clean, geometric display sans-serif with friendly curves) for headings with **Inter** (the gold standard for high-legibility UI text, numerals, and data).

- **Heading Font:** `'Outfit', system-ui, -apple-system, sans-serif`
- **Body Font:** `'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace Font:** `'JetBrains Mono', 'Fira Code', monospace` (for Document rule IDs, Scheme IDs, and statutory act citations)

```
Scale Name       Size (rem / px)      Weight    Line Height   Tracking    Typical Usage
----------------------------------------------------------------------------------------------------
Display Hero     3.00rem / 48px       800       1.15          -0.03em     Landing Page Main Headline
Heading 1 (H1)   2.25rem / 36px       700       1.20          -0.025em    Page Headers (Dashboard, All Schemes)
Heading 2 (H2)   1.75rem / 28px       700       1.25          -0.02em     Section Titles, Card Groupings
Heading 3 (H3)   1.25rem / 20px       600       1.35          -0.015em    Scheme Card Titles, Dialog Headers
Heading 4 (H4)   1.00rem / 16px       600       1.40          0.00em      Card Subheaders, Form Group Titles
Body Large       1.125rem / 18px      400/500   1.60          0.00em      Hero intro copy, Lead paragraphs
Body Regular     0.9375rem / 15px     400/500   1.55          0.00em      Default UI text, Scheme descriptions
Body Small       0.8125rem / 13px     400/500   1.45          +0.01em     Metadata, Disclaimers, Footnotes
Micro / Badge    0.75rem / 12px       600       1.00          +0.03em     Status Badges, Category Tags
```

---

## 4. Spacing, Grid & Responsive Breakpoints

### 4.1 8-Point Spacing Grid
All paddings, margins, and layout gaps adhere strictly to multiples of 4px and 8px:
- `space-1`: `4px`
- `space-2`: `8px`
- `space-3`: `12px`
- `space-4`: `16px`
- `space-6`: `24px`
- `space-8`: `32px`
- `space-12`: `48px`
- `space-16`: `64px`

### 4.2 Breakpoints & Layout Adapters
- **Mobile (`< 640px`):** Single-column stacked layouts, full-width inputs, bottom navigation sheet or full-screen drawer, cards have `16px` internal padding.
- **Tablet (`640px - 1024px`):** 2-column card grids, condensed dashboard banner, sticky compact header.
- **Desktop (`> 1024px`):** 3-column scheme grids, 1200px max-width content container, side-by-side search filters and result lists.

---

## 5. Component Library & Interaction Specifications

### 5.1 Buttons
- **Primary CTA (Saffron):**
  - Background: `#f97316` (Hover: `#ea580c`, Active: `#c2410c`)
  - Text: White (`#ffffff`), Weight: `700`
  - Shadow: `0 4px 12px rgba(249, 115, 22, 0.28)`
  - Usage: Highest priority actions (e.g., *"Find My Schemes"*, *"Analyze Message"*).
- **Secondary Action (Ashoka Blue):**
  - Background: `#2563eb` (Hover: `#1d4ed8`)
  - Text: White (`#ffffff`), Weight: `600`
  - Usage: Form submissions, profile saves, portal navigation.
- **Neutral Outlined Button:**
  - Background: Transparent (Hover: `#f1f5f9`)
  - Border: 1.5px solid `#cbd5e1` (Hover: `#94a3b8`)
  - Text: `#334155`
  - Usage: "Back to Schemes", "Clear Filters", "Cancel".
- **Icon / Voice Button:**
  - Rounded circular button (`40px x 40px`), micro-animation pulse during active voice recording.

### 5.2 Cards & Elevation
- **Base Card:** Background `#ffffff`, Border `1px solid #e2e8f0`, Radius `16px` (`var(--radius-lg)`), Shadow `0 4px 6px -1px rgba(0,0,0,0.05)`.
- **Hoverable Scheme Card:** Transitions `transform 0.2s ease, box-shadow 0.2s ease`. On hover: lifts `translateY(-3px)`, shadow increases to `0 12px 20px -3px rgba(0,0,0,0.08)`.
- **Glassmorphic Hero Card:** Background `linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0f172a 100%)`, white text, backdrop-filter blur.

### 5.3 Badges & Status Indicators
- **100% Eligible Badge:** Emerald pill (`bg: #ecfdf5`, `border: 1px solid #a7f3d0`, `text: #065f46`, icon: checkmark).
- **Needs Review Badge:** Amber pill (`bg: #fffbeb`, `border: 1px solid #fde68a`, `text: #92400e`, icon: alert-triangle).
- **High Risk Scam Badge:** Threat Red pill (`bg: #fef2f2`, `border: 1px solid #fecaca`, `text: #991b1b`, icon: shield-alert).
- **Jurisdiction Badge:** Blue pill for "Central Scheme", Purple pill for "Karnataka State".

### 5.4 Form Controls & Validation
- **Input Fields:**
  - Height: `44px` (touch-friendly minimum for mobile).
  - Border: `1.5px solid #cbd5e1`, Radius `8px`.
  - Focus State: Border color `#2563eb`, Glow `0 0 0 3px rgba(37, 99, 235, 0.15)`.
  - Error State: Border color `#ef4444`, inline red text below input with icon.
- **Select Dropdowns:** Styled native selects with custom chevron icons to ensure accessibility across mobile operating systems.

### 5.5 Feedback States & Banners
- **Skeleton Shimmer Loaders:** Light slate bars (`#f1f5f9` with shimmer animation) matching exact dimensions of text, titles, and cards while data is being fetched.
- **Empty State Illustration:** Minimalist line illustration (document folder, magnifying glass), friendly explanatory text, and a single clear recovery button (e.g., *"Clear all filters"*).
- **Service Warning Strip:** Subtle top-of-card warning when an AI microservice is temporarily offline, providing an explicit retry action without crashing the host page.

---

## 6. Accessibility & Civic Trust Commitments

1. **High-Contrast Readability:** All text elements exceed the WCAG AA minimum contrast ratio of 4.5:1 against their backgrounds.
2. **Keyboard Navigation:** Every button, input, tab, and card action has a clearly visible focus ring (`2px solid #2563eb`, outline-offset `2px`).
3. **Screen Reader Semantic Markup:** Proper heading hierarchies (`h1` -> `h2` -> `h3`), semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`), and `aria-expanded` attributes on accordions.
4. **No Jargon / Plain Language:** Government conditions are accompanied by plain-English explanations (e.g. explaining "Post-Matric" as "Studies after 10th standard").
