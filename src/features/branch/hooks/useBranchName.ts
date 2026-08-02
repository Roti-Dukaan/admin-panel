import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { adminAuthApi } from "@/features/admin-auth/api/admin-auth.api";
import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store";
import { branchMenuAvailabilityApi } from "@/lib/api/branch-menu-availability.api";

export const BRANCH_NAME_KEY = ["branch-name"] as const;

async function resolveBranchName(): Promise<string | null> {
  try {
    const me = await adminAuthApi.me();
    if (me.branch?.name) {
      const store = useAdminAuthStore.getState();
      if (store.user) {
        store.setUser({
          ...store.user,
          branchId: me.branchId ?? store.user.branchId,
          branch: me.branch,
        });
      }
      return me.branch.name;
    }
  } catch {
    // fall through to menu summary
  }

  const res = await branchMenuAvailabilityApi.managerSummary();
  return res.success ? res.data.branchName : null;
}

/** Resolved branch display name for branch-scoped managers (auth store + API fallback). */
export function useBranchName() {
  const { isBranchManager, branchId } = useWorkspace();
  const storedName = useAdminAuthStore((s) => s.user?.branch?.name ?? null);

  const fallback = useQuery({
    queryKey: [...BRANCH_NAME_KEY, branchId],
    queryFn: resolveBranchName,
    enabled: isBranchManager && !!branchId && !storedName,
    staleTime: 10 * 60 * 1000,
  });

  return storedName ?? fallback.data ?? null;
}
