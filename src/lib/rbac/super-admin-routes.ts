/** URL prefixes reserved for the main admin workspace (not branch / delivery). */
export const SUPER_ADMIN_ROUTE_PREFIXES = [
  '/dashboard',
  '/orders',
  '/deliveries',
  '/menu',
  '/customers',
  '/subscription-plans',
  '/subscriptions',
  '/delivery-slots',
  '/dispatch',
  '/reports',
  '/settings',
  '/areas',
  '/audit-logs',
  '/branches',
  '/cities',
  '/branch-inventory',
  '/subscription-operations',
  '/admin',
  '/support',
  '/coupons',
  '/contact-messages',
  '/cms',
  '/mobile-app',
  '/referrals',
  '/finance',
] as const

export function isSuperAdminRoute(pathname: string): boolean {
  return SUPER_ADMIN_ROUTE_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}
