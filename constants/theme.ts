import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#11181C",
    subtext: "#687076",
    background: "#F5F5F5",
    card: "#FFFFFF",
    inputBackground: "#EFEFEF",
    border: "#E0E0E0",
    tint: "#111111",
    primary: "#111111",
    primaryText: "#FFFFFF",
    accent: "#007AFF",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#111111",
    error: "#D32F2F",
    errorBackground: "#FDECEA",
    success: "#2E7D32",
    successBackground: "#E8F5E9",
    badge: "#D32F2F",
    badgeText: "#FFFFFF",
  },
  dark: {
    text: "#F3F4F6",
    subtext: "#9CA3AF",
    background: "#121212",
    card: "#1E1E1E",
    inputBackground: "#2C2C2E",
    border: "#333333",
    tint: "#FFFFFF",
    primary: "#FFFFFF",
    primaryText: "#111111",
    accent: "#0A84FF",
    icon: "#9CA3AF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#FFFFFF",
    error: "#FF453A",
    errorBackground: "#3C1E1E",
    success: "#30D158",
    successBackground: "#1E3C26",
    badge: "#FF453A",
    badgeText: "#FFFFFF",
  },
};

export type ThemeColors = typeof Colors.light;

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
