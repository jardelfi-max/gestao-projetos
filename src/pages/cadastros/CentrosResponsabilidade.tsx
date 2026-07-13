import CadastroCrud, { type Campo } from '../../components/CadastroCrud'

const campos: Campo[] = [
  { name: 'codigo', label: 'Código', required: true, placeholder: 'Ex.: CR-001' },
  { name: 'descricao', label: 'Descrição', required: true, placeholder: 'Ex.: Operações Portuárias' },
]

export default function CentrosResponsabilidade() {
  return (
    <CadastroCrud
      title="Centros de Responsabilidade"
      subtitle="Cadastro de centros de custo / responsabilidade"
      table="centros"
      storageKey="gp.centros"
      campos={campos}
      emptyIcon="◈"
      addLabel="+ Adicionar centro"
    />
  )
}
