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
    padding: spacing.xl, // Slightly reduced padding to give more room for content
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: RFValue(typography.xl),
    fontWeight: typography.bold,
    color: '#1E293B', // Dark slate text on white card
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: RFValue(typography.sm),
    color: '#64748B', // Medium slate text on white card
    marginTop: spacing.xs,
    fontWeight: typography.medium,
  },
  inputWrap: {
    width: '100%',
    marginBottom: spacing.md,
    backgroundColor: '#F8FAFC', // Light grayish-blue input bg
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Light border
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
    flexWrap: 'wrap', // Prevent overflow on small screens
    gap: 10,
  },
  rememberLabel: {
    fontSize: RFValue(typography.sm),
    color: '#475569', // Slate
    fontWeight: typography.medium,
    flexShrink: 1,
  },
  forgotLink: {
    paddingVertical: spacing.xxs,
    flexShrink: 1,
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
