import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { colors } from '../../theme';
import { loginStyles } from './LoginStyles';

const PasswordInput = ({ password, setPassword }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      label="Password"
      style={loginStyles.inputWrap}
      mode="outlined"
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      placeholder="Enter password"
      secureTextEntry={!showPassword}
      placeholderTextColor={colors.textPlaceholder}
      value={password}
      onChangeText={setPassword}
      right={
        <TextInput.Icon
          icon={showPassword ? 'eye-off' : 'eye'}
          color={colors.textMuted}
          onPress={() => setShowPassword(!showPassword)}
        />
      }
      textColor="#1E293B"
      theme={{ colors: { background: '#F8FAFC', onSurfaceVariant: '#94A3B8' } }}
    />
  );
};

export default PasswordInput;
