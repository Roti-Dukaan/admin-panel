export function getPortalHomeHref(options: {
  isBranchManager?: boolean
  isDeliveryBoy?: boolean
}): string {
  if (options.isDeliveryBoy) return "/delivery"
  if (options.isBranchManager) return "/branch/dashboard"
  return "/dashboard"
}

export function getPortalWorkspaceLabel(options: {
  isBranchManager?: boolean
  isDeliveryBoy?: boolean
}): string {
  if (options.isDeliveryBoy) return "Delivery"
  if (options.isBranchManager) return "Branch Manager"
  return "Admin"
}
