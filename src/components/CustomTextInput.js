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
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  mandatory: {
    color: colors.error,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputDisabled: {
    opacity: 0.7,
    backgroundColor: colors.borderLight,
  },
  phonePrefix: {
    paddingRight: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: spacing.xs,
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
    paddingVertical: spacing.sm,
    paddingLeft: 0,
  },
});
