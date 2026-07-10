import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { readList } from '../lib/storage'
import { STATUS, corStatus } from '../lib/projetoOpcoes'

type Projeto = {
  id: number
  codigoErp: string
  centroId: string
  status: string
  dataInicio: string
  dataFim: string
  valorOrcado: string
  valorRealizado: string
  percentualExecucao: string
}

function num(v: string): number {
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function labelCentro(id: string): string {
  const c = readList<any>('gp.centros').find((x) => String(x.id) === String(id))
  return c ? `${c.codigo} — ${c.descricao}` : '—'
}

export default function Dashboard() {
  const projetos = readList<Projeto>('gp.projetos')
  const centros = readList<any>('gp.centros')

  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')
  const [centroId, setCentroId] = useState('')
  const [status, setStatus] = useState('')

  const filtrados = useMemo(() => {
    return projetos.filter((p) => {
      if (dataDe && (!p.dataInicio || p.dataInicio < dataDe)) return false
      if (dataAte && (!p.dataInicio || p.dataInicio > dataAte)) return false
      if (centroId && String(p.centroId) !== centroId) return false
      if (status && p.status !== status) return false
      return true
    })
  }, [projetos, dataDe, dataAte, centroId, status])

  const totalOrcado = filtrados.reduce((s, p) => s + num(p.valorOrcado), 0)
  const totalRealizado = filtrados.reduce((s, p) => s + num(p.valorRealizado), 0)
  const consumo = totalOrcado > 0 ? (totalRealizado / totalOrcado) * 100 : 0
  const execucaoMedia =
    filtrados.length > 0
      ? filtrados.reduce((s, p) => s + num(p.percentualExecucao), 0) / filtrados.length
      : 0

  // Funil por status (apenas status com pelo menos 1 projeto)
  const funil = STATUS.map((s) => ({
    status: s,
    qtd: filtrados.filter((p) => p.status === s).length,
    valor: filtrados.filter((p) => p.status === s).reduce((a, p) => a + num(p.valorOrcado), 0),
  })).filter((f) => f.qtd > 0)
  const maxQtd = Math.max(1, ...funil.map((f) => f.qtd))

  function limparFiltros() {
    setDataDe('')
    setDataAte('')
    setCentroId('')
    setStatus('')
  }

  function exportarCSV() {
    const cabecalho = ['ID', 'Código ERP', 'Status', 'Centro de Responsabilidade', 'Início', 'Fim', 'Orçado', 'Realizado', '% Execução']
    const linhas = filtrados.map((p) => [
      p.id,
      p.codigoErp,
      p.status,
      labelCentro(p.centroId),
      p.dataInicio,
      p.dataFim,
      num(p.valorOrcado).toFixed(2),
      num(p.valorRealizado).toFixed(2),
      p.percentualExecucao || '0',
    ])
    const csv = [cabecalho, ...linhas]
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    // BOM p/ acentos abrirem certo no Excel
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'projetos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const kpis = [
    { label: 'Projetos no período', value: String(filtrados.length) },
    { label: 'Valor orçado', value: brl(totalOrcado) },
    { label: 'Valor realizado', value: brl(totalRealizado) },
    { label: '% de consumo', value: `${consumo.toFixed(1)}%` },
    { label: '% de execução (média)', value: `${execucaoMedia.toFixed(1)}%` },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do funil de projetos e indicadores financeiros"
      />

      {/* Filtros */}
      <div className="card filtros">
        <div className="filtros-grid">
          <label className="field">
            <span>Período — de (início)</span>
            <input type="date" value={dataDe} onChange={(e) => setDataDe(e.target.value)} />
          </label>
          <label className="field">
            <span>Período — até (início)</span>
            <input type="date" value={dataAte} onChange={(e) => setDataAte(e.target.value)} />
          </label>
          <label className="field">
            <span>Centro de Responsabilidade</span>
            <select value={centroId} onChange={(e) => setCentroId(e.target.value)}>
              <option value="">Todos</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.descricao}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="filtros-actions">
          <button type="button" className="btn-secondary" onClick={limparFiltros}>
            Limpar filtros
          </button>
          <button type="button" className="btn-secondary" onClick={exportarCSV}>
            ⬇ Exportar (Excel/CSV)
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            🖨 Imprimir / PDF
          </button>
        </div>
      </div>

      {projetos.length === 0 ? (
        <EmptyState
          icon="📋"
          message="Ainda não há projetos para exibir."
          hint="Cadastre projetos em “Projetos → + Novo projeto” para ver o dashboard ganhar vida."
        />
      ) : (
        <>
          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card kpi-card">
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-value">{kpi.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="card-title">Funil de projetos por status</h2>
            {funil.length === 0 ? (
              <p className="muted">Nenhum projeto no filtro atual.</p>
            ) : (
              <div className="funil">
                {funil.map((f) => (
                  <div key={f.status} className="funil-row">
                    <span className="funil-label">{f.status}</span>
                    <div className="funil-bar-wrap">
                      <div
                        className={`funil-bar bar-${corStatus(f.status)}`}
                        style={{ width: `${(f.qtd / maxQtd) * 100}%` }}
                      />
                    </div>
                    <span className="funil-valor">
                      {f.qtd} · {brl(f.valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card table-card">
            <div className="table-head-row">
              <h2 className="card-title">Projetos ({filtrados.length})</h2>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código ERP</th>
                    <th>Status</th>
                    <th>Centro</th>
                    <th>Orçado</th>
                    <th>Realizado</th>
                    <th>% Exec.</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.codigoErp || '—'}</td>
                      <td>
                        <span className={`badge badge-${corStatus(p.status)}`}>{p.status}</span>
                      </td>
                      <td>{labelCentro(p.centroId)}</td>
                      <td>{brl(num(p.valorOrcado))}</td>
                      <td>{brl(num(p.valorRealizado))}</td>
                      <td>{p.percentualExecucao || '0'}%</td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="no-results">
                        Nenhum projeto para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
