'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// ================= TYPES =================
// (Tetap sama seperti kode kamu)
export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  type: 'BANK' | 'EWALLET';
  color: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userName: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentProofUrl?: string;
  shippingRecipient?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryName: string;
  emoji: string;
  image?: string;
  bgColor: string;
  rating: number;
  stock: number;
  isActive?: boolean;
  category?: {         // Objek kategori hasil join
    id: string;
    name: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

// ================= CONTEXT TYPE =================
interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  currentUser: User | null;
  isLoggedIn: boolean;
  orders: Order[];
  bankAccounts: BankAccount[];
  fetchBankAccounts: () => Promise<void>;
  loading: boolean;

  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  refreshCategories: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  login: (user: User) => void;
  logout: () => void;

  updateOrderPaymentStatus: (orderId: string, status: string) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ================= PROVIDER =================
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // --- STATES ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH FUNCTIONS ---
  const fetchBankAccounts = async () => {
  try {
    setLoading(true);
    const res = await fetch('/api/bank-accounts');
    
    if (!res.ok) {
      // Ambil pesan error dari server jika ada
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Gagal ambil data bank');
    }

    const data = await res.json();
    setBankAccounts(data);
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    // Berikan data kosong agar UI tidak error saat looping .filter atau .map
    setBankAccounts([]); 
  } finally {
    setLoading(false);
  }
};

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Gagal mengambil data kategori');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error refreshCategories:", error);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Gagal mengambil data pesanan');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error refreshOrders:", error);
    }
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    // Jalankan semua fetch awal
    refreshCategories();
    refreshOrders();
    fetchBankAccounts();

    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Simpan Cart ke LocalStorage saat berubah
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // --- ACTIONS ---
  const addCategory = (c: Category) => setCategories(prev => [c, ...prev]);
  
  const updateCategory = (id: string, data: Partial<Category>) => 
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  
  const deleteCategory = (id: string) => 
    setCategories(prev => prev.filter(c => c.id !== id));
  
  const updateOrderPaymentStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status } : o));
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const idToFind = item.id || item.productId;
      const exist = prev.find(i => i.id === idToFind);
      if (exist) {
        return prev.map(i => 
          i.id === idToFind ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [...prev, { ...item, id: idToFind, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCart([]);
  };

  // --- DERIVED STATE ---
  const categoriesWithCount = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      productCount: products.filter(p => 
        p.categoryName?.toLowerCase() === cat.name?.toLowerCase()
      ).length
    }));
  }, [categories, products]);

  return (
    <AppContext.Provider value={{
      products,
      categories: categoriesWithCount,
      cart,
      currentUser,
      isLoggedIn,
      orders,
      bankAccounts,
      loading,
      setProducts,
      setCategories,
      refreshCategories,
      refreshOrders,
      fetchBankAccounts,
      addCategory,
      updateCategory,
      deleteCategory,
      addToCart,
      removeFromCart,
      login,
      logout,
      updateOrderPaymentStatus,
      updateOrderStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}