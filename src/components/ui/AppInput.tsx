import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const COLORS = {
  border: '#e2e8f0',
  borderFocus: '#0d9488',
  error: '#dc2626',
  text: '#1e293b',
  placeholder: '#94a3b8',
  label: '#475569',
  bg: '#f8fafc',
};

const AppInput = forwardRef<TextInput, AppInputProps>(
  ({ label, error, containerStyle, value, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = React.useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          value={value ?? ''}
          style={[
            styles.input,
            focused && styles.inputFocused,
            error ? styles.inputError : null,
          ]}
          placeholderTextColor={COLORS.placeholder}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';
export default AppInput;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.label,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  inputFocused: { borderColor: COLORS.borderFocus },
  inputError: { borderColor: COLORS.error },
  error: { fontSize: 12, color: COLORS.error, marginTop: 4 },
});
