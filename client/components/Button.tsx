import React, { ReactNode } from "react";
import {
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, NemyColors } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  loading = false,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getBackgroundColor = () => {
    if (variant === "primary") {
      return NemyColors.primary;
    }
    if (variant === "secondary") {
      return theme.backgroundSecondary;
    }
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "primary") {
      return "#FFFFFF";
    }
    if (variant === "secondary") {
      return theme.text;
    }
    return NemyColors.primary;
  };

  const getBorderColor = () => {
    if (variant === "outline") {
      return NemyColors.primary;
    }
    return "transparent";
  };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 2 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : typeof children === "string" ? (
        <ThemedText
          type="body"
          style={[styles.buttonText, { color: getTextColor() }]}
        >
          {children}
        </ThemedText>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  buttonText: {
    fontWeight: "600",
  },
});
