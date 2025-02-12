import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {alertModalStyles} from './AlertmodalStyles';
import {IBTN} from '../../constants/imagepath';
import {WIDTH} from '../../constants/config';
import {MEDIUM} from '../../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';
import {BRAND, WHITE} from '../../constants/color';

const Alertmodal = ({title, onCancel, onOkay, visible, onBackpress}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onBackpress(false)}>
      <Pressable
        onPress={() => {
          onBackpress(false);
        }}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(100, 100, 100, 0.5)',
        }}>
        <View style={alertModalStyles.mainContainer}>
          {/* <Text>{title}</Text> */}
          <View style={alertModalStyles.iBtnTextContainer}>
            <View style={alertModalStyles.iBtnContainer}>
              <Image
                style={{
                  width: '60%',
                  height: '60%',
                }}
                resizeMode="contain"
                source={IBTN}
              />
            </View>
            <View style={alertModalStyles.textContainer}>
              <Text style={alertModalStyles.alertText}>{title}</Text>
            </View>
          </View>
          <View style={alertModalStyles.btnsContainer}>
            {/* <TouchableOpacity style={alertModalStyles.btn}>
              <Text
                style={{
                  color: '#787878',
                  fontFamily: MEDIUM,
                  fontSize: RFValue(15),
                }}>
                Cancel
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => {
                onBackpress(false);
              }}
              style={{
                ...alertModalStyles.btn,
                marginRight: WIDTH * 0.04,
                backgroundColor: WHITE,
                borderColor: BRAND,
              }}>
              <Text
                style={{
                  color: BRAND,
                  fontFamily: MEDIUM,
                  fontSize: RFValue(15),
                }}>
                Ok
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default Alertmodal;
