# BI Agent Unified Design System

## Overview
This document establishes the unified design system for the BI Agent application, ensuring a professional, consistent, and accessible user experience across all modules (DUFA, MIA, shared pages).

---

## 1. Design Principles
- **Consistency:** All UI elements use shared primitives and design tokens.
- **Accessibility:** Keyboard navigation, focus states, ARIA support, and color contrast are required.
- **Responsiveness:** Mobile-first, adaptive layouts for all screen sizes.
- **Micro-interactions:** Subtle transitions, hover/focus/active states, and feedback for all interactive elements.
- **Scalability:** Components are modular, composable, and easy to extend.

---

## 2. Core UI Primitives
- **Component Library:** [Shadcn/ui](https://ui.shadcn.com/) (built on Radix UI primitives)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) utility classes for layout, spacing, color, and typography
- **Icons:** [lucide-react](https://lucide.dev/icons/) for all iconography

### Key Primitives Used
- `Button`, `Card`, `CardHeader`, `CardContent`, `CardTitle`, `Badge`, `Tabs`, `Tooltip`, `Select`, `Progress`, `Collapsible`, `Alert`

---

## 3. Color, Spacing, and Typography
- **Color Palette:**
  - Use `bg-white`, `bg-viz-medium`, `bg-viz-dark`, `text-viz-accent`, and Tailwind's blue/green/purple accent classes.
  - Dark mode supported via `dark:` prefixed classes.
- **Spacing:**
  - Use Tailwind spacing scale (`p-2`, `px-6`, `gap-4`, etc.) for consistent padding, margin, and grid gaps.
- **Typography:**
  - Consistent font weights and sizes (`font-bold`, `text-lg`, `text-4xl`, etc.).
  - Headings use `font-bold` and color tokens for hierarchy.

---

## 4. Accessibility & Responsiveness
- **Keyboard navigation:** All interactive elements must be focusable and operable by keyboard.
- **Focus states:** Use Tailwind focus ring utilities and visible outlines.
- **ARIA:** Add ARIA attributes where necessary for screen readers.
- **Responsive layouts:** Use `grid`, `flex`, and breakpoint utilities (`md:`, `lg:`) for adaptive design.

---

## 5. Micro-interactions & Feedback
- **Transitions:** Use `transition-all`, `duration-200`/`300` for smooth state changes.
- **Hover/Active/Disabled:** All buttons, cards, and interactive elements have visible hover, active, and disabled styles.
- **Toasts & Alerts:** Use Shadcn/ui `use-toast` and `Alert` for user feedback.
- **Tooltips:** Use shared `Tooltip` primitive for icons and controls.

---

## 6. Example Usage
```
<Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-lg transition-all duration-300">
  <CardHeader>
    <CardTitle className="text-lg font-bold text-viz-dark dark:text-white flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-viz-accent" />
      Example Card
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline" className="hover:text-viz-accent focus:ring-2">Action</Button>
  </CardContent>
</Card>
```

---

## 7. File and Component Organization
- Place all shared primitives in `src/components/ui/`
- Place module-specific UI in `src/modules/{MODULE}/components/`
- Use `src/pages/` for route-level containers only

---

## 8. Contributing & Extending
- Always use existing primitives before creating new ones
- Extend via composition, not duplication
- Document new primitives in this file and provide usage examples

---

## 9. References
- [Shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)

---

**For questions or suggestions, contact the core engineering team.**
