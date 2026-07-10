import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import AbaPrevisto from '../components/AbaPrevisto'
import AbaRealizado from '../components/AbaRealizado'
import AbaResumo from '../components/AbaResumo'
import AbaTransferencias from '../components/AbaTransferencias'
import AbaGantt from '../components/AbaGantt'
import { readList } from '../lib/storage'
import { useLocalStorageList } from '../lib/useLocalStorageList'
import { STATUS, PRIORIDADES, PAPEIS, MOTIVOS, corStatus } from '../lib/projetoOpcoes'
import {
  totalPrevisto,
  totalRealizado,
  STATUS_TRAVA_PREVISTO,
  type PrevistoLinha,
  type RealizadoLinha,
} from '../lib/financeiro'
import { type Transferencia } from '../lib/transferencias'
import { type Tarefa } from '../lib/gantt'

type Envolvido = { pessoaId: string; papel: string }

type Projeto = {
  id: number
  codigoErp: string
  matriz: string
  filial: string
  centroId: string
  tipoId: string
  status: string
  bloqueado: string
  prioridade: string
  dataInicio: string
  dataFim: string
  motivos: string[]
  descricaoEscopo: string
  justificativa: string
  retornoEsperado: string
  percentualExecucao: string
  valorOrcado: string
  valorRealizado: string
  previsto: PrevistoLinha[]
  realizado: RealizadoLinha[]
  transferencias: Transferencia[]
  tarefas: Tarefa[]
  envolvidos: Envolvido[]
}

type FormProjeto = Omit<Projeto, 'id'>

const STORAGE_KEY = 'gp.projetos'

const formVazio: FormProjeto = {
  codigoErp: '',
  matriz: '',
  filial: '',
  centroId: '',
  tipoId: '',
  status: 'Em Análise',
  bloqueado: 'Não',
  prioridade: 'Média',
  dataInicio: '',
  dataFim: '',
  motivos: [],
  descricaoEscopo: '',
  justificativa: '',
  retornoEsperado: '',
  percentualExecucao: '',
  valorOrcado: '',
  valorRealizado: '',
  previsto: [],
  realizado: [],
  transferencias: [],
  tarefas: [],
  envolvidos: [],
}

const ABAS = [
  { id: 'dados', label: 'Dados' },
  { id: 'envolvidos', label: 'Envolvidos' },
  { id: 'previsto', label: 'Valor Previsto' },
  { id: 'realizado', label: 'Valor Realizado' },
  { id: 'resumo', label: 'Resumo Financeiro' },
  { id: 'transferencias', label: 'Transferências' },
  { id: 'gantt', label: 'Gantt' },
] as const

type AbaId = (typeof ABAS)[number]['id']

function labelCentro(id: string): string {
  const c = readList<any>('gp.centros').find((x) => String(x.id) === String(id))
  return c ? `${c.codigo} — ${c.descricao}` : '—'
}
function labelPessoa(id: string): string {
  const p = readList<any>('gp.pessoas').find((x) => String(x.id) === String(id))
  return p ? p.nomeCompleto : '—'
}

export default function Projetos() {
  const [projetos, setProjetos] = useLocalStorageList<Projeto>(STORAGE_KEY)
  const [modo, setModo] = useState<'lista' | 'form'>('lista')
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormProjeto>(formVazio)
  const [aba, setAba] = useState<AbaId>('dados')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  const [novoEnvPessoa, setNovoEnvPessoa] = useState('')
  const [novoEnvPapel, setNovoEnvPapel] = useState('')

  const centros = readList<any>('gp.centros')
  const tipos = readList<any>('gp.tipos')
  const pessoas = readList<any>('gp.pessoas')

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return projetos
    return projetos.filter((p) =>
      [p.codigoErp, p.status, labelCentro(p.centroId), p.matriz, p.filial]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [projetos, busca])

  function set<K extends keyof FormProjeto>(campo: K, valor: FormProjeto[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }
  const setPrevisto = (fn: (l: PrevistoLinha[]) => PrevistoLinha[]) =>
    setForm((f) => ({ ...f, previsto: fn(f.previsto) }))
  const setRealizado = (fn: (l: RealizadoLinha[]) => RealizadoLinha[]) =>
    setForm((f) => ({ ...f, realizado: fn(f.realizado) }))
  const setTransferencias = (fn: (t: Transferencia[]) => Transferencia[]) =>
    setForm((f) => ({ ...f, transferencias: fn(f.transferencias) }))
  const setTarefas = (fn: (t: Tarefa[]) => Tarefa[]) =>
    setForm((f) => ({ ...f, tarefas: fn(f.tarefas) }))

  function toggleMotivo(motivo: string) {
    setForm((f) => ({
      ...f,
      motivos: f.motivos.includes(motivo)
        ? f.motivos.filter((m) => m !== motivo)
        : [...f.motivos, motivo],
    }))
  }

  function adicionarEnvolvido() {
    if (!novoEnvPessoa || !novoEnvPapel) return
    if (form.envolvidos.some((e) => e.pessoaId === novoEnvPessoa && e.papel === novoEnvPapel)) return
    set('envolvidos', [...form.envolvidos, { pessoaId: novoEnvPessoa, papel: novoEnvPapel }])
    setNovoEnvPessoa('')
    setNovoEnvPapel('')
  }

  function removerEnvolvido(idx: number) {
    set('envolvidos', form.envolvidos.filter((_, i) => i !== idx))
  }

  function novo() {
    setForm(formVazio)
    setEditId(null)
    setAba('dados')
    setErro('')
    setModo('form')
  }

  function editar(p: Projeto) {
    const { id: _ignore, ...resto } = p
    setForm({ ...formVazio, ...resto })
    setEditId(p.id)
    setAba('dados')
    setErro('')
    setModo('form')
  }

  function excluir(id: number) {
    setProjetos((lista) => lista.filter((p) => p.id !== id))
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.codigoErp.trim()) {
      setErro('O "Código do Projeto ERP" é obrigatório.')
      setAba('dados')
      return
    }
    if (!form.centroId) {
      setErro('O "Centro de Responsabilidade" é obrigatório.')
      setAba('dados')
      return
    }
    // Valores do Dashboard derivam dos grids financeiros.
    const finalizado: FormProjeto = {
      ...form,
      valorOrcado: String(totalPrevisto(form.previsto)),
      valorRealizado: String(totalRealizado(form.realizado)),
    }
    if (editId !== null) {
      setProjetos((lista) => lista.map((p) => (p.id === editId ? { id: editId, ...finalizado } : p)))
    } else {
      const proximoId = projetos.reduce((m, p) => Math.max(m, p.id), 0) + 1
      setProjetos((lista) => [...lista, { id: proximoId, ...finalizado }])
    }
    setModo('lista')
  }

  // ---------------- LISTA ----------------
  if (modo === 'lista') {
    return (
      <div className="page">
        <PageHeader title="Projetos" subtitle="Lista de projetos com busca e edição" />
        <div className="list-toolbar">
          <input
            className="search-input"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔎 Buscar por código, status, centro…"
          />
          <button type="button" className="btn-primary" onClick={novo}>
            + Novo projeto
          </button>
        </div>

        {projetos.length === 0 ? (
          <EmptyState
            icon="📋"
            message="Nenhum projeto cadastrado ainda."
            hint="Clique em “+ Novo projeto” para começar."
          />
        ) : (
          <div className="card table-card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código ERP</th>
                    <th>Status</th>
                    <th>Centro de Responsabilidade</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Envolvidos</th>
                    <th></th>
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
                      <td>{p.dataInicio || '—'}</td>
                      <td>{p.dataFim || '—'}</td>
                      <td>{p.envolvidos.length}</td>
                      <td className="row-actions">
                        <button type="button" className="btn-link" onClick={() => editar(p)}>
                          Editar
                        </button>
                        <button type="button" className="btn-link-danger" onClick={() => excluir(p.id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="no-results">
                        Nenhum resultado para “{busca}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---------------- FORMULÁRIO (com abas) ----------------
  const previstoTravado = STATUS_TRAVA_PREVISTO.includes(form.status)

  return (
    <div className="page">
      <PageHeader
        title={editId !== null ? `Editar projeto #${editId}` : 'Novo projeto'}
        subtitle="Preencha as abas do projeto. Os valores são salvos juntos ao clicar em Salvar."
      />

      <div className="tabs">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`tab ${aba === a.id ? 'tab-active' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <form onSubmit={salvar}>
        {aba === 'dados' && (
          <>
            <div className="card form-card">
              <h2 className="card-title">Identificação</h2>
              <div className="form-grid">
                <label className="field">
                  <span>Código do Projeto ERP *</span>
                  <input
                    value={form.codigoErp}
                    onChange={(e) => set('codigoErp', e.target.value)}
                    placeholder="Ex.: PRJ-2026-001"
                  />
                </label>
                <label className="field">
                  <span>Matriz</span>
                  <input value={form.matriz} onChange={(e) => set('matriz', e.target.value)} />
                </label>
                <label className="field">
                  <span>Filial</span>
                  <input value={form.filial} onChange={(e) => set('filial', e.target.value)} />
                </label>
                <label className="field">
                  <span>Centro de Responsabilidade *</span>
                  <select value={form.centroId} onChange={(e) => set('centroId', e.target.value)}>
                    <option value="">Selecione…</option>
                    {centros.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.descricao}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Tipo de Projeto</span>
                  <select value={form.tipoId} onChange={(e) => set('tipoId', e.target.value)}>
                    <option value="">Selecione…</option>
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.descricao}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Status</span>
                  <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Prioridade</span>
                  <select value={form.prioridade} onChange={(e) => set('prioridade', e.target.value)}>
                    {PRIORIDADES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Bloqueado</span>
                  <select value={form.bloqueado} onChange={(e) => set('bloqueado', e.target.value)}>
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </label>
                <label className="field">
                  <span>Data de Início</span>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => set('dataInicio', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Data Fim</span>
                  <input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => set('dataFim', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>% de Execução</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={form.percentualExecucao}
                    onChange={(e) => set('percentualExecucao', e.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>
            </div>

            <div className="card form-card">
              <h2 className="card-title">Motivo</h2>
              <div className="checklist">
                {MOTIVOS.map((m) => (
                  <label key={m} className="check-item">
                    <input
                      type="checkbox"
                      checked={form.motivos.includes(m)}
                      onChange={() => toggleMotivo(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            <div className="card form-card">
              <h2 className="card-title">Detalhamento</h2>
              <div className="stack">
                <label className="field">
                  <span>Descrição do escopo do projeto</span>
                  <textarea
                    rows={3}
                    value={form.descricaoEscopo}
                    onChange={(e) => set('descricaoEscopo', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Justificativa do projeto</span>
                  <textarea
                    rows={3}
                    value={form.justificativa}
                    onChange={(e) => set('justificativa', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Retorno Esperado</span>
                  <textarea
                    rows={2}
                    value={form.retornoEsperado}
                    onChange={(e) => set('retornoEsperado', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </>
        )}

        {aba === 'envolvidos' && (
          <div className="card form-card">
            <h2 className="card-title">Envolvidos no projeto</h2>
            <p className="muted">Associe pessoas por papel. A mesma pessoa pode ter vários papéis.</p>
            <div className="env-add">
              <select value={novoEnvPessoa} onChange={(e) => setNovoEnvPessoa(e.target.value)}>
                <option value="">Pessoa…</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomeCompleto}
                  </option>
                ))}
              </select>
              <select value={novoEnvPapel} onChange={(e) => setNovoEnvPapel(e.target.value)}>
                <option value="">Papel…</option>
                {PAPEIS.map((papel) => (
                  <option key={papel} value={papel}>
                    {papel}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-secondary" onClick={adicionarEnvolvido}>
                + Adicionar
              </button>
            </div>

            {pessoas.length === 0 && (
              <p className="form-error">
                Cadastre pessoas em “Cadastros → Pessoas” para poder associá-las.
              </p>
            )}

            {form.envolvidos.length > 0 && (
              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Pessoa</th>
                      <th>Papel</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.envolvidos.map((e, idx) => (
                      <tr key={`${e.pessoaId}-${e.papel}`}>
                        <td>{labelPessoa(e.pessoaId)}</td>
                        <td>{e.papel}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-link-danger"
                            onClick={() => removerEnvolvido(idx)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {aba === 'previsto' && (
          <div className="card form-card">
            <h2 className="card-title">Valor Previsto</h2>
            <AbaPrevisto linhas={form.previsto} setLinhas={setPrevisto} readOnly={previstoTravado} />
          </div>
        )}

        {aba === 'realizado' && (
          <div className="card form-card">
            <h2 className="card-title">Valor Realizado</h2>
            <AbaRealizado
              linhas={form.realizado}
              setLinhas={setRealizado}
              totalPrevistoValor={totalPrevisto(form.previsto)}
            />
          </div>
        )}

        {aba === 'resumo' && (
          <div className="card form-card">
            <h2 className="card-title">Resumo Financeiro</h2>
            <AbaResumo previsto={form.previsto} realizado={form.realizado} />
          </div>
        )}

        {aba === 'transferencias' && (
          <div className="card form-card">
            <h2 className="card-title">Transferências de verba</h2>
            <AbaTransferencias
              previsto={form.previsto}
              realizado={form.realizado}
              transferencias={form.transferencias}
              setTransferencias={setTransferencias}
            />
          </div>
        )}

        {aba === 'gantt' && (
          <div className="card form-card">
            <h2 className="card-title">Cronograma (Gantt)</h2>
            <AbaGantt tarefas={form.tarefas} setTarefas={setTarefas} envolvidos={form.envolvidos} />
          </div>
        )}

        {erro && <p className="form-error">{erro}</p>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setModo('lista')}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {editId !== null ? 'Salvar alterações' : 'Salvar projeto'}
          </button>
        </div>
      </form>
    </div>
  )
}
