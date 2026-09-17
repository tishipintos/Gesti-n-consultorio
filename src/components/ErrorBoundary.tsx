import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4" role="alert" aria-live="assertive">
          <div className="w-full max-w-sm text-center">
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/10 flex items-center justify-center">
                <AlertTriangle size={32} className="text-error" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Algo salió mal
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Ocurrió un error inesperado. Por favor, intentá de nuevo.
              </p>
              <button
                onClick={this.handleRetry}
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold press-scale transition-all"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}