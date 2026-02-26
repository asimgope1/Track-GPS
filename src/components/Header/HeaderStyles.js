import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const headerStyles = StyleSheet.create({
  enhancedHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0,
  },
  iconButton: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedHeaderTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    letterSpacing: 0.2,
  },
});
