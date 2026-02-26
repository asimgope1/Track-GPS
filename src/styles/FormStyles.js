/**
 * Shared form styles – theme-aware factory.
 *
 * Usage in a screen:
 *   const { theme } = useAppTheme();
 *   const fs = makeFormStyles(theme);
 *
 * Legacy `formStyles` (dark) still exported for backward compat.
 */
import { StyleSheet } from 'react-native';
import { darkTheme, spacing, radius, typography } from '../theme';

export const makeFormStyles = theme => {
  const c = theme.colors;
  const sh = theme.shadows;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContainer: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    sectionCard: {
      backgroundColor: c.cardBg,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
      borderWidth: 1,
      borderColor: c.cardBorder,
      ...sh.md,
    },
    sectionHeader: {
      fontSize: typography.lg,
      fontWeight: typography.semibold,
      color: c.text,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
    },
    sectionSubHeader: {
      fontSize: typography.sm,
      color: c.textMuted,
      marginBottom: spacing.md,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    inputItem: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.sm,
      fontWeight: typography.semibold,
      color: c.textSecondary,
      marginBottom: spacing.xxs,
    },
    input: {
      backgroundColor: c.inputBg,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.inputBorder,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.base,
      color: c.text,
      minHeight: 50,
    },
    multilineInput: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
    },
    errorInput: {
      borderColor: c.error,
      backgroundColor: c.errorLight,
      borderWidth: 1.5,
    },
    errorText: {
      color: c.error,
      fontSize: typography.xs,
      marginTop: spacing.xxs,
      fontWeight: typography.medium,
    },
    dateButton: {
      minHeight: 50,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.inputBorder,
      backgroundColor: c.inputBg,
    },
    dateButtonText: {
      color: c.text,
      fontSize: typography.base,
      fontWeight: typography.medium,
    },
    placeholderText: {
      color: c.textPlaceholder,
    },
    primaryButton: {
      backgroundColor: c.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      ...sh.sm,
    },
    primaryButtonDisabled: {
      backgroundColor: c.textMuted,
      opacity: 0.7,
    },
    primaryButtonText: {
      color: c.white,
      fontSize: typography.base,
      fontWeight: typography.semibold,
    },
    outlineButton: {
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: c.primary,
      backgroundColor: 'transparent',
    },
    outlineButtonText: {
      color: c.primary,
      fontSize: typography.sm,
      fontWeight: typography.semibold,
    },
    dropdown: {
      backgroundColor: c.surface,
      borderColor: c.inputBorder,
      borderWidth: 1,
      borderRadius: radius.sm,
      minHeight: 48,
      paddingHorizontal: spacing.md,
    },
    dropdownContainer: {
      borderRadius: radius.sm,
      borderColor: c.inputBorder,
      backgroundColor: c.surfaceElevated,
      ...sh.md,
    },
    dropdownText: {
      fontSize: typography.base,
      color: c.text,
    },
    dropdownPlaceholder: {
      color: c.textPlaceholder,
    },
    tableContainer: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      ...sh.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    loadingText: {
      marginTop: spacing.sm,
      color: c.textMuted,
      fontSize: typography.base,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: 'transparent',
    },
    errorSubText: {
      color: c.textMuted,
      fontSize: typography.sm,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    retryButton: {
      backgroundColor: c.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      marginTop: spacing.md,
    },
    retryButtonText: {
      color: c.white,
      fontSize: typography.base,
      fontWeight: typography.semibold,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: c.surfaceElevated,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      maxHeight: '90%',
      ...sh.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    modalTitle: {
      fontSize: typography.xl,
      fontWeight: typography.semibold,
      color: c.text,
    },
    modalContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
  });
};

// Legacy export (dark palette) for existing imports
export const formStyles = makeFormStyles(darkTheme);
