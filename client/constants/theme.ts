import { Platform } from "react-native";

export const NemyColors = {
  primary: "#FF8C00",
  primaryDark: "#E67A00",
  primaryLight: "#FFD4A3",
  accent: "#FF6B35",
  accentDark: "#E55A2B",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  carnival: {
    gold: "#FFD700",
    pink: "#E91E63",
  },
};

export const Colors = {
  light: {
    text: "#333333",
    textSecondary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#757575",
    tabIconSelected: NemyColors.primary,
    link: NemyColors.primary,
    backgroundRoot: "#F5F5F5",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#EEEEEE",
    backgroundTertiary: "#E0E0E0",
    border: "#E0E0E0",
    card: "rgba(255, 255, 255, 0.6)",
    cardBorder: "rgba(255, 255, 255, 0.8)",
    overlay: "rgba(0, 0, 0, 0.4)",
    skeleton: "#E0E0E0",
    skeletonHighlight: "#F5F5F5",
    gradientStart: "#FFFFFF",
    gradientEnd: "#C0C0C0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: NemyColors.primary,
    link: NemyColors.primary,
    backgroundRoot: "#0D0D0D",
    backgroundDefault: "#1A1A2E",
    backgroundSecondary: "#1E1E1E",
    backgroundTertiary: "#252525",
    border: "#333333",
    card: "rgba(30, 30, 30, 0.7)",
    cardBorder: "rgba(60, 60, 60, 0.5)",
    overlay: "rgba(0, 0, 0, 0.7)",
    skeleton: "#2C2C2C",
    skeletonHighlight: "#3C3C3C",
    gradientStart: "#0D0D0D",
    gradientEnd: "#2D1B4E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 52,
  buttonHeight: 52,
  iconButton: 44,
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 100,
  },
  card: {
    image: 120,
    banner: 200,
  },
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
