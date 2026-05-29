'use client'
import Link from 'next/link'
import { useState } from 'react'
import {
  ShoppingBag, Zap, BarChart3, Globe, Package, Truck,
  MessageCircle, Star, Check, ChevronRight, ArrowRight,
  Instagram, Facebook, TrendingUp,
} from 'lucide-react'

const PLANS = [
  {
    name: 'Free', price: 0, desc: 'Para comenzar',
    features: ['Hasta 10 productos', '50 pedidos/mes', 'Tienda online básica', 'Soporte por email'],
    cta: 'Comenzar gratis', highlight: false,
  },
  {
    name: 'Starter', price: 9990, desc: 'Para crecer',
    features: ['Hasta 100 productos', '200 pedidos/mes', 'Dominio personalizado', '1 integración dropshipping', 'Analytics básico'],
    cta: 'Empezar ahora', highlight: false,
  },
  {
    name: 'Pro', price: 24990, desc: 'Para escalar',
    features: ['Hasta 500 productos', '1.000 pedidos/mes', 'Agente IA de contenido', 'WhatsApp integrado', '3 integraciones dropshipping', 'Analytics avanzado', 'Recuperación carrito'],
    cta: 'Probar 15 días gratis', highlight: true,
  },
  {
    name: 'Business', price: 59990, desc: 'Para dominar',
    features: ['Productos ilimitados', 'Pedidos ilimitados', 'Multi-idioma', '5+ usuarios staff', 'Soporte prioritario 24/7', 'Todo lo de Pro'],
    cta: 'Hablar con ventas', highlight: false,
  },
]

const FEATURES = [
  { icon: ShoppingBag, title: 'Tienda lista en minutos', desc: 'Crea tu tienda, sube productos y empieza a vender hoy mismo. Sin tecnicismos.' },
  { icon: Truck, title: 'Dropshipping integrado', desc: 'Conecta con Dropi, CJdropshipping y más. Vende sin tener stock propio.' },
  { icon: Zap, title: 'Agente IA de contenido', desc: 'Genera descripciones de productos, posts para redes y emails de marketing automáticamente.' },
  { icon: BarChart3, title: 'Analytics en tiempo real', desc: 'Visualiza ventas, productos más vendidos y comportamiento de clientes.' },
  { icon: MessageCircle, title: 'WhatsApp integrado', desc: 'Botón flotante en tu tienda para que tus clientes te escriban directo.' },
  { icon: Globe, title: 'Tu dominio, tu marca', desc: 'Usa tu propio dominio y personaliza colores, logo y diseño.' },
]

const TESTIMONIALS = [
  { name: 'Valentina R.', store: 'Tienda Valentina', text: 'En 2 semanas ya tenía mi primera venta. La plataforma es muy fácil de usar.', stars: 5 },
  { name: 'Rodrigo M.', store: 'TechStore CL', text: 'El dropshipping con Dropi me cambió el negocio. No necesito bodega ni capital inicial.', stars: 5 },
  { name: 'Camila F.', store: 'Moda Camila', text: 'El agente IA me ahorra horas escribiendo descripciones. Vale cada peso del plan Pro.', stars: 5 },
]

function formatCLP(n: number) {
  return `$${n.toLocaleString('es-CL')}`
}

export default function LandingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight">2080<span className="text-indigo-600">.store</span></span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-black transition">Funciones</a>
            <a href="#pricing" className="hover:text-black transition">Precios</a>
            <a href="#testimonials" className="hover:text-black transition">Historias</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition px-3 py-2">
              Iniciar sesión
            </Link>
            <Link href="/register"
              className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              Crear tienda gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 -z-10" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} className="fill-current" />
            Nuevo: Agente IA de contenido incluido en Pro
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Tu tienda online<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">lista en minutos</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Vende tus propios productos o haz dropshipping desde Chile. Sin código, sin bodega, sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-800 transition shadow-lg shadow-black/10">
              Crear mi tienda gratis
              <ArrowRight size={20} />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 text-gray-600 font-semibold px-6 py-4 rounded-xl hover:text-black transition">
              Ver cómo funciona
              <ChevronRight size={18} />
            </a>
          </div>

          <p className="text-sm text-gray-400 mt-4">Sin tarjeta de crédito · Plan gratuito para siempre</p>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6">
          {[
            { value: '2 min', label: 'para crear tu tienda' },
            { value: '0%', label: 'comisión por venta' },
            { value: '24/7', label: 'tu tienda disponible' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-3xl font-black text-indigo-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations bar */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Integra con tus plataformas favoritas</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 font-bold text-sm">
            {['Webpay Plus', 'Flow', 'MercadoPago', 'Dropi', 'CJdropshipping', 'Transbank', 'Instagram', 'Facebook'].map(p => (
              <span key={p} className="hover:text-gray-700 transition cursor-default">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">Todo lo que necesitas para vender</h2>
            <p className="text-lg text-gray-500">Sin plugins, sin extras, todo incluido en tu plan.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-md transition group">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dropshipping section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Package size={12} />
              Dropshipping sin complicaciones
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4">Vende sin tener stock propio</h2>
            <p className="text-gray-300 text-lg mb-8">
              Conecta con Dropi, CJdropshipping u otras plataformas. Tú vendes, ellos despachan. Sin capital inicial, sin bodega, sin riesgo.
            </p>
            <ul className="space-y-3">
              {['Sincronización automática de productos', 'Seguimiento de órdenes en tiempo real', 'Múltiples proveedores simultáneos', 'Compatible con productos propios'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            {[
              { provider: 'Dropi', status: 'Conectado', products: 48, color: 'bg-green-500' },
              { provider: 'CJdropshipping', status: 'Conectado', products: 124, color: 'bg-green-500' },
              { provider: 'Spocket', status: 'Disponible pronto', products: 0, color: 'bg-yellow-500' },
            ].map(p => (
              <div key={p.provider} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  <span className="font-semibold text-sm">{p.provider}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{p.status}</p>
                  {p.products > 0 && <p className="text-xs font-bold text-white">{p.products} productos</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">Planes para cada etapa</h2>
            <p className="text-lg text-gray-500 mb-8">Empieza gratis, escala cuando lo necesites. Sin contratos.</p>

            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              <button onClick={() => setAnnual(false)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!annual ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
                Mensual
              </button>
              <button onClick={() => setAnnual(true)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${annual ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
                Anual <span className="text-green-600 text-xs ml-1">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map(plan => {
              const price = annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price
              return (
                <div key={plan.name}
                  className={`rounded-2xl border p-6 flex flex-col relative ${plan.highlight
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200 scale-105'
                    : 'bg-white border-gray-100'
                  }`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full">
                      MÁS POPULAR
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="font-black text-lg">{plan.name}</p>
                    <p className={`text-xs mb-4 ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{price === 0 ? 'Gratis' : formatCLP(price)}</span>
                      {price > 0 && <span className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>/mes</span>}
                    </div>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-green-500'}`} />
                        <span className={plan.highlight ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register"
                    className={`text-center text-sm font-bold py-3 rounded-xl transition ${plan.highlight
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-black text-white hover:bg-gray-800'
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Todos los planes incluyen SSL gratis, pagos con Webpay, Flow y MercadoPago, y soporte técnico.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">Lo que dicen nuestros vendedores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.store}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl shadow-indigo-200">
            <h2 className="text-4xl font-black tracking-tight mb-4">¿Listo para vender?</h2>
            <p className="text-indigo-100 text-lg mb-8">
              Únete a cientos de emprendedores chilenos que ya venden con 2080.store. Empieza gratis, sin tarjeta.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-black px-8 py-4 rounded-xl text-lg hover:bg-indigo-50 transition shadow-lg">
              Crear mi tienda ahora
              <ArrowRight size={20} />
            </Link>
            <p className="text-indigo-200 text-sm mt-4">Plan gratuito para siempre · Sin comisiones · Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-black text-lg">2080<span className="text-indigo-600">.store</span></span>
              <p className="text-sm text-gray-400 mt-2">E-commerce para LatAm. Simple, rápido, sin comisiones.</p>
            </div>
            {[
              { title: 'Producto', links: ['Funciones', 'Precios', 'Dropshipping', 'Agente IA'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Casos de éxito', 'Contacto'] },
              { title: 'Legal', links: ['Términos de uso', 'Privacidad', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-bold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-400 hover:text-black transition">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 2080.store · Hecho con ❤️ en Chile 🇨🇱</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-black transition"><Instagram size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition"><Facebook size={18} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition"><TrendingUp size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
