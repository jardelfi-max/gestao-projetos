type Props = {
  title: string
  subtitle?: string
  action?: string
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <button type="button" className="btn-primary" disabled>
          {action}
        </button>
      )}
    </header>
  )
}
