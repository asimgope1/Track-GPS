import {StyleSheet} from 'react-native';
import {WHITE} from '../../constants/color';
import {HEIGHT, WIDTH} from '../../constants/config';
export const splashStyles = StyleSheet.create({
  maincontainer: {
    height: '100%',
    width: '100%',
    backgroundColor: WHITE,
  },
  maincontainer2: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  logoContainer: {
    width: WIDTH * 0.6,
    height: HEIGHT * 0.15,
    alignItems: 'center',
  },
});
