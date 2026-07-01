import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopHomeProduct } from "@/app/queries/shop";

// componentsMainpage şablonunun beklediği sepet + favori store'u.
// Sanity Product yerine Prisma ShopHomeProduct ile çalışır.
export interface CartItem {
  product: ShopHomeProduct;
  quantity: number;
}

interface StoreState {
  items: CartItem[];
  favoriteProduct: ShopHomeProduct[];

  addItem: (product: ShopHomeProduct) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getItemCount: (productId: string) => number;
  getTotalPrice: () => number;
  getSubtotalPrice: () => number;
  getGroupedItems: () => CartItem[];

  addToFavorite: (product: ShopHomeProduct) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
}

const useCartStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProduct: [],

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product.id === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),

      deleteCartProduct: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      resetCart: () => set({ items: [] }),

      getItemCount: (productId) => {
        const item = get().items.find((i) => i.product.id === productId);
        return item ? item.quantity : 0;
      },

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getSubtotalPrice: () =>
        get().items.reduce((total, item) => {
          const base = item.product.oldPrice ?? item.product.price;
          return total + base * item.quantity;
        }, 0),

      getGroupedItems: () => get().items,

      addToFavorite: (product) => {
        return new Promise<void>((resolve) => {
          set((state) => {
            const exists = state.favoriteProduct.some(
              (p) => p.id === product.id
            );
            return {
              favoriteProduct: exists
                ? state.favoriteProduct.filter((p) => p.id !== product.id)
                : [...state.favoriteProduct, product],
            };
          });
          resolve();
        });
      },

      removeFromFavorite: (productId) =>
        set((state) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (p) => p.id !== productId
          ),
        })),

      resetFavorite: () => set({ favoriteProduct: [] }),
    }),
    {
      name: "shop-cart-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
