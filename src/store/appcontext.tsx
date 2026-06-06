'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';

// ================= TYPES =================

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  type: 'BANK' | 'EWALLET';
  color: string;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'STOCK' | 'SYSTEM' | 'REVIEW'; // Diselaraskan dengan enum Prisma
  isRead: boolean;
  link?: string;
  createdAt: string | Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userName: string; 
  totalAmount: number;
  shippingCost: number;
  paymentStatus: 'PENDING' | 'WAITING_VERIFICATION' | 'PAID' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
  paymentMethod?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REVIEWED';
  createdAt: string;
  updatedAt: string;
  paymentProofUrl?: string;
  trackingNumber?: string;
  courier?: string;
  shippingRecipient: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    productEmoji?: string;
    productBgColor?: string;
    image?: string;
    review?: any;
  }[];
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
  categoryId: string;
  image?: string | null;
  bgColor?: string | null;
  rating: number;
  stock: number;
  isActive?: boolean;
  originalPrice?: number | null;
  emoji?: string | null;
  weight?: number;
  categoryName?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  reviewCount: number;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product; 
  name?: string;
  price?: number;
  image?: string;
  stock?: number;
  category?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isActive?: boolean;
  createdAt?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// ================= CONTEXT TYPE =================

export interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  currentUser: User | null;
  isLoggedIn: boolean;
  orders: Order[];
  users: User[];
  bankAccounts: BankAccount[];
  loading: boolean;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  fetchBankAccounts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCart: (userId: string) => Promise<void>; 
  refreshWishlist: (userId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>; // 🚀 BARU: Sinkronisasi Notifikasi Database

  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;

  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addToCart: (item: Product) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartQty: (id: string, qty: number) => Promise<void>;
  toggleWishlist: (id: string) => Promise<void>; 

  login: (user: User) => void;
  loginGoogle: () => void; 
  logout: () => void;

  uploadPaymentProof: (orderId: string, proofUrl: string, paymentMethod: string) => Promise<void>;
  cancelOrder: (orderId: string) => void;
  updateOrderPaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>; // Diubah ke async db
  markAllNotificationsRead: () => Promise<void>;      // Diubah ke async db
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// ================= PROVIDER =================

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // ================= STATES =================
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🛠️ PERBAIKAN UTAMA: Kosongkan data tiruan mock data dari array state asal
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // ================= FETCH FUNCTIONS =================
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Gagal mengambil products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setProducts([]);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts');
      if (!res.ok) throw new Error('Gagal mengambil bank account');
      const data = await res.json();
      setBankAccounts(data);
    } catch (error) {
      console.error(error);
      setBankAccounts([]);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Gagal mengambil kategori');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Gagal mengambil orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Gagal mengambil users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  };

  const refreshCart = async (userId: string) => {
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      const result = await res.json();
      if (result.success) {
        setCart(result.data);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data cart database:", error);
    }
  };

  const refreshWishlist = async (userId: string) => {
    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`);
      const result = await res.json();
      if (result.success) {
        setWishlist(result.data.map((item: any) => item.productId));
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data wishlist database:", error);
    }
  };

  // 🚀 BARU: Tarik data Notifikasi Riil Milik Admin (userId = null) dari Database API
  const refreshNotifications = async () => {
    try {
      const res = await fetch('/api/notifications'); // Pastikan endpoint ini mengarah ke pencarian data db
      if (!res.ok) throw new Error('Gagal fetch notifikasi');
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data);
      } else if (Array.isArray(result)) {
        setNotifications(result);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data notifikasi database:", error);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        refreshCategories(),
        refreshOrders(),
        refreshUsers(),
        fetchBankAccounts(),
        refreshProducts(),
        refreshNotifications(), // 🚀 Jalankan penarikan notifikasi asli saat app pertama kali dimuat
      ]);

      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          setIsLoggedIn(true);
          
          await refreshCart(parsedUser.id);
          await refreshWishlist(parsedUser.id);
        } catch (e) {
          console.error(e);
        }
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try { setCart(JSON.parse(savedCart)); } catch (e) {}
        }
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
        }
      }

      setIsInitialized(true);
      setLoading(false);
    };

    initData();
  }, []);

  // Polling Sederhana: Sinkronisasi notifikasi admin secara otomatis setiap 15 detik
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      refreshNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // ================= SAVE TO LOCALSTORAGE (Offline Backup) =================
  useEffect(() => {
    if (isInitialized && !currentUser) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized, currentUser]);

  useEffect(() => {
    if (isInitialized && !currentUser) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isInitialized, currentUser]);

  // ================= ACTIONS =================
  
  const toggleWishlist = async (productId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId }),
      });
      const result = await res.json();
      if (result.success) {
        setWishlist((prev) => {
          if (result.isWishlisted) {
            return prev.includes(productId) ? prev : [...prev, productId];
          } else {
            return prev.filter((id) => id !== productId);
          }
        });
      }
    } catch (error) {
      console.error("Gagal memperbarui wishlist di Database:", error);
    }
  };

  const addCategory = (c: Category) => {
    setCategories((prev) => [c, ...prev]);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal update profile');
      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
    }
  };

  const addAddress = async (address: Address) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });

      if (!res.ok) throw new Error('Gagal tambah alamat');
      const newAddress = await res.json();

      const updatedUser = {
        ...currentUser,
        addresses: [...(currentUser.addresses || []), newAddress],
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
    }
  };

  const updateAddress = async (id: string, updatedData: Partial<Address>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error('Gagal memperbarui alamat di server');
      const updatedAddressFromDb = await res.json();

      const updatedAddresses = (currentUser.addresses || []).map((addr) => {
        if (addr.id === id) return updatedAddressFromDb;
        if (updatedData.isDefault && addr.id !== id) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });

      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updateAddress:", error);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/addresses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal delete alamat');

      const updatedUser = {
        ...currentUser,
        addresses: currentUser.addresses?.filter((addr) => addr.id !== id) || [],
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = async (item: Product) => {
    const activeUserId = currentUser?.id || 'user2';
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, productId: item.id }),
      });
      if (res.ok) {
        await refreshCart(activeUserId); 
      }
    } catch (error) {
      console.error("Gagal menambahkan ke database cart:", error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      }
    } catch (error) {
      console.error("Gagal menghapus item dari database:", error);
    }
  };

  const updateCartQty = async (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: qty }),
      });
      if (res.ok) {
        setCart((prev) =>
          prev.map((item) => (item.id === cartItemId ? { ...item, quantity: qty } : item))
        );
      }
    } catch (error) {
      console.error("Gagal mengubah kuantitas di database:", error);
    }
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = `role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`;
    refreshCart(user.id); 
    refreshWishlist(user.id);
  };

  const loginGoogle = () => {
    const mockGoogleUser: User = {
      id: 'user2', 
      name: 'User Google Toko',
      email: 'pangkalan.susu@gmail.com',
      role: 'CUSTOMER',
      isActive: true,
    };
    login(mockGoogleUser);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setCart([]);
    setWishlist([]); 
    setNotifications([]); // Bersihkan riwayat saat logout
  };

  const uploadPaymentProof = async (orderId: string, proofUrl: string, paymentMethod: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentProofUrl: proofUrl,
          paymentMethod,
          paymentStatus: 'WAITING_VERIFICATION',
        }),
      });

      if (!res.ok) throw new Error('Gagal upload bukti');

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentProofUrl: proofUrl,
                paymentMethod,
                paymentStatus: 'WAITING_VERIFICATION',
              }
            : order
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      )
    );
  };

  const updateOrderPaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o))
    );
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // 🚀 PERBAIKAN: Hubungkan aksi baca notifikasi ke Backend API database
  const markNotificationRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error(error);
    }
  };

  // 🚀 PERBAIKAN: Hubungkan aksi baca semua notifikasi ke Backend API database
  const markAllNotificationsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetch(`/api/notifications/read-all`, { method: 'PATCH' });
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      productCount: products.filter((p) => p.categoryId === cat.id).length,
    }));
  }, [categories, products]);

  return (
    <AppContext.Provider
      value={{
        products,
        categories: categoriesWithCount,
        cart,
        wishlist,
        currentUser,
        isLoggedIn,
        orders,
        setOrders,
        users,
        bankAccounts,
        loading,
        fetchBankAccounts,
        refreshCategories,
        refreshOrders,
        refreshUsers,
        refreshCart, 
        refreshWishlist,
        refreshNotifications, // Diekspos secara global
        setProducts,
        setCategories,
        setUsers,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        addCategory,
        updateCategory,
        deleteCategory,
        addToCart,
        removeFromCart,
        updateCartQty,
        toggleWishlist,
        login,
        loginGoogle, 
        logout,
        uploadPaymentProof,
        cancelOrder,
        updateOrderPaymentStatus,
        updateOrderStatus,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}