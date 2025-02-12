import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';

import {IBTN} from '../constants/imagepath';
import {HEIGHT, WIDTH} from '../constants/config';
import {BRAND, GRAY, RED, WHITE} from '../constants/color';
import {BOLD, MEDIUM} from '../constants/fontfamily';
import {RFValue} from 'react-native-responsive-fontsize';

const Addcontent = ({title, onCancel, onOkay, visible, onBackpress}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => onBackpress(false)}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(100, 100, 100, 0.5)',
        }}>
        <View style={{...styles.mainContainer}}>
          {/* <Text>{title}</Text> */}

          <View style={{...styles.FilterHead}}>
            <Text style={{...styles.FilterText}}>Add Content</Text>
          </View>
          <View style={{...styles.StatusView}}>
            <Text
              style={{
                ...styles.ContentText,
              }}>
              Reflection of Light in Physics
            </Text>
            <View
              style={{
                flexDirection: 'row',
                // backgroundColor: 'red',
                width: '60%',
              }}>
              <Text
                style={{
                  ...styles.ContentText1,
                }}>
                Assigned by
              </Text>
              <Text
                style={{
                  paddingLeft: 2,
                  color: 'black',
                  fontWeight: '600',
                  fontFamily: MEDIUM,
                  fontSize: RFValue(12),
                  color: '#e36863',
                }}>
                Purnima Sharma
              </Text>
            </View>
          </View>
          <View
            style={{
              ...styles.BrowseView,
            }}>
            <Text
              style={{
                ...styles.Browsetext,
              }}>
              Drag and drop or Browse to Upload
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '97%',
    alignItems: 'center',
    height: HEIGHT * 0.5,
    alignSelf: 'center',
    backgroundColor: WHITE,
    borderRadius: 10,
    borderColor: '#D1D1D1',
    borderWidth: 1,
  },
  FilterHead: {
    padding: 5,
    height: HEIGHT * 0.061,
    width: '95%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: '#f1f1f1',
  },
  FilterText: {
    paddingLeft: 14,
    color: 'black',
    fontWeight: '700',
    fontFamily: MEDIUM,
    fontSize: RFValue(13),
  },
  ContentText: {
    paddingLeft: 14,
    color: 'black',
    fontWeight: '700',
    fontFamily: MEDIUM,
    fontSize: RFValue(12),
  },
  ContentText1: {
    paddingLeft: 14,
    color: 'black',
    fontWeight: '600',
    fontFamily: MEDIUM,
    fontSize: RFValue(12),
  },
  textContainer: {
    width: '75%',
    // height: '100%',
    paddingRight: '6%',
    justifyContent: '',
    paddingTop: HEIGHT * 0.024,
    // backgroundColor: 'red',
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
  StatusView: {
    width: '99%',
    paddingLeft: 10,
    alignSelf: 'center ',
  },
  status: {
    height: '15%',
    width: '100%',
  },
  StatusItemView: {
    // height: '85%'
    // width: '100%',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    justifyContent: 'space-between',
  },
  statusItem: {
    // height: HEIGHT * 0.035,
    // width: WIDTH * 0.2,
    paddingVertical: HEIGHT * 0.005,
    paddingHorizontal: WIDTH * 0.035,

    backgroundColor: WHITE,
    borderWidth: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    alignSelf: 'flex-start',
    margin: 10,
    borderRadius: HEIGHT * 0.007,
  },
  BrowseView: {
    width: '85%',
    height: HEIGHT * 0.2,
    borderWidth: 1,
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginLeft: '5%',
    margin: '7%',
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Browsetext: {
    color: 'black',
    fontWeight: '600',
    fontFamily: MEDIUM,
    fontSize: RFValue(12),
  },
});

export default Addcontent;
