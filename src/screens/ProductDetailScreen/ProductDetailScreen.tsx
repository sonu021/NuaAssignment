import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { getProductById } from "@/src/api/productsApi";
import { useCart } from "@/src/contexts/CartContext";
import { useAppTheme } from "@/src/contexts/ThemeContext";
import { analytics } from "@/src/services/analytics";
import { Product } from "@/src/types/product";
import { calculateDiscountedPrice } from "@/src/utils/calculateDiscount";
import { IconSymbol } from "@/components/ui/icon-symbol";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Props {
  productId: number;
}

export default function ProductDetailScreen({ productId }: Props) {
  const { addItem, items } = useCart();
  const { colors, colorScheme } = useAppTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const loadProduct = useCallback(async () => {
    if (!productId || productId <= 0) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const data = await getProductById(productId, controller.signal);
      setProduct(data);

      // Log product_viewed analytics event
      analytics.logEvent("product_viewed", {
        productId: data.id,
        title: data.title,
        category: data.category,
        price: data.price,
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }

      console.error("Product detail error:", err);
      setError("Unable to load product details.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    loadProduct();
    return () => controller.abort();
  }, [loadProduct]);

  const handleRetry = useCallback(() => {
    loadProduct();
  }, [loadProduct]);

  const handleReturnPolicyPress = useCallback(() => {
    router.push({
      pathname: "/webview",
      params: {
        title: "Return Policy",
        url: "https://dummyjson.com/docs",
      },
    });
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error ?? "Product not found"}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleRetry}
        >
          <Text style={[styles.retryButtonText, { color: colors.primaryText }]}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountedPrice = calculateDiscountedPrice(
    product.price,
    product.discountPercentage,
  );

  const cartItem = items.find((item) => item.id === product.id);
  const isAtStockLimit = Boolean(
    cartItem && cartItem.quantity >= product.stock,
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.carouselWrapper, { backgroundColor: colors.card }]}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item }} style={styles.image} />
            </View>
          )}
          onMomentumScrollEnd={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / SCREEN_WIDTH);
            setActiveImage(index);
          }}
        />

        {product.images.length > 1 && (
          <View style={styles.pagination}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: colorScheme === "dark" ? "#555" : "#CCC" },
                  activeImage === index && [
                    styles.activeDot,
                    { backgroundColor: colors.primary },
                  ],
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.category, { color: colors.subtext }]}>
          {product.category?.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>

        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: colors.text }]}>
            ⭐ {product.rating}
          </Text>
          <Text style={[styles.stock, { color: colors.subtext }]}>
            • {product.stock} in stock
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.discountedPrice, { color: colors.text }]}>
            ${discountedPrice.toFixed(2)}
          </Text>
          {product.discountPercentage > 0 && (
            <Text style={[styles.originalPrice, { color: colors.subtext }]}>
              ${product.price.toFixed(2)}
            </Text>
          )}
        </View>

        {product.discountPercentage > 0 && (
          <View
            style={[
              styles.discountBadge,
              { backgroundColor: colors.successBackground },
            ]}
          >
            <Text style={[styles.discountText, { color: colors.success }]}>
              {product.discountPercentage.toFixed(1)}% OFF
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Description
        </Text>
        <Text style={[styles.description, { color: colors.subtext }]}>
          {product.description}
        </Text>

        {product.brand && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Brand
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              {product.brand}
            </Text>
          </>
        )}

        {/* WebView Return Policy Link Button */}
        <Pressable
          style={[
            styles.policyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handleReturnPolicyPress}
        >
          <View style={styles.policyRow}>
            <IconSymbol name="shield.fill" size={20} color={colors.primary} />
            <Text style={[styles.policyText, { color: colors.text }]}>
              Return & Refund Policy
            </Text>
          </View>
          <View style={styles.policyRow}>
            <Text style={[styles.policySubtext, { color: colors.subtext }]}>
              30 Days Guarantee
            </Text>
            <IconSymbol name="chevron.right" size={18} color={colors.subtext} />
          </View>
        </Pressable>

        {cartItem && (
          <Text style={[styles.cartStatusText, { color: colors.text }]}>
            In cart: {cartItem.quantity} item{cartItem.quantity > 1 ? "s" : ""}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.cartButton,
            { backgroundColor: colors.primary },
            (product.stock <= 0 || isAtStockLimit) && styles.disabledButton,
          ]}
          disabled={product.stock <= 0 || isAtStockLimit}
          activeOpacity={0.8}
          onPress={() => addItem(product)}
        >
          <Text style={[styles.cartButtonText, { color: colors.primaryText }]}>
            {product.stock <= 0
              ? "Out of Stock"
              : isAtStockLimit
                ? "Max quantity reached"
                : cartItem
                  ? `Add another (${cartItem.quantity})`
                  : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  carouselWrapper: {
    paddingBottom: 8,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "85%",
    height: "85%",
    resizeMode: "contain",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  category: {
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
  stock: {
    marginLeft: 6,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 16,
  },
  discountedPrice: {
    fontSize: 26,
    fontWeight: "800",
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    marginLeft: 12,
  },
  discountBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoText: {
    fontSize: 15,
  },
  policyCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  policyText: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },
  policySubtext: {
    fontSize: 13,
    marginRight: 6,
  },
  cartButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.4,
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cartStatusText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontWeight: "700",
  },
});
