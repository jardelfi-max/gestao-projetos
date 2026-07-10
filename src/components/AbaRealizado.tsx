import { useState } from 'react'
import { readList } from '../lib/storage'
import {
  MOEDAS,
  fmt,
  num,
  totalRealizado,
  labelCentro,
  labelCategoria,
  type RealizadoLinha,
} from '../lib/financeiro'

type Props = {
  linhas: RealizadoLinha[]
  setLinhas: (fn: (l: RealizadoLinha[]) => RealizadoLinha[]) => void
  totalPrevistoValor: number
}

const linhaVazia = { centroId: '', categoriaId: '', moeda: 'BRL', mesAno: '', valor: '' }

export default function AbaRealizado({ linhas, setLinhas, totalPrevistoValor }: Props) {
  const [nova, setNova] = useState(linhaVazia)
  const [erro, setErro] = useState('')

  const centros = readList<any>('gp.centros')
  const categorias = readList<any>('gp.categorias')

  const totalReal = totalRealizado(linhas)
  const saldo = totalPrevistoValor - totalReal

  function adicionar() {
    if (!nova.centroId || !nova.categoriaId) {
      setErro('Selecione o centro de responsabilidade e a categoria.')
      return
    }
    if (num(nova.valor) <= 0) {
      setErro('Informe um valor maior que zero.')
      return
    }
    if (totalReal + num(nova.valor) > totalPrevistoValor) {
      setErro(
        `Este lançamento faria o total realizado (${fmt(
          totalReal + num(nova.valor),
        )}) ultrapassar o total previsto (${fmt(totalPrevistoValor)}).`,
      )
      return
    }
    const id = linhas.reduce((m, l) => Math.max(m, l.id), 0) + 1
    setLinhas((l) => [...l, { id, ...nova }])
    setNova(linhaVazia)
    setErro('')
  }

  function remover(id: number) {
    setLinhas((l) => l.filter((x) => x.id !== id))
  }

  return (
    <div>
      <div className="resumo-chips">
        <span className="chip">Previsto: <strong>{fmt(totalPrevistoValor)}</strong></span>
        <span className="chip">Realizado: <strong>{fmt(totalReal)}</strong></span>
        <span className={`chip ${saldo < 0 ? 'chip-neg' : 'chip-pos'}`}>
          Saldo: <strong>{fmt(saldo)}</strong>
        </span>
      </div>

      <div className="grid-add">
        <select value={nova.centroId} onChange={(e) => setNova({ ...nova, centroId: e.target.value })}>
          <option value="">Centro de Resp…</option>
          {centros.map((c) => (
            <option key={c.id} value={c.id}>
              {c.codigo} — {c.descricao}
            </option>
          ))}
        </select>
        <select value={nova.categoriaId} onChange={(e) => setNova({ ...nova, categoriaId: e.target.value })}>
          <option value="">Categoria…</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descricao}
            </option>
          ))}
        </select>
        <input
          type="month"
          title="Competência (ano/mês)"
          value={nova.mesAno}
          onChange={(e) => setNova({ ...nova, mesAno: e.target.value })}
        />
        <select value={nova.moeda} onChange={(e) => setNova({ ...nova, moeda: e.target.value })}>
          {MOEDAS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Valor realizado"
          value={nova.valor}
          onChange={(e) => setNova({ ...nova, valor: e.target.value })}
        />
        <button type="button" className="btn-secondary" onClick={adicionar}>
          + Adicionar
        </button>
      </div>

      {erro && <p className="form-error">{erro}</p>}

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Centro de Responsabilidade</th>
              <th>Categoria</th>
              <th>Competência</th>
              <th>Moeda</th>
              <th>Valor Realizado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={6} className="no-results">
                  Nenhum lançamento realizado ainda.
                </td>
              </tr>
            )}
            {linhas.map((l) => (
              <tr key={l.id}>
                <td>{labelCentro(l.centroId)}</td>
                <td>{labelCategoria(l.categoriaId)}</td>
                <td>{l.mesAno || '—'}</td>
                <td>{l.moeda}</td>
                <td>{fmt(num(l.valor), l.moeda)}</td>
                <td>
                  <button type="button" className="btn-link-danger" onClick={() => remover(l.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={4}>Total Realizado</td>
              <td>{fmt(totalReal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
