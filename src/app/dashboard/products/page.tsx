'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import { formatCLP, cn } from '@/lib/utils'
import type { Product } from '@/types'
import Link from 'next/link'
import { Plus, Package, Search } from 'lucide-react'
import { useState } from 'react'

export default function ProductsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery<{ results?: Product[] } | Product[]>({
    queryKey: ['my-products'],
    queryFn: () => catalogApi.myProducts().then(r => r.data),
  })

  const products: Product[] = Array.isArray(data) ? data : (data?.results ?? [])
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos en tu tienda</p>
        </div>
        <Link href="/dashboard/products/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
          <Plus size={16} />
          Agregar producto
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        />
      </div>

      {/* Lista de productos */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Producto</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Precio</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Origen</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.main_image
                          ? <img src={p.main_image} alt={p.name} className="w-full h-full object-cover" />
                          : <Package size={16} className="m-auto text-gray-400 mt-2.5" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-sm hover:underline">{p.name}</p>
                        {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <p className="text-sm font-semibold">{formatCLP(p.price)}</p>
                    {p.compare_at_price && (
                      <p className="text-xs text-gray-400 line-through">{formatCLP(p.compare_at_price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <StockBadge product={p} />
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full',
                      p.source === 'own' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
                    )}>
                      {p.source === 'own' ? 'Propio' : 'Dropshipping'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full',
                      p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {p.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StockBadge({ product }: { product: Product }) {
  if (product.stock_mode === 'infinite') return <span className="text-xs text-gray-400">∞ Ilimitado</span>
  if (product.stock_mode === 'made_to_order') return <span className="text-xs text-blue-600 font-medium">Bajo pedido</span>
  const color = product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'
  return <span className={cn('text-sm font-semibold', color)}>{product.stock}</span>
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
      <Package size={40} className="text-gray-200 mx-auto mb-4" />
      <p className="font-semibold text-gray-700 mb-1">Aún no tienes productos</p>
      <p className="text-sm text-gray-400 mb-6">Agrega tu primer producto propio o importa desde dropshipping</p>
      <Link href="/dashboard/products/new"
        className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
        <Plus size={15} />
        Agregar primer producto
      </Link>
    </div>
  )
}
