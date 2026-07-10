import {
  fmt,
  num,
  totalLinhaPrevisto,
  labelCentro,
  labelCategoria,
  type PrevistoLinha,
  type RealizadoLinha,
} from '../lib/financeiro'

type Props = {
  previsto: PrevistoLinha[]
  realizado: RealizadoLinha[]
}

type LinhaResumo = {
  chave: string
  centroId: string
  categoriaId: string
  previsto: number
  realizado: number
}

export default function AbaResumo({ previsto, realizado }: Props) {
  const mapa = new Map<string, LinhaResumo>()

  function garante(centroId: string, categoriaId: string): LinhaResumo {
    const chave = `${centroId}|${categoriaId}`
    if (!mapa.has(chave)) {
      mapa.set(chave, { chave, centroId, categoriaId, previsto: 0, realizado: 0 })
    }
    return mapa.get(chave)!
  }

  previsto.forEach((l) => {
    garante(l.centroId, l.categoriaId).previsto += totalLinhaPrevisto(l)
  })
  realizado.forEach((l) => {
    garante(l.centroId, l.categoriaId).realizado += num(l.valor)
  })

  const linhas = Array.from(mapa.values())
  const totPrev = linhas.reduce((s, l) => s + l.previsto, 0)
  const totReal = linhas.reduce((s, l) => s + l.realizado, 0)

  if (linhas.length === 0) {
    return (
      <p className="muted">
        Lance valores nas abas “Valor Previsto” e “Valor Realizado” para ver o resumo por centro e
        categoria.
      </p>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Centro de Responsabilidade</th>
            <th>Categoria</th>
            <th>Total Previsto</th>
            <th>Total Realizado</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const saldo = l.previsto - l.realizado
            return (
              <tr key={l.chave}>
                <td>{labelCentro(l.centroId)}</td>
                <td>{labelCategoria(l.categoriaId)}</td>
                <td>{fmt(l.previsto)}</td>
                <td>{fmt(l.realizado)}</td>
                <td className={saldo < 0 ? 'saldo-neg' : 'saldo-pos'}>{fmt(saldo)}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan={2}>Total geral</td>
            <td>{fmt(totPrev)}</td>
            <td>{fmt(totReal)}</td>
            <td className={totPrev - totReal < 0 ? 'saldo-neg' : 'saldo-pos'}>
              {fmt(totPrev - totReal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
