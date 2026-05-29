'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi, storesApi } from '@/lib/api'
import { formatCLP } from '@/lib/utils'
import type { Product, Store } from '@/types'
import { useState, use } from 'react'
import { ShoppingCart, Search, MessageCircle, Package } from 'lucide-react'
import { CartDrawer } from '@/components/storefront/CartDrawer'

export type CartItem = Product & { quantity: number }

export default function StorefrontPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = use(params)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['storefront', storeSlug],
    queryFn: () => catalogApi.products(storeSlug).then(r =>
      Array.isArray(r.data) ? r.data : r.data.results ?? []
    ),
  })

  // Info básica de la tienda desde los productos (o endpoint público futuro)
  const storeName = storeSlug.replace(/-/g, ' ')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const featured = products.filter(p => p.is_featured).slice(0, 3)

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar de la tienda */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <h1 className="text-lg font-black capitalize tracking-tight truncate">{storeName}</h1>

          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <button onClick={() => setCartOpen(true)}
            className="relative p-2.5 hover:bg-gray-50 rounded-xl transition">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Búsqueda mobile */}
        <div className="sm:hidden mb-6">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        {/* Productos destacados */}
        {!search && featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} featured />
              ))}
            </div>
          </section>
        )}

        {/* Todos los productos */}
        <section>
          {!search && (
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              {products.length} producto{products.length !== 1 ? 's' : ''}
            </h2>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-2xl mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Package size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">{search ? 'Sin resultados' : 'Próximamente'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">
          Tienda impulsada por <span className="font-bold text-black">2080 Tiendas</span>
        </p>
      </footer>

      {/* Carrito */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        total={cartTotal}
        onUpdateQty={(id, qty) => setCart(prev =>
          qty === 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: qty } : i)
        )}
      />
    </div>
  )
}

function ProductCard({ product, onAdd, featured }: {
  product: Product
  onAdd: (p: Product) => void
  featured?: boolean
}) {
  const hasDiscount = product.compare_at_price &&
    parseFloat(product.compare_at_price) > parseFloat(product.price)

  return (
    <div className={`group cursor-pointer ${featured ? 'sm:col-span-1' : ''}`}>
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
        {product.main_image ? (
          <img src={product.main_image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-200" />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_at_price!)) * 100)}%
          </span>
        )}

        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500">Sin stock</span>
          </div>
        )}

        {product.is_in_stock && (
          <button onClick={() => onAdd(product)}
            className="absolute bottom-2 right-2 bg-black text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg">
            <ShoppingCart size={14} />
          </button>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-black">{formatCLP(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatCLP(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
