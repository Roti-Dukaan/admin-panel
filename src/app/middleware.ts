import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPER_ADMIN_PATHS = ['/dashboard', '/orders', '/deliveries', '/menu', '/customers', '/subscription-plans', '/subscriptions', '/delivery-slots', '/reports', '/settings', '/areas', '/audit-logs', '/branches', '/cities', '/branch-inventory', '/subscription-operations', '/admin', '/support']
const BRANCH_PATHS = ['/branch/dashboard', '/branch/orders', '/branch/kitchen', '/branch/production', '/branch/inventory', '/branch/delivery', '/branch/customers', '/branch/reports', '/branch/profile']

function getWorkspaceFromCookie(request: NextRequest): 'SUPER_ADMIN' | 'BRANCH_MANAGER' | null {
  const workspace = request.cookies.get('workspace')?.value
  if (workspace === 'SUPER_ADMIN' || workspace === 'BRANCH_MANAGER') {
    return workspace
  }
  return null
}

function getRoleFromCookie(request: NextRequest): string | null {
  return request.cookies.get('user-role')?.value || null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const workspace = getWorkspaceFromCookie(request)
  const role = getRoleFromCookie(request)

  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next()
  }

  const isSuperAdminRoute = SUPER_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )
  const isBranchRoute = BRANCH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (isSuperAdminRoute) {
    if (!workspace) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (workspace !== 'SUPER_ADMIN') {
      if (role === 'BRANCH_MANAGER') {
        return NextResponse.redirect(new URL('/branch/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isBranchRoute) {
    if (!workspace) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (workspace !== 'BRANCH_MANAGER') {
      if (role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/deliveries/:path*',
    '/menu/:path*',
    '/customers/:path*',
    '/subscription-plans/:path*',
    '/subscriptions/:path*',
    '/delivery-slots/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/areas/:path*',
    '/audit-logs/:path*',
    '/branches/:path*',
    '/cities/:path*',
    '/branch-inventory/:path*',
    '/subscription-operations/:path*',
    '/admin/:path*',
    '/branch/:path*',
    '/support/:path*',
  ],
}
