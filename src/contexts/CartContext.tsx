import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Product } from "@/src/types/product";
import { analytics } from "@/src/services/analytics";

const CART_STORAGE_KEY = "@nua-assignment/cart";

export type CartItem = Pick<
  Product,
  "id" | "title" | "price" | "thumbnail" | "stock"
> & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isLoading: boolean;
  itemCount: number;
  total: number;
  addItem: (product: Product) => void;
  incrementItem: (productId: number) => void;
  decrementItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart) as CartItem[]);
        }
      } catch (error) {
        console.warn("Unable to restore cart", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreCart();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(
      (error) => console.warn("Unable to save cart", error),
    );
  }, [isLoading, items]);

  const addItem = useCallback((product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentItems;
        }

        const newQuantity = existingItem.quantity + 1;
        analytics.logEvent("add_to_cart", {
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: newQuantity,
        });

        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item,
        );
      }

      analytics.logEvent("add_to_cart", {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
      });

      return [
        ...currentItems,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  }, []);

  const decrementItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        return item.quantity === 1 ? [] : [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }, []);

  const incrementItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      isLoading,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [items, isLoading, addItem, incrementItem, decrementItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
