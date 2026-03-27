import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', width: '100vw', background: '#0d1117', color: '#e6edf3',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center'
        }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 20, color: '#ef4444' }}>
            CRITICAL SYSTEM FAILURE
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: 30, maxWidth: '500px' }}>
            A fatal error occurred in the application. Please reset the system. This will reload the application and clear any corrupted state.
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              padding: '12px 24px', background: '#ef4444', border: 'none', borderRadius: 12, 
              color: 'white', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            RESET & RESTART
          </button>
          <details style={{ marginTop: 30, color: '#6e7681', fontSize: 12 }}>
            <summary>Error Details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#161b22', padding: 16, borderRadius: 8, marginTop: 10 }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
