'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storesApi } from '@/lib/api'
import { formatCLP, cn, PLAN_COLORS } from '@/lib/utils'
import type { Plan, PlanStatus } from '@/types'
import { CheckCircle, Zap } from 'lucide-react'

const FEATURES = [
  { key: 'max_products',                   label: 'Productos',                  format: (v: number) => v === 0 ? 'Ilimitados' : v.toString() },
  { key: 'max_orders_per_month',           label: 'Órdenes / mes',              format: (v: number) => v === 0 ? 'Ilimitadas' : v.toString() },
  { key: 'max_dropshipping_integrations',  label: 'Dropshipping',               format: (v: number) => v === 0 ? 'Ilimitado' : v === 1 ? '1 plataforma' : `${v} plataformas` },
  { key: 'max_staff_users',               label: 'Usuarios staff',             format: (v: number) => v.toString() },
  { key: 'has_custom_domain',             label: 'Dominio propio',             format: (v: boolean) => v ? '✅' : '—' },
  { key: 'has_ai_content_agent',          label: '🤖 Agente IA contenido',     format: (v: boolean) => v ? '✅' : '—' },
  { key: 'has_whatsapp_integration',      label: '💬 WhatsApp integrado',      format: (v: boolean) => v ? '✅' : '—' },
  { key: 'has_analytics_advanced',        label: '📊 Analytics avanzado',      format: (v: boolean) => v ? '✅' : '—' },
  { key: 'has_abandoned_cart_recovery',   label: '🛒 Recuperación de carrito', format: (v: boolean) => v ? '✅' : '—' },
  { key: 'has_multi_language',            label: '🌍 Multi-idioma',            format: (v: boolean) => v ? '✅' : '—' },
  { key: 'has_priority_support',          label: '⭐ Soporte prioritario',      format: (v: boolean) => v ? '✅' : '—' },
]

export default function PlansPage() {
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => storesApi.plans().then(r => r.data),
  })

  const { data: planStatus } = useQuery<PlanStatus>({
    queryKey: ['plan-status'],
    queryFn: () => storesApi.planStatus().then(r => r.data),
  })

  const currentTier = planStatus?.active_plan?.tier

  const qc = useQueryClient()
  const [busyGateway, setBusyGateway] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Al volver de la pasarela (?sub=success|failed) refresca el estado y avisa
  useEffect(() => {
    const sub = new URLSearchParams(window.location.search).get('sub')
    if (sub === 'success') {
      qc.invalidateQueries({ queryKey: ['plan-status'] })
      alert('¡Suscripción activada! 🎉')
    } else if (sub === 'failed') {
      alert('El pago no se completó. Intenta de nuevo.')
    }
  }, [qc])

  const subscribe = useMutation({
    mutationFn: ({ tier, gateway }: { tier: string; gateway: string }) =>
      storesApi.subscribe(tier, gateway).then(r => r.data),
    onMutate: ({ gateway }) => setBusyGateway(gateway),
    onSuccess: (data: { redirect_url?: string }) => {
      if (data?.redirect_url) window.location.href = data.redirect_url
    },
    onError: () => {
      setBusyGateway(null)
      alert('No se pudo iniciar el pago. Intenta de nuevo.')
    },
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <div className="text-center mb-12">
        <h1 className="text-3xl font-black tracking-tight mb-2">Elige tu plan</h1>
        <p className="text-gray-500">Cambia cuando quieras. Sin permanencia.</p>
      </div>

      {/* Cards de planes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {plans.map(plan => {
          const isCurrent = plan.tier === currentTier
          const isPopular = plan.tier === 'pro'

          return (
            <div key={plan.id} className={cn(
              'relative rounded-2xl border p-5 flex flex-col transition-all',
              isPopular
                ? 'border-black bg-black text-white shadow-2xl shadow-black/20 scale-[1.02]'
                : isCurrent
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
            )}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} /> Más popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block',
                  isPopular ? 'bg-white/10 text-white' : PLAN_COLORS[plan.tier]
                )}>
                  {plan.name}
                </span>
                <div className="flex items-end gap-1 mt-3">
                  <span className="text-3xl font-black">
                    {plan.price_monthly_clp === '0' ? 'Gratis' : formatCLP(plan.price_monthly_clp)}
                  </span>
                  {plan.price_monthly_clp !== '0' && (
                    <span className={cn('text-sm mb-1', isPopular ? 'text-gray-300' : 'text-gray-400')}>/mes</span>
                  )}
                </div>
                {plan.price_monthly_usd && plan.price_monthly_clp !== '0' && (
                  <p className={cn('text-xs mt-0.5', isPopular ? 'text-gray-400' : 'text-gray-400')}>
                    ~USD {plan.price_monthly_usd}/mes
                  </p>
                )}
              </div>

              <ul className={cn('space-y-2 flex-1 text-sm mb-6', isPopular ? 'text-gray-200' : 'text-gray-600')}>
                <li className="flex items-center gap-2">
                  <CheckCircle size={13} className={isPopular ? 'text-white' : 'text-emerald-500'} />
                  <span><strong>{plan.max_products === 0 ? 'Ilimitados' : plan.max_products}</strong> productos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={13} className={isPopular ? 'text-white' : 'text-emerald-500'} />
                  <span><strong>{plan.max_orders_per_month === 0 ? 'Ilimitadas' : plan.max_orders_per_month}</strong> órdenes/mes</span>
                </li>
                {plan.has_ai_content_agent && (
                  <li className="flex items-center gap-2">
                    <CheckCircle size={13} className={isPopular ? 'text-white' : 'text-emerald-500'} />
                    <span>Agente IA 🤖</span>
                  </li>
                )}
                {plan.has_whatsapp_integration && (
                  <li className="flex items-center gap-2">
                    <CheckCircle size={13} className={isPopular ? 'text-white' : 'text-emerald-500'} />
                    <span>WhatsApp 💬</span>
                  </li>
                )}
                {plan.has_custom_domain && (
                  <li className="flex items-center gap-2">
                    <CheckCircle size={13} className={isPopular ? 'text-white' : 'text-emerald-500'} />
                    <span>Dominio propio 🌐</span>
                  </li>
                )}
                {plan.has_priority_support && (
                  <li className="flex items-center gap-2">
                    <CheckCircle size={13} className={isPopular ? 'text-white' : 'text-emerald-500'} />
                    <span>Soporte prioritario ⭐</span>
                  </li>
                )}
              </ul>

              {isCurrent ? (
                <div className={cn('w-full py-2.5 rounded-xl text-sm font-semibold text-center',
                  isPopular ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  Plan actual ✓
                </div>
              ) : (
                <button
                  onClick={() => plan.tier !== 'free' && setSelectedTier(plan.tier)}
                  disabled={plan.tier === 'free'}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    isPopular
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                  )}>
                  {plan.tier === 'free' ? 'Bajar a Free' : `Contratar ${plan.name}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Tabla comparativa */}
      <div>
        <h2 className="text-xl font-black mb-6 text-center">Comparación completa</h2>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-4 font-semibold text-gray-500 w-1/3">Feature</th>
                {plans.map(p => (
                  <th key={p.id} className={cn('px-4 py-4 text-center font-bold',
                    p.tier === 'pro' ? 'text-violet-700' : 'text-gray-800'
                  )}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(({ key, label, format }) => (
                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-gray-600">{label}</td>
                  {plans.map(p => {
                    const val = p[key as keyof Plan] as number | boolean
                    return (
                      <td key={p.id} className={cn('px-4 py-3.5 text-center font-semibold',
                        p.tier === currentTier ? 'bg-gray-50' : ''
                      )}>
                        {format(val as never)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Los pagos se procesan vía Transbank Webpay y Mercado Pago · Sin permanencia · Cancela cuando quieras
      </p>

      {/* Selector de pasarela al contratar */}
      {selectedTier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !busyGateway && setSelectedTier(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black mb-1">¿Cómo quieres pagar?</h3>
            <p className="text-sm text-gray-500 mb-5">Elige tu medio de pago para el plan.</p>

            <div className="space-y-3">
              <button
                onClick={() => subscribe.mutate({ tier: selectedTier, gateway: 'webpay' })}
                disabled={busyGateway !== null}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {busyGateway === 'webpay' ? 'Redirigiendo…' : '💳 Webpay (Transbank)'}
              </button>
              <button
                onClick={() => subscribe.mutate({ tier: selectedTier, gateway: 'mercadopago' })}
                disabled={busyGateway !== null}
                className="w-full py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition disabled:opacity-50"
              >
                {busyGateway === 'mercadopago' ? 'Redirigiendo…' : '💙 MercadoPago'}
              </button>
            </div>

            <button
              onClick={() => setSelectedTier(null)}
              disabled={busyGateway !== null}
              className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
