/** True when the branch manager order alert provider should be active. */
export function shouldEnableBranchOrderAlerts(
  pathname: string,
  options: { isBranchManager: boolean; isAuthenticated: boolean },
): boolean {
  if (!options.isAuthenticated) return false;
  if (options.isBranchManager) return true;
  return pathname === "/branch" || pathname.startsWith("/branch/");
}
