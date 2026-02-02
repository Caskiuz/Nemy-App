import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, NemyColors } from "@/constants/theme";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ text, variant = "primary", style }: BadgeProps) {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: NemyColors.primaryLight,
          text: NemyColors.primaryDark,
        };
      case "secondary":
        return {
          bg: theme.backgroundSecondary,
          text: theme.textSecondary,
        };
      case "success":
        return {
          bg: "#E8F5E9",
          text: NemyColors.success,
        };
      case "warning":
        return {
          bg: "#FFF8E1",
          text: "#F57C00",
        };
      case "error":
        return {
          bg: "#FFEBEE",
          text: NemyColors.error,
        };
      default:
        return {
          bg: NemyColors.primaryLight,
          text: NemyColors.primaryDark,
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <ThemedText type="caption" style={[styles.text, { color: colors.text }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
  },
});
