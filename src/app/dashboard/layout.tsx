'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, ShoppingCart,
  Settings, LogOut, Store, TrendingUp
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',          label: 'Inicio',     icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Productos',  icon: Package },
  { href: '/dashboard/orders',   label: 'Pedidos',    icon: ShoppingCart },
  { href: '/dashboard/analytics',label: 'Analytics',  icon: TrendingUp },
  { href: '/dashboard/settings', label: 'Mi tienda',  icon: Store },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">

        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">20</span>
            </div>
            <div>
              <p className="text-sm font-black tracking-tight leading-none">2080 Tiendas</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">
                {user?.first_name || user?.username}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <Link href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Settings size={16} />
            Configuración
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
