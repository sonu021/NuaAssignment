import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { getProducts, searchProducts } from "@/src/api/productsApi";
import ProductCard from "@/src/components/ProductCard";
import SearchBar from "@/src/components/SearchBar";
import { useCart } from "@/src/contexts/CartContext";
import { useAppTheme } from "@/src/contexts/ThemeContext";
import { useDebounce } from "@/src/hooks/useDebounce";
import { analytics } from "@/src/services/analytics";
import { Product } from "@/src/types/product";

const PAGE_SIZE = 10;

export default function ProductListScreen() {
  const { addItem, items } = useCart();
  const { colors } = useAppTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Request sequence tracking ref to prevent race conditions from out-of-order API responses
  const requestIdRef = useRef(0);
  // AbortController ref for in-flight request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const cartQuantities = useMemo(
    () => new Map(items.map((item) => [item.id, item.quantity])),
    [items],
  );

  /**
   * Main fetch function with cancellation & race-condition sequence validation
   */
  const fetchProducts = useCallback(
    async (
      currentSkip: number,
      mode: "initial" | "append" | "refresh" = "initial",
      query = "",
    ) => {
      // Increment request sequence ID for every call
      const currentRequestId = ++requestIdRef.current;

      // Abort previous in-flight HTTP request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (mode === "append") {
          setLoadingMore(true);
        } else if (mode === "refresh") {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const trimmedQuery = query.trim();
        const data = trimmedQuery
          ? await searchProducts(
              trimmedQuery,
              PAGE_SIZE,
              currentSkip,
              controller.signal,
            )
          : await getProducts(PAGE_SIZE, currentSkip, controller.signal);

        // RACE CONDITION GUARD: Only apply state if this is still the latest active request!
        if (currentRequestId !== requestIdRef.current) {
          console.log(
            `[RaceCondition] Ignored stale response for request #${currentRequestId}`,
          );
          return;
        }

        if (trimmedQuery && mode === "initial") {
          analytics.logEvent("search_performed", {
            query: trimmedQuery,
            resultCount: data.total,
          });
        }

        setProducts((previous) =>
          mode === "append" ? [...previous, ...data.products] : data.products,
        );

        const loadedCount = currentSkip + data.products.length;
        setHasMore(loadedCount < data.total);
      } catch (fetchError: any) {
        if (fetchError?.name === "AbortError") {
          return; // Request was aborted cleanly, ignore error
        }

        // Only set error if this request was not superseded
        if (currentRequestId === requestIdRef.current) {
          console.error("Product list fetch error:", fetchError);
          setError(
            query.trim()
              ? "Unable to search products."
              : "Unable to load products.",
          );
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  // Trigger search / initial query when debounced query changes
  useEffect(() => {
    const activeQuery = debouncedSearch.trim();
    setSkip(0);
    setHasMore(true);
    fetchProducts(0, "initial", activeQuery);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearch, fetchProducts]);

  // Pull-to-refresh handler (doesn't conflict with pagination)
  const handleRefresh = useCallback(() => {
    setSkip(0);
    setHasMore(true);
    fetchProducts(0, "refresh", debouncedSearch.trim());
  }, [debouncedSearch, fetchProducts]);

  // Infinite scroll load more handler
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }

    const nextSkip = skip + PAGE_SIZE;
    setSkip(nextSkip);
    fetchProducts(nextSkip, "append", debouncedSearch.trim());
  }, [skip, loading, loadingMore, refreshing, hasMore, debouncedSearch, fetchProducts]);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: String(product.id) },
    });
  }, []);

  const handleRetry = useCallback(() => {
    fetchProducts(skip, skip > 0 ? "append" : "initial", debouncedSearch.trim());
  }, [skip, debouncedSearch, fetchProducts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Products</Text>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch("")}
      />

      {error && products.length > 0 ? (
        <View
          style={[
            styles.inlineError,
            {
              backgroundColor: colors.errorBackground,
              borderColor: colors.error,
            },
          ]}
        >
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <Text style={[styles.retryButtonText, { color: colors.primaryText }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      {loading && products.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.subtext }]}>
            Loading products...
          </Text>
        </View>
      ) : error && products.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <Text style={[styles.retryButtonText, { color: colors.primaryText }]}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
              onAddToCart={() => addItem(item)}
              cartQuantity={cartQuantities.get(item.id) ?? 0}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.footer}
              />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.subtext }]}>
                  No products found for "{debouncedSearch}"
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
  },
  error: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  inlineError: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: "700",
    fontSize: 13,
  },
  footer: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
});
