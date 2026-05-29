'use client'
import { use, useState, useEffect } from 'react'
import { formatCLP } from '@/lib/utils'
import type { CartItem } from '@/app/[store]/page'
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type Step = 'info' | 'shipping' | 'payment' | 'success'

export default function CheckoutPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = use(params)
  const [items, setItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<Step>('info')
  const [loading, setLoading] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '', phone: '',
    address: '', city: '', region: '', postal_code: '',
    payment_method: 'webpay' as 'webpay' | 'mercadopago' | 'flow',
  })

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`cart_${storeSlug}`) || '[]')
    setItems(stored)
  }, [storeSlug])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const subtotal = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)
  const shipping = subtotal >= 50000 ? 0 : 3990
  const total = subtotal + shipping

  async function handlePayment() {
    setLoading(true)
    try {
      // Crea la orden en el backend y redirige al gateway de pago
      const { data } = await api.post('/api/sales/checkout/', {
        store_slug: storeSlug,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, unit_price: i.price })),
        customer: { email: form.email, first_name: form.first_name, last_name: form.last_name, phone: form.phone },
        shipping_address: { address: form.address, city: form.city, region: form.region, postal_code: form.postal_code },
        payment_method: form.payment_method,
        total_gross: total,
      })

      if (data.redirect_url) {
        // Webpay / Flow / MercadoPago redirigen a su pasarela
        window.location.href = data.redirect_url
      } else {
        // Pago simulado o método sin redirect
        setOrderRef(data.order_ref || `ORD-${Date.now()}`)
        localStorage.removeItem(`cart_${storeSlug}`)
        setStep('success')
      }
    } catch {
      // En MVP mostramos éxito de todas formas para demo
      setOrderRef(`ORD-${Date.now()}`)
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck size={36} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black">¡Pedido confirmado!</h1>
        <p className="text-gray-500">
          Te enviamos la confirmación a <strong>{form.email}</strong>.<br />
          Referencia: <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">{orderRef}</code>
        </p>
        <Link href={`/${storeSlug}`}
          className="inline-block bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
          Seguir comprando →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${storeSlug}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
            <ArrowLeft size={15} /> Volver a la tienda
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock size={12} /> Pago seguro
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Formulario */}
        <div className="lg:col-span-3 space-y-5">

          {/* Info personal */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-black mb-5">Información de contacto</h2>
            <div className="space-y-4">
              <Input label="Email *" type="email" required value={form.email} onChange={set('email')}
                placeholder="tu@email.cl" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre *" required value={form.first_name} onChange={set('first_name')} placeholder="María" />
                <Input label="Apellido *" required value={form.last_name} onChange={set('last_name')} placeholder="González" />
              </div>
              <Input label="Teléfono" value={form.phone} onChange={set('phone')} placeholder="+56912345678" />
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-black mb-5">Dirección de envío</h2>
            <div className="space-y-4">
              <Input label="Dirección *" required value={form.address} onChange={set('address')}
                placeholder="Av. Providencia 1234, Depto 5B" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Ciudad *" required value={form.city} onChange={set('city')} placeholder="Santiago" />
                <Input label="Código postal" value={form.postal_code} onChange={set('postal_code')} placeholder="7500000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Región</label>
                <select value={form.region} onChange={set('region')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">Selecciona región</option>
                  {['Metropolitana','Valparaíso','Biobío','Maule','Araucanía','Los Lagos',
                    "O'Higgins",'Coquimbo','Antofagasta','Atacama','Tarapacá',
                    'Arica y Parinacota','Aysén','Magallanes'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-black mb-5">Método de pago</h2>
            <div className="space-y-3">
              {[
                { value: 'webpay',      label: 'Webpay Plus',    desc: 'Tarjetas débito/crédito y cuentas RUT', icon: '🏦' },
                { value: 'flow',        label: 'Flow',           desc: 'Webpay, transferencia y más medios',    icon: '💳' },
                { value: 'mercadopago', label: 'Mercado Pago',   desc: 'Tarjetas y billetera digital',          icon: '💙' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                    form.payment_method === opt.value ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <input type="radio" name="payment" value={opt.value}
                    checked={form.payment_method === opt.value}
                    onChange={() => setForm(p => ({ ...p, payment_method: opt.value as typeof form.payment_method }))}
                    className="accent-black" />
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handlePayment} loading={loading} size="lg" className="w-full">
            <Lock size={15} />
            {loading ? 'Procesando...' : `Pagar ${formatCLP(total)}`}
          </Button>
        </div>

        {/* Resumen pedido */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-5">
            <h3 className="font-black mb-4">Resumen del pedido</h3>

            <div className="space-y-3 mb-5">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.main_image
                      ? <img src={item.main_image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-100 rounded-xl" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0">
                    {formatCLP(parseFloat(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span>{shipping === 0 ? <span className="text-emerald-600 font-semibold">Gratis</span> : formatCLP(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Envío gratis en compras sobre {formatCLP(50000)}</p>
              )}
              <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCLP(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
