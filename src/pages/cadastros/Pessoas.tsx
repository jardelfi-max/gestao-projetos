import CadastroCrud, { type Campo } from '../../components/CadastroCrud'

const campos: Campo[] = [
  { name: 'nomeCompleto', label: 'Nome completo', required: true, placeholder: 'Ex.: Maria Silva' },
  { name: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
  { name: 'email', label: 'E-mail', required: true, type: 'email', placeholder: 'maria@empresa.com' },
  { name: 'telefone', label: 'Telefone', placeholder: '(47) 90000-0000' },
  { name: 'departamento', label: 'Departamento', placeholder: 'Ex.: TI' },
]

export default function Pessoas() {
  return (
    <CadastroCrud
      title="Pessoas"
      subtitle="Cadastro de usuários: nome, CPF, e-mail, telefone e departamento"
      storageKey="gp.pessoas"
      campos={campos}
      emptyIcon="◍"
      addLabel="+ Adicionar pessoa"
    />
  )
}
