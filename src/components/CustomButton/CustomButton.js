import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { customButtonStyles } from './CustomButtonStyles';
import { WIDTH } from '../../constants/config';
import { colors } from '../../theme';

const CustomButton = ({
  width = '90%',
  title,
  onPress,
  icon,
  disabled,
  activeOpacity = 0.7,
  backgroundColor = colors.primary,
  borderColor = 'transparent',
  textColor = colors.white,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[
        customButtonStyles.buttonview,
        {
          width: width || WIDTH * 0.9,
          backgroundColor: disabled ? colors.border : backgroundColor,
          borderWidth: borderColor !== 'transparent' ? 1 : 0,
          borderColor,
        },
      ]}>
      {icon && (
        <View style={customButtonStyles.iconview}>
          <Image
            style={customButtonStyles.iconimage}
            resizeMode="contain"
            source={icon}
          />
        </View>
      )}
      <Text style={[customButtonStyles.text, { color: textColor }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
