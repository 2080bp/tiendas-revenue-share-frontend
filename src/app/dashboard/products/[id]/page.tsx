'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import { ProductForm } from '@/components/dashboard/ProductForm'
import type { Product } from '@/types'
import { use } from 'react'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => catalogApi.myProducts({ id }).then(r => {
      // Fallback: busca en la lista
      const list: Product[] = Array.isArray(r.data) ? r.data : r.data.results ?? []
      return list.find(p => p.id === parseInt(id))!
    }),
  })

  if (isLoading) return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-32" />
      ))}
    </div>
  )

  if (!product) return (
    <div className="p-8 text-center text-gray-400">Producto no encontrado</div>
  )

  return <ProductForm product={product} />
}
