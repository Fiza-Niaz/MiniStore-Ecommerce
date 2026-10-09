// app/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/useCart';
import Link from 'next/link';

export default function SuccessPage() {
    const clearCart = useCart((state) => state.clearCart);

    useEffect(() => {
        clearCart(); // Clear cart state on successful payment
    }, [clearCart]);

    return (
        <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful! 🎉</h1>
            <p className="text-gray-600 mb-6">Thank you for your order.</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Continue Shopping
            </Link>
        </div>
    );
}