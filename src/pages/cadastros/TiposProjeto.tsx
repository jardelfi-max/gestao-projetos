import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function TiposProjeto() {
  return (
    <div className="page">
      <PageHeader
        title="Tipos de Projeto"
        subtitle="Cadastro de tipos de projeto"
        action="+ Novo tipo"
      />
      <EmptyState icon="◇" message="Nenhum tipo de projeto cadastrado ainda." />
    </div>
  )
}
