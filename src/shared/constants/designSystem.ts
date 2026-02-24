/**
 * VIZ Platform Design System
 * Modern SaaS UI/UX Constants
 */

export const DESIGN_TOKENS = {
  // Spacing Scale (Tailwind-compatible)
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Typography Scale
  typography: {
    hero: 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight',
    h1: 'text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-semibold',
    body: 'text-base leading-relaxed',
    bodyLarge: 'text-lg leading-relaxed',
    bodySmall: 'text-sm leading-relaxed',
    caption: 'text-xs uppercase tracking-wider font-semibold',
  },

  // Border Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },

  // Animations
  animations: {
    fadeIn: 'animate-in fade-in duration-500',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
    slideDown: 'animate-in slide-in-from-top-4 duration-500',
    scaleIn: 'animate-in zoom-in-95 duration-300',
  },

  // Gradients
  gradients: {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    secondary: 'bg-gradient-to-r from-purple-500 to-violet-600',
    accent: 'bg-gradient-to-r from-viz-accent to-blue-600',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600',
    warning: 'bg-gradient-to-r from-orange-500 to-red-600',
    dark: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    light: 'bg-gradient-to-br from-slate-50 to-slate-100',
  },
};

export const COMPONENT_STYLES = {
  // Card Variants
  card: {
    base: 'bg-white/90 dark:bg-viz-medium/80 backdrop-blur-sm border border-slate-200/50 dark:border-viz-light/20 rounded-2xl shadow-sm',
    elevated: 'bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/30 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300',
    glass: 'bg-white/60 dark:bg-viz-medium/60 backdrop-blur-xl border border-white/20 dark:border-viz-light/10 rounded-2xl shadow-lg',
  },

  // Button Variants
  button: {
    primary: 'px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
    secondary: 'px-6 py-3 bg-white dark:bg-viz-medium text-slate-700 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-viz-light/20 hover:border-blue-500 transition-all duration-200',
    ghost: 'px-6 py-3 text-slate-700 dark:text-white font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-viz-light/10 transition-all duration-200',
  },

  // Input Variants
  input: {
    base: 'w-full px-4 py-3 bg-white dark:bg-viz-dark border border-slate-200 dark:border-viz-light/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  },

  // Badge Variants
  badge: {
    primary: 'px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full',
    success: 'px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full',
    warning: 'px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full',
    premium: 'px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-semibold rounded-full',
  },
};

export const LAYOUT_CONSTANTS = {
  maxWidth: {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  },
  
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
};
