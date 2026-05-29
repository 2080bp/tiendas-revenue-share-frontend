'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import { formatCLP } from '@/lib/utils'
import type { Product } from '@/types'
import { use, useState } from 'react'
import { ShoppingCart, ArrowLeft, Package, Truck, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ProductPage({ params }: { params: Promise<{ store: string; slug: string }> }) {
  const { store: storeSlug, slug } = use(params)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['storefront', storeSlug],
    queryFn: () => catalogApi.products(storeSlug).then(r =>
      Array.isArray(r.data) ? r.data : r.data.results ?? []
    ),
  })

  const product = products.find(p => p.slug === slug)

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <Package size={48} className="mx-auto mb-4 opacity-20" />
        <p>Producto no encontrado</p>
        <Link href={`/${storeSlug}`} className="text-sm underline mt-2 block">Volver a la tienda</Link>
      </div>
    </div>
  )

  const hasDiscount = product.compare_at_price &&
    parseFloat(product.compare_at_price) > parseFloat(product.price)

  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_at_price!)) * 100)
    : 0

  function handleAddToCart() {
    if (!product) return
    // En MVP guardamos en localStorage, en producción mandaremos al CartContext
    const stored = JSON.parse(localStorage.getItem(`cart_${storeSlug}`) || '[]')
    const existing = stored.find((i: { id: number }) => i.id === product.id)
    if (existing) existing.quantity += qty
    else stored.push({ ...product, quantity: qty })
    localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(stored))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/${storeSlug}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Imagen */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden">
              {product.main_image ? (
                <img src={product.main_image} alt={product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={64} className="text-gray-200" />
                </div>
              )}
            </div>
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-black text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.category_name && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {product.category_name}
              </p>
            )}

            <h1 className="text-3xl font-black leading-tight tracking-tight">{product.name}</h1>

            {product.short_description && (
              <p className="text-gray-500 leading-relaxed">{product.short_description}</p>
            )}

            {/* Precio */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black">{formatCLP(product.price)}</span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through mb-1">
                  {formatCLP(product.compare_at_price!)}
                </span>
              )}
            </div>

            {/* Stock */}
            {product.stock_mode === 'tracked' && product.stock <= 5 && product.stock > 0 && (
              <p className="text-amber-600 text-sm font-semibold">
                ⚠️ Solo quedan {product.stock} unidades
              </p>
            )}

            {/* Cantidad + Agregar */}
            {product.is_in_stock ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 text-lg font-bold transition">
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 text-lg font-bold transition">
                    +
                  </button>
                </div>

                <button onClick={handleAddToCart}
                  className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    added ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-gray-800'
                  }`}>
                  <ShoppingCart size={18} />
                  {added ? '¡Agregado al carrito! ✓' : 'Agregar al carrito'}
                </button>

                <Link href={`/${storeSlug}/checkout`}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all">
                  Comprar ahora
                </Link>
              </div>
            ) : (
              <button disabled
                className="w-full py-4 rounded-2xl font-bold text-base bg-gray-100 text-gray-400 cursor-not-allowed">
                Sin stock
              </button>
            )}

            {/* Garantías */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={14} className="text-gray-400" /> Pago seguro SSL
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck size={14} className="text-gray-400" /> Despacho a todo Chile
              </div>
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-gray-400">Descripción</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
