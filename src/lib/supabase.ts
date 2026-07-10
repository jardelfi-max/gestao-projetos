import { createClient } from '@supabase/supabase-js'

// Os valores vêm de variáveis de ambiente do Vite (arquivo .env.local).
// A chave "anon" é pública por natureza (protegida pelas regras RLS do banco).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigurado = Boolean(url && anon)

// Cliente único do Supabase para todo o app.
export const supabase = createClient(url ?? 'http://localhost', anon ?? 'anon-placeholder')
