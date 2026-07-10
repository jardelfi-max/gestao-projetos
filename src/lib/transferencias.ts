import { num, totalLinhaPrevisto, type PrevistoLinha, type RealizadoLinha } from './financeiro'

export type Transferencia = {
  id: number
  centroOrigemId: string
  categoriaOrigemId: string
  centroDestinoId: string
  categoriaDestinoId: string
  valor: string
  justificativa: string
  status: string
}

// Estágios do fluxo de aprovação (em ordem).
export const FLUXO = ['Solicitada', 'Aprovada PMO', 'Aprovada Gerente', 'Aprovada Board', 'Efetivada'] as const
export const REJEITADA = 'Rejeitada'

// Dado o status atual, qual a próxima ação de aprovação (rótulo + próximo estágio).
export function proximaAcao(status: string): { label: string; proximo: string } | null {
  switch (status) {
    case 'Solicitada':
      return { label: 'Aprovar (PMO)', proximo: 'Aprovada PMO' }
    case 'Aprovada PMO':
      return { label: 'Aprovar (Gerente CC)', proximo: 'Aprovada Gerente' }
    case 'Aprovada Gerente':
      return { label: 'Aprovar (Board)', proximo: 'Aprovada Board' }
    case 'Aprovada Board':
      return { label: 'Efetivar transferência', proximo: 'Efetivada' }
    default:
      return null
  }
}

export function comboKey(centroId: string, categoriaId: string): string {
  return `${centroId}|${categoriaId}`
}

export type SaldoCombo = {
  centroId: string
  categoriaId: string
  previsto: number
  realizado: number
  transfIn: number
  transfOut: number
  saldo: number
}

// Calcula o saldo disponível por combinação centro+categoria,
// considerando apenas transferências EFETIVADAS para mover verba.
export function saldosPorCombo(
  previsto: PrevistoLinha[],
  realizado: RealizadoLinha[],
  transferencias: Transferencia[],
): SaldoCombo[] {
  const mapa = new Map<string, SaldoCombo>()
  const garante = (centroId: string, categoriaId: string) => {
    const k = comboKey(centroId, categoriaId)
    if (!mapa.has(k)) {
      mapa.set(k, { centroId, categoriaId, previsto: 0, realizado: 0, transfIn: 0, transfOut: 0, saldo: 0 })
    }
    return mapa.get(k)!
  }

  previsto.forEach((l) => (garante(l.centroId, l.categoriaId).previsto += totalLinhaPrevisto(l)))
  realizado.forEach((l) => (garante(l.centroId, l.categoriaId).realizado += num(l.valor)))
  transferencias
    .filter((t) => t.status === 'Efetivada')
    .forEach((t) => {
      garante(t.centroOrigemId, t.categoriaOrigemId).transfOut += num(t.valor)
      garante(t.centroDestinoId, t.categoriaDestinoId).transfIn += num(t.valor)
    })

  for (const c of mapa.values()) {
    c.saldo = c.previsto + c.transfIn - c.transfOut - c.realizado
  }
  return Array.from(mapa.values())
}

export function saldoDoCombo(combos: SaldoCombo[], centroId: string, categoriaId: string): number {
  const c = combos.find((x) => x.centroId === centroId && x.categoriaId === categoriaId)
  return c ? c.saldo : 0
}
