// app/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/store/useCart';

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('https://dummyjson.com/products?limit=100');
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();

  // Normalize response data so every product has a single 'image' property
  return data.products.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    description: item.description,
    category: item.category,
    image: item.thumbnail || item.images?.[0] || '',
  }));
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const addToCart = useCart((state) => state.addToCart);

  // Extract unique categories dynamically for navigation links
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products based only on search term
  const filteredProducts = products.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) return <div className="text-center py-10 font-semibold">Loading products...</div>;
  if (isError) return <div className="text-center py-10 text-red-500">Error fetching products.</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">All products</h1>
        <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} products found.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2 text-sm text-gray-500 hover:text-black"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Navigation Links (Directs to dedicated route) */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/category/${encodeURIComponent(cat.toLowerCase())}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition capitalize bg-gray-100 text-gray-700 hover:bg-black hover:text-white"
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products match your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              {/* Clickable Product Link */}
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

              {/* Price and Cart Action */}
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
      )}
    </div>
  );
}