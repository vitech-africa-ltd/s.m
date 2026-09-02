import { Component, type ErrorInfo, type ReactNode } from "react";

interface State { error: Error | null; info: ErrorInfo | null; }

/**
 * Catches any runtime error in the app tree and renders a diagnostic screen
 * instead of a blank white page. Essential for production debugging on Vercel.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });
    // Surface to the console for Vercel runtime logs
    console.error("[VITECH] Uncaught application error:", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    const { error, info } = this.state;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c1a33", fontFamily: "'Public Sans', system-ui, sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 640, width: "100%", background: "#101d38", border: "1px solid #273e6e", borderRadius: 16, padding: 32, color: "#dee7f3" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>!</div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "#fff" }}>Une erreur est survenue</h1>
              <p style={{ margin: 0, fontSize: 13, color: "#9cb5d8" }}>The application hit an unexpected error. Details below help us fix it.</p>
            </div>
          </div>
          <div style={{ background: "#0a1226", border: "1px solid #273e6e", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#dca638", marginBottom: 6 }}>Error message</div>
            <code style={{ fontSize: 13, color: "#fda4af", wordBreak: "break-word", display: "block" }}>{error.name}: {error.message}</code>
            {info?.componentStack && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#dca638", margin: "14px 0 6px" }}>Component stack</div>
                <pre style={{ fontSize: 11, color: "#9cb5d8", whiteSpace: "pre-wrap", margin: 0, maxHeight: 160, overflow: "auto" }}>{info.componentStack}</pre>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={this.reset} style={{ background: "#2b5ce9", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Réessayer</button>
            <button onClick={() => { localStorage.clear(); location.hash = "/"; location.reload(); }} style={{ background: "transparent", color: "#dee7f3", border: "1px solid #35518b", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Réinitialiser les données locales</button>
          </div>
          <p style={{ fontSize: 12, color: "#6f90c2", marginTop: 16, marginBottom: 0 }}>
            Astuce : « Réinitialiser les données locales » corrige la plupart des problèmes liés à d'anciennes données mises en cache.
          </p>
        </div>
      </div>
    );
  }
}
