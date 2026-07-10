import { readList } from './storage'

export type PrevistoLinha = {
  id: number
  centroId: string
  categoriaId: string
  moeda: string
  mesAno: string
  valor: string
  impostos: string
}

export type RealizadoLinha = {
  id: number
  centroId: string
  categoriaId: string
  moeda: string
  mesAno: string
  valor: string
}

export const MOEDAS = ['BRL', 'USD', 'EUR'] as const

// Status a partir dos quais o grid de Valor Previsto fica travado (só PMO edita — futuro).
export const STATUS_TRAVA_PREVISTO = ['Aprovado', 'Em compras', 'Em execução', 'Finalizado']

export function num(v: string): number {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function fmt(valor: number, moeda = 'BRL'): string {
  try {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: moeda })
  } catch {
    return valor.toFixed(2)
  }
}

export function totalLinhaPrevisto(l: PrevistoLinha): number {
  return num(l.valor) + num(l.impostos)
}

export function totalPrevisto(linhas: PrevistoLinha[]): number {
  return linhas.reduce((s, l) => s + totalLinhaPrevisto(l), 0)
}

export function totalRealizado(linhas: RealizadoLinha[]): number {
  return linhas.reduce((s, l) => s + num(l.valor), 0)
}

export function labelCentro(id: string): string {
  const c = readList<any>('gp.centros').find((x) => String(x.id) === String(id))
  return c ? `${c.codigo} — ${c.descricao}` : '—'
}

export function labelCategoria(id: string): string {
  const c = readList<any>('gp.categorias').find((x) => String(x.id) === String(id))
  return c ? c.descricao : '—'
}
