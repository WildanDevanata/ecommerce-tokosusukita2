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
  userName: string;
  totalAmount: number;
  paymentStatus:
    | 'PENDING'
    | 'PAID'
    | 'FAILED';

  paymentMethod: string;

  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

  createdAt: string;
  updatedAt: string;

  paymentProofUrl?: string;
  shippingRecipient?: string;

  items?: {
    productName: string;
    quantity: number;
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
  categoryName: string;
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
}

// ================= CONTEXT TYPE =================

interface AppContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];

  currentUser: User | null;
  isLoggedIn: boolean;

  orders: Order[];
  users: User[];

  bankAccounts: BankAccount[];

  loading: boolean;

  fetchBankAccounts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshUsers: () => Promise<void>;

  setProducts: React.Dispatch<
    React.SetStateAction<Product[]>
  >;

  setCategories: React.Dispatch<
    React.SetStateAction<Category[]>
  >;

  setUsers: React.Dispatch<
    React.SetStateAction<User[]>
  >;

  addCategory: (
    category: Category
  ) => void;

  updateCategory: (
    id: string,
    data: Partial<Category>
  ) => void;

  deleteCategory: (
    id: string
  ) => void;

  addToCart: (item: Product) => void;

  removeFromCart: (
    id: string
  ) => void;

  login: (user: User) => void;

  logout: () => void;

  updateOrderPaymentStatus: (
    orderId: string,
    status: Order['paymentStatus']
  ) => void;

  updateOrderStatus: (
    orderId: string,
    status: Order['status']
  ) => void;
}

const AppContext =
  createContext<AppContextType | undefined>(
    undefined
  );

// ================= PROVIDER =================

export const AppProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // ================= STATES =================

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [bankAccounts, setBankAccounts] =
    useState<BankAccount[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ================= FETCH =================

  const fetchBankAccounts =
    async () => {
      try {
        setLoading(true);

        const res = await fetch(
          '/api/bank-accounts'
        );

        if (!res.ok) {
          throw new Error(
            'Gagal mengambil bank account'
          );
        }

        const data = await res.json();

        setBankAccounts(data);
      } catch (error) {
        console.error(error);

        setBankAccounts([]);
      } finally {
        setLoading(false);
      }
    };

  const refreshCategories =
    async () => {
      try {
        const res = await fetch(
          '/api/categories'
        );

        if (!res.ok) {
          throw new Error(
            'Gagal mengambil kategori'
          );
        }

        const data = await res.json();

        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

  const refreshOrders =
    async () => {
      try {
        const res = await fetch(
          '/api/orders'
        );

        if (!res.ok) {
          throw new Error(
            'Gagal mengambil orders'
          );
        }

        const data = await res.json();

        setOrders(data);
      } catch (error) {
        console.error(error);

        setOrders([]);
      }
    };

  const refreshUsers =
    async () => {
      try {
        const res = await fetch(
          '/api/users'
        );

        if (!res.ok) {
          throw new Error(
            'Gagal mengambil users'
          );
        }

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

    const savedUser =
      localStorage.getItem('user');

    const savedCart =
      localStorage.getItem('cart');

    if (savedUser) {
      setCurrentUser(
        JSON.parse(savedUser)
      );

      setIsLoggedIn(true);
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // ================= SAVE CART =================

  useEffect(() => {
    localStorage.setItem(
      'cart',
      JSON.stringify(cart)
    );
  }, [cart]);

  // ================= ACTIONS =================

  const addCategory = (
    c: Category
  ) => {
    setCategories((prev) => [
      c,
      ...prev,
    ]);
  };

  const updateCategory = (
    id: string,
    data: Partial<Category>
  ) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...data }
          : c
      )
    );
  };

  const deleteCategory = (
    id: string
  ) => {
    setCategories((prev) =>
      prev.filter((c) => c.id !== id)
    );
  };

  const updateOrderPaymentStatus = (
    orderId: string,
    status: Order['paymentStatus']
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: status,
            }
          : o
      )
    );
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order['status']
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status }
          : o
      )
    );
  };

  const addToCart = (
    item: Product
  ) => {
    setCart((prev) => {
      const exist = prev.find(
        (i) => i.id === item.id
      );

      if (exist) {
        return prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity:
                  i.quantity + 1,
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (
    id: string
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  };

  const login = (user: User) => {
    setCurrentUser(user);

    setIsLoggedIn(true);

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );
  };

  const logout = () => {
    setCurrentUser(null);

    setIsLoggedIn(false);

    localStorage.removeItem('user');
    localStorage.removeItem('cart');

    setCart([]);
  };

  // ================= DERIVED =================

  const categoriesWithCount =
    useMemo(() => {
      return categories.map((cat) => ({
        ...cat,

        productCount: products.filter(
          (p) =>
            p.categoryName?.toLowerCase() ===
            cat.name?.toLowerCase()
        ).length,
      }));
    }, [categories, products]);

  // ================= PROVIDER =================

  return (
    <AppContext.Provider
      value={{
        products,
        categories:
          categoriesWithCount,
        cart,
        currentUser,
        isLoggedIn,
        orders,
        users,
        bankAccounts,
        loading,

        setProducts,
        setCategories,
        setUsers,

        refreshCategories,
        refreshOrders,
        refreshUsers,

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ================= HOOK =================

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return context;
}