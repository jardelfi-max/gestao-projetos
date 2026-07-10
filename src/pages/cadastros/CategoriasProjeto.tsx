import CadastroCrud, { type Campo } from '../../components/CadastroCrud'

const campos: Campo[] = [
  { name: 'descricao', label: 'Descrição', required: true, placeholder: 'Ex.: Obras Civis' },
  {
    name: 'centroId',
    label: 'Centro de Responsabilidade',
    required: true,
    select: {
      optionsKey: 'gp.centros',
      getLabel: (o) => `${o.codigo} — ${o.descricao}`,
    },
  },
]

export default function CategoriasProjeto() {
  return (
    <CadastroCrud
      title="Categorias de Projeto"
      subtitle="Cadastro padronizado: descrição e centro de responsabilidade associado"
      storageKey="gp.categorias"
      campos={campos}
      emptyIcon="◆"
      addLabel="+ Adicionar categoria"
    />
  )
}
