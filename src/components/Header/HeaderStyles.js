import { StyleSheet } from 'react-native';
import { BRAND } from '../../constants/color';

export const headerStyles = StyleSheet.create({
  simpleHeaderContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND, // soft light background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // for Android shadow
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db', // subtle border
  },
  simpleHeaderTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white', // dark gray-blue
    letterSpacing: 0.5,

  },
});
