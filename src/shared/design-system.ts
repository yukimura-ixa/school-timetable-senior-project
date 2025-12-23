/**
 * Phrasongsa Design System
 *
 * A premium, modern design system inspired by the Program Management page.
 * Features glassmorphism, subtle animations, and vibrant gradients.
 *
 * UNIFIED SOURCE OF TRUTH:
 * Colors are defined here AND in globals.css as CSS variables (--color-ds-*).
 * This allows both MUI (via this file) and Tailwind (via globals.css) to use
 * the same values. Always update both files when changing colors.
 *
 * @usage
 * import { colors, gradients, animations, cardStyles } from '@/shared/design-system';
 */

import { alpha, keyframes, Theme, SxProps } from "@mui/material";

// ============================================================================
// CSS VARIABLE GETTERS (for runtime access to Tailwind-defined tokens)
// ============================================================================

/**
 * Get a CSS variable value at runtime.
 * Useful for bridging Tailwind CSS variables to MUI theming.
 */
export const getCssVar = (name: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
};

// ============================================================================
// COLOR PALETTE (Synced with globals.css --color-ds-* tokens)
// ============================================================================

/**
 * Primary color palette - vibrant, modern colors.
 * These values MUST match the CSS variables in globals.css.
 */
export const colors = {
  // Primary
  blue: {
    main: "#3b82f6", // --color-ds-blue
    dark: "#1d4ed8", // --color-ds-blue-dark
    light: "#60a5fa", // --color-ds-blue-light
  },
  // Success
  emerald: {
    main: "#10b981", // --color-ds-emerald
    dark: "#059669", // --color-ds-emerald-dark
    light: "#34d399", // --color-ds-emerald-light
  },
  // Accent
  violet: {
    main: "#8b5cf6", // --color-ds-violet
    dark: "#7c3aed", // --color-ds-violet-dark
    light: "#a78bfa", // --color-ds-violet-light
  },
  // Warning
  amber: {
    main: "#f59e0b", // --color-ds-amber
    dark: "#d97706", // --color-ds-amber-dark
    light: "#fbbf24", // --color-ds-amber-light
  },
  // Error
  red: {
    main: "#ef4444", // --color-ds-red
    dark: "#dc2626", // --color-ds-red-dark
    light: "#f87171", // --color-ds-red-light
  },
  // Info
  cyan: {
    main: "#06b6d4", // --color-ds-cyan
    dark: "#0891b2", // --color-ds-cyan-dark
    light: "#22d3ee", // --color-ds-cyan-light
  },
  // Neutral (Synced with --color-ds-slate-*)
  slate: {
    50: "#f8fafc", // --color-ds-slate-50
    100: "#f1f5f9", // --color-ds-slate-100
    200: "#e2e8f0", // --color-ds-slate-200
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569", // --color-ds-slate-600
    700: "#334155", // --color-ds-slate-700
    800: "#1e293b", // --color-ds-slate-800
    900: "#0f172a", // --color-ds-slate-900
  },
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

/**
 * Gradient presets for backgrounds and accent elements
 */
export const gradients = {
  // Primary gradients (for icons, badges, CTAs)
  blue: `linear-gradient(135deg, ${colors.blue.main} 0%, ${colors.blue.dark} 100%)`,
  emerald: `linear-gradient(135deg, ${colors.emerald.main} 0%, ${colors.emerald.dark} 100%)`,
  violet: `linear-gradient(135deg, ${colors.violet.main} 0%, ${colors.violet.dark} 100%)`,
  amber: `linear-gradient(135deg, ${colors.amber.main} 0%, ${colors.amber.dark} 100%)`,
  red: `linear-gradient(135deg, ${colors.red.main} 0%, ${colors.red.dark} 100%)`,
  cyan: `linear-gradient(135deg, ${colors.cyan.main} 0%, ${colors.cyan.dark} 100%)`,

  // Mixed gradients (for decorative elements)
  blueViolet: `linear-gradient(135deg, ${colors.blue.main} 0%, ${colors.violet.main} 100%)`,
  emeraldCyan: `linear-gradient(135deg, ${colors.emerald.main} 0%, ${colors.cyan.main} 100%)`,
  pinkOrange: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`,
  blueGreen: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`,
  greenCyan: `linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)`,
  pinkYellow: `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`,
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

/**
 * Reusable keyframe animations
 */
export const keyframeAnimations = {
  // Floating effect for icons
  float: keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  `,

  // Subtle pulsing for background elements (reduced from 0.8 to 0.5 max)
  pulse: keyframes`
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.5; }
  `,

  // Shimmer effect for loading skeletons
  shimmer: keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  `,

  // Fade in animation
  fadeIn: keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  `,

  // Scale in animation
  scaleIn: keyframes`
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  `,
} as const;

/**
 * Animation presets for common use cases
 */
export const animations = {
  float: `${keyframeAnimations.float} 2s ease-in-out infinite`,
  pulse: `${keyframeAnimations.pulse} 4s ease-in-out infinite`,
  shimmer: `${keyframeAnimations.shimmer} 1.5s infinite`,
  fadeIn: `${keyframeAnimations.fadeIn} 0.3s ease-out`,
  scaleIn: `${keyframeAnimations.scaleIn} 0.3s ease-out`,
} as const;

// ============================================================================
// GLASSMORPHISM STYLES
// ============================================================================

/**
 * Glassmorphism card background
 */
export function getGlassBackground(
  color: string,
  theme: Theme,
  intensity: "subtle" | "medium" | "strong" = "medium",
): string {
  const alphaLight =
    intensity === "subtle" ? 0.04 : intensity === "medium" ? 0.08 : 0.12;
  const alphaDark =
    intensity === "subtle" ? 0.08 : intensity === "medium" ? 0.15 : 0.2;

  return theme.palette.mode === "dark"
    ? `linear-gradient(135deg, ${alpha(color, alphaDark)} 0%, ${alpha(color, alphaDark * 0.3)} 100%)`
    : `linear-gradient(135deg, ${alpha(color, alphaLight)} 0%, ${alpha("#fff", 0.9)} 100%)`;
}

/**
 * Standard glass card styles
 */
export function glassCardSx(
  color: string,
  options: {
    hoverable?: boolean;
    glowIntensity?: "none" | "subtle" | "medium";
  } = {},
): SxProps<Theme> {
  const { hoverable = true, glowIntensity = "subtle" } = options;

  // Reduced glow values
  const glowOpacity =
    glowIntensity === "none" ? 0 : glowIntensity === "subtle" ? 0.1 : 0.15;
  const hoverGlowOpacity =
    glowIntensity === "none" ? 0 : glowIntensity === "subtle" ? 0.15 : 0.25;

  return {
    position: "relative",
    overflow: "hidden",
    background: (theme) => getGlassBackground(color, theme),
    backdropFilter: "blur(10px)",
    border: "1px solid",
    borderColor: alpha(color, 0.2),
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ...(hoverable && {
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-4px) scale(1.01)",
        boxShadow: `0 16px 32px ${alpha(color, hoverGlowOpacity)}`,
        borderColor: alpha(color, 0.35),
        "& .card-icon": {
          animation: animations.float,
        },
        "& .card-arrow": {
          transform: "translateX(4px)",
        },
        "& .card-glow": {
          opacity: glowOpacity * 1.5,
        },
      },
    }),
  };
}

// ============================================================================
// ICON BOX STYLES
// ============================================================================

/**
 * Gradient icon box (for card headers, page titles)
 */
export function iconBoxSx(
  gradient: string,
  color: string,
  size: "small" | "medium" | "large" = "medium",
): SxProps<Theme> {
  const dimensions = size === "small" ? 40 : size === "medium" ? 48 : 56;
  const borderRadius = size === "small" ? 2 : size === "medium" ? 2.5 : 3;

  // Reduced shadow opacity from 0.35 to 0.2
  return {
    width: dimensions,
    height: dimensions,
    borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: gradient,
    boxShadow: `0 6px 18px ${alpha(color, 0.2)}`,
    transition: "all 0.3s ease",
  };
}

// ============================================================================
// GLOW EFFECT STYLES
// ============================================================================

/**
 * Background glow effect (decorative circles) - REDUCED INTENSITY
 */
export function glowEffectSx(
  gradient: string,
  position: "topRight" | "bottomLeft" | "center" = "topRight",
  size: number = 150,
): SxProps<Theme> {
  const positionStyles = {
    topRight: { top: -size / 3, right: -size / 3 },
    bottomLeft: { bottom: -size / 3, left: -size / 3 },
    center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  };

  // Reduced opacity from 0.15 to 0.08
  return {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: gradient,
    opacity: 0.08,
    filter: "blur(40px)",
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
    ...positionStyles[position],
  };
}

// ============================================================================
// STATS BADGE STYLES
// ============================================================================

/**
 * Stat badge/chip styles (for counters, indicators)
 */
export function statBadgeSx(color: string): SxProps<Theme> {
  return {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.5,
    py: 0.5,
    borderRadius: 2,
    bgcolor: alpha(color, 0.08),
    border: `1px solid ${alpha(color, 0.15)}`,
  };
}

// ============================================================================
// PAGE HEADER STYLES
// ============================================================================

/**
 * Page header paper styles with decorative background
 */
export const pageHeaderSx: SxProps<Theme> = {
  p: 4,
  mb: 4,
  border: "1px solid",
  borderColor: alpha(colors.blue.main, 0.1),
  borderRadius: 4,
  position: "relative",
  overflow: "hidden",
  background: (theme) =>
    theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${alpha(colors.slate[800], 0.9)} 0%, ${alpha(colors.slate[900], 0.95)} 100%)`
      : `linear-gradient(135deg, ${colors.slate[50]} 0%, ${colors.slate[100]} 100%)`,
};

// ============================================================================
// SKELETON STYLES
// ============================================================================

/**
 * Shimmer skeleton background
 */
export const shimmerSkeletonSx: SxProps<Theme> = {
  background: `linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)`,
  backgroundSize: "200% 100%",
  animation: animations.shimmer,
};

// ============================================================================
// STAT CARD STYLES
// ============================================================================

/**
 * Colorful stat card (for dashboard metrics)
 */
export function statCardSx(gradient: string): SxProps<Theme> {
  return {
    p: 2,
    background: gradient,
    borderRadius: 2,
    color: "white",
  };
}

// ============================================================================
// CHIP/TAG STYLES
// ============================================================================

/**
 * Colored chip styles
 */
export function coloredChipSx(color: string): SxProps<Theme> {
  return {
    bgcolor: alpha(color, 0.12),
    color: color,
    fontWeight: 700,
    border: `1px solid ${alpha(color, 0.2)}`,
  };
}

// ============================================================================
// HOVER EFFECT PRESETS
// ============================================================================

/**
 * Smooth hover lift effect
 */
export const hoverLiftSx: SxProps<Theme> = {
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
  },
};

/**
 * Scale hover effect
 */
export const hoverScaleSx: SxProps<Theme> = {
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
  },
};

// ============================================================================
// TYPOGRAPHY STYLES
// ============================================================================

/**
 * Gradient text styles
 */
export const gradientTextSx: SxProps<Theme> = {
  background: `linear-gradient(135deg, ${colors.slate[800]} 0%, ${colors.slate[600]} 100%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

// ============================================================================
// SPACING & LAYOUT PRESETS
// ============================================================================

export const spacing = {
  cardPadding: 3,
  sectionGap: 4,
  elementGap: 2,
  headerMargin: 4,
} as const;

export const borderRadius = {
  small: 1,
  medium: 2,
  large: 3,
  xlarge: 4,
} as const;
