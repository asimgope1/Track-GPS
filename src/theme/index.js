/**
 * FleetCue Design System – Modern, sleek UI
 * Clean hierarchy, soft elevation, refined palette.
 */

import { Platform } from 'react-native';

export const colors = {
  primary: '#0d9488',
  primaryLight: '#14b8a6',
  primaryDark: '#0f766e',

  white: '#ffffff',
  background: '#f1f5f9',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textPlaceholder: '#94a3b8',

  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#0891b2',
  infoLight: '#cffafe',

  statusPending: '#d97706',
  statusInProgress: '#0891b2',
  statusCompleted: '#059669',
  statusCancelled: '#dc2626',

  black: '#000000',
  gray: '#64748b',
  red: '#dc2626',
  green: '#059669',
  orange: '#ea580c',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  sm: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: { elevation: 1 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    android: { elevation: 3 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
  }),
};

export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  padding: spacing.lg,
  ...shadows.sm,
};

export const input = {
  backgroundColor: colors.surface,
  borderRadius: radius.sm,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
};
export const inputFocused = {
  borderColor: colors.primary,
  backgroundColor: colors.surface,
};
export const inputError = {
  borderColor: colors.error,
  backgroundColor: colors.errorLight,
};
/** Section card for grouping form fields – left accent, soft shadow */
export const formSection = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeftWidth: 4,
  borderLeftColor: colors.primary,
  ...shadows.sm,
};
export default {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  card,
  input,
  inputFocused,
  inputError,
  formSection,
};

