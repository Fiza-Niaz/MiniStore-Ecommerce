// app/cart/page.tsx
'use client';

import { useCart } from '@/store/useCart';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // Redirects user to Stripe payment page
            } else {
                alert('Checkout error');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
                <Link href="/" className="text-blue-600 underline">
                    Go back to shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-8">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b py-4">
                        <div className="flex items-center gap-4">
                            <img src={item.image} alt={item.title} className="w-16 h-16 object-contain" />
                            <div>
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-gray-500">
                                    ${item.price} x {item.quantity}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <div className="mt-6 flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={clearCart}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                    Clear Cart
                </button>
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Checkout'}
                </button>
            </div>
        </div>
    );
}