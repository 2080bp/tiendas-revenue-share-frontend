'use client'
import { useQuery } from '@tanstack/react-query'
import { storesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { formatCLP, daysUntil, PLAN_COLORS, cn } from '@/lib/utils'
import type { PlanStatus } from '@/types'
import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, Zap, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: planStatus } = useQuery<PlanStatus>({
    queryKey: ['plan-status'],
    queryFn: () => storesApi.planStatus().then(r => r.data),
  })

  const plan = planStatus?.active_plan
  const tierColor = plan ? PLAN_COLORS[plan.tier] : 'bg-gray-100 text-gray-700'

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">
          Hola, {user?.first_name || user?.username} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Panel de tu tienda</p>
      </div>

      {/* Banner plan */}
      {plan && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={cn('px-3 py-1 rounded-full text-xs font-bold', tierColor)}>
              Plan {plan.name}
            </span>
            {planStatus?.is_on_trial && planStatus.trial_expires_at && (
              <span className="text-sm text-emerald-600 font-semibold">
                🎁 Trial activo — {daysUntil(planStatus.trial_expires_at)} días restantes
              </span>
            )}
          </div>
          {plan.tier !== 'business' && (
            <Link href="/dashboard/settings?tab=plan"
              className="flex items-center gap-1.5 text-sm font-semibold text-black hover:underline">
              Subir plan <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard icon={<Package size={20} />} label="Productos" value="—" sub="activos" />
        <MetricCard icon={<ShoppingCart size={20} />} label="Pedidos" value="—" sub="este mes" />
        <MetricCard icon={<TrendingUp size={20} />} label="Ventas" value="—" sub="este mes" />
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickCard
          href="/dashboard/products/new"
          icon={<Package size={18} />}
          title="Agregar producto"
          desc="Sube tu primer producto a la tienda"
        />
        <QuickCard
          href="/dashboard/settings"
          icon={<Zap size={18} />}
          title="Configurar tienda"
          desc="Logo, colores, dominio y más"
        />
      </div>

      {/* Features bloqueados */}
      {plan && !plan.has_ai_content_agent && (
        <div className="mt-6 bg-violet-50 border border-violet-100 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-semibold text-violet-900 text-sm">
              Agente IA de contenido disponible en plan Pro
            </p>
            <p className="text-violet-600 text-xs mt-1">
              Genera descripciones de productos, posts para redes y campañas con IA automáticamente.
            </p>
            <Link href="/dashboard/settings?tab=plan"
              className="inline-block mt-3 text-xs font-bold text-violet-700 hover:underline">
              Ver plan Pro →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-gray-400 mb-3">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function QuickCard({ href, icon, title, desc }: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link href={href}
      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-gray-500 group-hover:text-black transition">{icon}</div>
        <p className="font-semibold text-sm">{title}</p>
        <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-black transition" />
      </div>
      <p className="text-xs text-gray-400">{desc}</p>
    </Link>
  )
}
