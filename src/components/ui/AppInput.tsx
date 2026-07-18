import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  ({ label, error, containerStyle, value, secureTextEntry, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputRow,
            focused && styles.inputRowFocused,
            error ? styles.inputRowError : null,
          ]}
        >
          <TextInput
            ref={ref}
            value={value ?? ''}
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={secureTextEntry ? !passwordVisible : false}
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
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          )}
        </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  inputRowFocused: { borderColor: COLORS.borderFocus },
  inputRowError: { borderColor: COLORS.error },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: { fontSize: 12, color: COLORS.error, marginTop: 4 },
});
