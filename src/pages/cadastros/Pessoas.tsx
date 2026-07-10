import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function Pessoas() {
  return (
    <div className="page">
      <PageHeader
        title="Pessoas"
        subtitle="Cadastro de usuários: nome, CPF, e-mail, telefone e departamento"
        action="+ Nova pessoa"
      />
      <EmptyState
        icon="◍"
        message="Nenhuma pessoa cadastrada ainda."
        hint="Este será o primeiro cadastro a salvar de verdade, após conectarmos o banco."
      />
    </div>
  )
}
