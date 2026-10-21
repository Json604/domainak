import { Component, type ReactNode } from 'react'

// Last resort: a render error shows a way out instead of a blank page
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false }

    static getDerivedStateFromError() {
        return { failed: true }
    }

    componentDidCatch(error: unknown) {
        console.error('🔴 Page crashed:', error)
    }

    reset = () => {
        // Saved searches or settings are the likeliest cause; the app works without them
        try {
            localStorage.removeItem('domainak:history')
            localStorage.removeItem('domainak:currency')
        } catch {
            // Storage blocked: reloading is all we can do
        }
        window.location.assign('/')
    }

    render() {
        if (!this.state.failed) return this.props.children
        return (
            <div className="error-state" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <h2 style={{ fontWeight: 500 }}>Something went wrong</h2>
                <p style={{ color: '#666' }}>Reload to try again. If it keeps happening, reset Domainak’s saved data in this browser.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', borderRadius: '0.5rem', border: 0, background: '#111', color: '#fff', cursor: 'pointer' }}>Reload</button>
                    <button onClick={this.reset} style={{ padding: '0.6rem 1.4rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Reset saved data</button>
                </div>
            </div>
        )
    }
}

export default ErrorBoundary
