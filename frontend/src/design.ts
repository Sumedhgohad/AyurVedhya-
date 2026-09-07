/**
 * AYURVEDHYA DESIGN TOKENS — LIGHT THEME
 *
 * Single source of truth for color, radius, spacing and typography
 * used across the AyurVedhya CTMS platform.
 * Aligned with the Ministry of Ayush / AIIA institutional aesthetic.
 */

// ─── Brand & Accent ───────────────────────────────────────────────
export const PRIMARY        = '#1b6e4e';   // Refined Clinical Emerald
export const PRIMARY_FOCUS  = '#2d8a64';   // Focus ring accent
export const PRIMARY_ON_DARK = '#52B788';  // Bright leaf green on dark surfaces

// ─── Surfaces (Light Theme) ───────────────────────────────────────
export const CANVAS         = '#ffffff';   // Pure white content cards
export const PARCHMENT      = '#f8faf9';   // Clean, warm clinical background
export const PEARL          = '#f1f5f3';   // Light clinical tint for secondary surfaces
export const TILE_1         = '#173B2A';   // Forest deep tile
export const TILE_2         = '#1e4834';   // Lighter botanical tile
export const TILE_3         = '#122c20';   // Darker botanical tile
export const SURFACE_BLACK  = '#0b1c14';   // Institutional dark forest top bar

// ─── Text ─────────────────────────────────────────────────────────
export const INK            = '#0f1f16';   // Crisp deep forest ink — maximum readability
export const INK_80         = '#1e3025';   // High-contrast secondary body copy
export const INK_48         = '#475b4f';   // Crisp caption, helper and label text (AA compliant)
export const ON_DARK        = '#ffffff';   // Crisp pure white text on dark surfaces
export const MUTED_DARK     = '#b8ccc0';   // High-contrast secondary text on dark surfaces

// ─── Borders / Hairlines ──────────────────────────────────────────
export const HAIRLINE        = '#e2e8e4';               // 1px subtle card hairline
export const DIVIDER         = 'rgba(23, 59, 42, 0.08)'; // Soft divider
export const BORDER_LIGHT    = 'rgba(23, 59, 42, 0.08)'; // Card border on light bg
export const BORDER_DARK     = 'rgba(255,255,255,0.12)'; // Card border on dark bg
export const BORDER_DARK_THIN = 'rgba(255,255,255,0.08)';

// ─── Semantic ─────────────────────────────────────────────────────
export const SUCCESS        = '#15803d';   // Clinical green
export const WARNING        = '#b45309';   // Amber warning
export const DANGER         = '#dc2626';   // Adverse event danger
export const PURPLE         = '#7e22ce';   // Regulatory violet

// ─── Elevation ────────────────────────────────────────────────────
export const PRODUCT_SHADOW = '0 12px 36px rgba(23, 59, 42, 0.12)';
export const CARD_SHADOW    = '0 1px 3px rgba(0,0,0,0.03), 0 6px 18px rgba(23, 59, 42, 0.03)';

// ─── Border Radii ─────────────────────────────────────────────────
export const R_XS   = 6;     // Inline chip
export const R_SM   = 8;     // Utility buttons
export const R_MD   = 10;    // Input fields, data cells
export const R_LG   = 16;    // Main card radius
export const R_PILL = 9999;  // CTAs, nav pills, badges

// ─── Spacing (8px grid) ───────────────────────────────────────────
export const SP_XXS    = 4;
export const SP_XS     = 8;
export const SP_SM     = 12;
export const SP_MD     = 16;
export const SP_LG     = 24;
export const SP_XL     = 32;
export const SP_XXL    = 48;
export const SP_SECTION = 80;

// ─── Typography ───────────────────────────────────────────────────
export const FONT_STACK = "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif";
export const FONT_MONO  = "'SF Mono', 'ui-monospace', 'Menlo', monospace";

// Typography scale
export const TYPE = {
  hero:       { fontSize: 48, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' },
  displayLg:  { fontSize: 36, fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.015em' },
  displayMd:  { fontSize: 28, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
  tagline:    { fontSize: 20, fontWeight: 600, lineHeight: 1.3,  letterSpacing: '-0.005em' },
  body:       { fontSize: 15, fontWeight: 400, lineHeight: 1.5,  letterSpacing: '-0.01em' },
  bodyStrong: { fontSize: 15, fontWeight: 600, lineHeight: 1.4,  letterSpacing: '-0.01em' },
  caption:    { fontSize: 13, fontWeight: 400, lineHeight: 1.45, letterSpacing: '-0.005em' },
  captionStr: { fontSize: 13, fontWeight: 600, lineHeight: 1.4,  letterSpacing: '-0.005em' },
  btnLarge:   { fontSize: 16, fontWeight: 600, lineHeight: 1.0,  letterSpacing: '0' },
  btnUtility: { fontSize: 13, fontWeight: 500, lineHeight: 1.2,  letterSpacing: '-0.01em' },
  navLink:    { fontSize: 13, fontWeight: 500, lineHeight: 1.2,  letterSpacing: '-0.01em' },
  finePrint:  { fontSize: 12, fontWeight: 400, lineHeight: 1.3,  letterSpacing: '0' },
  micro:      { fontSize: 11, fontWeight: 400, lineHeight: 1.3,  letterSpacing: '0.01em' },
  label:      { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const },
} as const;

// ─── Shared inline styles ─────────────────────────────────────────
import React from 'react';

/** Primary CTA pill button */
export const btnPrimary = (disabled = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: PRIMARY, color: '#ffffff', border: 'none',
  borderRadius: R_PILL, padding: '10px 20px',
  fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  boxShadow: '0 2px 8px rgba(27,110,78,0.22)',
  transition: 'all 0.15s ease',
  fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
});

/** Secondary ghost pill button */
export const btnSecondary = (): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: '#ffffff', color: PRIMARY, border: `1px solid ${HAIRLINE}`,
  borderRadius: R_PILL, padding: '9px 18px',
  fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
  cursor: 'pointer', transition: 'all 0.15s ease',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
});

/** Utility compact button */
export const btnUtility = (bg = INK): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: bg, color: bg === INK ? '#ffffff' : INK,
  border: `1px solid ${bg === INK ? 'transparent' : HAIRLINE}`,
  borderRadius: R_SM, padding: '7px 14px',
  fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
  cursor: 'pointer', transition: 'all 0.15s ease',
  fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
});

/** Light surface card */
export const cardLight = (): React.CSSProperties => ({
  background: CANVAS,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: R_LG,
  padding: SP_LG,
  boxShadow: CARD_SHADOW,
});

/** Parchment surface card */
export const cardParchment = (): React.CSSProperties => ({
  background: PEARL,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: R_LG,
  padding: SP_LG,
});

/** Dark tile card */
export const cardDark = (): React.CSSProperties => ({
  background: TILE_1,
  border: `1px solid ${BORDER_DARK}`,
  borderRadius: R_LG,
  padding: SP_LG,
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
});

/** Input field */
export const inputField = (focused = false): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box' as const,
  background: '#ffffff',
  border: `1px solid ${focused ? PRIMARY_FOCUS : HAIRLINE}`,
  borderRadius: R_MD, padding: '10px 14px',
  color: INK, fontSize: 14, letterSpacing: '-0.01em',
  outline: 'none', fontFamily: FONT_STACK,
  boxShadow: focused ? '0 0 0 3px rgba(45,138,100,0.15)' : 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
});

/** Label overline */
export const labelOverline = (): React.CSSProperties => ({
  display: 'block',
  fontSize: 11, fontWeight: 600,
  color: INK_48, letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: 6,
});

/** Status badge — pill shaped */
export const badge = (
  color: string, bg: string, border: string
): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  padding: '3px 10px', borderRadius: R_PILL,
  color, background: bg, border: `1px solid ${border}`,
  whiteSpace: 'nowrap' as const,
  lineHeight: 1.3,
});

export const BADGE = {
  blue:   badge(PRIMARY,        'rgba(27,110,78,0.10)',  'rgba(27,110,78,0.25)'),
  green:  badge(SUCCESS,        'rgba(21,128,61,0.10)',  'rgba(21,128,61,0.25)'),
  red:    badge(DANGER,         'rgba(220,38,38,0.10)',  'rgba(220,38,38,0.25)'),
  amber:  badge(WARNING,        'rgba(180,83,9,0.10)',   'rgba(180,83,9,0.25)'),
  purple: badge(PURPLE,         'rgba(126,34,206,0.10)', 'rgba(126,34,206,0.25)'),
  ink:    badge(INK_80,         PEARL,                   HAIRLINE),
};
