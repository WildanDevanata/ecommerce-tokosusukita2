'use client'; 
import React, { createContext, useContext, useState } from 'react';

// 1. Definisikan tipe data Produk (Agar sinkron dengan UI)
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryName: string;
  emoji: string;
  bgColor: string;
  rating: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface AppContextType {
  products: Product[]; // Tambahkan ini agar page.tsx tidak error
  cart: CartItem[];
  addToCart: (item: any) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Data Produk (Didefinisikan di sini sebagai data utama aplikasi)
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Susu Formula Bayi A', slug: 'susu-formula-a', price: 150000, categoryName: 'Susu Bayi', emoji: '🍼', bgColor: 'bg-blue-50', rating: 4.8, stock: 20 },
  { id: '2', name: 'Popok Sekali Pakai M', slug: 'popok-sekali-pakai', price: 85000, categoryName: 'Popok', emoji: '🧷', bgColor: 'bg-green-50', rating: 4.5, stock: 15 },
  { id: '3', name: 'Bubur Bayi Organik', slug: 'bubur-organik', price: 45000, categoryName: 'Makanan Bayi', emoji: '🥣', bgColor: 'bg-orange-50', rating: 4.9, stock: 5 },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const addToCart = (newItem: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === (newItem.id || newItem.productId));
      
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id === (newItem.id || newItem.productId))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...newItem, id: newItem.id || newItem.productId }];
    });
    
    alert(`${newItem.name} berhasil ditambah ke keranjang!`);
  };

  return (
    // Tambahkan 'products' ke dalam value Provider
    <AppContext.Provider value={{ products, cart, addToCart, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp harus digunakan di dalam AppProvider');
  }
  return context;
}