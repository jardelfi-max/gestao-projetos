import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// Hook de cadastro com dados no Supabase (tabela com coluna JSONB "dados").
// Mantém também um cache no localStorage (cacheKey) para as telas que ainda
// leem de forma síncrona (Projetos, Dashboard).
export function useCadastro(table: string, cacheKey: string) {
  const [items, setItems] = useState<Array<Record<string, any> & { id: number }>>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from(table).select('id, dados').order('id')
    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }
    const lista = (data ?? []).map((r: any) => ({ id: r.id as number, ...r.dados }))
    setItems(lista)
    localStorage.setItem(cacheKey, JSON.stringify(lista))
    setErro(null)
    setLoading(false)
  }, [table, cacheKey])

  useEffect(() => {
    carregar()
  }, [carregar])

  const adicionar = useCallback(
    async (dados: Record<string, any>) => {
      const { error } = await supabase.from(table).insert({ dados })
      if (error) {
        setErro(error.message)
        return false
      }
      await carregar()
      return true
    },
    [table, carregar],
  )

  const atualizar = useCallback(
    async (id: number, dados: Record<string, any>) => {
      const { error } = await supabase.from(table).update({ dados }).eq('id', id)
      if (error) {
        setErro(error.message)
        return false
      }
      await carregar()
      return true
    },
    [table, carregar],
  )

  const excluir = useCallback(
    async (id: number) => {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) {
        setErro(error.message)
        return false
      }
      await carregar()
      return true
    },
    [table, carregar],
  )

  return { items, loading, erro, adicionar, atualizar, excluir }
}
