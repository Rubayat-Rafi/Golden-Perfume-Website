import { createContext, useState, useEffect, useMemo } from 'react';

export const CartContext = createContext(null);

const STORAGE_KEY = 'gp_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
};
