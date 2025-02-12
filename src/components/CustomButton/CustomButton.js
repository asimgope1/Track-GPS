import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import React from 'react';
import { customButtonStyles } from './CustomButtonStyles';
import { WIDTH } from '../../constants/config';
import { BLACK, BRAND, GREEN, WHITE } from '../../constants/color';

const CustomButton = ({
  width = '90%',
  title,
  onPress,
  icon,
  disabled,
  activeOpacity,
  backgroundColor = GREEN,
  borderColor = BLACK,
  textColor = WHITE,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={{
        ...customButtonStyles.buttonview,
        width: width ? width : WIDTH,
        backgroundColor: backgroundColor,
        borderWidth: 1,
        borderColor: borderColor,
      }}>
      {icon && (
        <View style={customButtonStyles.iconview}>
          <Image
            // tintColor={WHITE}
            style={customButtonStyles.iconimage}
            resizeMode="center"
            source={icon}
          />
        </View>
      )}
      <Text style={{ ...customButtonStyles.text, color: textColor }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
