import { useState } from 'react'
import { readList } from '../lib/storage'
import {
  MOEDAS,
  fmt,
  num,
  totalLinhaPrevisto,
  totalPrevisto,
  labelCentro,
  labelCategoria,
  type PrevistoLinha,
} from '../lib/financeiro'

type Props = {
  linhas: PrevistoLinha[]
  setLinhas: (fn: (l: PrevistoLinha[]) => PrevistoLinha[]) => void
  readOnly: boolean
}

const linhaVazia = { centroId: '', categoriaId: '', moeda: 'BRL', mesAno: '', valor: '', impostos: '' }

export default function AbaPrevisto({ linhas, setLinhas, readOnly }: Props) {
  const [nova, setNova] = useState(linhaVazia)
  const [erro, setErro] = useState('')

  const centros = readList<any>('gp.centros')
  const categorias = readList<any>('gp.categorias')

  function adicionar() {
    if (!nova.centroId || !nova.categoriaId) {
      setErro('Selecione o centro de responsabilidade e a categoria.')
      return
    }
    if (num(nova.valor) <= 0) {
      setErro('Informe um valor maior que zero.')
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

  const total = totalPrevisto(linhas)

  return (
    <div>
      {readOnly && (
        <div className="lock-banner">
          🔒 Grid travado porque o projeto está aprovado ou além. A edição ficará liberada
          apenas para o perfil <strong>PMO</strong> (virá com o login/permissões).
        </div>
      )}

      {!readOnly && (
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
            placeholder="Valor"
            value={nova.valor}
            onChange={(e) => setNova({ ...nova, valor: e.target.value })}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Impostos/Taxas"
            value={nova.impostos}
            onChange={(e) => setNova({ ...nova, impostos: e.target.value })}
          />
          <button type="button" className="btn-secondary" onClick={adicionar}>
            + Adicionar
          </button>
        </div>
      )}

      {erro && <p className="form-error">{erro}</p>}
      {categorias.length === 0 && (
        <p className="muted">Dica: cadastre categorias em “Cadastros → Categorias de Projeto”.</p>
      )}

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Centro de Responsabilidade</th>
              <th>Categoria</th>
              <th>Competência</th>
              <th>Moeda</th>
              <th>Valor</th>
              <th>Impostos/Taxas</th>
              <th>Total</th>
              {!readOnly && <th></th>}
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={readOnly ? 7 : 8} className="no-results">
                  Nenhum lançamento previsto ainda.
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
                <td>{fmt(num(l.impostos), l.moeda)}</td>
                <td>{fmt(totalLinhaPrevisto(l), l.moeda)}</td>
                {!readOnly && (
                  <td>
                    <button type="button" className="btn-link-danger" onClick={() => remover(l.id)}>
                      Remover
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={6}>Total Previsto</td>
              <td>{fmt(total)}</td>
              {!readOnly && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
