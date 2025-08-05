import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { headerStyles } from './HeaderStyles';
import LogIcon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for the logout icon
import { clearAll } from '../../utils/Storage';
import { useDispatch } from 'react-redux';
import { checkuserToken } from '../../redux/actions/auth';

const Header = ({title, onMenuPress, rightIcon = null}) => {
  const dispatch = useDispatch();

  return (
    <LinearGradient
      colors={['#38bdf8', '#0ea5e9', '#0284c7']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={headerStyles.enhancedHeaderContainer}>
      <TouchableOpacity style={headerStyles.iconButton} onPress={onMenuPress}>
        <Icon name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={headerStyles.titleWrapper}>
        <Text style={headerStyles.enhancedHeaderTitle}>{title}</Text>
      </View>

      {rightIcon && (
        <TouchableOpacity style={headerStyles.iconButton}>
          <LogIcon
            name="sign-out"
            size={26}
            color="#fff"
            onPress={() => {
              clearAll();
              dispatch(checkuserToken());
            }}
          />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};


export default Header;
