type Props = {
  icon?: string
  message: string
  hint?: string
}

export default function EmptyState({ icon = '📄', message, hint }: Props) {
  return (
    <div className="card empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-message">{message}</p>
      {hint && <p className="empty-hint">{hint}</p>}
    </div>
  )
}
