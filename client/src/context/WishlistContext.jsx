import { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext(null);

const STORAGE_KEY = 'gp_wishlist';

export const WishlistProvider = ({ children }) => {
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

  const isWishlisted = (id) => items.some((i) => i.id === id);

  const toggleItem = (product) => {
    setItems((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, product]
    );
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const clearWishlist = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, toggleItem, removeItem, clearWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
