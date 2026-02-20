/**
 * FleetCue Design System v3 – Inspired by Google Stitch AI UI
 * High contrast, deep glassmorphism, vibrant premium accents.
 */

import { Platform } from 'react-native';

export const colors = {
  primary: '#4F46E5', // vibrant indigo
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  primaryGradient: ['#4F46E5', '#7C3AED'], // purple-indigo gradient 

  white: '#FFFFFF',
  background: 'transparent', // Used to be '#F3F4F6' - Now glassmorphism gradient
  surface: 'rgba(255, 255, 255, 0.1)',
  surfaceElevated: 'rgba(255, 255, 255, 0.15)',
  border: 'rgba(255, 255, 255, 0.2)',
  borderLight: 'rgba(255, 255, 255, 0.08)',

  text: '#FFFFFF', // pure white text for heavy dark background
  textSecondary: '#E2E8F0', // slate-200
  textMuted: '#94A3B8', // slate-400
  textPlaceholder: '#CBD5E1', // slate-300

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  statusPending: '#F59E0B',
  statusInProgress: '#3B82F6',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',

  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,  // softer radii for modern AI look
  xl: 32,
  full: 9999,
};

export const typography = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '800', // chunkier bold
};

export const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  sm: Platform.select({
    ios: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    android: { elevation: 3 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    android: { elevation: 6 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
    },
    android: { elevation: 12 },
  }),
  glow: Platform.select({
    ios: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    android: { elevation: 16, shadowColor: '#4F46E5' },
  }),
};

export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.lg,
  ...shadows.md,
};

export const input = {
  backgroundColor: colors.borderLight,
  borderRadius: radius.md,
  borderWidth: 1.5,
  borderColor: colors.border,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: typography.base,
  color: colors.text,
};

export const inputFocused = {
  borderColor: colors.primary,
  backgroundColor: colors.surface,
  borderWidth: 1.5,
  ...shadows.sm,
};

export const inputError = {
  borderColor: colors.error,
  backgroundColor: colors.errorLight,
  borderWidth: 1.5,
};

export const formSection = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderLeftWidth: 4,
  borderLeftColor: colors.primary,
  ...shadows.md,
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
