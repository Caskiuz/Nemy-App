import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? NemyColors.error
    : isFocused
      ? NemyColors.primary
      : theme.border;

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor,
          },
        ]}
      >
        {leftIcon ? (
          <Feather
            name={leftIcon}
            size={20}
            color={theme.textSecondary}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              paddingLeft: leftIcon ? 0 : Spacing.lg,
              backgroundColor: "transparent",
            },
            style,
          ]}
          selectionColor={NemyColors.primary}
          placeholderTextColor={theme.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather name={rightIcon} size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText
          type="caption"
          style={[styles.error, { color: NemyColors.error }]}
        >
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    height: Spacing.inputHeight,
  },
  leftIcon: {
    marginLeft: Spacing.lg,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingRight: Spacing.lg,
  },
  rightIcon: {
    padding: Spacing.md,
  },
  error: {
    marginTop: Spacing.xs,
  },
});
