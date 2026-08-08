import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/src/contexts/ThemeContext";

let WebViewComponent: any = null;
try {
  WebViewComponent = require("react-native-webview").WebView;
} catch {
  WebViewComponent = null;
}

const DEFAULT_URL = "https://dummyjson.com/docs";

export default function WebViewScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{ url?: string; title?: string }>();
  const { colors } = useAppTheme();

  const targetUrl = url || DEFAULT_URL;
  const pageTitle = title || "Return Policy";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleOpenExternal = async () => {
    try {
      await WebBrowser.openBrowserAsync(targetUrl);
    } catch (e) {
      console.warn("Could not open external browser", e);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.headerButton}
          hitSlop={10}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>

        {/* Absolutely centered title so it's always visually centred */}
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {pageTitle}
          </Text>
        </View>

        <Pressable
          onPress={handleOpenExternal}
          style={styles.headerButton}
          hitSlop={10}
        >
          <IconSymbol name="globe" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {WebViewComponent ? (
        <View style={styles.webContainer}>
          <WebViewComponent
            source={{ uri: targetUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={styles.webview}
          />
          {loading && (
            <View
              style={[
                styles.overlayLoading,
                { backgroundColor: colors.background },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subtext }]}>
                Loading policy document...
              </Text>
            </View>
          )}
          {error && (
            <View
              style={[
                styles.overlayLoading,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.error }]}>
                Failed to load page.
              </Text>
              <Pressable
                style={[styles.externalButton, { backgroundColor: colors.primary }]}
                onPress={handleOpenExternal}
              >
                <Text
                  style={[
                    styles.externalButtonText,
                    { color: colors.primaryText },
                  ]}
                >
                  Open in Browser
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={[styles.fallbackTitle, { color: colors.text }]}>
            {pageTitle}
          </Text>
          <Text style={[styles.fallbackText, { color: colors.subtext }]}>
            Review our 30-day full refund policy with free return shipping on all original products.
          </Text>
          <Pressable
            style={[styles.externalButton, { backgroundColor: colors.primary }]}
            onPress={handleOpenExternal}
          >
            <Text
              style={[
                styles.externalButtonText,
                { color: colors.primaryText },
              ]}
            >
              Open Full Document Online
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    position: "relative",
  },
  headerButton: {
    padding: 6,
    zIndex: 1,
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 56,
    top: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  webContainer: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  externalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  externalButtonText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
