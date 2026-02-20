import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { WIDTH } from '../constants/config';
import { colors, spacing, radius, typography } from '../theme';

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
    <View style={[styles.wrapper, width ? { width } : null]}>
      {title ? (
        <Text style={styles.label}>
          {title} {mandatory && <Text style={styles.mandatory}>*</Text>}
        </Text>
      ) : null}
      <View style={[styles.inputWrap, { height }, !editable && styles.inputDisabled]}>
        {isPhonenumber && (
          <View style={styles.phonePrefix}>
            <Text style={styles.phonePrefixText}>+91</Text>
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
            if (hasCallback) callbackMethod(txt);
            if (hasExtraCallback) extraCallbackMethod(txt);
            onChangeText(txt);
          }}
          autoCapitalize={autoCapitalize}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          style={styles.input}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mandatory: {
    color: colors.error,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputDisabled: {
    opacity: 0.7,
    backgroundColor: 'rgba(243, 244, 246, 0.85)', // Very light gray indicating disabled
  },
  phonePrefix: {
    paddingRight: spacing.sm,
    borderRightWidth: 1.5,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  input: {
    flex: 1,
    fontSize: typography.base,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingLeft: 0,
  },
});
