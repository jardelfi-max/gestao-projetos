import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

export default function CategoriasProjeto() {
  return (
    <div className="page">
      <PageHeader
        title="Categorias de Projeto"
        subtitle="Cadastro padronizado: ID, descrição e centro de responsabilidade associado"
        action="+ Nova categoria"
      />
      <EmptyState icon="◆" message="Nenhuma categoria de projeto cadastrada ainda." />
    </div>
  )
}
