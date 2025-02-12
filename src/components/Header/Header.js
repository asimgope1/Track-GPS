import React from 'react';
import {View, Text, Image, TouchableOpacity, Platform} from 'react-native';
import {headerStyles} from './HeaderStyles';
import {appStyles} from '../../styles/AppStyles';
import {BACKARROW, PANVERIFIED} from '../../constants/imagepath';
import {useNavigation} from '@react-navigation/native';
const Header = ({
  iconShown = true,
  // icon = Platform.OS == "android" ? BACKARROW : PANVERIFIED,
  icon = BACKARROW,
  title,
  logoutShown = false,
  onIconPress,
  skipCallback,
  adminShown,
}) => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        ...headerStyles.headercontainer,
      }}>
      {iconShown && (
        <TouchableOpacity onPress={onIconPress} style={headerStyles.iconview}>
          <Image
            resizeMode={'contain'}
            style={headerStyles.image}
            source={icon}
          />
        </TouchableOpacity>
      )}
      <View
        style={{
          ...headerStyles.headertextview,
          alignItems: icon == BACKARROW ? 'center' : 'flex-start',
        }}>
        <Text style={headerStyles.text}>{title}</Text>
      </View>
      {logoutShown && (
        <View style={headerStyles.skipview}>
          <Text
            onPress={() => {
              skipCallback();
            }}
            style={headerStyles.skiptext}>
            Log out
          </Text>
        </View>
      )}
    </View>
  );
};

export default Header;
