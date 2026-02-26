/**
 * FleetCue Design System v4 – Day / Night aware
 * Two complete palettes: light (day) and dark (night).
 * Import `useAppTheme` anywhere to get the active palette.
 */

import { Platform } from 'react-native';

// ─── DARK palette (original deep-space look) ─────────────────────────────────
export const darkColors = {
  // Brand
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  primaryGradient: ['#0F172A', '#1E1B4B', '#4F46E5'],

  // Surfaces
  background: 'transparent',
  backgroundSolid: '#0F172A',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceElevated: 'rgba(255, 255, 255, 0.13)',
  border: 'rgba(255, 255, 255, 0.18)',
  borderLight: 'rgba(255, 255, 255, 0.06)',

  // Text
  white: '#FFFFFF',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textPlaceholder: '#64748B',

  // Status
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',

  statusPending: '#F59E0B',
  statusInProgress: '#3B82F6',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',

  // Misc
  black: '#000000',
  transparent: 'transparent',

  // Nav / tab
  tabBar: 'rgba(15, 23, 42, 0.95)',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  tabActive: '#818CF8',
  tabInactive: '#475569',

  // Input
  inputBg: 'rgba(255, 255, 255, 0.06)',
  inputBorder: 'rgba(255, 255, 255, 0.18)',

  // Card
  cardBg: 'rgba(255, 255, 255, 0.08)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',

  isDark: true,
};

// ─── LIGHT palette (airy, truly distinct from dark mode) ────────────────────
export const lightColors = {
  // Brand
  primary:       '#4F46E5', // Matches dark mode primary for consistency
  primaryLight:  '#6366F1',
  primaryDark:   '#3730A3',
  primaryGradient: ['#F8FAFC', '#F1F5F9', '#E2E8F0'],

  // Surfaces — white cards on light gray background
  background:       'transparent',
  backgroundSolid:  '#F4F7FA', 
  surface:          '#FFFFFF', 
  surfaceElevated:  '#FFFFFF',
  border:           '#E2E8F0', 
  borderLight:      '#F1F5F9', 

  // Text — Very dark for readability
  white:           '#FFFFFF',
  text:            '#0F172A',   
  textSecondary:   '#334155',   
  textMuted:       '#64748B',   
  textPlaceholder: '#94A3B8',   

  // Status
  success:      '#059669',
  successLight: 'rgba(5, 150, 105, 0.12)',
  warning:      '#D97706',
  warningLight: 'rgba(217, 119, 6, 0.12)',
  error:        '#DC2626',
  errorLight:   'rgba(220, 38, 38, 0.12)',
  info:         '#2563EB',
  infoLight:    'rgba(37, 99, 235, 0.12)',

  statusPending:    '#D97706',
  statusInProgress: '#2563EB',
  statusCompleted:  '#059669',
  statusCancelled:  '#DC2626',

  // Misc
  black:       '#000000',
  transparent: 'transparent',

  // Nav / tab
  tabBar:       'rgba(255, 255, 255, 0.98)',
  tabBarBorder: '#E2E8F0',
  tabActive:    '#4F46E5',
  tabInactive:  '#94A3B8',

  // Input
  inputBg:     '#F8FAFC',
  inputBorder: '#CBD5E1',

  // Card
  cardBg:     '#FFFFFF',
  cardBorder: '#E2E8F0',

  isDark: false,
};

// Keep a single `colors` export so existing imports don't break (defaults dark)
export const colors = darkColors;

// ─── Spacing / Radius / Typography / Shadows (theme-invariant) ───────────────
export const spacing = {
  xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48,
};

export const radius = {
  xs: 8, sm: 12, md: 16, lg: 24, xl: 32, full: 9999,
};

export const typography = {
  xs: 12, sm: 14, base: 16, md: 18, lg: 20, xl: 24, xxl: 30, xxxl: 36,
  regular: '400', medium: '500', semibold: '600', bold: '800',
};

export const makeShadows = (c) => {
  const shadowColorObj = c.isDark ? c.black : '#64748B';
  return {
    none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
    sm: Platform.select({
      ios: { shadowColor: shadowColorObj, shadowOffset: { width: 0, height: 2 }, shadowOpacity: c.isDark ? 0.3 : 0.08, shadowRadius: 8 },
      android: { elevation: 2, shadowColor: shadowColorObj },
    }),
    md: Platform.select({
      ios: { shadowColor: shadowColorObj, shadowOffset: { width: 0, height: 6 }, shadowOpacity: c.isDark ? 0.4 : 0.08, shadowRadius: 16 },
      android: { elevation: 4, shadowColor: shadowColorObj },
    }),
    lg: Platform.select({
      ios: { shadowColor: shadowColorObj, shadowOffset: { width: 0, height: 12 }, shadowOpacity: c.isDark ? 0.5 : 0.12, shadowRadius: 24 },
      android: { elevation: 8, shadowColor: shadowColorObj },
    }),
    glow: Platform.select({
      ios: { shadowColor: c.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 12, shadowColor: c.primary },
    }),
  };
};

// Legacy (non-dynamic) shadows for backward compatibility
export const shadows = makeShadows(darkColors);

// ─── Helper: build a full theme object from a colour palette ─────────────────
export const buildTheme = (c) => {
  const sh = makeShadows(c);
  return {
    colors: c,
    spacing,
    radius,
    typography,
    shadows: sh,
    card: {
      backgroundColor: c.cardBg,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      ...sh.md,
    },
    input: {
      backgroundColor: c.inputBg,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.inputBorder,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.base,
      color: c.text,
    },
    inputFocused: {
      borderColor: c.primary,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      ...sh.sm,
    },
    inputError: {
      borderColor: c.error,
      backgroundColor: c.errorLight,
      borderWidth: 1.5,
    },
    formSection: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderLeftWidth: c.isDark ? 4 : 0,
      borderLeftColor: c.primary,
      borderWidth: c.isDark ? 0 : 1,
      borderColor: c.borderLight,
      ...sh.sm, // lighter softer shadow
    },
  };
};

export const darkTheme  = buildTheme(darkColors);
export const lightTheme = buildTheme(lightColors);

// Legacy default export (dark)
export default darkTheme;
