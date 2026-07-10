import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function CentrosResponsabilidade() {
  return (
    <div className="page">
      <PageHeader
        title="Centros de Responsabilidade"
        subtitle="Cadastro de centros de custo / responsabilidade"
        action="+ Novo centro"
      />
      <EmptyState
        icon="◈"
        message="Nenhum centro de responsabilidade cadastrado ainda."
      />
    </div>
  )
}
