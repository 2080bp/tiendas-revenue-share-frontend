'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register, login } = useAuth()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    username: '', phone: '', password: '', password2: '',
  })
  const [error, setError] = useState<string | Record<string, string[]>>('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await register(form)
      await login(form.username, form.password)
      router.push('/dashboard/setup')
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } }
      setError(e?.response?.data || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const errorMsg = typeof error === 'string'
    ? error
    : Object.entries(error).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' | ')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">20</span>
            </div>
            <span className="text-xl font-black tracking-tight">2080 Tiendas</span>
          </div>
          <p className="text-gray-500 text-sm">Crea tu cuenta gratis — sin tarjeta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nombre</label>
                <input type="text" required value={form.first_name} onChange={set('first_name')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="María" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Apellido</label>
                <input type="text" required value={form.last_name} onChange={set('last_name')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="González" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" required value={form.email} onChange={set('email')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="tu@email.cl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Usuario</label>
                <input type="text" required value={form.username} onChange={set('username')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="mitienda" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Teléfono</label>
                <input type="tel" value={form.phone} onChange={set('phone')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+56912345678" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input type="password" required value={form.password} onChange={set('password')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Mínimo 8 caracteres" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Repetir contraseña</label>
              <input type="password" required value={form.password2} onChange={set('password2')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••" />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-black font-semibold hover:underline">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
