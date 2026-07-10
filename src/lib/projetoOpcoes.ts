// Opções fixas do cadastro de Projetos (conforme a especificação).

export const STATUS = [
  'Em Análise',
  'Em orçamento',
  'Em compras',
  'Aguardando Aprovação Interna',
  'Aguardando Aprovação Board',
  'Aprovado',
  'Em execução',
  'Postergado',
  'Cancelado',
  'Finalizado',
] as const

export const PRIORIDADES = ['Baixa', 'Média', 'Alta', 'Crítica'] as const

export const PAPEIS = [
  'Sponsor do projeto',
  'Aprovadores RIA',
  'Responsável técnico',
  'Gerentes',
  'Analistas',
  'Solicitante de compra',
  'Gestão Budget',
  'Outros Envolvidos',
  'PMO',
  'Board',
] as const

export const MOTIVOS = [
  'Growth',
  'Maintenance',
  'Regulatory',
  'Replacement',
  'Others',
] as const

// Cor do "selo" (badge) de status na lista.
export function corStatus(status: string): string {
  switch (status) {
    case 'Aprovado':
    case 'Em execução':
    case 'Finalizado':
      return 'verde'
    case 'Cancelado':
    case 'Postergado':
      return 'vermelho'
    case 'Aguardando Aprovação Interna':
    case 'Aguardando Aprovação Board':
      return 'amarelo'
    default:
      return 'azul'
  }
}
