import { useState } from 'react'
import { readList } from '../lib/storage'
import { intervalo, barra, pct, type Tarefa } from '../lib/gantt'

type Envolvido = { pessoaId: string; papel: string }

type Props = {
  tarefas: Tarefa[]
  setTarefas: (fn: (t: Tarefa[]) => Tarefa[]) => void
  envolvidos: Envolvido[]
}

const vazia = {
  descricao: '',
  responsavelId: '',
  inicioPlan: '',
  fimPlan: '',
  inicioReal: '',
  fimReal: '',
  percentual: '',
  predecessoraId: '',
}

function nomePessoa(id: string): string {
  const p = readList<any>('gp.pessoas').find((x) => String(x.id) === String(id))
  return p ? p.nomeCompleto : '—'
}

export default function AbaGantt({ tarefas, setTarefas, envolvidos }: Props) {
  const [nova, setNova] = useState(vazia)
  const [erro, setErro] = useState('')

  // Responsáveis = pessoas envolvidas no projeto (sem repetir)
  const idsEnvolvidos = Array.from(new Set(envolvidos.map((e) => e.pessoaId)))

  function up(campo: keyof typeof vazia, v: string) {
    setNova((n) => ({ ...n, [campo]: v }))
  }

  function adicionar() {
    if (!nova.descricao.trim()) {
      setErro('Informe a descrição da tarefa.')
      return
    }
    const id = tarefas.reduce((m, t) => Math.max(m, t.id), 0) + 1
    setTarefas((l) => [...l, { id, ...nova, descricao: nova.descricao.trim() }])
    setNova(vazia)
    setErro('')
  }

  function remover(id: number) {
    setTarefas((l) => l.filter((t) => t.id !== id).map((t) => (t.predecessoraId === String(id) ? { ...t, predecessoraId: '' } : t)))
  }

  function descPred(id: string): string {
    const t = tarefas.find((x) => String(x.id) === String(id))
    return t ? t.descricao : '—'
  }

  function exportarCSV() {
    const cab = ['Tarefa', 'Responsável', 'Início Plan.', 'Fim Plan.', 'Início Real', 'Fim Real', '% Exec.', 'Predecessora']
    const linhas = tarefas.map((t) => [
      t.descricao,
      nomePessoa(t.responsavelId),
      t.inicioPlan,
      t.fimPlan,
      t.inicioReal,
      t.fimReal,
      t.percentual || '0',
      descPred(t.predecessoraId),
    ])
    const csv = [cab, ...linhas]
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cronograma.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const faixa = intervalo(tarefas)

  return (
    <div>
      {idsEnvolvidos.length === 0 && (
        <p className="muted">Dica: adicione pessoas na aba “Envolvidos” para escolher responsáveis.</p>
      )}

      <div className="grid-add">
        <input
          placeholder="Descrição da tarefa"
          value={nova.descricao}
          onChange={(e) => up('descricao', e.target.value)}
          style={{ minWidth: 200 }}
        />
        <select value={nova.responsavelId} onChange={(e) => up('responsavelId', e.target.value)}>
          <option value="">Responsável…</option>
          {idsEnvolvidos.map((id) => (
            <option key={id} value={id}>
              {nomePessoa(id)}
            </option>
          ))}
        </select>
        <input type="date" title="Início planejado" value={nova.inicioPlan} onChange={(e) => up('inicioPlan', e.target.value)} />
        <input type="date" title="Fim planejado" value={nova.fimPlan} onChange={(e) => up('fimPlan', e.target.value)} />
        <input type="date" title="Início real" value={nova.inicioReal} onChange={(e) => up('inicioReal', e.target.value)} />
        <input type="date" title="Fim real" value={nova.fimReal} onChange={(e) => up('fimReal', e.target.value)} />
        <input
          type="number"
          min="0"
          max="100"
          placeholder="% exec."
          value={nova.percentual}
          onChange={(e) => up('percentual', e.target.value)}
          style={{ width: 90 }}
        />
        <select value={nova.predecessoraId} onChange={(e) => up('predecessoraId', e.target.value)}>
          <option value="">Predecessora…</option>
          {tarefas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.descricao}
            </option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={adicionar}>
          + Tarefa
        </button>
      </div>
      {erro && <p className="form-error">{erro}</p>}

      {tarefas.length > 0 && (
        <>
          {/* Gráfico de Gantt */}
          <h3 className="sub-title">Gráfico de Gantt (planejado)</h3>
          {faixa ? (
            <div className="gantt">
              {tarefas.map((t) => {
                const b = barra(t, faixa)
                return (
                  <div key={t.id} className="gantt-row">
                    <span className="gantt-label" title={t.descricao}>
                      {t.descricao}
                    </span>
                    <div className="gantt-track">
                      {b ? (
                        <div className="gantt-bar" style={{ left: `${b.left}%`, width: `${b.width}%` }}>
                          <div className="gantt-bar-fill" style={{ width: `${pct(t)}%` }} />
                          <span className="gantt-pct">{pct(t)}%</span>
                        </div>
                      ) : (
                        <span className="gantt-sem-data">sem datas</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="muted">Informe datas de início/fim planejadas para desenhar o gráfico.</p>
          )}

          {/* Lista de tarefas */}
          <div className="table-head-row toolbar" style={{ marginTop: 20, paddingLeft: 0, paddingRight: 0, borderBottom: 'none' }}>
            <h3 className="sub-title" style={{ margin: 0 }}>Lista de tarefas</h3>
            <button type="button" className="btn-secondary" onClick={exportarCSV}>
              ⬇ Exportar (Excel/CSV)
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Responsável</th>
                  <th>Início Plan.</th>
                  <th>Fim Plan.</th>
                  <th>Início Real</th>
                  <th>Fim Real</th>
                  <th>% Exec.</th>
                  <th>Predecessora</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tarefas.map((t) => (
                  <tr key={t.id}>
                    <td>{t.descricao}</td>
                    <td>{t.responsavelId ? nomePessoa(t.responsavelId) : '—'}</td>
                    <td>{t.inicioPlan || '—'}</td>
                    <td>{t.fimPlan || '—'}</td>
                    <td>{t.inicioReal || '—'}</td>
                    <td>{t.fimReal || '—'}</td>
                    <td>{t.percentual || '0'}%</td>
                    <td>{t.predecessoraId ? descPred(t.predecessoraId) : '—'}</td>
                    <td>
                      <button type="button" className="btn-link-danger" onClick={() => remover(t.id)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            O gráfico usa as datas <strong>planejadas</strong>; a barra preenchida mostra o % de execução.
          </p>
        </>
      )}
    </div>
  )
}
