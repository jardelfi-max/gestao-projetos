import { useState } from 'react'
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

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    for (const campo of campos) {
      if (campo.required && !form[campo.name]?.trim()) {
        setErro(`O campo "${campo.label}" é obrigatório.`)
        return
      }
    }
    const proximoId = itens.reduce((m, i) => Math.max(m, i.id), 0) + 1
    const novo = { id: proximoId } as Registro
    for (const campo of campos) novo[campo.name] = (form[campo.name] ?? '').trim()

    setItens((lista) => [...lista, novo])
    setForm(formInicial(campos))
    setErro('')
  }

  function excluir(id: number) {
    setItens((lista) => lista.filter((i) => i.id !== id))
  }

  return (
    <div className="page">
      <PageHeader title={title} subtitle={subtitle} />

      <form className="card form-card" onSubmit={adicionar}>
        <h2 className="card-title">{addLabel}</h2>
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
          <button type="submit" className="btn-primary">
            {addLabel}
          </button>
        </div>
      </form>

      {itens.length === 0 ? (
        <EmptyState icon={emptyIcon} message="Nenhum registro cadastrado ainda." />
      ) : (
        <div className="card table-card">
          <div className="table-head-row">
            <h2 className="card-title">Cadastrados ({itens.length})</h2>
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
                {itens.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    {campos.map((c) => (
                      <td key={c.name}>{rotuloOpcao(c, item[c.name])}</td>
                    ))}
                    <td>
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
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
