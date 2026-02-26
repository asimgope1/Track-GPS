import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogIcon from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { headerStyles } from './HeaderStyles';
import { clearAll } from '../../utils/Storage';
import { useDispatch } from 'react-redux';
import { checkuserToken } from '../../redux/actions/auth';
import { useAppTheme } from '../../theme/ThemeContext';

const Header = ({ title, onMenuPress, rightIcon = null, showCloseButton = false }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme, theme } = useAppTheme();
  const c = theme.colors;

  return (
    <View
      style={[
        headerStyles.enhancedHeaderContainer,
        { paddingTop: insets.top + 12, backgroundColor: 'transparent' },
      ]}>
      {/* Left: menu / close */}
      <TouchableOpacity
        style={headerStyles.iconButton}
        onPress={onMenuPress}
        activeOpacity={0.7}>
        <Icon name={showCloseButton ? 'close' : 'menu'} size={24} color={c.text} />
      </TouchableOpacity>

      {/* Centre: title */}
      <View style={headerStyles.titleWrapper}>
        <Text style={[headerStyles.enhancedHeaderTitle, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right: theme toggle + optional sign-out */}
      <View style={styles.rightGroup}>
        {/* Sun / Moon toggle */}
        <TouchableOpacity
          style={[headerStyles.iconButton, styles.themeBtn]}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <Icon
            name={isDark ? 'wb-sunny' : 'nightlight-round'}
            size={22}
            color={isDark ? '#FBBF24' : '#FCD34D'}
          />
        </TouchableOpacity>

        {rightIcon ? (
          <TouchableOpacity
            style={headerStyles.iconButton}
            activeOpacity={0.7}
            onPress={() => {
              clearAll();
              dispatch(checkuserToken());
            }}>
            <LogIcon name="sign-out" size={22} color={c.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ minWidth: 44, minHeight: 44 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeBtn: {
    marginRight: 4,
  },
});

export default Header;
