'use client'
import { useQuery } from '@tanstack/react-query'
import { salesApi } from '@/lib/api'
import { formatCLP } from '@/lib/utils'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ShoppingBag, DollarSign, Receipt, Package } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface DailyPoint   { date: string; revenue: number; orders: number }
interface TopProduct   { name: string; units: number; revenue: number }
interface ByStatus     { status: string; count: number }
interface BySource     { source: string; count: number; revenue: number }

interface Analytics {
  period: number
  summary: {
    revenue: number; revenue_prev: number; revenue_pct: number | null
    orders: number;  orders_prev: number;  orders_pct: number | null
    avg_ticket: number; avg_prev: number; avg_pct: number | null
  }
  daily: DailyPoint[]
  top_products: TopProduct[]
  by_status: ByStatus[]
  by_source: BySource[]
}

// ── Mini helpers ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', preparing: 'Preparando',
  shipped: 'Enviado', delivered: 'Entregado', refunded: 'Devuelto', cancelled: 'Anulado',
}
const SOURCE_LABELS: Record<string, string> = {
  webpay: 'Webpay', flow: 'Flow', mercadopago: 'Mercado Pago',
  manual: 'Manual', transfer: 'Transferencia',
}
const STATUS_COLORS: Record<string, string> = {
  pending: '#d97706', paid: '#059669', preparing: '#2563eb',
  shipped: '#7c3aed', delivered: '#10b981', refunded: '#6b7280', cancelled: '#ef4444',
}
const SOURCE_COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#0d9488']

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-gray-400">sin datos previos</span>
  const pos = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {pos ? '+' : ''}{pct}%
    </span>
  )
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function LineChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Sin datos</div>
  )

  const W = 600, H = 160, PAD = { t: 10, r: 10, b: 30, l: 60 }
  const iW = W - PAD.l - PAD.r
  const iH = H - PAD.t - PAD.b

  const maxRev = Math.max(...data.map(d => d.revenue), 1)
  const xs = data.map((_, i) => PAD.l + (i / Math.max(data.length - 1, 1)) * iW)
  const ys = data.map(d => PAD.t + iH - (d.revenue / maxRev) * iH)

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const area = `${path} L${xs[xs.length - 1].toFixed(1)},${(PAD.t + iH).toFixed(1)} L${PAD.l.toFixed(1)},${(PAD.t + iH).toFixed(1)} Z`

  // Y axis labels (4 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: PAD.t + iH - t * iH,
    label: formatCLP(Math.round(maxRev * t)),
  }))

  // X axis labels — show only a few dates
  const step = Math.ceil(data.length / 6)
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PAD.l - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{t.label}</text>
        </g>
      ))}

      {/* Area */}
      <path d={area} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinejoin="round" />

      {/* Dots */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill="#4f46e5" />
      ))}

      {/* X labels */}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d)
        return (
          <text key={i} x={xs[idx]} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {d.date.slice(5)} {/* MM-DD */}
          </text>
        )
      })}
    </svg>
  )
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────

function BarChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return null

  const W = 600, H = 100, PAD = { t: 6, r: 10, b: 20, l: 30 }
  const iW = W - PAD.l - PAD.r
  const iH = H - PAD.t - PAD.b
  const maxOrders = Math.max(...data.map(d => d.orders), 1)
  const barW = Math.max(4, iW / data.length - 2)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
      {data.map((d, i) => {
        const x = PAD.l + (i / data.length) * iW + (iW / data.length - barW) / 2
        const bH = (d.orders / maxOrders) * iH
        const y = PAD.t + iH - bH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bH} rx="2" fill="#4f46e5" opacity="0.7" />
          </g>
        )
      })}
      {/* Axis */}
      <line x1={PAD.l} y1={PAD.t + iH} x2={W - PAD.r} y2={PAD.t + iH} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart({ slices, colors }: { slices: { label: string; value: number }[]; colors: string[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0)
  if (!total) return <div className="h-32 flex items-center justify-center text-gray-300 text-sm">Sin datos</div>

  const R = 50, cx = 70, cy = 60, r = 20
  let angle = -Math.PI / 2
  const paths: { d: string; color: string }[] = []

  for (let i = 0; i < slices.length; i++) {
    const pct = slices[i].value / total
    const sweep = pct * 2 * Math.PI
    const x1 = cx + R * Math.cos(angle)
    const y1 = cy + R * Math.sin(angle)
    angle += sweep
    const x2 = cx + R * Math.cos(angle)
    const y2 = cy + R * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0

    // outer arc → inner arc (donut)
    const xi1 = cx + r * Math.cos(angle)
    const yi1 = cy + r * Math.sin(angle)
    const xi2 = cx + r * Math.cos(angle - sweep)
    const yi2 = cy + r * Math.sin(angle - sweep)

    paths.push({
      d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi1.toFixed(1)},${yi1.toFixed(1)} A${r},${r} 0 ${large},0 ${xi2.toFixed(1)},${yi2.toFixed(1)} Z`,
      color: colors[i % colors.length],
    })
  }

  return (
    <svg viewBox="0 0 140 120" className="w-full max-w-[160px]">
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">{total}</text>
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const PERIODS = [7, 30, 90]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30)

  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ['analytics', period],
    queryFn: () => salesApi.analytics(period).then(r => r.data),
    refetchInterval: 60_000,
  })

  const s = data?.summary

  const statCards = s ? [
    {
      label: 'Ingresos',
      value: formatCLP(s.revenue),
      pct: s.revenue_pct,
      sub: `Período anterior: ${formatCLP(s.revenue_prev)}`,
      icon: DollarSign,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Pedidos',
      value: s.orders,
      pct: s.orders_pct,
      sub: `Período anterior: ${s.orders_prev}`,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Ticket promedio',
      value: formatCLP(s.avg_ticket),
      pct: s.avg_pct,
      sub: `Período anterior: ${formatCLP(s.avg_prev)}`,
      icon: Receipt,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ] : []

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Métricas de tu tienda en tiempo real</p>
        </div>
        <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${period === p ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {isLoading
          ? [...Array(3)].map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-28 animate-pulse" />)
          : statCards.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className={c.color} />
                  </div>
                  <PctBadge pct={c.pct} />
                </div>
                <p className="text-2xl font-black">{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{c.label}</p>
              </div>
            )
          })
        }
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-black text-base">Ingresos por día</p>
            <p className="text-xs text-gray-400">Últimos {period} días · solo pedidos activos</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold">
            <div className="w-3 h-0.5 bg-indigo-600 rounded" />
            Ingresos
          </div>
        </div>
        {isLoading
          ? <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
          : <LineChart data={data?.daily ?? []} />
        }
      </div>

      {/* Orders bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-black text-base">Pedidos por día</p>
          <div className="flex items-center gap-2 text-xs text-indigo-500 font-semibold">
            <div className="w-3 h-3 bg-indigo-500 rounded opacity-70" />
            Pedidos
          </div>
        </div>
        {isLoading
          ? <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
          : <BarChart data={data?.daily ?? []} />
        }
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Top products */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-gray-400" />
            <p className="font-black text-base">Top productos</p>
          </div>
          {isLoading
            ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-50 rounded-lg animate-pulse" />)}</div>
            : !data?.top_products.length
              ? <p className="text-sm text-gray-400 py-6 text-center">Sin ventas en el período</p>
              : (
                <div className="space-y-3">
                  {data.top_products.map((p, i) => {
                    const maxRev = data.top_products[0].revenue
                    const pct = Math.round((p.revenue / maxRev) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 truncate max-w-[60%]">{p.name}</span>
                          <span className="font-black text-gray-900 flex-shrink-0">{formatCLP(p.revenue)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{p.units} uds</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
          }
        </div>

        {/* By source + by status */}
        <div className="space-y-4">

          {/* Fuente de pago */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="font-black text-sm mb-3">Por medio de pago</p>
            {isLoading
              ? <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
              : (
                <div className="flex items-center gap-3">
                  <DonutChart
                    slices={(data?.by_source ?? []).map(s => ({ label: SOURCE_LABELS[s.source] || s.source, value: s.count }))}
                    colors={SOURCE_COLORS}
                  />
                  <ul className="space-y-1.5 flex-1">
                    {(data?.by_source ?? []).map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                        <span className="truncate text-gray-600">{SOURCE_LABELS[s.source] || s.source}</span>
                        <span className="font-bold ml-auto text-gray-800">{s.count}</span>
                      </li>
                    ))}
                    {!data?.by_source.length && <li className="text-xs text-gray-400">Sin datos</li>}
                  </ul>
                </div>
              )
            }
          </div>

          {/* Estado de pedidos */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="font-black text-sm mb-3">Por estado</p>
            {isLoading
              ? <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
              : (
                <ul className="space-y-2">
                  {(data?.by_status ?? []).map((s, i) => (
                    <li key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? '#9ca3af' }} />
                        <span className="text-gray-600">{STATUS_LABELS[s.status] ?? s.status}</span>
                      </div>
                      <span className="font-bold text-gray-800">{s.count}</span>
                    </li>
                  ))}
                  {!data?.by_status.length && <li className="text-xs text-gray-400">Sin datos</li>}
                </ul>
              )
            }
          </div>
        </div>

      </div>
    </div>
  )
}
