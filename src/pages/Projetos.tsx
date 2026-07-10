import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

export default function Projetos() {
  return (
    <div className="page">
      <PageHeader
        title="Projetos"
        subtitle="Lista de projetos com filtros e exportação"
        action="+ Novo projeto"
      />
      <EmptyState
        icon="📋"
        message="Nenhum projeto cadastrado ainda."
        hint="A lista, os filtros e o cadastro completo chegam nas próximas etapas."
      />
    </div>
  )
}
