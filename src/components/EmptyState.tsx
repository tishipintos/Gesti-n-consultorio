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
    <div role="status" className="flex flex-col items-center justify-center pt-14 pb-24 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-[1.6rem] bg-primary/10 text-primary/70 flex items-center justify-center mb-5 shadow-sm" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary mb-2 tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary mb-7 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white px-7 py-2.5 rounded-full text-base font-semibold min-h-12 press-scale transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
