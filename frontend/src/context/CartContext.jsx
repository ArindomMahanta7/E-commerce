import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import { calculateTotalPaise } from "../utils/currency";
import { getStoredCart, setStoredCart } from "../utils/storage";

const CartContext = createContext(null);

/**
 * Frontend-managed shopping cart.
 *
 * IMPORTANT: the backend exposes NO cart endpoints. The mounted routers are
 * only /api/auth, /api/products, /api/orders, /api/payment and /api/analytics
 * - there is no /api/cart anywhere in the backend source. The cart is therefore
 * persisted in localStorage and every price/stock value is re-validated
 * against GET /api/products before an order is created. Nothing in the cart is
 * trusted as authoritative.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => getStoredCart());

  useEffect(() => {
    setStoredCart(items);
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);

    setItems((current) => {
      const existing = current.find((item) => item.productId === product._id);

      if (existing) {
        const maxStock = Number(product.stock) || Infinity;
        const nextQuantity = Math.min(existing.quantity + qty, maxStock);
        return current.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.imageURLs || "",
          stock: Number(product.stock) || 0,
          quantity: qty,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current.map((item) => {
        if (item.productId !== productId) return item;
        const maxStock = Number(item.stock) || Infinity;
        return {
          ...item,
          quantity: Math.min(Math.max(1, Number(quantity) || 1), maxStock),
        };
      })
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const totalPaise = calculateTotalPaise(items);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      itemCount: totalQuantity,
      totalPaise,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within <CartProvider>");
  return context;
}
