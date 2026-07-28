import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPER_ADMIN_PATHS = ['/dashboard', '/orders', '/deliveries', '/menu', '/subscription-menu', '/customers', '/subscription-plans', '/subscriptions', '/delivery-slots', '/dispatch', '/reports', '/settings', '/areas', '/audit-logs', '/branches', '/cities', '/branch-inventory', '/subscription-operations', '/admin', '/support', '/coupons']
const BRANCH_PATHS = ['/branch/dashboard', '/branch/orders', '/branch/kitchen', '/branch/subscription-dispatch', '/branch/production', '/branch/menu', '/branch/inventory', '/branch/delivery', '/branch/dispatch', '/branch/delivery-boys', '/branch/customers', '/branch/team', '/branch/reports', '/branch/profile', '/branch/support']
const DELIVERY_BOY_PATHS = ['/delivery']

function getWorkspaceFromRole(role: string | null): 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'DELIVERY_BOY' | null {
  if (role === 'BRANCH_MANAGER') return 'BRANCH_MANAGER'
  if (role === 'DELIVERY_BOY') return 'DELIVERY_BOY'
  if (role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN') return 'SUPER_ADMIN'
  return null
}

function getRoleFromCookie(request: NextRequest): string | null {
  return request.cookies.get('user-role')?.value || null
}

function getWorkspaceFromCookie(request: NextRequest): 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'DELIVERY_BOY' | null {
  const workspace = request.cookies.get('workspace')?.value
  if (workspace === 'SUPER_ADMIN' || workspace === 'BRANCH_MANAGER' || workspace === 'DELIVERY_BOY') {
    return workspace
  }
  const role = getRoleFromCookie(request)
  return getWorkspaceFromRole(role)
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
  const isDeliveryBoyRoute = DELIVERY_BOY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (isDeliveryBoyRoute) {
    if (!workspace) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (workspace === 'DELIVERY_BOY' || role === 'BRANCH_MANAGER') {
      return NextResponse.next()
    }
    if (role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isSuperAdminRoute) {
    if (!workspace) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (workspace !== 'SUPER_ADMIN') {
      if (workspace === 'BRANCH_MANAGER' || role === 'BRANCH_MANAGER') {
        return NextResponse.redirect(new URL('/branch/dashboard', request.url))
      }
      if (workspace === 'DELIVERY_BOY' || role === 'DELIVERY_BOY') {
        return NextResponse.redirect(new URL('/delivery', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isBranchRoute) {
    if (!workspace) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (workspace !== 'BRANCH_MANAGER') {
      if (workspace === 'DELIVERY_BOY' || role === 'DELIVERY_BOY') {
        return NextResponse.redirect(new URL('/delivery', request.url))
      }
      if (workspace === 'SUPER_ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN') {
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
    '/subscription-menu/:path*',
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
    '/dispatch/:path*',
    '/delivery/:path*',
    '/coupons/:path*',
  ],
}
