"use client"

import * as React from "react"

export function useCachedStoreSelector<T, U>(store: any, selector: (state: T) => U): U {
  const [cachedValue, setCachedValue] = React.useState<U>(() => selector(store.getState()))

  React.useEffect(() => {
    const unsubscribe = store.subscribe((state: T) => {
      const newValue = selector(state)
      if (newValue !== cachedValue) {
        setCachedValue(newValue)
      }
    })

    return () => unsubscribe()
  }, [store, selector, cachedValue])

  return cachedValue
}
