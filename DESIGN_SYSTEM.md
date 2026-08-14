# TooRichApp Design System

> **When building any new screen, read this file first.** Always use the `Text`, `Button`, and `Card` components from `src/components/` rather than raw React Native primitives, and always pull values from `src/theme/tokens.ts` rather than hardcoding colors/sizes/spacing.

This file is the single source of truth for visual/design decisions. Do not reintroduce ad-hoc colors, fonts, sizes, or spacing in screen code. If a token is missing, add it to `src/theme/tokens.ts` and document it here.

> **v3 note:** This replaces the v2 "parchment/bronze" private-club direction entirely. The product is now deliberately minimalist: **pure black and white** with a neutral gray ramp used only for hierarchy and structure. No accent colors anywhere — no blue, no bronze/gold, no warm gradients. Fraunces (serif) Bold is the premium/display voice for wordmarks, headlines, and prominent numbers; General Sans is reserved for body copy and UI labels. The old monolithic "two modes" (Warm/Clean) concept is gone — there is one monochrome language for the entire app. Do not resurrect deprecated tokens — see Section 7.

---

## 1. Typography

Two font families, unchanged in identity and linking from before.

### 1a. Fraunces — Serif Display Font

The wordmark / headline / editorial serif. Use for headlines, wordmarks, big numbers (stat callouts, member numbers), and card titles. **Bold (700) is the primary weight** for everything prominent.

| Weight | fontFamily value | Token | File |
|---|---|---|---|
| Regular (400) | `Fraunces-Regular` | `theme.fonts.fontSerifRegular` | `src/assets/fonts/Fraunces-Regular.ttf` |
| Regular Italic (400i) | `Fraunces-Italic` | `theme.fonts.fontSerifItalic` | `src/assets/fonts/Fraunces-Italic.ttf` |
| Medium (500) | `Fraunces-Medium` | `theme.fonts.fontSerifMedium` | `src/assets/fonts/Fraunces-Medium.ttf` |
| SemiBold (600) | `Fraunces-SemiBold` | `theme.fonts.fontSerifSemibold` | `src/assets/fonts/Fraunces-SemiBold.ttf` |
| Bold (700) | `Fraunces-Bold` | `theme.fonts.fontSerifBold` | `src/assets/fonts/Fraunces-Bold.ttf` |

- `fontFamily` value = file name (Android resolves by filename, iOS by embedded PostScript name — both aligned to the file name).
- Optical cut remains **Fraunces 72pt** throughout.
- Apply serif text via the `Text` component's override pattern:
  ```tsx
  <Text style={{ fontFamily: theme.fonts.fontSerifBold }}>
    Too Rich
  </Text>
  ```

**Serif usage rules (weight → role):**

| Role | Weight | Size (token) | Example |
|---|---|---|---|
| Hero headline / splash wordmark | **Bold (700)** | `xl4` (40) – `xl5` (48) | "Too Rich" on Splash |
| Onboarding / sign-in step headline | **Bold (700)** | `xl3` (32) – `xl4` (40) | "Show us who's joining.", "Welcome." |
| Screen / page title | **Bold (700)** or SemiBold (600) | `xl3` (32) | "Members" page titles |
| Card / confirmation title | SemiBold (600) | `xl2` (24) – `xl3` (32) | "Welcome to the club." |
| Big numbers / stats (member count, member number) | **Bold (700)** or SemiBold (600) | `xl2` (24) – `xl4` (40) | "#247", "873" |
| Status message / quote accents | Regular Italic (400i) | `base` (16) – `lg` (18) | "Too Rich to Reply." |
| Quiet large serif accents | Regular (400) | `xl` (20) – `xl2` (24) | — |
| Intermediate accent (rare) | Medium (500) | any display size | — |

Rule of thumb: **if it's prominent, it's Fraunces Bold.** Reserve lighter serif weights for quiet/subordinate serif moments only.

### 1b. General Sans — Body/UI Font

Body copy, buttons, labels, form inputs, navigation, list items, captions, tab bar labels, eyebrow/kicker labels (e.g. "STEP 1 OF 3", "MEMBER").

| Weight | fontFamily value | Token |
|---|---|---|
| Regular (400) | `GeneralSans-Regular` | `theme.fonts.fontRegular` |
| Medium (500) | `GeneralSans-Medium` | `theme.fonts.fontMedium` |
| Semibold (600) | `GeneralSans-Semibold` | `theme.fonts.fontSemibold` |
| Bold (700) | `GeneralSans-Bold` | `theme.fonts.fontBold` |

Eyebrow/kicker labels (small all-caps tracked text like "STEP 1 OF 3", "MEMBER") use `fontMedium`, `xs`–`sm` size, `letterSpacing: 1.5`, uppercase, color `textSecondary` — see 3g.

### 1c. Variant system (`src/components/Text.tsx`)

No changes to the component's own defaults.

| Variant | Font | Size | Color | Use for |
|---|---|---|---|---|
| `display` | GeneralSans-Semibold | 48 (`xl5`) | `textPrimary` | Large sans displays (prefer serif Bold for headlines) |
| `heading` | GeneralSans-Bold | 32 (`xl3`) | `textPrimary` | Section titles |
| `subheading` | GeneralSans-Medium | 18 (`lg`) | `textPrimary` | Sub-section titles |
| `body` | GeneralSans-Regular | 16 (`base`) | `textPrimary` | Paragraph/body copy |
| `caption` | GeneralSans-Regular | 16 (`base`) | `textSecondary` | Secondary/explanatory text |
| `label` | GeneralSans-Medium | 12 (`xs`) | `textSecondary` | Input labels, small UI labels, eyebrow/kicker text |

For serif display text, pass `style={{ fontFamily: theme.fonts.fontSerifBold }}` (see 1a).

### 1d. Font size scale (unchanged, from `src/theme/tokens.ts` `fontSizes`)

| Token | Value |
|---|---|
| `xs` | 12 |
| `sm` | 14 |
| `base` | 16 |
| `lg` | 18 |
| `xl` | 20 |
| `xl2` | 24 |
| `xl3` | 32 |
| `xl4` | 40 |
| `xl5` | 48 |

---

## 2. Color System — Monochrome Palette

One palette for the entire app. **No accent colors, no gradients, no warmth.** Surfaces are white; text and primary controls are near-black; hierarchy is expressed with one neutral gray ramp.

| Role | Hex | Token |
|---|---|---|
| Background | `#FFFFFF` | `theme.colors.background` |
| Muted surface (search input fill, placeholder tiles) | `#F3F4F6` | `theme.colors.surfaceMuted` |
| Text primary | `#0A0A0A` | `theme.colors.textPrimary` |
| Text secondary | `#6B7280` | `theme.colors.textSecondary` |
| Border / divider | `#E5E7EB` | `theme.colors.border` |
| Solid black (CTA, icons, active elements) | `#0A0A0A` | `theme.colors.black` |
| White (on-black text, fills) | `#FFFFFF` | `theme.colors.white` |

Rules:
- **Screens have a plain white (`background`) surface.** Do not use gradients; the only gradients in the codebase are legacy and unused.
- Headlines, wordmarks, and prominent numbers: `textPrimary` (`#0A0A0A`) in Fraunces.
- Secondary/descriptive text, captions, links: `textSecondary` (`#6B7280`).
- Active dots, active chips, active tab icons, primary CTAs, stat numbers, icons: `black`.
- Inactive dots, chip borders, card borders, dividers, input borders: `border` (`#E5E7EB`).

---

## 3. Components & Patterns

### 3a. Buttons (`src/components/Button.tsx`)

Still pill-shaped: `borderRadius: theme.radius.full` (999). Height baseline: `minHeight: 52`, horizontal padding `theme.spacing.lg` (24).

| Variant | Background | Text color | Border |
|---|---|---|---|
| `primary` | `theme.colors.black` (`#0A0A0A`) | white (`#FFFFFF`) | none |
| `secondary` | `theme.colors.border` (`#E5E7EB`) | `textPrimary` | none |
| `outline` | transparent / `background` | `textPrimary` | 1px `theme.colors.border` |

- All button text uses `fontSemibold` (GeneralSans-Semibold), centered, single line.
- Disabled = `opacity 0.5`; pressed = `opacity 0.88`.
- Text-only "buttons" (no fill, no border — e.g. "Skip", "Skip for now") are not a `Button` variant; render as a `Text` with `fontFamily: fontMedium`, color `textSecondary`, no underline unless the reference explicitly shows one.

### 3b. Text inputs

Bordered, rounded-rectangle inputs, transparent/background-matching fill. Used on the Onboarding photo name field, status message textarea, and Instagram username field.

| Property | Value |
|---|---|
| Border | `1px solid` `theme.colors.border` (`#E5E7EB`) |
| Background | transparent (inherits screen background) |
| Corner radius | `theme.radius.lg` (16) |
| Padding | `theme.spacing.md` (16) horizontal, `theme.spacing.md` vertical (more for the multi-line textarea) |
| Placeholder text color | `theme.colors.textSecondary` |
| Text color (entered) | `theme.colors.textPrimary` |
| Icon prefix (e.g. Instagram field) | `black`, `20x20`, left-aligned inside the border with `spacing.sm` gap to text |

Multi-line variant (status message textarea) additionally shows a bottom-right character counter (`0 / 80`) in `label` style, `textSecondary`, and a resize-handle glyph in the corner — decorative only.

**Search input (Member Wall):** differs from the bordered inputs above — it uses a `surfaceMuted` (`#F3F4F6`) filled field with a `border` outline, `radius.lg`, black magnifier-glyph icon prefix left-aligned, placeholder in `textSecondary`, text in `textPrimary`. Same corner radius/padding as the bordered inputs.

### 3c. Cards (`src/components/Card.tsx`)

Default card: white background, `1px` border in `theme.colors.border` (`#E5E7EB`), used for stat/info cards on Sign In, Club home, and member profiles.

- Corner radius: `theme.radius.lg` (16).
- Padding: `theme.spacing.md` (16).
- A thin vertical divider (`1px`, `border`) can separate two stacked info items inside a card.
- Soft shadow treatment for any card that needs to visually float, unchanged:
  ```tsx
  const elevated = {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: theme.colors.background,
  };
  ```

### 3d. Pagination dots

| Property | Value |
|---|---|
| Dot size | 8×8 |
| Dot radius | 4 |
| Dot spacing | `marginHorizontal: 8` |

- Active dot = `black` (`#0A0A0A`); inactive = `border` (`#E5E7EB`).

### 3e. Spacing, radius scales — unchanged

No changes to `theme.spacing` or `theme.radius` values.

**Spacing:** `xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 32 · `xl2` 48
**Radius:** `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `full` 999

### 3f. Large fixed sizes — unchanged

`theme.photoCircleSize` = 200 (Onboarding photo preview circle diameter). Plain treatment: white/`background` fill, `2px` ring in `textSecondary` (gray), black camera glyph centered inside.

### 3g. Eyebrow / kicker labels

Small uppercase tracked labels used above headlines and to label stat blocks: "STEP 1 OF 3", "MEMBER", "MEMBER #247", "ONLY 1,000 EVER.", "JOINED AUGUST 2026".

| Property | Value |
|---|---|
| Font | `fontMedium` (GeneralSans-Medium) |
| Size | `xs` (12) or `sm` (14) depending on hierarchy |
| Letter spacing | `1.5` |
| Case | UPPERCASE (apply via `textTransform: 'uppercase'`, don't hardcode caps in copy) |
| Color | `textSecondary` |

### 3h. Membership / Confirmation card

The bordered card shown on the Onboarding Confirmation screen (member number reveal) and reused for the Share Card.

- Card background: white.
- Border: `1px` `theme.colors.border`, plus simple corner detailing if needed — no color, no ornate SVG flourish.
- Top ornament: none required; if a wreath/mark exists it must be monochrome (`black`).
- Wordmark: Fraunces Bold, `xl3`, centered, `textPrimary`.
- Thin horizontal rule with a centered diamond (◆) glyph under the wordmark — `1px` line in `border`, diamond `textPrimary`, `6px`, centered gap in the line (see `RuleWithDiamond`).
- Member photo: circular, centered, `~120px` diameter, thin `border` ring.
- "MEMBER #247" eyebrow (`textSecondary`, tracked uppercase) → Name (Fraunces Bold, `xl2`) → "Permanent Member" (General Sans, `textSecondary`) → status message in serif italic → Instagram handle row (small black Instagram glyph + handle, General Sans) → "JOINED AUGUST 2026" eyebrow → "ONLY 1,000 EVER." eyebrow, tight vertical rhythm (`spacing.sm`–`spacing.md`).
- Below the card: primary black pill "Share Card" button, then `outline` pill "Save as Image" button, then centered caption ("Only 1,000 people will ever own one.") in `textSecondary`.

### 3i. Verification badge

Small circular badge, bottom-right corner of a member's photo thumbnail on the Member Wall grid and Club home "Newest Members" strip.

| Property | Value |
|---|---|
| Size | 24×24 |
| Background | white (`#FFFFFF`) |
| Icon | checkmark, `black` |
| Position | absolute, bottom-right of photo, small white ring/gap separating it from the photo edge |

### 3j. Filter chips

Horizontal scrollable row on Member Wall: All / Newest / Lowest Number / Highest Number / Favorites.

| State | Background | Text color | Border |
|---|---|---|---|
| Active | `black` (`#0A0A0A`) | white | none |
| Inactive | transparent / white | `textPrimary` | 1px `border` (`#E5E7EB`) |

- Pill-shaped (`radius.full`), height ~`36`–`40`, horizontal padding `spacing.md`.
- Only one chip active at a time (single-select).
- Font: `fontMedium`, `sm`.

### 3k. Bottom tab bar

Three tabs: Club (home icon), Members (people icon), Me (person icon).

| State | Icon/label color |
|---|---|
| Active | `black` |
| Inactive | `textSecondary` |

- Icons above labels, centered, standard RN bottom-tab layout.
- Background: white, `1px` top border in `theme.colors.border`.
- Labels: `fontMedium`, `xs`.
- Shared component: `src/components/BottomTabBar.tsx` — all three home tabs render it (`activeTab` + `onTabPress` props, handles its own safe-area bottom inset). Do not inline tab bar code into a screen; reuse the component.

### 3l. Progress bar

Used on Club/Home ("873 / 1,000 Members Claimed") — a horizontal bar showing claim progress toward the 1,000 cap.

| Property | Value |
|---|---|
| Track | `border` (`#E5E7EB`), full width, height ~6–8, `radius.full` |
| Fill | `black`, same height/radius, width = proportional |
| Label above | Fraunces SemiBold/Bold big number ("873") inline with General Sans "/ 1,000 Members Claimed" |
| Label below | General Sans, "127 Spots Remaining" — the number in `black`/Semibold, rest in `textSecondary` |

---

## 4. Screen-Type Classification

Every screen uses the same monochrome language (Section 2). No separate modes exist.

| Screen | Notes |
|---|---|
| Splash Screen | white bg, Fraunces Bold wordmark, gray tagline, 3 dots (active black / inactive `border`) |
| Sign In / Request Membership Screen | white bg, Fraunces wordmark (smaller, top), Fraunces Bold "Welcome." headline, gray subtitle, bordered/shadowed stats card (live claim + remaining counts), black native Apple button, lock trust row, "No subscriptions. No ads. Just membership." footer |
| Onboarding — Photo (Step 1 of 3) | white bg, Fraunces Bold headline, gray subtitle, gray-ring photo circle with black camera glyph, black "Choose Photo" button, gray "Skip for now" link, gray footer note |
| Onboarding — Message (Step 2 of 3) | white bg, bordered textarea, suggested-status chips |
| Onboarding — Instagram (Step 3 of 3) | white bg, bordered input with black icon prefix |
| Onboarding — Confirmation | white bg, monochrome membership card (3h) |
| Member Wall | filter chips (3j), verification badges (3i), bottom tab bar (3k) |
| Club / Home | stat card, progress bar (3l), Newest Members strip, bottom tab bar (3k) |
| Individual Member Page | build in the monochrome component language above |
| My Profile / Edit | same guidance |
| Share Sheet / Membership Card | reuses the same card component as Confirmation (3h) |
| Settings | *(not yet in reference set)* |

---

## 5. Dependencies & Setup

- Gradient: `react-native-linear-gradient` is installed but **not used** — v3 has no gradient screens. Do not reintroduce it.
- Fonts: registered via `react-native.config.js` → `./src/assets/fonts`. All Fraunces weights (incl. italic) and General Sans weights are already linked. No new font work required.
- No native dependencies are required for the monochrome patterns; any icons should be simple monochrome glyphs or bundled assets in `black`/`textSecondary`.

---

## 6. Key rules (quick answer)

- One palette: white background, near-black text/CTAs/active elements, neutral gray for secondary text and borders. **No color anywhere.**
- Prominent text (wordmarks, headlines, big stat numbers) = **Fraunces Bold**, `textPrimary`.
- Body copy and UI labels = **General Sans**, per the variant table (1c).
- Spacing/radius/fontSize scales are unchanged — always pull from `theme.tokens`.
- No gradients. No blue, no bronze, no warm tones — ever.

---

## 7. Deprecated tokens — do not use

All v2 and older tokens were removed from `src/theme/tokens.ts`:

- `theme.colors.warmGradient` (parchment gradient `#F7F0E8 → #EFE8DD → #D6C9B7`).
- `theme.colors.warmText` (`#1A1613`), `theme.colors.warmTextMuted` (`#7A6F63`).
- `theme.colors.accentBronze` (`#8C6640`), `theme.colors.accentBronzeDeep` (`#8C6330`).
- `theme.colors.borderBronze` (`#B9A488`), `theme.colors.borderBronzeLight` (`#D9C9AE`).
- `theme.colors.tabInactive` (`#9CA3AF`).
- `theme.colors.accentBlue` (`#0066FF`) — already removed in v2, still banned.
- Pre-v2 warm gradient stops (`#F7E3C1 → #F0C69A → #E2A278`, peach/gold).

Replacement mapping:
- Parchment gradient → plain `background` (`#FFFFFF`).
- `accentBronze` (icons, active dots, stat numbers, links, progress fill) → `black`.
- `warmText` → `textPrimary`; `warmTextMuted` → `textSecondary`.
- `borderBronze` / `borderBronzeLight` → `border` (`#E5E7EB`).
- `tabInactive` → `textSecondary`.

---

## Appendix — Fraunces cut rationale (unchanged)

Google Fonts only distributes Fraunces as a **variable** font; static TTFs were needed for native linking. Fraunces has multiple optical sizes (opsz axis): 9pt (body), 72pt (display), 144pt (poster). 72pt is the correct cut for our 36–48px headline range.

File provenance:
- `Fraunces-Regular.ttf`, `Fraunces-SemiBold.ttf`, `Fraunces-Bold.ttf` — official static 72pt instances from `undercasetype/Fraunces` at commit `d6d3857`, path `fonts/static/ttf/Fraunces72pt-{Regular,SemiBold,Bold}.ttf`.
- `Fraunces-Medium.ttf` — no official Medium static; generated via `fontTools.varLib.instancer` at `wght=500, opsz=72, SOFT=0, WONK=0`.
- `Fraunces-Italic.ttf` — official static 72pt italic instance, same foundry repo/commit, path `fonts/static/ttf/Fraunces72pt-Italic.ttf`. PostScript name rewritten to `Fraunces-Italic` to match the file-name convention used for the rest of the family.
- All PostScript names rewritten from the foundry's `Fraunces72pt-*` convention to match file names (`Fraunces-*`), so one `fontFamily` string resolves on both Android (file-name lookup) and iOS (PostScript-name lookup). The font **family name** remains `Fraunces 72pt`.