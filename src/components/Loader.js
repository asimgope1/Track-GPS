import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {HEIGHT, MyStatusBar, WIDTH} from '../constants/config';
import {LOGO} from '../constants/imagepath';
import {BRAND, BRANDTEXT, GREEN, WHITE} from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';

export const Loader = ({
  visible = false,
  onBackPress,
  imageStyle,
  source,
  backgroundColor = `rgba(100, 100, 100, 0.5)`,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onBackPress != undefined && onBackPress(false)}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(100, 100, 100, 0.5)',
        }}>
        <View style={{}}>
          {/* <View style={{...styles.logoContainer}}> 
            <Image
              resizeMode={'contain'}
              style={{
                alignSelf: 'center',
                width: '80%',
                height: '90%',
              }}
              source={LOGO}
            />
          </View> */}
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 200,
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
});
