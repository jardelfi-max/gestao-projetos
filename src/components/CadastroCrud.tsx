import { useMemo, useState } from 'react'
import PageHeader from './PageHeader'
import EmptyState from './EmptyState'
import { readList, type WithId } from '../lib/storage'
import { useLocalStorageList } from '../lib/useLocalStorageList'

export type Campo = {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  type?: 'text' | 'email'
  // Quando preenchido, o campo vira um <select> com opções vindas de outro cadastro.
  select?: {
    optionsKey: string
    getLabel: (item: any) => string
  }
}

type Registro = WithId & Record<string, string>

type Props = {
  title: string
  subtitle?: string
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
  storageKey,
  campos,
  emptyIcon = '📄',
  addLabel,
}: Props) {
  const [itens, setItens] = useLocalStorageList<Registro>(storageKey)
  const [form, setForm] = useState<Record<string, string>>(() => formInicial(campos))
  const [editId, setEditId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  function atualizar(name: string, valor: string) {
    setForm((f) => ({ ...f, [name]: valor }))
  }

  function rotuloOpcao(campo: Campo, valor: string): string {
    if (!campo.select || !valor) return valor || '—'
    const opcoes = readList<any>(campo.select.optionsKey)
    const achado = opcoes.find((o) => String(o.id) === String(valor))
    return achado ? campo.select.getLabel(achado) : '—'
  }

  function textoBusca(item: Registro): string {
    return campos.map((c) => rotuloOpcao(c, item[c.name])).join(' ').toLowerCase()
  }

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return itens
    return itens.filter((i) => textoBusca(i).includes(q))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, busca])

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    for (const campo of campos) {
      if (campo.required && !form[campo.name]?.trim()) {
        setErro(`O campo "${campo.label}" é obrigatório.`)
        return
      }
    }

    if (editId !== null) {
      setItens((lista) =>
        lista.map((i) => {
          if (i.id !== editId) return i
          const atualizado = { ...i }
          for (const campo of campos) atualizado[campo.name] = (form[campo.name] ?? '').trim()
          return atualizado
        }),
      )
    } else {
      const proximoId = itens.reduce((m, i) => Math.max(m, i.id), 0) + 1
      const novo = { id: proximoId } as Registro
      for (const campo of campos) novo[campo.name] = (form[campo.name] ?? '').trim()
      setItens((lista) => [...lista, novo])
    }

    cancelarEdicao()
  }

  function editar(item: Registro) {
    const preenchido: Record<string, string> = {}
    for (const campo of campos) preenchido[campo.name] = item[campo.name] ?? ''
    setForm(preenchido)
    setEditId(item.id)
    setErro('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setForm(formInicial(campos))
    setEditId(null)
    setErro('')
  }

  function excluir(id: number) {
    setItens((lista) => lista.filter((i) => i.id !== id))
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
                  onChange={(e) => atualizar(campo.name, e.target.value)}
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
                  onChange={(e) => atualizar(campo.name, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>

        {erro && <p className="form-error">{erro}</p>}

        <div className="form-actions">
          {editando && (
            <button type="button" className="btn-secondary" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary">
            {editando ? 'Salvar alterações' : addLabel}
          </button>
        </div>
      </form>

      {itens.length === 0 ? (
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
                        onClick={() => excluir(item.id)}
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
