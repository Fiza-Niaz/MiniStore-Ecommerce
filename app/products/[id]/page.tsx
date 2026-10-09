// app/products/[id]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { Product } from '@/types';
import Link from 'next/link';

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

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => fetchProduct(id),
    });

    const addToCart = useCart((state) => state.addToCart);

    if (isLoading) return <div className="text-center py-12 font-semibold">Loading product details...</div>;
    if (isError || !product) return <div className="text-center py-12 text-red-500">Product not found.</div>;

    // Direct route to dedicated Buy Now page (DOES NOT touch useCart)
    const handleBuyNow = () => {
        router.push(`/buy-now?id=${product.id}&quantity=1`);
    };

    return (
        <div className="max-w-6xl mx-auto my-8 p-4">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-black mb-6 inline-block">
                ← Back to products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 items-start">
                <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-center w-full min-h-[350px]">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="max-h-[400px] w-auto object-contain"
                    />
                </div>

                <div className="flex flex-col justify-between h-full space-y-6">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{product.title}</h1>
                        <p className="text-3xl font-bold text-blue-600 mb-6">${product.price}</p>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition"
                        >
                            Add to Cart
                        </button>

                        <Link
                            href={`/buy-now?id=${product.id}&quantity=1`}
                            className="flex-1 bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-600 transition shadow-md text-center block"
                        >
                            Buy Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}