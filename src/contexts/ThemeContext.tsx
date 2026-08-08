import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { Colors, ThemeColors } from "@/constants/theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  themeMode: ThemeMode;
  colorScheme: "light" | "dark";
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "@nua-assignment/theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useRNColorScheme() ?? "light";
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const restoreTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.warn("Failed to restore theme preference", error);
      } finally {
        setIsLoaded(true);
      }
    };

    restoreTheme();
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error) =>
      console.warn("Failed to save theme preference", error),
    );
  }, []);

  const toggleTheme = useCallback(() => {
    const effectiveScheme =
      themeMode === "system" ? systemScheme : themeMode;
    const nextMode: ThemeMode = effectiveScheme === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
  }, [themeMode, systemScheme, setThemeMode]);

  const activeColorScheme = useMemo((): "light" | "dark" => {
    if (themeMode === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return Colors[activeColorScheme];
  }, [activeColorScheme]);

  const value = useMemo(
    () => ({
      themeMode,
      colorScheme: activeColorScheme,
      colors,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, activeColorScheme, colors, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}
