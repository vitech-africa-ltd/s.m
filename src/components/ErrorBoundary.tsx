import { Component, type ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("[VITECH] Render error:", error); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f4fa", fontFamily: "'Public Sans', system-ui, sans-serif", padding: 24 }}>
          <div style={{ maxWidth: 520, background: "#fff", border: "1px solid #dee7f3", borderRadius: 16, padding: 32, boxShadow: "0 20px 48px -18px rgb(10 18 38 / 0.25)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0c1a33", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 32 32"><path d="M8 9l8 15 8-15h-4.6L16 15.8 12.6 9z" fill="#dca638" /></svg>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#101d38", margin: 0 }}>Something went wrong</h1>
            <p style={{ color: "#4b6ba8", fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>The application hit an unexpected error. Your data is safe — try reloading, or reset the local cache if the problem persists.</p>
            <pre style={{ background: "#f0f4fa", border: "1px solid #dee7f3", borderRadius: 8, padding: 12, fontSize: 11.5, color: "#b91c1c", overflow: "auto", maxHeight: 140, marginTop: 12 }}>{String(this.state.error)}</pre>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
                style={{ flex: 1, height: 42, borderRadius: 10, border: "none", background: "#1e49c9", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Reload app</button>
              <button onClick={() => { localStorage.removeItem("vitech-state-v1"); window.location.reload(); }}
                style={{ flex: 1, height: 42, borderRadius: 10, border: "1px solid #c3d3e9", background: "#fff", color: "#101d38", fontWeight: 700, cursor: "pointer" }}>Reset local data</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
