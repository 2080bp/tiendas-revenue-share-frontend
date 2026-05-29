import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/']
const DASHBOARD_PREFIX = '/dashboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas de tienda pública: siempre accesibles
  if (!pathname.startsWith(DASHBOARD_PREFIX)) {
    return NextResponse.next()
  }

  // Dashboard: requiere token
  const token = request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  // En Next.js el token está en localStorage (client-side)
  // El middleware corre en edge — usamos una cookie que el cliente setea al login
  const authCookie = request.cookies.get('auth_session')?.value

  if (!authCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
