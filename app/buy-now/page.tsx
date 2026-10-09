// app/buy-now/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';

async function fetchProduct(id: string): Promise<Product> {
    const res = await fetch(`https://dummyjson.com/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    const data = await res.json();
    return {
        id: data.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.thumbnail || data.images?.[0] || '',
    };
}

function BuyNowContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const quantity = Number(searchParams.get('quantity')) || 1;
    const [loading, setLoading] = useState(false);

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['buy-now-product', id],
        queryFn: () => fetchProduct(id!),
        enabled: !!id,
    });

    if (!id || isError) return <div className="text-center py-12 text-red-500">Invalid Product.</div>;
    if (isLoading || !product) return <div className="text-center py-12 font-semibold">Loading checkout...</div>;

    const handleProceedToPay = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ ...product, quantity }] }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to initiate checkout.');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to checkout server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold mb-6 border-b pb-4">Direct Buy Now Checkout</h1>

            <div className="flex gap-6 items-center mb-6">
                <img src={product.image} alt={product.title} className="w-24 h-24 object-contain bg-gray-50 p-2 rounded-lg" />
                <div>
                    <h2 className="text-xl font-semibold">{product.title}</h2>
                    <p className="text-gray-500 text-sm">Quantity: {quantity}</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">${product.price * quantity}</p>
                </div>
            </div>

            <button
                onClick={handleProceedToPay}
                disabled={loading}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            >
                {loading ? 'Redirecting to Stripe...' : 'Proceed to Payment'}
            </button>
        </div>
    );
}

export default function BuyNowPage() {
    return (
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <BuyNowContent />
        </Suspense>
    );
}