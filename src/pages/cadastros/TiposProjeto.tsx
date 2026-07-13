import CadastroCrud, { type Campo } from '../../components/CadastroCrud'

const campos: Campo[] = [
  { name: 'descricao', label: 'Descrição', required: true, placeholder: 'Ex.: Infraestrutura' },
]

export default function TiposProjeto() {
  return (
    <CadastroCrud
      title="Tipos de Projeto"
      subtitle="Cadastro de tipos de projeto"
      table="tipos"
      storageKey="gp.tipos"
      campos={campos}
      emptyIcon="◇"
      addLabel="+ Adicionar tipo"
    />
  )
}
