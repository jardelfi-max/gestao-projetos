import { useMemo, useState } from 'react'
import PageHeader from './PageHeader'
import EmptyState from './EmptyState'
import { readList } from '../lib/storage'
import { useCadastro } from '../lib/useCadastro'

export type Campo = {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  type?: 'text' | 'email'
  // Quando preenchido, o campo vira um <select> com opções vindas de outro cadastro (cache local).
  select?: {
    optionsKey: string
    getLabel: (item: any) => string
  }
}

type Props = {
  title: string
  subtitle?: string
  table: string
  storageKey: string
  campos: Campo[]
  emptyIcon?: string
  addLabel: string
}

function formInicial(campos: Campo[]): Record<string, string> {
  return Object.fromEntries(campos.map((c) => [c.name, '']))
}

export default function CadastroCrud({
  title,
  subtitle,
  table,
  storageKey,
  campos,
  emptyIcon = '📄',
  addLabel,
}: Props) {
  const { items, loading, erro, adicionar, atualizar, excluir } = useCadastro(table, storageKey)
  const [form, setForm] = useState<Record<string, string>>(() => formInicial(campos))
  const [editId, setEditId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [salvando, setSalvando] = useState(false)

  function atualizarCampo(name: string, valor: string) {
    setForm((f) => ({ ...f, [name]: valor }))
  }

  function rotuloOpcao(campo: Campo, valor: string): string {
    if (!campo.select || !valor) return valor || '—'
    const opcoes = readList<any>(campo.select.optionsKey)
    const achado = opcoes.find((o) => String(o.id) === String(valor))
    return achado ? campo.select.getLabel(achado) : '—'
  }

  function textoBusca(item: Record<string, any>): string {
    return campos.map((c) => rotuloOpcao(c, item[c.name])).join(' ').toLowerCase()
  }

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => textoBusca(i).includes(q))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, busca])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    for (const campo of campos) {
      if (campo.required && !form[campo.name]?.trim()) {
        setErroForm(`O campo "${campo.label}" é obrigatório.`)
        return
      }
    }
    const dados: Record<string, string> = {}
    for (const campo of campos) dados[campo.name] = (form[campo.name] ?? '').trim()

    setSalvando(true)
    const ok = editId !== null ? await atualizar(editId, dados) : await adicionar(dados)
    setSalvando(false)
    if (ok) cancelarEdicao()
    else setErroForm('Não foi possível salvar. Tente novamente.')
  }

  function editar(item: Record<string, any>) {
    const preenchido: Record<string, string> = {}
    for (const campo of campos) preenchido[campo.name] = item[campo.name] ?? ''
    setForm(preenchido)
    setEditId(item.id)
    setErroForm('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setForm(formInicial(campos))
    setEditId(null)
    setErroForm('')
  }

  async function remover(id: number) {
    await excluir(id)
    if (editId === id) cancelarEdicao()
  }

  const editando = editId !== null

  return (
    <div className="page">
      <PageHeader title={title} subtitle={subtitle} />

      <form className="card form-card" onSubmit={salvar}>
        <h2 className="card-title">{editando ? 'Editar registro' : addLabel}</h2>
        <div className="form-grid">
          {campos.map((campo) => (
            <label className="field" key={campo.name}>
              <span>
                {campo.label}
                {campo.required && ' *'}
              </span>
              {campo.select ? (
                <select
                  value={form[campo.name]}
                  onChange={(e) => atualizarCampo(campo.name, e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {readList<any>(campo.select.optionsKey).map((o) => (
                    <option key={o.id} value={o.id}>
                      {campo.select!.getLabel(o)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={campo.type ?? 'text'}
                  value={form[campo.name]}
                  placeholder={campo.placeholder}
                  onChange={(e) => atualizarCampo(campo.name, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>

        {erroForm && <p className="form-error">{erroForm}</p>}

        <div className="form-actions">
          {editando && (
            <button type="button" className="btn-secondary" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : addLabel}
          </button>
        </div>
      </form>

      {erro && (
        <p className="form-error">
          Erro ao acessar o banco: {erro}. Verifique se as tabelas foram criadas no Supabase.
        </p>
      )}

      {loading ? (
        <div className="card empty-state">
          <p className="muted">Carregando do banco…</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={emptyIcon} message="Nenhum registro cadastrado ainda." />
      ) : (
        <div className="card table-card">
          <div className="table-head-row toolbar">
            <h2 className="card-title">Cadastrados ({itensFiltrados.length})</h2>
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
                  {campos.map((c) => (
                    <th key={c.name}>{c.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    {campos.map((c) => (
                      <td key={c.name}>{rotuloOpcao(c, item[c.name])}</td>
                    ))}
                    <td className="row-actions">
                      <button type="button" className="btn-link" onClick={() => editar(item)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-link-danger"
                        onClick={() => remover(item.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {itensFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={campos.length + 2} className="no-results">
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
