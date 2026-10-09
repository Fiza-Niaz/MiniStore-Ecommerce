// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/useCart';

export default function Navbar() {
    const cart = useCart((state) => state.cart);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    MiniStore
                </Link>
                <Link href="/cart" className="relative flex items-center gap-2 font-medium">
                    <ShoppingCart className="w-6 h-6" />
                    <span>Cart</span>
                    {totalItems > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {totalItems}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
}