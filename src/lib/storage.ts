export type WithId = { id: number }

// Lê uma lista salva no navegador (localStorage). Retorna [] se não houver nada.
export function readList<T>(key: string): T[] {
  const salvo = localStorage.getItem(key)
  return salvo ? (JSON.parse(salvo) as T[]) : []
}
