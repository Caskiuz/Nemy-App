import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppSafe, ThemeMode } from "@/contexts/AppContext";

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const appContext = useAppSafe();

  const themeMode: ThemeMode = appContext?.themeMode ?? "system";
  const setThemeMode = appContext?.setThemeMode ?? (async () => {});

  const effectiveScheme =
    themeMode === "system" ? (systemColorScheme ?? "light") : themeMode;

  const isDark = effectiveScheme === "dark";
  const theme = Colors[effectiveScheme];

  return {
    theme,
    isDark,
    themeMode,
    setThemeMode,
  };
}
