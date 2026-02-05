import { theme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppSafe, ThemeMode } from "@/contexts/AppContext";

// Define light and dark themes
const lightTheme = {
  ...theme,
  gradientStart: '#FFFFFF',
  gradientEnd: '#F5F5F5',
  card: '#FFFFFF',
  text: theme.colors.text.primary,
  textSecondary: theme.colors.text.secondary,
};

const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    surface: '#1E1E1E',
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#666666',
      inverse: '#000000',
    },
  },
  gradientStart: '#121212',
  gradientEnd: '#1E1E1E',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
};

const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const appContext = useAppSafe();

  const themeMode: ThemeMode = appContext?.themeMode ?? "system";
  const setThemeMode = appContext?.setThemeMode ?? (async () => {});

  const effectiveScheme =
    themeMode === "system" ? (systemColorScheme ?? "light") : themeMode;

  const isDark = effectiveScheme === "dark";
  const themeData = Colors[effectiveScheme];

  return {
    theme: themeData,
    isDark,
    themeMode,
    setThemeMode,
  };
}
