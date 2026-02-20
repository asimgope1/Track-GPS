import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, radius, spacing, shadows, typography } from '../../theme';

export const customButtonStyles = StyleSheet.create({
  buttonview: {
    minHeight: 48,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    ...shadows.sm,
  },
  text: {
    fontSize: RFValue(typography.base),
    fontWeight: typography.semibold,
  },
  iconview: {
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconimage: {
    height: 20,
    width: 20,
  },
});
