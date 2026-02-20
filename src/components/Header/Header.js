import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogIcon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { headerStyles } from './HeaderStyles';
import { clearAll } from '../../utils/Storage';
import { useDispatch } from 'react-redux';
import { checkuserToken } from '../../redux/actions/auth';
import { colors } from '../../theme';

const Header = ({ title, onMenuPress, rightIcon = null, showCloseButton = false }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        headerStyles.enhancedHeaderContainer,
        { paddingTop: insets.top + 12, backgroundColor: 'transparent' },
      ]}>
      <TouchableOpacity
        style={headerStyles.iconButton}
        onPress={onMenuPress}
        activeOpacity={0.7}>
        <Icon name={showCloseButton ? 'close' : 'menu'} size={24} color={colors.white} />
      </TouchableOpacity>

      <View style={headerStyles.titleWrapper}>
        <Text style={headerStyles.enhancedHeaderTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {rightIcon ? (
        <TouchableOpacity
          style={headerStyles.iconButton}
          activeOpacity={0.7}
          onPress={() => {
            clearAll();
            dispatch(checkuserToken());
          }}>
          <LogIcon name="sign-out" size={22} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={{ minWidth: 44, minHeight: 44 }} />
      )}
    </View>
  );
};

export default Header;
