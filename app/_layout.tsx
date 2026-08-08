import React, { useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { CartProvider, useCart } from "@/src/contexts/CartContext";
import { ThemeProvider, useAppTheme } from "@/src/contexts/ThemeContext";
import { useAppStateAnalytics } from "@/src/hooks/useAppStateAnalytics";
import { AnalyticsModal } from "@/src/components/AnalyticsModal";

export const unstable_settings = {
  anchor: "(tabs)",
};

function HeaderActions({ onOpenAnalytics }: { onOpenAnalytics: () => void }) {
  const { colors, colorScheme, toggleTheme } = useAppTheme();
  const { itemCount } = useCart();

  return (
    <View style={styles.headerRightContainer}>
      <Pressable
        onPress={toggleTheme}
        style={styles.iconBtn}
        hitSlop={6}
        accessibilityLabel="Toggle theme"
      >
        <IconSymbol
          size={22}
          name={colorScheme === "dark" ? "sun.max.fill" : "moon.fill"}
          color={colors.text}
        />
      </Pressable>

      <Pressable
        onPress={onOpenAnalytics}
        style={styles.iconBtn}
        hitSlop={6}
        accessibilityLabel="Open Analytics Log"
      >
        <IconSymbol size={22} name="chart.bar.fill" color={colors.primary} />
      </Pressable>

      <Link href="/cart" asChild>
        <Pressable
          style={styles.iconBtn}
          accessibilityLabel="Go to cart"
        >
          <IconSymbol size={24} name="cart.fill" color={colors.text} />
          {itemCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </Link>
    </View>
  );
}

function MainApp() {
  const { colorScheme, colors } = useAppTheme();
  const [analyticsVisible, setAnalyticsVisible] = useState(false);

  // Activate app state backgrounded analytics listener
  useAppStateAnalytics();

  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            headerTitle: "Nua Shop",
            headerRight: () => (
              <HeaderActions
                onOpenAnalytics={() => setAnalyticsVisible(true)}
              />
            ),
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            title: "Product Details",
            headerRight: () => (
              <HeaderActions
                onOpenAnalytics={() => setAnalyticsVisible(true)}
              />
            ),
          }}
        />
        <Stack.Screen
          name="webview"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <AnalyticsModal
        visible={analyticsVisible}
        onClose={() => setAnalyticsVisible(false)}
      />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
