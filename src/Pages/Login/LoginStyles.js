import { StyleSheet, Dimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const { width, height } = Dimensions.get('window');

export const loginStyles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    minHeight: height,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: width * 0.9,
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    padding: spacing.xxl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: RFValue(typography.xl),
    fontWeight: typography.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: RFValue(typography.sm),
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: typography.medium,
  },
  inputWrap: {
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: RFValue(typography.base),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  rememberLabel: {
    fontSize: RFValue(typography.sm),
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  forgotLink: {
    paddingVertical: spacing.xxs,
  },
  forgotText: {
    fontSize: RFValue(typography.sm),
    color: colors.primary,
    fontWeight: typography.bold,
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  loginButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: RFValue(typography.md),
    fontWeight: typography.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: spacing.xxxl,
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: RFValue(12),
    color: colors.white,
    opacity: 0.8,
    fontWeight: typography.medium,
  },
  footerBrand: {
    fontWeight: typography.bold,
    color: colors.white,
  },
});
