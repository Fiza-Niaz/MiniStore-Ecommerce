// src/app/layout.tsx
import QueryProvider from '@/providers/QueryProvider';
import Navbar from '@/components/Navbar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <QueryProvider>
           <Navbar /> 
          <main className="max-w-7xl mx-auto p-4">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}