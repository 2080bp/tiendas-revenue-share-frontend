'use client'
import { useQuery } from '@tanstack/react-query'
import { salesApi } from '@/lib/api'
import { formatCLP, formatDate, cn } from '@/lib/utils'
import { useState } from 'react'
import { Search, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface SaleItem {
  id: number
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
}

interface Sale {
  id: number
  order_ref: string
  status: string
  source: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_region: string
  shipping_cost: string
  total_gross: string
  total_net: string
  items: SaleItem[]
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; variant: 'warning' | 'success' | 'info' | 'purple' | 'default' | 'danger' }> = {
  pending:   { label: 'Pendiente',       variant: 'warning' },
  paid:      { label: 'Pagado',          variant: 'success' },
  preparing: { label: 'Preparando',      variant: 'info' },
  shipped:   { label: 'Enviado',         variant: 'purple' },
  delivered: { label: 'Entregado',       variant: 'success' },
  refunded:  { label: 'Devuelto',        variant: 'default' },
  cancelled: { label: 'Anulado',         variant: 'danger' },
}

const SOURCE_LABELS: Record<string, string> = {
  webpay: 'Webpay', flow: 'Flow', mercadopago: 'Mercado Pago',
  manual: 'Manual', transfer: 'Transferencia',
}

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const { data, isLoading } = useQuery<Sale[]>({
    queryKey: ['my-sales', statusFilter],
    queryFn: () => salesApi.mySales(statusFilter ? { status: statusFilter } : undefined)
      .then(r => Array.isArray(r.data) ? r.data : r.data.results ?? []),
    refetchInterval: 30000, // refresca cada 30s automáticamente
  })

  const sales = data ?? []
  const filtered = sales.filter(s =>
    !search ||
    s.order_ref.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_email.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_name.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = sales
    .filter(s => ['paid', 'preparing', 'shipped', 'delivered'].includes(s.status))
    .reduce((acc, s) => acc + parseFloat(s.total_gross), 0)

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Pedidos</h1>
        <p className="text-gray-400 text-sm mt-0.5">{sales.length} pedidos recibidos</p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       value: sales.length,                                          suffix: '' },
          { label: 'Pagados',     value: sales.filter(s => s.status === 'paid').length,          suffix: '' },
          { label: 'Pendientes',  value: sales.filter(s => s.status === 'pending').length,       suffix: '' },
          { label: 'Ingresos',    value: formatCLP(totalRevenue),                                suffix: '' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
            <p className="text-xl font-black mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar pedido, email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <ShoppingBag size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600 mb-1">Aún no tienes pedidos</p>
          <p className="text-sm text-gray-400">Cuando alguien compre en tu tienda, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sale => {
            const st = STATUS_LABELS[sale.status] ?? { label: sale.status, variant: 'default' as const }
            const isOpen = expanded === sale.id

            return (
              <div key={sale.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                {/* Fila principal */}
                <button onClick={() => setExpanded(isOpen ? null : sale.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-sm">{sale.order_ref}</span>
                      <Badge variant={st.variant}>{st.label}</Badge>
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {SOURCE_LABELS[sale.source] || sale.source}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {sale.customer_name} · {sale.customer_email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black">{formatCLP(sale.total_gross)}</p>
                    <p className="text-xs text-gray-400">{formatDate(sale.created_at)}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                </button>

                {/* Detalle expandido */}
                {isOpen && (
                  <div className="border-t border-gray-50 p-5 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cliente</p>
                        <p className="font-medium">{sale.customer_name}</p>
                        <p className="text-gray-500">{sale.customer_email}</p>
                        {sale.customer_phone && <p className="text-gray-500">{sale.customer_phone}</p>}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Envío</p>
                        <p className="text-gray-600">{sale.shipping_address}</p>
                        <p className="text-gray-500">{sale.shipping_city}{sale.shipping_region ? `, ${sale.shipping_region}` : ''}</p>
                        <p className="text-gray-400 text-xs mt-1">Costo envío: {formatCLP(sale.shipping_cost)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Productos</p>
                      <div className="space-y-2">
                        {sale.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm bg-white p-3 rounded-xl">
                            <span className="text-gray-700">{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                            <span className="font-semibold">{formatCLP(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="text-sm space-y-1 text-right">
                        <div className="flex gap-8 text-gray-500">
                          <span>Neto (sin IVA)</span>
                          <span>{formatCLP(sale.total_net)}</span>
                        </div>
                        <div className="flex gap-8 font-black text-base">
                          <span>Total</span>
                          <span>{formatCLP(sale.total_gross)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
