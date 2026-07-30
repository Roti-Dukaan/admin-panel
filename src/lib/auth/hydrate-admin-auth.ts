import { useAdminAuthStore } from "@/features/admin-auth/store/admin-auth-store"

/** Wait for zustand persist rehydration; always resolves (never blocks UI forever). */
export function hydrateAdminAuth(onReady: () => void): () => void {
  let finished = false

  const finish = () => {
    if (finished) return
    finished = true
    onReady()
  }

  const unsubscribe = useAdminAuthStore.persist.onFinishHydration(finish)

  if (useAdminAuthStore.persist.hasHydrated()) {
    finish()
  } else {
    try {
      useAdminAuthStore.persist.rehydrate()
    } catch {
      finish()
    }
  }

  const timeout = window.setTimeout(finish, 500)

  return () => {
    unsubscribe()
    window.clearTimeout(timeout)
  }
}
