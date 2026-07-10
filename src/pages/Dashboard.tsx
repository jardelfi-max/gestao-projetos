import PageHeader from '../components/PageHeader'

const kpis = [
  { label: 'Projetos no período', value: '—', hint: 'aguardando dados' },
  { label: 'Valor orçado', value: 'R$ —', hint: 'aguardando dados' },
  { label: 'Valor realizado', value: 'R$ —', hint: 'aguardando dados' },
  { label: '% de execução', value: '—%', hint: 'aguardando dados' },
]

export default function Dashboard() {
  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do funil de projetos e indicadores financeiros"
      />

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value}</span>
            <span className="kpi-hint">{kpi.hint}</span>
          </div>
        ))}
      </div>

      <div className="card placeholder-chart">
        <h2 className="card-title">Funil de projetos por status</h2>
        <p className="muted">
          Em breve: gráfico do funil, filtros por data / centro de responsabilidade /
          status e exportação (Excel/PDF). Primeiro vamos conectar o banco de dados.
        </p>
      </div>
    </div>
  )
}
