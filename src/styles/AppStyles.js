import { StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { WIDTH } from '../constants/config';

export const appStyles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
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
