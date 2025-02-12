/* eslint-disable prettier/prettier */
import {StyleSheet} from 'react-native';
import {BLACK, BRAND, LIGHTGRAY, WHITE} from '../../constants/color';
import {BOLD, EXTRABOLD, MEDIUM} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
import {HEIGHT, WIDTH} from '../../constants/config';
export const loginStyles = StyleSheet.create({
  safeareacontainer: {
    height: '100%',
    width: '100%',
    backgroundColor: WHITE,
  },
  maincontainer: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: RFValue(12),
    color: BLACK,
  },
  verificationText: {
    fontFamily: MEDIUM,
    color: LIGHTGRAY,
    paddingLeft: 5,
    paddingTop: 5,
    fontSize: RFValue(11.8),
  },
  msgcontainer: {
    width: '90%',
    justifyContent: 'center',
    paddingTop: HEIGHT * 0.07,
    paddingBottom: HEIGHT * 0.05,
    alignSelf: 'center',
  },
  logincontainer: {
    width: '90%',
    height: HEIGHT * 0.4,
  },
  loginheader: {
    marginTop: HEIGHT * 0.01,
    width: '90%',
    alignSelf: 'center',
  },
  msgtext: {
    color: BLACK,
    fontSize: RFValue(25),
    textAlign: 'left',
    fontFamily: EXTRABOLD,
    fontWeight: 'bold',
  },
  btn: {
    width: WIDTH * 0.5,
  },
  imageContainer: {
    width: WIDTH * 0.5,
    height: WIDTH * 0.3,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  image: {
    width: '100%',
    height: '100%',
    // tintColor: BRAND,
  },
  credentialView: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
