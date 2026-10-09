import {create} from 'zustand';
import {Product, CartItem} from '../types';

interface CartState {
    cart: CartItem[];
    addToCart: (item: Product) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
}

export const useCart = create<CartState>((set) => ({
    cart: [],
    addToCart: (product) =>
        set((state) => {
            const existing = state.cart.find((item) => item.id === product.id);
            if (existing) {
                return {
                    cart: state.cart.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }
            return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
    removeFromCart: (id) =>
        set((state) => ({
            cart: state.cart.filter((item) => item.id !== id),
        })),
    clearCart: () => set({ cart: [] }),
}));      