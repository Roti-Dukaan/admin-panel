import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Truck, ClipboardList, Users, CreditCard, Clock, BarChart3, Wallet, Settings, FileText, ToggleLeft, LifeBuoy, UserPlus, Package, FolderOpen, Bike, Shield } from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  roles?: string[]
  workspace?: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'DELIVERY_BOY' | 'all'
}

export const SUPER_ADMIN_NAVIGATION: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Deliveries", href: "/deliveries", icon: Truck },
  { label: "Menu Items", href: "/menu", icon: ClipboardList, roles: ['OWNER', 'ADMIN'] },
  { label: "Customers", href: "/customers", icon: Users, roles: ['OWNER', 'ADMIN'] },
  { label: "Subscription Plans", href: "/subscription-plans", icon: CreditCard, roles: ['OWNER', 'ADMIN'] },
  { label: "Delivery Slots", href: "/delivery-slots", icon: Clock, roles: ['OWNER', 'ADMIN'] },
  { label: "Dispatch Management", href: "/dispatch", icon: Package, roles: ['OWNER', 'ADMIN'] },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3, roles: ['OWNER', 'ADMIN'] },
  { label: "Payments", href: "/admin/payments", icon: Wallet, roles: ['OWNER', 'ADMIN'] },
  { label: "Team", href: "/admin/team", icon: UserPlus, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
  { label: "Roles & Permissions", href: "/admin/roles", icon: Shield, roles: ['SUPER_ADMIN', 'OWNER', 'ADMIN'] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ['OWNER', 'ADMIN'] },
  { label: "CMS", href: "/cms", icon: FolderOpen, roles: ['SUPER_ADMIN'] },
]

export const BRANCH_MANAGER_NAVIGATION: NavItem[] = [
  { label: "Dashboard", href: "/branch/dashboard", icon: LayoutDashboard, workspace: 'BRANCH_MANAGER' },
  { label: "Orders", href: "/branch/orders", icon: ShoppingBag, workspace: 'BRANCH_MANAGER' },
  { label: "Kitchen", href: "/branch/kitchen", icon: UtensilsCrossed, workspace: 'BRANCH_MANAGER' },
  { label: "Menu", href: "/branch/menu", icon: ToggleLeft, workspace: 'BRANCH_MANAGER' },
  { label: "Delivery", href: "/branch/delivery", icon: Truck, workspace: 'BRANCH_MANAGER' },
  { label: "Delivery Partners", href: "/branch/delivery-partners", icon: Bike, workspace: 'BRANCH_MANAGER' },
  { label: "My Route", href: "/delivery", icon: Truck, workspace: 'BRANCH_MANAGER' },
  { label: "Customers", href: "/branch/customers", icon: Users, workspace: 'BRANCH_MANAGER' },
  { label: "Team", href: "/branch/team", icon: UserPlus, workspace: 'BRANCH_MANAGER' },
  { label: "Support", href: "/branch/support", icon: LifeBuoy, workspace: 'BRANCH_MANAGER' },
  { label: "Reports", href: "/branch/reports", icon: BarChart3, workspace: 'BRANCH_MANAGER' },
  { label: "Profile", href: "/branch/profile", icon: FileText, workspace: 'BRANCH_MANAGER' },
]

export function getNavigationForWorkspace(workspace: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'DELIVERY_BOY' | null, userRoles: string[] = []): NavItem[] {
  if (workspace === 'DELIVERY_BOY') {
    return [{ label: "My Route", href: "/delivery", icon: Truck, workspace: 'DELIVERY_BOY' }]
  }
  if (workspace === 'BRANCH_MANAGER') {
    return BRANCH_MANAGER_NAVIGATION
  }
  return SUPER_ADMIN_NAVIGATION.filter((item) => {
    if (!item.roles) return true
    return item.roles.some((r) => userRoles.includes(r))
  })
}