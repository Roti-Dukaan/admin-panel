"use client"

import * as React from "react"

export function useCachedStoreSelector<T, U>(store: any, selector: (state: T) => U): U {
  const [cachedValue, setCachedValue] = React.useState<U>(() => selector(store.getState()))

  React.useEffect(() => {
    let mounted = true
    const unsubscribe = store.subscribe((state: T) => {
      if (!mounted) return
      const newValue = selector(state)
      if (newValue !== cachedValue) {
        setCachedValue(newValue)
      }
    })

    // Initial sync in case store was hydrated after initial render
    const initialValue = selector(store.getState())
    if (initialValue !== cachedValue) {
      setCachedValue(initialValue)
    }

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [store, selector])

  return cachedValue
}
