import {StyleSheet} from 'react-native';
import {HEIGHT, WIDTH} from '../../constants/config';
import {WHITE} from '../../constants/color';
import {MEDIUM} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
export const alertModalStyles = StyleSheet.create({
  mainContainer: {
    width: '85%',
    height: HEIGHT * 0.2,
    backgroundColor: WHITE,
    borderRadius: 10,
    borderColor: '#D1D1D1',
    borderWidth: 1,
  },
  iBtnTextContainer: {
    width: '100%',
    height: HEIGHT * 0.1,
    flexDirection: 'row',
  },
  iBtnContainer: {
    width: '25%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: '6%',
  },
  textContainer: {
    width: '75%',
    height: '100%',
    paddingRight: '6%',
    justifyContent: '',
    paddingTop: HEIGHT * 0.026,
  },
  alertText: {
    color: '#444242',
    fontFamily: MEDIUM,
    fontSize: RFValue(15),
  },
  btnsContainer: {
    width: '100%',
    height: HEIGHT * 0.1,
    // backgroundColor: 'red',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btn: {
    width: '32%',
    height: '50%',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 4,
    marginLeft: WIDTH * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
