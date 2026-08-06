---
name: Ladies Taylor
description: A DIY show-flyer aesthetic for a no-BS creative agency — bold primary colors, hard black outlines, zero gradients.
colors:
  lt-yellow: "#FFCE00"
  lt-red: "#FF001E"
  lt-blue: "#027DDA"
  lt-dark: "#202224"
  lt-cream: "#FFFBF2"
  lt-gray: "#D9D9D9"
  lt-panel: "#F1F1F1"
  lt-pink: "#FF808F"
  lt-purple: "#731DD8"
  lt-green: "#8AEA92"
  lt-amber: "#E89400"
  lt-pale-blue: "#D9EBFF"
  lt-pale-yellow: "#FFE780"
  lt-sky: "#81BEED"
  lt-peach: "#F6C69A"
typography:
  display:
    fontFamily: "DrukWide-Heavy, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "normal"
  gothic:
    fontFamily: "JBLACK (blackletter), serif"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontWeight: 400
    letterSpacing: "-0.05em"
rounded:
  xs: "4px"
  sm: "12px"
  md: "14px"
  lg: "20px"
spacing:
  section-y: "64px"
  section-y-md: "80px"
components:
  button-primary:
    backgroundColor: "{colors.lt-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.lt-red}"
    textColor: "#FFFFFF"
---

# Design System: Ladies Taylor

## 1. Overview

**Creative North Star: "The DIY Show Flyer"**

Ladies Taylor's site looks like it was cut, stapled, and photocopied for a gig, not exported from a template store. Hard black outlines, flat primary colors with no blend between them, and offset drop-shadows with zero blur read as pasted-on paper, not glassy screen chrome. The blackletter (JBLACK) and heavy poster-display (Druk Wide) type pairing is straight off a punk or metal show flyer; the system-font body copy stays plain and legible underneath it, doing the actual talking.

This system explicitly rejects the generic "creative agency" template look: no soft gradients, no glassmorphism, no safe stock-photo optimism, no hedging. If it could be mistaken for a template-store agency site, the system has failed. Confidence is expressed through flat saturated color and hard edges, not through polish or restraint.

**Key Characteristics:**
- Flat, saturated primary colors used at full strength, never tinted or gradient-blended
- Every interactive surface (button, card, window chrome) gets a 2px black outline plus a hard, blur-free offset shadow — never a soft ambient shadow
- Two loud display faces (Druk Wide, JBLACK blackletter) do the shouting; body copy stays plain system-font and quiet
- Corners are consistently rounded on a small "squircle" scale (4–20px) — never sharp, never a mismatched one-off radius

## 2. Colors

The palette is Full palette strategy: several named, fully-saturated roles used deliberately rather than one dominant accent — closer to a screen-printed flyer's limited ink set than a tinted-neutral SaaS palette.

### Primary
- **Flyer Yellow** (`#FFCE00`): the dominant surface color — hero background, primary brand wash. Used at near-drenched coverage on the homepage hero.
- **Flyer Red** (`#FF001E`): the primary action color. Every canonical CTA button (Contact, Subscribe, Join Guest List) uses this as its background.

### Secondary
- **Ink Black** (`#202224`, token `lt-dark`): the dark surface used for the nav "Contact" pill and other dark-on-light inversions. Doubles as the near-black text color across the site.
- **Poster Blue** (`#027DDA`): a secondary accent, used more sparingly than red or yellow.

### Tertiary
- **Backstage Purple** (`#731DD8`), **Amp Green** (`#8AEA92`), **Warning Amber** (`#E89400`), **Pale Sky Blue** (`#D9EBFF`): the desktop-hero's per-window-kind header colors — each "window" in the desktop simulation gets one of these as an identifying badge color. Reserved for that role; don't reuse them as general UI accents.
- **Flyer Pink** (`#FF808F`): tag-chip accent color (e.g. alternating tag chips on the best-of-bands listing).

### Neutral
- **Flyer Cream** (`#FFFBF2`): the default light background off white, used for content sections that sit off the yellow hero.
- **Concrete Gray** (`#D9D9D9`): dividers, muted surfaces.
- **Panel Gray** (`#F1F1F1`): card/panel backgrounds inside windows and content blocks.

### Reserved (not yet in use)
- **Overcast Sky** (`#81BEED`), **Peach** (`#F6C69A`), **Pale Flyer Yellow** (`#FFE780`): declared in the palette (sampled from the Figma exports) but not yet assigned a role in the UI. Available for future sections (brands of the month, blog, courses) rather than dead weight to delete.

### Admin panel (out of scope for this system)
The `/admin` CMS deliberately does **not** use this design system — it's a lean, minimal, SF Pro (system-font) interface distinct from the public site's bold flyer aesthetic, styled via `src/lib/admin/ui.ts` instead of the tokens below.

### Named Rules
**The Flat Ink Rule.** Colors are used at full saturation or not at all — no tints, no gradients, no opacity ramps for brand colors. Where transparency is used (`text-black/40` and similar), it's for de-emphasized UI text only, never for a brand color itself, and must still clear WCAG contrast against its actual background.

## 3. Typography

**Display Font:** DrukWide-Heavy (self-hosted, `--font-display`)
**Body Font:** System stack — SF Pro Text/Display on Apple, Helvetica Neue/Arial elsewhere (`--font-body`)
**Label/Accent Font:** JBLACK, a blackletter face (`--font-gothic`), self-hosted

**Character:** A poster-loud display pairing (heavy grotesk + blackletter) sitting on top of a deliberately plain, quiet body face — the type does the same job as the flyer metaphor: shout the headline, then get out of the way for the copy.

### Hierarchy
- **Display** (Druk Wide, 800, `text-5xl`–`text-7xl`, tight/none line-height): hero and listing-page banner headlines.
- **Headline** (Druk Wide or JBLACK, `text-4xl`–`text-5xl`): detail-page H1s (event detail, press detail) — standardized on the smaller of the two prior scales.
- **Title** (system body, `text-xl`–`text-3xl`, semibold–bold): section headings, card titles.
- **Body** (system body, `text-sm`–`text-base`, regular, cap line length ~65–75ch): paragraph copy, form copy.
- **Label** (system body, `text-xs`/`text-micro`, bold, uppercase, tracking-wide): button labels, badges, tag chips. `text-micro` (10px) is a new step added during the polish pass to absorb the scattered sub-xs arbitrary sizes (8/9/10px) that had drifted below the standard Tailwind scale; the 11/13px cluster was absorbed into the existing `text-xs` (12px) step instead of adding a second new size.

### Named Rules
**The Shout-Then-Whisper Rule.** Display and label type (Druk, JBLACK, uppercase tracked labels) are loud on purpose. Body copy never borrows that loudness — it stays in the plain system font at regular weight so the two registers stay legible against each other.

## 4. Elevation

Flat and hard-edged, not soft or ambient. Depth is conveyed by a fixed-offset, zero-blur "comic" drop shadow paired with a solid 2px black border — the cut-paper-flyer look — never by soft `box-shadow` blur or glassmorphism.

### Shadow Vocabulary
- **Comic** (`.comic-border`: `border: 2px solid #000; box-shadow: 6px 6px 0 0 #000;`): the standard hard-shadow treatment for larger surfaces (cards, panels).
- **Comic Small** (`.comic-border-sm`: `border: 2px solid #000; box-shadow: 3px 3px 0 0 #000;`): the same treatment at a tighter offset, used on buttons and small chips.
- **Window** (`.window-border`: `border: 2px solid #000;`, no shadow): flat chrome for the desktop-hero window simulation, matching the reference art — outline only, no offset shadow.

### Named Rules
**The No-Blur Rule.** Shadows never blur. Every elevated surface gets a hard, pixel-exact offset shadow (`0` blur radius) — a soft `box-shadow` blur anywhere in the system is a bug, not a stylistic variant.

## 5. Components

### Buttons
- **Shape:** `rounded-squircle-md` (14px) on the standard button; the squircle scale (4/12/14/20px, all snapped from prior arbitrary radii during the polish pass) is used everywhere corners appear, no exceptions.
- **Primary:** `.comic-border-sm`, `bg-lt-red`, white text, `px-6 py-2.5`, `text-xs font-bold uppercase tracking-wide`. This is the canonical CTA (Contact, Subscribe, Join Guest List) — sourced from `lib/ui.ts`'s `PRIMARY_BUTTON_CLASS` constant as of the polish pass, rather than re-typed per call site.
- **Dark/inverted variant:** `.comic-border-sm`, `bg-lt-dark`, white text — used for the nav "Contact" pill and CtaBand's dark CTA. A distinct variant from the red primary, not a re-skin of it.
- **Mobile primary:** same shape and color as desktop primary but with a larger `px-6 py-3 text-sm` footprint — an intentional larger tap-target variant for touch, not a drift to fix.
- **Secondary/choice (quiz answers):** `bg-lt-yellow`, black text, no uppercase, no `comic-border` — a deliberately lighter-weight family for in-context selection rather than a page-level CTA.
- **Hover/Focus:** no bespoke hover treatment currently defined beyond browser defaults; focus-visible states should remain keyboard-visible (don't suppress the outline) given the accessibility pass in this project's polish work.

### Chips
- **Style:** small pill, `bg-lt-pink` or `bg-lt-gray` alternating, black text, uppercase label.
- **State:** static/informational only (tags), not interactive filters, except the best-of-bands filter chip, which is a distinct lighter-weight utility control (no `comic-border`) since it triggers filtering rather than navigating.

### Cards / Containers
- **Corner Style:** `rounded-squircle-sm`–`lg` depending on size (12–20px).
- **Background:** `lt-cream` or `lt-panel` depending on context (page section vs. nested panel).
- **Shadow Strategy:** `.comic-border` for standalone cards; flat `.window-border` for nested chrome inside the desktop-window simulation.
- **Border:** always the 2px solid black border that comes with the comic-border treatment; never a colored border, and never a colored `border-left`/`border-right` accent stripe.

### Inputs / Fields
- **Style:** flat, light background, black text, placeholder-only labeling historically (now paired with `sr-only` `<label>`/`htmlFor` associations as of the accessibility pass).
- **Focus:** relies on browser default focus ring; no custom focus treatment defined.

### Navigation
- **Style:** `NavBar` (desktop) and `MobileNavBar` (mobile) — both real `<nav>` landmarks. Desktop nav sits on the yellow hero band; mobile nav is a separate compact component. Labels use a deliberately irreverent censored style ("Cool Sh*t", "Pr*ss & M*edia") consistent with the brand's blunt voice.

### Desktop Hero Window Simulation (signature component)
A faux-desktop UI (`DesktopHero`, `Window`, `Dock`, `DesktopFolder`) simulating an OS desktop as the homepage's centerpiece on wide viewports, with per-window-kind header colors from the Tertiary palette. Fully hidden (not just visually collapsed) on mobile in favor of `MobileHero`.

## 6. Do's and Don'ts

### Do:
- **Do** use flat, fully-saturated brand colors (`lt-yellow`, `lt-red`, `lt-dark`, etc.) straight from the token list — never a manually-picked near-match hex.
- **Do** pair every elevated surface with a hard, zero-blur offset shadow (`.comic-border`/`.comic-border-sm`) and a solid 2px black border.
- **Do** keep all corners on the squircle scale (4/12/14/20px) — no arbitrary `rounded-[Npx]` values.
- **Do** keep body copy in the plain system font at regular weight, reserving Druk Wide and JBLACK for display/label roles only.
- **Do** write copy that's direct and a little blunt — this brand doesn't hedge.

### Don't:
- **Don't** use soft, blurred, or ambient `box-shadow` anywhere — it reads as generic SaaS polish, which this brand explicitly rejects.
- **Don't** use gradients or `background-clip: text` gradient headlines — flat color only.
- **Don't** use glassmorphism, blur-backdrop cards, or any soft/translucent surface treatment.
- **Don't** introduce a colored `border-left`/`border-right` accent stripe on any card, list item, or callout.
- **Don't** let the site drift toward "generic corporate creative agency template" — no soft optimism, no stock-photo positivity, no safe hedging copy.
- **Don't** add a new one-off corner radius, font size, or button style outside the documented scales without adding it to this file.
