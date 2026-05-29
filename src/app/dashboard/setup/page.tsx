'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storesApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { Store, Globe, Palette, CheckCircle } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Tu tienda',   icon: Store },
  { id: 2, label: 'Localización',icon: Globe },
  { id: 3, label: 'Apariencia',  icon: Palette },
  { id: 4, label: '¡Listo!',     icon: CheckCircle },
]

const COUNTRIES = [
  { code: 'CL', name: 'Chile',     currency: 'CLP' },
  { code: 'MX', name: 'México',    currency: 'MXN' },
  { code: 'CO', name: 'Colombia',  currency: 'COP' },
  { code: 'PE', name: 'Perú',      currency: 'PEN' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'BR', name: 'Brasil',    currency: 'BRL' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD' },
]

const COLORS = ['#000000','#1d4ed8','#7c3aed','#dc2626','#059669','#d97706','#db2777','#0891b2']

export default function SetupPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', contact_email: '', contact_phone: '',
    country_code: 'CL', currency_code: 'CLP', language_code: 'es',
    primary_color: '#000000', logo_url: '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const createStore = useMutation({
    mutationFn: () => storesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-store'] })
      setStep(4)
    },
  })

  const updateStore = useMutation({
    mutationFn: () => storesApi.update({ primary_color: form.primary_color, logo_url: form.logo_url }),
    onSuccess: () => setStep(4),
  })

  function next() {
    if (step === 1) {
      if (!form.name) return
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      createStore.mutate()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = step > s.id
            const active = step === s.id
            return (
              <div key={s.id} className="flex items-center">
                <div className={cn('flex flex-col items-center gap-1.5')}>
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                    done   ? 'bg-black text-white' :
                    active ? 'bg-black text-white' :
                             'bg-gray-100 text-gray-400'
                  )}>
                    <Icon size={16} />
                  </div>
                  <span className={cn('text-xs font-medium hidden sm:block',
                    active ? 'text-black' : 'text-gray-400'
                  )}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'h-px w-12 sm:w-20 mx-2 mb-5 transition-all',
                    step > s.id ? 'bg-black' : 'bg-gray-200'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* Paso 1: Nombre y contacto */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">Cuéntanos de tu tienda</h2>
                <p className="text-gray-400 text-sm">Esta información aparecerá en tu tienda pública</p>
              </div>
              <Input label="Nombre de tu tienda *" required
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Ej: Boutique Jacky, Mi Tienda Tech..." autoFocus />
              <Input label="Email de contacto" type="email"
                value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                placeholder="hola@mitienda.cl" />
              <Input label="WhatsApp / Teléfono"
                value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                placeholder="+56912345678" hint="Tus clientes te contactarán aquí" />
            </div>
          )}

          {/* Paso 2: País y moneda */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">¿Dónde vendes?</h2>
                <p className="text-gray-400 text-sm">Define el país, moneda e idioma de tu tienda</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COUNTRIES.map(c => (
                  <button key={c.code} type="button"
                    onClick={() => { set('country_code', c.code); set('currency_code', c.currency) }}
                    className={cn(
                      'p-3 border rounded-xl text-left transition',
                      form.country_code === c.code
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    )}>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className={cn('text-xs mt-0.5', form.country_code === c.code ? 'text-gray-300' : 'text-gray-400')}>
                      {c.currency}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3: Apariencia */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black mb-1">Personaliza tu tienda</h2>
                <p className="text-gray-400 text-sm">Elige el color principal (puedes cambiarlo después)</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Color principal
                </label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('primary_color', c)}
                      style={{ backgroundColor: c }}
                      className={cn(
                        'w-10 h-10 rounded-xl transition-all',
                        form.primary_color === c ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'
                      )} />
                  ))}
                </div>
              </div>
              <Input label="URL del logo (opcional)" type="url"
                value={form.logo_url} onChange={e => set('logo_url', e.target.value)}
                placeholder="https://..." hint="También puedes subirlo más tarde" />
            </div>
          )}

          {/* Paso 4: Éxito */}
          {step === 4 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black mb-2">¡Tu tienda está lista! 🎉</h2>
                <p className="text-gray-500 text-sm">
                  <strong>{form.name}</strong> fue creada con plan Free.
                  Agrega productos y empieza a vender.
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full">
                Ir al panel →
              </Button>
            </div>
          )}

          {/* Botón siguiente */}
          {step < 4 && (
            <div className="mt-8 flex justify-between items-center">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)}>
                  ← Atrás
                </Button>
              ) : <div />}
              <Button onClick={next} loading={createStore.isPending}>
                {step === 3 ? 'Crear tienda →' : 'Siguiente →'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
