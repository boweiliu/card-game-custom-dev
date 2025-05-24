// Color utilities for TypeScript
// Colors are defined in colors.less as CSS custom properties and utility classes
// Use CSS classes (.textError, .bgPrimary, etc.) instead of these utilities

// If you need direct access to CSS custom property values in rare cases:
export function getCSSVar(varName: string): string {
  if (typeof document === 'undefined') {
    // Fallback for SSR or Node.js environments
    return '';
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

// CSS custom property names (for rare cases where you need the variable name)
export const cssVars = {
  primaryBlue: '--primary-blue',
  textError: '--text-error',
  textPrimary: '--text-primary',
  // Add more as needed
} as const;
