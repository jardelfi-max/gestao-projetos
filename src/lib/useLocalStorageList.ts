import { useEffect, useState } from 'react'
import { readList } from './storage'

// Hook que mantém uma lista sincronizada com o localStorage do navegador.
export function useLocalStorageList<T>(key: string) {
  const [items, setItems] = useState<T[]>(() => readList<T>(key))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items))
  }, [key, items])

  return [items, setItems] as const
}
