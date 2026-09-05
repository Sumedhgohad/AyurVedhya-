/**
 * VERGE.MD DESIGN TOKENS — LIGHT THEME
 *
 * Single source of truth for every color, radius, spacing and typography
 * value used across the entire AyurVedhya CTMS frontend.
 *
 * Rules enforced here:
 *  - Body text is 17px / weight 400 — NOT 16px
 *  - Weight 500 is ABSENT — ladder is 300 / 400 / 600 / 700
 *  - Single accent: Action Blue #0066cc for every interactive element
 *  - No gradients on UI chrome; no shadows on cards or buttons
 *  - The ONLY allowed shadow: PRODUCT_SHADOW on hero elements
 *  - All buttons: transform: scale(0.95) on active/press
 */

// ─── Brand & Accent ───────────────────────────────────────────────
export const PRIMARY        = '#0066cc';   // Action Blue — every CTA, link, focus
export const PRIMARY_FOCUS  = '#0071e3';   // Focus ring
export const PRIMARY_ON_DARK = '#2997ff';  // Sky Blue — links on dark surfaces

// ─── Surfaces (Light Theme) ───────────────────────────────────────
export const CANVAS         = '#ffffff';   // Pure white content areas
export const PARCHMENT      = '#f5f5f7';   // Signature Apple off-white — page bg + alternating tiles
export const PEARL          = '#fafafc';   // Near-white for secondary button fill
export const TILE_1         = '#272729';   // Primary dark tile
export const TILE_2         = '#2a2a2c';   // Micro-step lighter dark tile
export const TILE_3         = '#252527';   // Micro-step darker dark tile
export const SURFACE_BLACK  = '#000000';   // Global nav only

// ─── Text ─────────────────────────────────────────────────────────
export const INK            = '#1d1d1f';   // Near-black — all headlines & body on light
export const INK_80         = '#333333';   // Body on pearl button surface
export const INK_48         = '#7a7a7a';   // Disabled / fine-print / label text
export const ON_DARK        = '#ffffff';   // All text on dark tiles
export const MUTED_DARK     = '#cccccc';   // Secondary text on dark tiles

// ─── Borders / Hairlines ──────────────────────────────────────────
export const HAIRLINE        = '#e0e0e0';               // 1px utility card border
export const DIVIDER         = 'rgba(0,0,0,0.08)';      // Soft divider on light surfaces
export const BORDER_LIGHT    = 'rgba(0,0,0,0.08)';      // Card border on light bg
export const BORDER_DARK     = 'rgba(255,255,255,0.08)'; // Card border on dark bg
export const BORDER_DARK_THIN = 'rgba(255,255,255,0.06)';

// ─── Semantic ─────────────────────────────────────────────────────
export const SUCCESS        = '#34c759';
export const WARNING        = '#ff9f0a';
export const DANGER         = '#ff453a';
export const PURPLE         = '#bf5af2';

// ─── Elevation ────────────────────────────────────────────────────
// The ONE allowed shadow — product photography only (never cards/buttons)
export const PRODUCT_SHADOW = 'rgba(0,0,0,0.22) 3px 5px 30px 0';
// Card hairline elevation
export const CARD_SHADOW    = '0 1px 3px rgba(0,0,0,0.06)';

// ─── Border Radii ─────────────────────────────────────────────────
export const R_XS   = 5;     // Inline chip (rare)
export const R_SM   = 8;     // Utility / dark buttons
export const R_MD   = 11;    // Input fields, pearl buttons, inner data boxes
export const R_LG   = 18;    // Store utility cards (main card radius)
export const R_PILL = 9999;  // Primary CTAs, nav pills, search, chips

// ─── Spacing (8px grid) ───────────────────────────────────────────
export const SP_XXS    = 4;
export const SP_XS     = 8;
export const SP_SM     = 12;
export const SP_MD     = 17;
export const SP_LG     = 24;
export const SP_XL     = 32;
export const SP_XXL    = 48;
export const SP_SECTION = 80;

// ─── Typography ───────────────────────────────────────────────────
export const FONT_STACK = "'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
export const FONT_MONO  = "'SF Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', monospace";

// Typography scale (size / weight / lineHeight / letterSpacing)
export const TYPE = {
  hero:       { fontSize: 56, fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' },
  displayLg:  { fontSize: 40, fontWeight: 600, lineHeight: 1.10, letterSpacing: '0' },
  displayMd:  { fontSize: 34, fontWeight: 600, lineHeight: 1.47, letterSpacing: '-0.374px' },
  tagline:    { fontSize: 21, fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px' },
  body:       { fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px' },
  bodyStrong: { fontSize: 17, fontWeight: 600, lineHeight: 1.24, letterSpacing: '-0.374px' },
  caption:    { fontSize: 14, fontWeight: 400, lineHeight: 1.43, letterSpacing: '-0.224px' },
  captionStr: { fontSize: 14, fontWeight: 600, lineHeight: 1.29, letterSpacing: '-0.224px' },
  btnLarge:   { fontSize: 18, fontWeight: 300, lineHeight: 1.0,  letterSpacing: '0' },
  btnUtility: { fontSize: 14, fontWeight: 400, lineHeight: 1.29, letterSpacing: '-0.224px' },
  navLink:    { fontSize: 12, fontWeight: 400, lineHeight: 1.0,  letterSpacing: '-0.12px' },
  finePrint:  { fontSize: 12, fontWeight: 400, lineHeight: 1.0,  letterSpacing: '-0.12px' },
  micro:      { fontSize: 10, fontWeight: 400, lineHeight: 1.3,  letterSpacing: '-0.08px' },
  label:      { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const },
} as const;

// ─── Shared inline styles ─────────────────────────────────────────
import React from 'react';

/** Primary blue pill CTA — the signature Action Blue capsule */
export const btnPrimary = (disabled = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: PRIMARY, color: '#ffffff', border: 'none',
  borderRadius: R_PILL, padding: '11px 22px',
  fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px', lineHeight: 1.47,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'transform 0.1s ease',
  fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
});

/** Secondary ghost pill — transparent with blue border */
export const btnSecondary = (): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: 'transparent', color: PRIMARY, border: `1px solid ${PRIMARY}`,
  borderRadius: R_PILL, padding: '10px 22px',
  fontSize: 17, fontWeight: 400, letterSpacing: '-0.374px',
  cursor: 'pointer', transition: 'transform 0.1s ease',
  fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
});

/** Utility compact button — dark bg, sm radius */
export const btnUtility = (bg = INK): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  background: bg, color: bg === INK ? '#ffffff' : INK,
  border: 'none', borderRadius: R_SM, padding: '8px 15px',
  fontSize: 14, fontWeight: 400, letterSpacing: '-0.224px',
  cursor: 'pointer', transition: 'transform 0.1s ease',
  fontFamily: FONT_STACK, whiteSpace: 'nowrap' as const,
});

/** Light surface utility card */
export const cardLight = (): React.CSSProperties => ({
  background: CANVAS,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: R_LG,
  padding: SP_LG,
});

/** Parchment surface card */
export const cardParchment = (): React.CSSProperties => ({
  background: PARCHMENT,
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
});

/** Input field */
export const inputField = (focused = false): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box' as const,
  background: PARCHMENT,
  border: `1px solid ${focused ? PRIMARY_FOCUS : HAIRLINE}`,
  borderRadius: R_MD, padding: '9px 14px',
  color: INK, fontSize: 14, letterSpacing: '-0.224px',
  outline: 'none', fontFamily: FONT_STACK,
  transition: 'border-color 0.15s ease',
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
  display: 'inline-flex', alignItems: 'center',
  fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  padding: '2px 10px', borderRadius: R_PILL,
  color, background: bg, border: `1px solid ${border}`,
  whiteSpace: 'nowrap' as const,
});

export const BADGE = {
  blue:   badge(PRIMARY_ON_DARK, 'rgba(0,102,204,0.10)', 'rgba(0,102,204,0.25)'),
  green:  badge(SUCCESS,         'rgba(52,199,89,0.10)', 'rgba(52,199,89,0.28)'),
  red:    badge(DANGER,          'rgba(255,69,58,0.10)', 'rgba(255,69,58,0.28)'),
  amber:  badge(WARNING,         'rgba(255,159,10,0.10)','rgba(255,159,10,0.28)'),
  purple: badge(PURPLE,          'rgba(191,90,242,0.10)','rgba(191,90,242,0.28)'),
  ink:    badge(INK_80,          PARCHMENT,               HAIRLINE),
};
