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

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userName: string; 
  totalAmount: number;
  shippingCost: number;
  paymentStatus: 'PENDING' | 'WAITING_VERIFICATION' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  paymentProofUrl?: string;
  trackingNumber?: string;
  courier?: string;

  // --- PRISMA FLAT FIELDS ---
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
  image?: string;
  bgColor: string;
  rating: number;
  stock: number;
  isActive?: boolean;

  category?: {
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
  currentUser: User | null;
  isLoggedIn: boolean;
  orders: Order[];
  users: User[];
  bankAccounts: BankAccount[];
  loading: boolean;

  // Fetching & Refreshers
  fetchBankAccounts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshUsers: () => Promise<void>;

  // State Setters (Dipakai jika butuh manipulasi manual dari luar)
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  // Profile & Address Actions
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart Actions
  addToCart: (item: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;

  // Auth Actions
  login: (user: User) => void;
  logout: () => void;

  // Order Actions
  uploadPaymentProof: (orderId: string, proofUrl: string, paymentMethod: string) => Promise<void>;
  cancelOrder: (orderId: string) => void;
  updateOrderPaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

// Tambahkan eksport pada AppContext agar bisa diakses jika dibutuhkan secara langsung
export const AppContext = createContext<AppContextType | undefined>(undefined);

// ================= PROVIDER =================

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // ================= STATES =================
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const res = await fetch('/api/bank-accounts');
      if (!res.ok) throw new Error('Gagal mengambil bank account');
      const data = await res.json();
      setBankAccounts(data);
    } catch (error) {
      console.error(error);
      setBankAccounts([]);
    } finally {
      setLoading(false);
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

  // ================= INITIAL LOAD =================
  useEffect(() => {
    refreshCategories();
    refreshOrders();
    refreshUsers();
    fetchBankAccounts();
    refreshProducts();

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

  // ================= SAVE CART TO LOCALSTORAGE =================
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ================= ACTIONS =================

  // --- Category Actions ---
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

  // --- Profile & Address Actions ---
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
      alert("Gagal memperbarui alamat. Silakan periksa koneksi Anda.");
    }
  };

  const deleteAddress = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/addresses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal hapus alamat');

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

  // --- Cart Actions ---
  const addToCart = (item: Product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  // --- Auth Actions ---
  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = `role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setCart([]);
  };

  // --- Order Actions ---
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
      alert("Gagal menyimpan bukti pembayaran ke server.");
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

  // ================= DERIVED STATE =================
  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      productCount: products.filter((p) => p.categoryId === cat.id).length,
    }));
  }, [categories, products]);

  // ================= RETURN PROVIDER =================
  return (
    <AppContext.Provider
      value={{
        products,
        categories: categoriesWithCount,
        cart,
        currentUser,
        isLoggedIn,
        orders,
        users,
        bankAccounts,
        loading,
        fetchBankAccounts,
        refreshCategories,
        refreshOrders,
        refreshUsers,
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
        login,
        logout,
        uploadPaymentProof,
        cancelOrder,
        updateOrderPaymentStatus,
        updateOrderStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ================= HOOK =================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}