import {StatusBar, StyleSheet} from 'react-native';
import {BLACK, BRAND, BROWN, WHITE} from '../../constants/color';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';
import {BOLD, LIGHT, REGULAR, SEMIBOLD} from '../../constants/fontfamily';
import {HEIGHT, WIDTH} from '../../constants/config';
export const headerStyles = StyleSheet.create({
  headercontainer: {
    // marginTop: StatusBar.currentHeight,
    flexDirection: 'row',
    width: '90%',
    height: 55,
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  iconview: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  headertextview: {
    width: '55%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: BLACK,
    fontSize: RFValue(14),
    fontFamily: SEMIBOLD,
  },
  skiptext: {
    color: BLACK,
    fontSize: RFValue(13),
    fontFamily: BOLD,
  },
  skipview: {
    width: '35%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 10,
    borderWidth: 1,
  },
});
