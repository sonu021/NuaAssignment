import { useColorScheme as useRNColorScheme } from "react-native";
import { useAppTheme } from "@/src/contexts/ThemeContext";

export function useColorScheme(): "light" | "dark" {
  try {
    const { colorScheme } = useAppTheme();
    return colorScheme;
  } catch {
    return useRNColorScheme() ?? "light";
  }
}
