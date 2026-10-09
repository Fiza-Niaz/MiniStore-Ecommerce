// app/category/[categoryName]/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';

async function fetchCategoryProducts(category: string): Promise<Product[]> {
    const res = await fetch(`https://dummyjson.com/products/category/${category}`);
    if (!res.ok) throw new Error('Failed to fetch category products');
    const data = await res.json();

    return data.products.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        description: item.description,
        category: item.category,
        image: item.thumbnail || item.images?.[0] || '',
    }));
}

function CategoryProductsContent() {
    const params = useParams();
    // Decode URL parameter to handle spaces or special characters (e.g., "mens-shoes")
    const rawCategory = params.categoryName as string;
    const categoryName = decodeURIComponent(rawCategory);

    const [sortBy, setSortBy] = useState<'best' | 'low-high' | 'high-low'>('best');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ['category-products', categoryName],
        queryFn: () => fetchCategoryProducts(categoryName),
        enabled: !!categoryName,
    });

    const addToCart = useCart((state) => state.addToCart);

    // Sort logic for category products
    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'low-high') return a.price - b.price;
        if (sortBy === 'high-low') return b.price - a.price;
        return 0; // 'best' keeps standard API order
    });

    if (isLoading) return <div className="text-center py-12 font-semibold">Loading {categoryName}...</div>;
    if (isError) return <div className="text-center py-12 text-red-500">Failed to load products for this category.</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
            {/* Breadcrumb Navigation */}
            <nav className="text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:text-black">Home</Link>
                <span className="mx-2">/</span>
                <span className="capitalize font-medium text-gray-900">{categoryName.replace('-', ' ')}</span>
            </nav>

            {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold capitalize">{categoryName.replace('-', ' ')}</h1>
                    <p className="text-gray-500 text-sm mt-1">Showing {sortedProducts.length} results</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="sortBy" className="text-sm font-medium text-gray-600">Sort By:</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="best">Best Match</option>
                            <option value="low-high">Price low to high</option>
                            <option value="high-low">Price high to low</option>
                        </select>
                    </div>

                    {/* View Toggle Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <button
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid View"
                            className={`p-2 transition ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 002-2h2a2 2 0 002 2v2a2 2 0 00-2 2h-2a2 2 0 00-2-2V5zM14 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            aria-label="List View"
                            className={`p-2 transition ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Display */}
            {sortedProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No products found in this category.</div>
            ) : viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
                        >
                            <Link href={`/products/${product.id}`} className="group cursor-pointer">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="h-48 w-full object-contain mb-4 group-hover:scale-105 transition"
                                />
                                <h2 className="font-semibold text-base line-clamp-1 group-hover:text-blue-600">
                                    {product.title}
                                </h2>
                                <p className="text-gray-500 text-xs mb-2 line-clamp-2">{product.description}</p>
                            </Link>
                            <div>
                                <p className="text-lg font-bold text-gray-900 my-2">${product.price}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* LIST VIEW */
                <div className="space-y-4">
                    {sortedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
                        >
                            <Link
                                href={`/products/${product.id}`}
                                className="flex flex-col sm:flex-row items-center gap-6 flex-1 group cursor-pointer"
                            >
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-32 h-32 object-contain bg-gray-50 p-2 rounded-lg flex-shrink-0 group-hover:scale-105 transition"
                                />
                                <div>
                                    <h2 className="font-semibold text-lg group-hover:text-blue-600">
                                        {product.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                                </div>
                            </Link>

                            <div className="flex flex-col items-end justify-between sm:min-w-[140px] border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                                <p className="text-xl font-bold text-orange-600 mb-3">${product.price}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full sm:w-auto bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoryPage() {
    return (
        <Suspense fallback={<div className="text-center py-12">Loading category...</div>}>
            <CategoryProductsContent />
        </Suspense>
    );
}