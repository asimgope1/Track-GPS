/**
 * AppStyles factory – call makeAppStyles(colors) to get theme-aware styles.
 * Backward compat: appStyles (dark) still exported for existing usages.
 */
import { StyleSheet } from 'react-native';
import { darkColors as colors, spacing } from '../theme';
import { WIDTH } from '../constants/config';

export const makeAppStyles = c =>
  StyleSheet.create({
    safeareacontainer: {
      flex: 1,
      backgroundColor: 'transparent', // gradient is behind
    },
    maincontainer: {
      flex: 1,
      alignItems: 'center',
    },
    customButtonWrapper: {
      width: '100%',
      position: 'absolute',
      bottom: spacing.xl,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textcolor: {
      color: c.text,
    },
    customTextInputWrapper: {
      width: '90%',
      alignSelf: 'center',
    },
    termstextWrapper: {
      width: '100%',
    },
    rowInputsStyleWrapper: {
      flexDirection: 'row',
      width: '90%',
      alignSelf: 'center',
      justifyContent: 'space-between',
    },
  });

// Legacy export (dark palette) – for files that import appStyles directly
export const appStyles = makeAppStyles(colors);
