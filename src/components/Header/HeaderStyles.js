import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const headerStyles = StyleSheet.create({
  enhancedHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  iconButton: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedHeaderTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
