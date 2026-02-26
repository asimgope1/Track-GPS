/**
 * Legacy colour constants – kept for backward compatibility.
 * For new code prefer: const { theme } = useAppTheme();
 *
 * These constants reference the DARK palette by default.
 * Screens that need dynamic theming should use `useAppTheme()` instead.
 */
import { darkColors as themeColors } from '../theme';

export const BACKGROUND         = themeColors.background;
export const BACKGROUNDBLACK    = '#0C0A0F';
export const WHITE              = themeColors.white;
export const BLACK              = themeColors.text;
export const ORANGE             = '#FF5C00';
export const PINK               = '#FF00C7';
export const GRAY               = themeColors.textMuted;
export const RED                = themeColors.error;
export const ICONGRAY           = themeColors.textMuted;
export const TABGRAY            = '#3D3B3C';
export const BLUE               = themeColors.primary;
export const ORGGREEN           = '#1ED760';
export const GREEN              = themeColors.success;
export const DARKGREEN          = '#249D10';
export const BRANDBLUE          = themeColors.primaryLight;
export const ONBOARDINGTITLE1   = themeColors.text;
export const BRAND              = themeColors.primary;
export const DESCRIPTION        = themeColors.textMuted;
export const TEXTINPUTBACKGROUND = themeColors.inputBg;
export const TEXTINPUTTITLE     = themeColors.textSecondary;
export const LIGHTGRAY          = themeColors.textMuted;
export const BROWN              = '#9A0320';
export const PURPLE             = '#1E1D27';
export const DARKPURPLE         = '#070709';
export const CHECKBOX           = themeColors.borderLight;
export const SUBSCRIPTIONGRAY   = '#817575';
export const LISTTEXTGRAY       = themeColors.textSecondary;
export const BRANDTEXT          = '#FBCC5E';
export const BUTTONDISABLED     = themeColors.border;
export const PRICETEXT          = themeColors.text;
export const LIGHTGRAY1         = themeColors.textMuted;
export const BRANDRED           = themeColors.error;
export const PROFILESTATUSBAR   = themeColors.borderLight;
