# Implementation Plan: SignSync Frontend Redesign

## Overview

Elevate the SignSync frontend from a functional prototype to a polished, hackathon-ready application by applying a new green/beige color palette, glassmorphism, Framer Motion animations, improved typography/spacing, new UI primitives, and a fully responsive layout. All existing routes, business logic, and backend files remain untouched — only the visual layer improves.

## Tasks

- [ ] 1. Update design token system
  - [ ] 1.1 Update `tailwind.config.js` with new color tokens
    - Replace `signal-*` (blues) with forest green shades: `#2D6A4F` (500), `#40916C` (600), `#52B788` (400), `#74C69D` (300), `#95D5B2` (200), `#B7E4C7` (100), `#D8F3DC` (50)
    - Replace `paper: "#F7F9FC"` with warm beige tokens: `paper: "#FAF7F2"`, add `beige-50: "#FAF7F2"`, `beige-100: "#F5EFE6"`
    - Replace `ink-900: "#0B1220"` with warm charcoal: `#1C1C1C`; update remaining `ink-*` shades to neutral dark tones
    - Add `glass` and `glass-border` color tokens (`rgba(255,255,255,0.08)`, `rgba(255,255,255,0.15)`)
    - Add `shadow-glass`, `shadow-elevated`, `shadow-glow-mint`, `shadow-glow-signal` named box-shadow tokens
    - Keep `coral-*` and `mint-*` tokens unchanged
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 1.2 Update `src/index.css` base styles
    - Update `body` base style to use new `bg-paper` (beige) and `text-ink-800` (warm charcoal)
    - Update `::selection` to use new `signal-200` (light green tint)
    - Update `:focus-visible` outline color to new `signal-500` (forest green)
    - Ensure `@media (prefers-reduced-motion: reduce)` rule remains intact and covers all animations
    - _Requirements: 1.4, 25.1, 25.2_

- [ ] 2. Update shared UI primitives
  - [ ] 2.1 Update `src/components/ui/Logo.tsx`
    - Keep existing shape/SVG structure
    - Update fill/stroke colors to use new `signal-*` green tokens instead of blue
    - _Requirements: 1.4_

  - [ ] 2.2 Create `src/components/ui/StatusBadge.tsx`
    - Implement `StatusBadgeProps`: `status: 'live' | 'idle' | 'error' | 'warning'`, `label: string`, `pulse?: boolean`
    - Apply distinct color classes: mint-400 for `live`, ink-400 for `idle`, coral-500 for `error`, yellow for `warning`
    - WHEN `pulse` is true, render an animated pulsing dot using CSS `animate-ping`
    - Render `label` as visible text with `aria-label` for screen readers
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 2.3 Create `src/components/ui/LoadingSpinner.tsx`
    - Implement `LoadingSpinnerProps`: `size?: 'sm' | 'md' | 'lg'`, `color?: 'primary' | 'white' | 'muted'`, `label?: string`
    - Apply dimension classes per size: `sm` = `w-4 h-4`, `md` = `w-6 h-6`, `lg` = `w-8 h-8`
    - Apply color classes per color prop: `primary` = `text-signal-500`, `white` = `text-white`, `muted` = `text-ink-400`
    - Set `aria-label` from `label` prop; default to `"Loading"` when not provided
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 2.4 Create `src/components/ui/EmptyState.tsx`
    - Implement `EmptyStateProps`: `icon?: ReactNode`, `title: string`, `description?: string`, `action?: ReactNode`
    - Render `title` as a visible `<p>` or `<h3>` heading element
    - Conditionally render `icon` above title, `description` below title, and `action` below description
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 2.5 Create `src/components/ui/SectionTitle.tsx`
    - Implement `SectionTitleProps`: `badge?: string`, `badgeTone?: BadgeTone`, `heading: string`, `subtext?: string`, `align?: 'left' | 'center'`
    - Render `heading` as `<h2>` with `font-display` class
    - Conditionally render `Badge` above heading when `badge` prop is provided; pass `badgeTone` to it
    - Conditionally render `subtext` as `<p>` below heading
    - Apply `text-left` or `text-center` based on `align` prop
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 2.6 Create `src/components/ui/GlassCard.tsx`
    - Implement `GlassCardProps`: `blur?: 'sm' | 'md' | 'lg'`, `border?: boolean`, `padding?: 'sm' | 'md' | 'lg'`, `children: ReactNode`, `className?: string`
    - Apply `backdrop-blur-sm/md/lg` per `blur` prop
    - Apply `border border-white/[0.15]` when `border` is true
    - Apply `p-4`, `p-6`, or `p-8` per `padding` prop
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 2.7 Update `src/components/ui/Button.tsx`
    - Add `'icon'` to `variant` prop union; map all five variants to distinct non-empty Tailwind class strings using new green `signal-*` tokens
    - Add `glow?: boolean` prop: when true on `primary` variant, apply `shadow-glow-signal`
    - Add `leftIcon?: ReactNode` and `rightIcon?: ReactNode` props
    - Wrap root element with `motion.button`; apply `whileHover: { scale: 1.02 }` and `whileTap: { scale: 0.97 }` with spring transition
    - WHEN `isLoading` is true, render `LoadingSpinner` inside button, set `disabled`, and keep label text for screen readers
    - Forward all `aria-*`, `onKeyDown`, and `tabIndex` props to `motion.button`
    - Fall back to `primary` variant when an unknown variant string is passed (no throw)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 2.8 Update `src/components/ui/Card.tsx`
    - Add `variant` prop: `'default' | 'glass' | 'elevated' | 'outlined'`; apply distinct non-empty class strings per variant using new tokens
    - WHEN `glass` variant: apply `backdrop-blur bg-white/[0.08] border border-white/[0.15]`
    - Add `interactive?: boolean` prop: when true, wrap with `motion.div` and apply `whileHover: { y: -4, boxShadow: ... }`
    - Add `as?: 'div' | 'article' | 'section'` prop and render specified HTML element
    - Fall back to `default` variant for unknown variant values (no throw)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 2.9 Update `src/components/ui/Input.tsx`
    - Add `floatingLabel?: boolean` prop; WHEN true and field has value or is focused, animate label upward using Framer Motion
    - Add `icon?: ReactNode` prop; render on left side with `pl-10` applied to `<input>` to prevent text overlap
    - Add `hint?: string` prop; render below field when no error is present
    - WHEN `error` is non-empty string: display error below field, set `aria-invalid="true"` on `<input>`, apply `border-coral-500`
    - WHEN `error` clears (non-empty → undefined): hide error message, restore default border
    - WHEN error present, trigger `shakeVariants` sequence (`x: [0, 8, -8, 6, -6, 3, -3, 0]`) over 500ms
    - Forward `aria-describedby` to reference active error or hint element ID
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 2.10 Update `src/components/ui/Badge.tsx`
    - Update color classes to use new `signal-*` (green) tokens instead of blue
    - Ensure all existing tone variants remain functional; add any missing tones needed by `SectionTitle`
    - _Requirements: 1.4, 9.5_

  - [ ] 2.11 Create `src/components/ui/Modal.tsx`
    - Implement `ModalProps`: `isOpen: boolean`, `onClose: () => void`, `title?: string`, `size?: 'sm' | 'md' | 'lg'`, `children: ReactNode`
    - WHEN `isOpen` is true, trap keyboard focus within modal boundary using a focus trap utility (Tab/Shift+Tab cycle within)
    - WHEN `isOpen` transitions to false, restore focus to the triggering element
    - Call `onClose` on Escape key press and backdrop click
    - Wrap modal content in `AnimatePresence` with opacity 0→1 and scale 0.96→1 entrance; opacity 1→0 exit
    - Apply `backdrop-blur` to the overlay
    - WHEN `title` provided, render in header and set `aria-labelledby` on modal container
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 3. Checkpoint — UI Primitives complete
  - Ensure all new and updated components in `src/components/ui/` compile without TypeScript errors. Ask the user if questions arise.

- [ ] 4. Update layout components
  - [ ] 4.1 Update `src/components/layout/Navbar.tsx`
    - WHEN scroll position is 0, render transparent background
    - WHEN scroll position exceeds 12px, transition to `bg-white/90 backdrop-blur-md border-b border-ink-900/5`
    - Animate transition with `transition-all duration-300` CSS class
    - WHEN mobile menu is open, animate panel using `AnimatePresence` with height 0→auto and opacity 0→1
    - Render full nav links on `lg+`; collapse into mobile menu below `lg`
    - Update active link and button color classes to new `signal-*` green tokens
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

  - [ ] 4.2 Update `src/components/layout/Footer.tsx`
    - Update all color class references from `signal-*` blue to `signal-*` green tokens
    - Update `ink-*` references to new warm charcoal tokens
    - Update `paper` background to new beige token
    - Improve layout spacing and typography to match design system
    - _Requirements: 1.4_

- [ ] 5. Update auth components
  - [ ] 5.1 Update `src/components/auth/AuthLayout.tsx`
    - Render two-panel layout on `md+`: white form panel left, dark glass panel right
    - Right panel: apply `backdrop-blur`, radial gradient overlays, checkmark feature list
    - Left panel: use `from-white to-paper` subtle gradient background with generous padding
    - Use floating label `Input` components for all form fields
    - WHEN a form field has a validation error, trigger `shakeVariants` Framer Motion animation on that field
    - WHEN Register page password strength indicator is present, animate strength bar segments with color transitions on keystroke
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

- [ ] 6. Update landing page sections
  - [ ] 6.1 Update `src/components/landing/Hero.tsx`
    - Apply deep gradient background `from-ink-900 via-signal-900 to-ink-900` with two radial gradient overlay orbs and grid pattern overlay
    - Render headline at `text-4xl` mobile / `text-6xl lg+` using `font-display` Sora
    - Render stat row with three stats (conversations translated, recognition accuracy, sign languages supported) and count-up animation on mount
    - Render floating demo card on right column using `GlassCard` with hand landmark SVG and caption pills, using `animate-floaty`
    - Animate left column: `opacity 0→1, y: 24→0`; right column: `opacity 0→1, scale: 0.94→1` using Framer Motion on mount
    - Render two CTA buttons: primary ("Start free") and outline ("Watch demo")
    - Add SOS emergency button in the hero section — visually prominent, coral-colored, with an appropriate icon (e.g., alert/phone icon from lucide-react)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [ ] 6.2 Update `src/components/landing/Features.tsx`
    - Render cards in responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
    - Use `SectionTitle` component for section header (centered)
    - Use `Card variant="elevated"` for each feature with a gradient icon container unique to each feature (using new green tones)
    - Apply `interactive` card prop; stagger `whileInView` entrance with 80ms between cards, `viewport={{ once: true }}`
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 24.1_

  - [ ] 6.3 Update `src/components/landing/HowItWorks.tsx`
    - Render step numbers as gradient-filled circles `from-signal-500 to-signal-600` with glow shadow
    - Render dashed connector line between steps on `lg+` viewports
    - Animate step cards with `whileInView` entrance, `viewport={{ once: true }}`
    - Responsive layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
    - Use `SectionTitle` for section header
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 24.1_

  - [ ] 6.4 Update `src/components/landing/About.tsx`
    - Render two-column layout on `lg+` with staggered `whileInView` entrance for both columns, `viewport={{ once: true }}`
    - Render stat numbers with gradient text using Sora `text-3xl+`
    - Update all color references to new green/beige design tokens
    - Use `SectionTitle` for section header
    - _Requirements: 21.1, 21.2, 24.1_

  - [ ] 6.5 Update `src/components/landing/CTA.tsx`
    - Apply deep gradient background `from-signal-700 via-signal-800 to-ink-900` with mesh overlay
    - Animate with `whileInView` fade-in entrance, `viewport={{ once: true }}`
    - Update button colors to new green `signal-*` tokens
    - _Requirements: 21.3, 21.4, 24.1_

- [ ] 7. Checkpoint — Landing page and auth complete
  - Ensure all landing sections and auth layout compile and render correctly. Ask the user if questions arise.

- [ ] 8. Update dashboard components
  - [ ] 8.1 Update `src/components/dashboard/Sidebar.tsx`
    - Apply `bg-ink-900` base with `border-r border-white/5`
    - Active nav item: `border-l-2 border-signal-400 bg-white/[0.08] text-white`
    - Hovered inactive item: `bg-white/5` transition
    - Render user profile chip pinned to bottom: avatar initials, name, logout icon button
    - Below `lg`: animate as full-height drawer from left using `AnimatePresence` + `drawerVariants`; render semi-transparent backdrop; clicking backdrop calls `onClose`
    - Trap keyboard focus within drawer when mobile drawer is open
    - Stagger nav items on open using `containerVariants` / `itemVariants`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 26.3, 27.4_

  - [ ] 8.2 Update `src/components/dashboard/TopNavbar.tsx`
    - Apply `bg-ink-900/70 backdrop-blur-xl border-b border-white/5` glassmorphism classes
    - Display time-aware greeting using authenticated user's name
    - Animate search input width expansion via Framer Motion `layout` animation on focus
    - Render notification bell with colored dot indicator
    - Render user avatar as gradient initials circle; open user menu dropdown on click
    - Animate dropdown with `AnimatePresence` scale + opacity entrance/exit
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 8.3 Update `src/components/dashboard/StatusCard.tsx`
    - Render gradient icon container using `signal-500 to signal-700` gradient (green shades)
    - Animate metric value with count-up effect on mount using Framer Motion `useMotionValue`
    - Apply `interactive` Card prop for hover lift + shadow transition
    - Handle any `StatusMetric.value` string of length 1–20 without overflow or exception
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 8.4 Update `src/components/dashboard/CameraPanel.tsx`
    - WHEN `SessionStatus` is `'idle'`: show camera-off icon centered with subtle gradient background
    - WHEN `SessionStatus` is `'listening'` or `'translating'`: show pulsing mint ring and scanning line animation
    - Animate state transition using `AnimatePresence` (opacity 0→1) when switching from idle to active
    - Replace plain `Badge` with `StatusBadge`; set `status` prop based on `SessionStatus` with labels: `'Camera off'`, `'Watching for signs'`, `'Translating'`
    - Apply `whileTap: { scale: 0.96 }` to Start/Stop button
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ] 8.5 Update `src/components/dashboard/GestureOutputPanel.tsx`
    - Animate each gesture entry with staggered `opacity 0→1` and `x: 16→0` entrance, 80ms between items
    - Render confidence bar per `RecognizedGesture`: fill width = `confidence / 100 * 100%` of container; clip within bounds for any value in [0, 100]
    - WHEN `recognizedGestures` array is empty, render `EmptyState` with appropriate title and description
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 8.6 Update `src/components/dashboard/ActivityHistory.tsx`
    - Render each `ActivityEntry` as a timeline row with vertical connector line and type-specific icon node
    - Animate each row with `whileInView` slide-up entrance, `viewport={{ once: true }}`
    - Replace plain accuracy badge with ring/arc progress indicator; fill = `entry.accuracy / 100`; clip within bounds for any value in [0, 100]
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 24.1_

- [ ] 9. Checkpoint — Dashboard components complete
  - Ensure all dashboard components compile and connect correctly to existing data/context. Ask the user if questions arise.

- [ ] 10. Update pages and route transitions
  - [ ] 10.1 Update `src/pages/DashboardPage.tsx`
    - Animate Sidebar slide-in (`x: -20→0, opacity 0→1`, 400ms) and content area fade-in (opacity 0→1, 300ms, 100ms delay) on mount
    - Stagger StatusCards with 80ms delay between each
    - Fade-in CameraPanel (delay 400ms), GestureOutputPanel (delay 500ms), slide-up ActivityHistory (delay 600ms)
    - Ensure StatusCards grid uses `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`
    - Ensure primary grid uses `grid-cols-1 xl:grid-cols-[1.6fr_1fr]`
    - _Requirements: 26.2_

  - [ ] 10.2 Update `src/pages/LandingPage.tsx`
    - Compose all updated landing sections: Navbar, Hero, Features, HowItWorks, About, CTA, Footer in correct order
    - Ensure no horizontal overflow at any viewport in [320px, 1536px]
    - _Requirements: 26.1, 26.6_

  - [ ] 10.3 Update `src/App.tsx` with `AnimatePresence` page transitions
    - Wrap `<Routes>` in `AnimatePresence mode="wait"`
    - Create a `PageWrapper` motion component using `pageVariants`: initial `{ opacity: 0, y: 12 }`, animate `{ opacity: 1, y: 0, transition: { duration: 0.35 } }`, exit `{ opacity: 0, y: -8, transition: { duration: 0.2 } }`
    - Pass `location` from `useLocation()` as `key` to `AnimatePresence` so route changes are detected
    - Wrap each route's element in `PageWrapper`; verify each path still renders the same component as before
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 11. Final checkpoint — Full application review
  - Ensure all tests pass and the application compiles without TypeScript or lint errors. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design uses TypeScript/React — no language selection was needed
- All tasks reference specific requirements for traceability
- Checkpoints at tasks 3, 7, 9, and 11 ensure incremental validation
- The design document has a Correctness Properties section (Properties 1–10), but they define runtime behavioral contracts (variant exhaustiveness, a11y forwarding, reduced-motion compliance) rather than pure mathematical properties suitable for property-based testing with fast-check — unit tests are the appropriate vehicle here
- Color token changes: `signal-*` blue → forest green; `paper` → warm beige; `ink-*` → warm charcoal; keep `coral-*` and `mint-*`
- Do NOT touch any backend files or routing/auth business logic
- SOS emergency button is placed in the Hero section (task 6.1) per user instruction

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 2, "tasks": ["2.7", "2.8", "2.9", "2.10", "2.11"] },
    { "id": 3, "tasks": ["4.1", "4.2", "5.1"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 6, "tasks": ["10.1", "10.2"] },
    { "id": 7, "tasks": ["10.3"] }
  ]
}
```
