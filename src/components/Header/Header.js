import React from 'react';
import { View, Text } from 'react-native';
import { headerStyles } from './HeaderStyles';

const Header = ({ title }) => {
  return (
    <View style={headerStyles.simpleHeaderContainer}>
      <Text style={headerStyles.simpleHeaderTitle}>{title}</Text>
    </View>
  );
};

export default Header;
