import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CartItem, useCart } from "@/src/contexts/CartContext";
import { useAppTheme } from "@/src/contexts/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function CartScreen() {
  const {
    items,
    itemCount,
    total,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    isLoading,
  } = useCart();

  const { colors } = useAppTheme();
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>
          Restoring your cart…
        </Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <IconSymbol name="cart" size={64} color={colors.subtext} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Your cart is empty
        </Text>
        <Text style={[styles.emptyText, { color: colors.subtext }]}>
          Add products to see them listed here.
        </Text>
        {orderMessage ? (
          <View
            style={[
              styles.messageBox,
              { backgroundColor: colors.successBackground, marginTop: 20 },
            ]}
          >
            <Text style={[styles.messageText, { color: colors.success }]}>
              {orderMessage}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      clearCart();
      setOrderMessage("Your order has been placed successfully!");
      setIsProcessing(false);
    }, 500);
  };

  const handleClearCart = () => {
    clearCart();
    setOrderMessage("Your cart has been cleared.");
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isAtStockLimit = item.quantity >= item.stock;

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.image} />
        <View style={styles.itemContent}>
          <Text
            numberOfLines={2}
            style={[styles.title, { color: colors.text }]}
          >
            {item.title}
          </Text>
          <Text style={[styles.price, { color: colors.text }]}>
            ${item.price.toFixed(2)}
          </Text>

          <View style={styles.quantityRow}>
            <Pressable
              accessibilityLabel={`Decrease ${item.title} quantity`}
              onPress={() => decrementItem(item.id)}
              style={[
                styles.quantityButton,
                { backgroundColor: colors.primary },
              ]}
              hitSlop={6}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  { color: colors.primaryText },
                ]}
              >
                −
              </Text>
            </Pressable>

            <Text style={[styles.quantity, { color: colors.text }]}>
              {item.quantity}
            </Text>

            <Pressable
              accessibilityLabel={`Increase ${item.title} quantity`}
              disabled={isAtStockLimit}
              onPress={() => incrementItem(item.id)}
              style={[
                styles.quantityButton,
                { backgroundColor: colors.primary },
                isAtStockLimit && styles.disabledButton,
              ]}
              hitSlop={6}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  { color: colors.primaryText },
                ]}
              >
                +
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={`Remove ${item.title} from cart`}
              onPress={() => removeItem(item.id)}
              style={styles.removeContainer}
            >
              <Text style={[styles.removeText, { color: colors.error }]}>
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Cart ({itemCount})
        </Text>
        <Pressable onPress={handleClearCart} style={styles.clearCartTextButton}>
          <Text style={[styles.clearCartText, { color: colors.error }]}>
            Clear All
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <View
        style={[
          styles.bottomSummaryBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.totalInfo}>
          <Text style={[styles.totalLabel, { color: colors.subtext }]}>
            Total Amount
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ${total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.checkoutButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          <Text style={[styles.checkoutButtonText, { color: colors.primaryText }]}>
            {isProcessing ? "Processing…" : "Checkout"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
  },
  clearCartTextButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearCartText: {
    fontSize: 14,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  messageBox: {
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 8,
    resizeMode: "contain",
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  quantityRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  quantityButton: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
  },
  quantity: {
    fontSize: 15,
    fontWeight: "700",
    marginHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.35,
  },
  removeContainer: {
    marginLeft: "auto",
  },
  removeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomSummaryBar: {
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  totalInfo: {
    justifyContent: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutButtonText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
