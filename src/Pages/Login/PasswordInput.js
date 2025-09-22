import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { HEIGHT, WIDTH } from '../../constants/config';
import { GRAY, GREEN } from '../../constants/color';

const PasswordInput = ({ password, setPassword }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      label="Password"
      style={{
        width: WIDTH * 0.8,
        marginTop: HEIGHT * 0.02,
        backgroundColor: 'white',
      }}
      mode="outlined"
      outlineColor={GREEN}
      activeOutlineColor={GREEN}
      placeholder="Password"
      secureTextEntry={!showPassword}
      placeholderTextColor={GRAY}
      value={password}
      onChangeText={text => setPassword(text)}
      right={
        <TextInput.Icon
          icon={showPassword ? 'eye-off' : 'eye'}
          color={GRAY}
          onPress={() => setShowPassword(!showPassword)}
        />
      }
    />
  );
};

export default PasswordInput;
