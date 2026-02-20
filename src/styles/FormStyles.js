/**
 * Shared form styles – modern inputs, section cards, buttons.
 * Use with theme for consistent form UI across TripStart, TripExpenses, etc.
 */
import { StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  input as inputBase,
  inputError as inputErrorBase,
  formSection as formSectionBase,
} from '../theme';

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  /** Wrapper for a group of fields in a card */
  sectionCard: {
    ...formSectionBase,
  },
  sectionHeader: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionSubHeader: {
    fontSize: typography.sm,
    color: colors.textMuted,
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
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  input: {
    ...inputBase,
    minHeight: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
    paddingVertical: spacing.md,
  },
  errorInput: {
    ...inputErrorBase,
  },
  errorText: {
    color: colors.error,
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
    borderColor: colors.border,
    backgroundColor: colors.borderLight,
  },
  dateButtonText: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
  placeholderText: {
    color: colors.textPlaceholder,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  outlineButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dropdownContainer: {
    borderRadius: radius.sm,
    borderColor: colors.border,
    ...shadows.md,
  },
  dropdownText: {
    fontSize: typography.base,
    color: colors.text,
  },
  dropdownPlaceholder: {
    color: colors.textPlaceholder,
  },
  tableContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorSubText: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
    ...shadows.lg,
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
    color: colors.text,
  },
  modalContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
