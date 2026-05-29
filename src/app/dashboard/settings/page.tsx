'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storesApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCLP, daysUntil, PLAN_COLORS } from '@/lib/utils'
import type { Store, PlanStatus } from '@/types'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Save, ExternalLink, CheckCircle, Lock } from 'lucide-react'
import Link from 'next/link'

const TABS = ['general', 'apariencia', 'contacto', 'plan'] as const
type Tab = typeof TABS[number]

const COLORS = ['#000000','#1d4ed8','#7c3aed','#dc2626','#059669','#d97706','#db2777','#0891b2','#374151']

export default function SettingsPage() {
  return <Suspense fallback={<div className="p-8 text-gray-400">Cargando...</div>}><SettingsContent /></Suspense>
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'general')
  const [saved, setSaved] = useState(false)

  const { data: store } = useQuery<Store>({
    queryKey: ['my-store'],
    queryFn: () => storesApi.me().then(r => r.data),
  })

  const { data: planStatus } = useQuery<PlanStatus>({
    queryKey: ['plan-status'],
    queryFn: () => storesApi.planStatus().then(r => r.data),
  })

  const [form, setForm] = useState({
    name: '', contact_email: '', contact_phone: '',
    whatsapp_number: '', logo_url: '', primary_color: '#000000',
    language_code: 'es', custom_domain: '',
  })

  useEffect(() => {
    if (store) {
      setForm({
        name:           store.name,
        contact_email:  store.contact_email,
        contact_phone:  store.contact_phone,
        whatsapp_number:store.whatsapp_number,
        logo_url:       store.logo_url,
        primary_color:  store.primary_color || '#000000',
        language_code:  store.language_code,
        custom_domain:  store.custom_domain || '',
      })
    }
  }, [store])

  const mutation = useMutation({
    mutationFn: () => storesApi.update(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-store'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const plan = planStatus?.active_plan
  const hasCustomDomain = planStatus?.features.custom_domain

  return (
    <div className="p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Configuración</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {store?.name} ·{' '}
            <a href={`/${store?.slug}`} target="_blank"
              className="hover:underline inline-flex items-center gap-1">
              ver tienda <ExternalLink size={11} />
            </a>
          </p>
        </div>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          {saved ? <><CheckCircle size={14} /> Guardado</> : <><Save size={14} /> Guardar</>}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-7 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all',
              tab === t ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'
            )}>
            {t}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Información de tu tienda" />
            <div className="space-y-4">
              <Input label="Nombre de la tienda *" value={form.name} onChange={set('name')} required />
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  URL de tu tienda
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-400">2080tiendas.com/</span>
                  <span className="text-sm font-semibold">{store?.slug}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">El slug no se puede cambiar</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Idioma y región" />
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Idioma
              </label>
              <select value={form.language_code} onChange={set('language_code')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Dominio personalizado"
              action={
                !hasCustomDomain && (
                  <Link href="/dashboard/plans">
                    <Badge variant="purple">Plan Pro+</Badge>
                  </Link>
                )
              }
            />
            <div className={cn(!hasCustomDomain && 'opacity-50 pointer-events-none')}>
              <Input
                label="Tu dominio"
                value={form.custom_domain}
                onChange={set('custom_domain')}
                placeholder="www.mitienda.cl"
                hint={hasCustomDomain ? "Apunta tu DNS a nuestros servidores para activarlo" : "Disponible en plan Pro o superior"}
              />
              {!hasCustomDomain && (
                <div className="mt-3 flex items-center gap-2 text-violet-600">
                  <Lock size={13} />
                  <span className="text-xs font-semibold">
                    <Link href="/dashboard/plans" className="underline">Sube a Pro</Link> para usar dominio propio
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Apariencia */}
      {tab === 'apariencia' && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Logo" />
            <div className="space-y-4">
              {form.logo_url && (
                <div className="w-24 h-24 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={form.logo_url} alt="logo" className="w-full h-full object-contain p-2" />
                </div>
              )}
              <Input label="URL del logo" type="url" value={form.logo_url} onChange={set('logo_url')}
                placeholder="https://..." hint="PNG o SVG con fondo transparente, mín. 200x200px" />
            </div>
          </Card>

          <Card>
            <CardHeader title="Color principal" subtitle="Se aplica a botones, badges y acentos de tu tienda" />
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, primary_color: c }))}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'w-10 h-10 rounded-xl transition-all',
                      form.primary_color === c ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'
                    )} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color}
                  onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <Input value={form.primary_color} onChange={set('primary_color')}
                  placeholder="#000000" className="font-mono w-32" />
              </div>
              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wide">Preview</p>
                <button style={{ backgroundColor: form.primary_color }}
                  className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl">
                  Agregar al carrito
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Contacto */}
      {tab === 'contacto' && (
        <Card>
          <CardHeader title="Datos de contacto" subtitle="Cómo te contactan tus clientes" />
          <div className="space-y-4">
            <Input label="Email de contacto" type="email" value={form.contact_email} onChange={set('contact_email')}
              placeholder="hola@mitienda.cl" />
            <Input label="Teléfono" value={form.contact_phone} onChange={set('contact_phone')}
              placeholder="+56912345678" hint="Aparece en el footer de tu tienda" />
            <Input label="WhatsApp" value={form.whatsapp_number} onChange={set('whatsapp_number')}
              placeholder="+56912345678"
              hint="Activa el botón flotante de WhatsApp en tu tienda" />
            {form.whatsapp_number && (
              <div className="p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Botón WhatsApp activo</p>
                  <p className="text-xs text-emerald-600">Tus clientes podrán escribirte directo al {form.whatsapp_number}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Plan */}
      {tab === 'plan' && plan && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Tu plan actual" />
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <span className={cn('px-3 py-1 rounded-full text-sm font-bold', PLAN_COLORS[plan.tier])}>
                  {plan.name}
                </span>
                {planStatus.is_on_trial && planStatus.trial_expires_at && (
                  <span className="text-sm text-emerald-600 font-semibold">
                    🎁 Trial · {daysUntil(planStatus.trial_expires_at)} días restantes
                  </span>
                )}
              </div>
              <span className="font-black text-lg">{formatCLP(plan.price_monthly_clp)}<span className="text-sm text-gray-400 font-normal">/mes</span></span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Productos',      value: plan.max_products === 0 ? 'Ilimitados' : plan.max_products },
                { label: 'Órdenes/mes',    value: plan.max_orders_per_month === 0 ? 'Ilimitadas' : plan.max_orders_per_month },
                { label: 'Staff',          value: plan.max_staff_users },
                { label: 'Dropshipping',   value: plan.max_dropshipping_integrations === 0 ? 'Ilimitado' : plan.max_dropshipping_integrations },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="font-black text-lg mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { key: 'has_ai_content_agent',      label: '🤖 Agente IA de contenido' },
                { key: 'has_whatsapp_integration',  label: '💬 WhatsApp integrado' },
                { key: 'has_custom_domain',         label: '🌐 Dominio personalizado' },
                { key: 'has_analytics_advanced',    label: '📊 Analytics avanzado' },
                { key: 'has_multi_language',        label: '🌍 Multi-idioma' },
                { key: 'has_abandoned_cart_recovery',label: '🛒 Recuperación de carrito' },
                { key: 'has_priority_support',      label: '⭐ Soporte prioritario' },
              ].map(({ key, label }) => {
                const active = plan[key as keyof typeof plan] as boolean
                return (
                  <div key={key} className={cn('flex items-center gap-2 text-sm', !active && 'opacity-40')}>
                    <span>{active ? '✅' : '🔒'}</span>
                    <span className={active ? 'font-medium' : ''}>{label}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {plan.tier !== 'business' && (
            <Link href="/dashboard/plans">
              <div className="p-5 bg-black text-white rounded-2xl hover:bg-gray-900 transition cursor-pointer">
                <p className="font-black text-lg mb-1">Sube tu plan →</p>
                <p className="text-gray-300 text-sm">Desbloquea el agente IA, WhatsApp y más funciones</p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
