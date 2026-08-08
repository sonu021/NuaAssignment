import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/src/contexts/ThemeContext";
import { Product } from "../types/product";
import { calculateDiscountedPrice } from "../utils/calculateDiscount";

interface Props {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  cartQuantity?: number;
}

function ProductCard({
  product,
  onPress,
  onAddToCart,
  cartQuantity = 0,
}: Props) {
  const { colors, colorScheme } = useAppTheme();
  const isOutOfStock = product.stock <= 0 || cartQuantity >= product.stock;
  const discountedPrice = calculateDiscountedPrice(
    product.price,
    product.discountPercentage,
  );

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Image source={{ uri: product.thumbnail }} style={styles.image} />

        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {product.title}
          </Text>

          <Text
            style={[styles.description, { color: colors.subtext }]}
            numberOfLines={2}
          >
            {product.description}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {product.discountPercentage > 0 && (
              <Text style={[styles.originalPrice, { color: colors.subtext }]}>
                ${product.price.toFixed(2)}
              </Text>
            )}
          </View>

          <Text style={[styles.rating, { color: colors.subtext }]}>
            ⭐ {product.rating.toFixed(1)} • {product.stock} left
          </Text>

          {cartQuantity > 0 ? (
            <View
              style={[
                styles.cartBadge,
                { backgroundColor: colors.successBackground },
              ]}
            >
              <Text
                style={[styles.cartBadgeText, { color: colors.success }]}
              >
                In cart: {cartQuantity}
              </Text>
            </View>
          ) : null}
        </View>

        {onAddToCart ? (
          <View style={styles.actionColumn}>
            <Pressable
              style={[
                styles.cartButton,
                {
                  backgroundColor:
                    cartQuantity > 0
                      ? colors.primary
                      : colorScheme === "dark"
                        ? "#333333"
                        : "#F2F2F2",
                },
                isOutOfStock && styles.disabledButton,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={isOutOfStock}
              accessibilityRole="button"
              accessibilityLabel={
                isOutOfStock
                  ? `Out of stock for ${product.title}`
                  : `Add ${product.title} to cart`
              }
            >
              <IconSymbol
                name="cart.fill"
                size={18}
                color={
                  isOutOfStock
                    ? colors.subtext
                    : cartQuantity > 0
                      ? colors.primaryText
                      : colors.text
                }
              />

              {cartQuantity > 0 ? (
                <View
                  style={[styles.quantityDot, { backgroundColor: colors.badge }]}
                >
                  <Text style={styles.quantityDotText}>{cartQuantity}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: 85,
    height: 85,
    borderRadius: 8,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  actionColumn: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  rating: {
    marginTop: 4,
    fontSize: 12,
  },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  disabledButton: {
    opacity: 0.4,
  },
  quantityDot: {
    position: "absolute",
    right: -3,
    top: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityDotText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  cartBadge: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    borderRadius: 10,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
