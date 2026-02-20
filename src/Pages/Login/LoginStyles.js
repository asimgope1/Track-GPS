import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { HEIGHT, WIDTH } from '../../constants/config';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export const loginStyles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  card: {
    width: WIDTH * 0.9,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.md,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: RFValue(24),
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  inputWrap: {
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: colors.borderLight,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: RFValue(typography.base),
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  rememberLabel: {
    fontSize: RFValue(typography.sm),
    color: colors.textSecondary,
  },
  forgotLink: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  forgotText: {
    fontSize: RFValue(typography.sm),
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  loginButtonText: {
    fontSize: RFValue(typography.base),
    fontWeight: typography.semibold,
    color: colors.white,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: RFValue(11),
    color: colors.textMuted,
  },
  footerBrand: {
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
});
