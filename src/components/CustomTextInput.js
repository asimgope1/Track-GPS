import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { HEIGHT, STYLES, WIDTH } from '../constants/config';
import {
  BLACK,
  GRAY,
  LIGHTGRAY,
  RED,
  TEXTINPUTBACKGROUND,
  TEXTINPUTTITLE,
  WHITE,
} from '../constants/color';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { EXTRABOLD, MEDIUM, REGULAR } from '../constants/fontfamily';

export const CustomTextInput = ({
  title = '',
  value = null,
  placeholder = '',
  width = WIDTH * 0.9,
  keyboardType = 'default',
  maxLength,
  onChangeText,
  editable = true,
  autoFocus = false,
  isPhonenumber = false,
  autoCapitalize = 'none',
  hasCallback = false,
  callbackMethod,
  secureTextEntry,
  onPressIn,
  hasActionOnFocus = false,
  mandatory = false,
  hasExtraCallback = false,
  extraCallbackMethod,
  height = 48,
  textAlignVertical,
  numberOfLines,
  multiline,
}) => {
  return (
    <View
      style={{
        width: width ? width : WIDTH,
      }}>
      <View style={{ marginVertical: '1%' }}>
        <Text
          style={{
            color: WHITE,
            fontFamily: EXTRABOLD,
            fontSize: RFValue(15),
            paddingLeft: HEIGHT * 0.0059,
            fontWeight: 'bold',
          }}>
          {title} <Text style={{ color: RED }}>{mandatory && '*'}</Text>
        </Text>
      </View>
      <View
        style={{
          borderRadius: 7,
          borderWidth: 0.6,
          borderColor: '#C8C8C8',
          marginTop: 1,
          marginBottom: HEIGHT * 0.005,
          borderWidth: 1,
        }}>
        <LinearGradient
          end={{ x: 1, y: 1 }}
          start={{ x: 1, y: 1 }}
          colors={[WHITE, WHITE]}
          style={{
            opacity: editable ? 1 : 0.5,
            borderRadius: 7,
            height: height,
            flexDirection: 'row',
            borderColor: GRAY,
          }}>
          {isPhonenumber && (
            <View
              style={{
                width: WIDTH * 0.13,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: RFValue(14),
                  color: BLACK,
                  fontFamily: EXTRABOLD,
                  fontWeight: 'bold',
                }}>
                +91
              </Text>
            </View>
          )}
          <TextInput
            onPressIn={hasActionOnFocus ? onPressIn : null}
            autoFocus={autoFocus}
            secureTextEntry={secureTextEntry}
            editable={editable}
            textAlignVertical={textAlignVertical}
            numberOfLines={numberOfLines}
            multiline={multiline}
            onChangeText={txt => {
              // if (!/[0-9,.*-@]/.test(txt.slice(-1))) {
              if (hasCallback) {
                callbackMethod(txt);
              }
              if (hasExtraCallback) {
                extraCallbackMethod(txt);
              }
              onChangeText(txt);
              // } else {
              // }
            }}
            autoCapitalize={autoCapitalize}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={'#787878'}
            style={{
              ...Styles.inputTextStyle,
            }}
            keyboardType={keyboardType}
            maxLength={maxLength}
          />
        </LinearGradient>
      </View>
    </View>
  );
};
const Styles = StyleSheet.create({
  viewForTextInput: {
    ...STYLES.elevation,
    height: 60,
    alignSelf: 'center',
    borderRadius: 7,
    borderWidth: 0.6,
    borderColor: GRAY,
    marginTop: 5,
    // backgroundColor: 'red',
  },
  inputTextStyle: {
    fontSize: RFValue(13),
    color: BLACK,
    fontFamily: EXTRABOLD,
    fontWeight: 'bold',
    marginLeft: 5,
    flex: 1,
    paddingLeft: 10,
  },
});
