interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div role="status" className="empty-state flex flex-col items-center justify-center text-center">
      <div className="empty-state-icon text-primary flex items-center justify-center mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-semibold text-text-primary mb-2 tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary mb-5 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white px-7 py-2.5 rounded-xl text-base font-semibold min-h-12 press-scale transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
