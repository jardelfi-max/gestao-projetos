import { supabase } from './supabase'

// Tabelas de cadastro e a chave de cache local usada pelas telas síncronas.
export const TABELAS_CADASTRO = [
  { table: 'pessoas', key: 'gp.pessoas' },
  { table: 'centros', key: 'gp.centros' },
  { table: 'tipos', key: 'gp.tipos' },
  { table: 'categorias', key: 'gp.categorias' },
]

// Puxa todos os cadastros do banco para o cache local (chamado após o login).
export async function syncCadastros() {
  await Promise.all(
    TABELAS_CADASTRO.map(async ({ table, key }) => {
      const { data, error } = await supabase.from(table).select('id, dados').order('id')
      if (!error && data) {
        localStorage.setItem(key, JSON.stringify(data.map((r: any) => ({ id: r.id, ...r.dados }))))
      }
    }),
  )
}
