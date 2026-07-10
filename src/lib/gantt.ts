export type Tarefa = {
  id: number
  descricao: string
  responsavelId: string
  inicioPlan: string
  fimPlan: string
  inicioReal: string
  fimReal: string
  percentual: string
  predecessoraId: string
}

function ms(data: string): number | null {
  if (!data) return null
  const t = Date.parse(data)
  return isNaN(t) ? null : t
}

// Menor e maior data (planejadas) entre as tarefas, para dimensionar a régua.
export function intervalo(tarefas: Tarefa[]): { min: number; max: number } | null {
  const datas: number[] = []
  tarefas.forEach((t) => {
    const i = ms(t.inicioPlan)
    const f = ms(t.fimPlan)
    if (i !== null) datas.push(i)
    if (f !== null) datas.push(f)
  })
  if (datas.length === 0) return null
  const min = Math.min(...datas)
  const max = Math.max(...datas)
  return { min, max: max === min ? min + 86400000 : max }
}

// Posição/largura da barra (em %) dentro da régua.
export function barra(
  tarefa: Tarefa,
  faixa: { min: number; max: number },
): { left: number; width: number } | null {
  const i = ms(tarefa.inicioPlan)
  const f = ms(tarefa.fimPlan)
  if (i === null || f === null) return null
  const total = faixa.max - faixa.min
  const left = ((i - faixa.min) / total) * 100
  const width = Math.max(1.5, ((f - i) / total) * 100)
  return { left, width }
}

export function pct(t: Tarefa): number {
  const n = parseFloat(String(t.percentual ?? '').replace(',', '.'))
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, n))
}
