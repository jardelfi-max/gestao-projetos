import { useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import { readList } from '../../lib/storage'
import { useCadastro } from '../../lib/useCadastro'

const PERFIS = ['Gerente', 'Diretor', 'Supervisor', 'Solicitante'] as const

type Responsavel = {
  pessoaId: string
  perfil: string
  dataInicio: string
  dataFim: string
}

type FormCentro = {
  codigo: string
  descricao: string
  responsaveis: Responsavel[]
}

const formVazio: FormCentro = { codigo: '', descricao: '', responsaveis: [] }
const respVazio = { pessoaId: '', perfil: '', dataInicio: '', dataFim: '' }

function nomePessoa(id: string): string {
  const p = readList<any>('gp.pessoas').find((x) => String(x.id) === String(id))
  return p ? p.nomeCompleto : '—'
}

export default function CentrosResponsabilidade() {
  const { items, loading, erro, adicionar, atualizar, excluir } = useCadastro('centros', 'gp.centros')
  const [form, setForm] = useState<FormCentro>(formVazio)
  const [editId, setEditId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [novoResp, setNovoResp] = useState(respVazio)

  const pessoas = readList<any>('gp.pessoas')

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => `${c.codigo} ${c.descricao}`.toLowerCase().includes(q))
  }, [items, busca])

  function up(campo: 'codigo' | 'descricao', v: string) {
    setForm((f) => ({ ...f, [campo]: v }))
  }

  function adicionarResp() {
    if (!novoResp.pessoaId || !novoResp.perfil) {
      setErroForm('Selecione a pessoa e o perfil para associar.')
      return
    }
    setForm((f) => ({ ...f, responsaveis: [...f.responsaveis, novoResp] }))
    setNovoResp(respVazio)
    setErroForm('')
  }

  function removerResp(idx: number) {
    setForm((f) => ({ ...f, responsaveis: f.responsaveis.filter((_, i) => i !== idx) }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.codigo.trim()) {
      setErroForm('O código é obrigatório.')
      return
    }
    if (!form.descricao.trim()) {
      setErroForm('A descrição é obrigatória.')
      return
    }
    const dados = {
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      responsaveis: form.responsaveis,
    }
    setSalvando(true)
    const ok = editId !== null ? await atualizar(editId, dados) : await adicionar(dados)
    setSalvando(false)
    if (ok) cancelar()
    else setErroForm('Não foi possível salvar. Tente novamente.')
  }

  function editar(c: any) {
    setForm({ codigo: c.codigo ?? '', descricao: c.descricao ?? '', responsaveis: c.responsaveis ?? [] })
    setEditId(c.id)
    setErroForm('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setForm(formVazio)
    setNovoResp(respVazio)
    setEditId(null)
    setErroForm('')
  }

  async function remover(id: number) {
    await excluir(id)
    if (editId === id) cancelar()
  }

  const editando = editId !== null

  return (
    <div className="page">
      <PageHeader
        title="Centros de Responsabilidade"
        subtitle="Cadastro de centros com pessoas associadas por perfil e período"
      />

      <form className="card form-card" onSubmit={salvar}>
        <h2 className="card-title">{editando ? 'Editar centro' : '+ Novo centro'}</h2>
        <div className="form-grid">
          <label className="field">
            <span>Código *</span>
            <input value={form.codigo} onChange={(e) => up('codigo', e.target.value)} placeholder="Ex.: CR-001" />
          </label>
          <label className="field">
            <span>Descrição *</span>
            <input
              value={form.descricao}
              onChange={(e) => up('descricao', e.target.value)}
              placeholder="Ex.: Operações Portuárias"
            />
          </label>
        </div>

        <h3 className="sub-title">Pessoas associadas (por perfil e período)</h3>
        {pessoas.length === 0 && (
          <p className="muted">Cadastre pessoas em “Cadastros → Pessoas” para poder associá-las.</p>
        )}
        <div className="grid-add">
          <select value={novoResp.pessoaId} onChange={(e) => setNovoResp({ ...novoResp, pessoaId: e.target.value })}>
            <option value="">Pessoa…</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nomeCompleto}
              </option>
            ))}
          </select>
          <select value={novoResp.perfil} onChange={(e) => setNovoResp({ ...novoResp, perfil: e.target.value })}>
            <option value="">Perfil…</option>
            {PERFIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="date"
            title="Início da vigência"
            value={novoResp.dataInicio}
            onChange={(e) => setNovoResp({ ...novoResp, dataInicio: e.target.value })}
          />
          <input
            type="date"
            title="Fim da vigência"
            value={novoResp.dataFim}
            onChange={(e) => setNovoResp({ ...novoResp, dataFim: e.target.value })}
          />
          <button type="button" className="btn-secondary" onClick={adicionarResp}>
            + Associar
          </button>
        </div>

        {form.responsaveis.length > 0 && (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Perfil</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.responsaveis.map((r, idx) => (
                  <tr key={idx}>
                    <td>{nomePessoa(r.pessoaId)}</td>
                    <td>{r.perfil}</td>
                    <td>{r.dataInicio || '—'}</td>
                    <td>{r.dataFim || '—'}</td>
                    <td>
                      <button type="button" className="btn-link-danger" onClick={() => removerResp(idx)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {erroForm && <p className="form-error">{erroForm}</p>}

        <div className="form-actions">
          {editando && (
            <button type="button" className="btn-secondary" onClick={cancelar}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : '+ Adicionar centro'}
          </button>
        </div>
      </form>

      {erro && <p className="form-error">Erro ao acessar o banco: {erro}</p>}

      {loading ? (
        <div className="card empty-state">
          <p className="muted">Carregando do banco…</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="◈" message="Nenhum centro cadastrado ainda." />
      ) : (
        <div className="card table-card">
          <div className="table-head-row toolbar">
            <h2 className="card-title">Cadastrados ({filtrados.length})</h2>
            <input
              className="search-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="🔎 Buscar…"
            />
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th>Responsáveis</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c, idx) => (
                  <tr key={c.id}>
                    <td>{idx + 1}</td>
                    <td>{c.codigo}</td>
                    <td>{c.descricao}</td>
                    <td>{(c.responsaveis ?? []).length}</td>
                    <td className="row-actions">
                      <button type="button" className="btn-link" onClick={() => editar(c)}>
                        Editar
                      </button>
                      <button type="button" className="btn-link-danger" onClick={() => remover(c.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="no-results">
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
