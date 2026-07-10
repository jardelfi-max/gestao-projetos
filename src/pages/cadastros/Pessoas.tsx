import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

type Pessoa = {
  id: number
  nomeCompleto: string
  cpf: string
  email: string
  telefone: string
  departamento: string
}

const STORAGE_KEY = 'gp.pessoas'

const formVazio = {
  nomeCompleto: '',
  cpf: '',
  email: '',
  telefone: '',
  departamento: '',
}

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    return salvo ? (JSON.parse(salvo) as Pessoa[]) : []
  })
  const [form, setForm] = useState(formVazio)
  const [erro, setErro] = useState('')

  // Salva no navegador sempre que a lista muda
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pessoas))
  }, [pessoas])

  function atualizarCampo(campo: keyof typeof formVazio, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function adicionar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nomeCompleto.trim()) {
      setErro('O nome completo é obrigatório.')
      return
    }
    if (!form.email.trim()) {
      setErro('O e-mail é obrigatório.')
      return
    }
    const nova: Pessoa = {
      id: Date.now(),
      nomeCompleto: form.nomeCompleto.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      departamento: form.departamento.trim(),
    }
    setPessoas((lista) => [...lista, nova])
    setForm(formVazio)
    setErro('')
  }

  function excluir(id: number) {
    setPessoas((lista) => lista.filter((p) => p.id !== id))
  }

  return (
    <div className="page">
      <PageHeader
        title="Pessoas"
        subtitle="Cadastro de usuários: nome, CPF, e-mail, telefone e departamento"
      />

      <form className="card form-card" onSubmit={adicionar}>
        <h2 className="card-title">Nova pessoa</h2>
        <div className="form-grid">
          <label className="field">
            <span>Nome completo *</span>
            <input
              value={form.nomeCompleto}
              onChange={(e) => atualizarCampo('nomeCompleto', e.target.value)}
              placeholder="Ex.: Maria Silva"
            />
          </label>
          <label className="field">
            <span>CPF</span>
            <input
              value={form.cpf}
              onChange={(e) => atualizarCampo('cpf', e.target.value)}
              placeholder="000.000.000-00"
            />
          </label>
          <label className="field">
            <span>E-mail *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => atualizarCampo('email', e.target.value)}
              placeholder="maria@empresa.com"
            />
          </label>
          <label className="field">
            <span>Telefone</span>
            <input
              value={form.telefone}
              onChange={(e) => atualizarCampo('telefone', e.target.value)}
              placeholder="(47) 90000-0000"
            />
          </label>
          <label className="field">
            <span>Departamento</span>
            <input
              value={form.departamento}
              onChange={(e) => atualizarCampo('departamento', e.target.value)}
              placeholder="Ex.: TI"
            />
          </label>
        </div>

        {erro && <p className="form-error">{erro}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            + Adicionar pessoa
          </button>
        </div>
      </form>

      {pessoas.length === 0 ? (
        <EmptyState icon="◍" message="Nenhuma pessoa cadastrada ainda." />
      ) : (
        <div className="card table-card">
          <div className="table-head-row">
            <h2 className="card-title">
              Pessoas cadastradas ({pessoas.length})
            </h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome completo</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Departamento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nomeCompleto}</td>
                    <td>{p.cpf || '—'}</td>
                    <td>{p.email}</td>
                    <td>{p.telefone || '—'}</td>
                    <td>{p.departamento || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-link-danger"
                        onClick={() => excluir(p.id)}
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
