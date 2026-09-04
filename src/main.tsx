import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

window.addEventListener("error", (e) => console.error("[VITECH] Global error:", e.message, e.filename, e.lineno));
window.addEventListener("unhandledrejection", (e) => console.error("[VITECH] Unhandled rejection:", e.reason));

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

if (import.meta.env.PROD) {
  /* Purge stale service-worker caches so a fresh deploy is always served. */
  if ("caches" in window) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("vitech-school-") && k !== "vitech-school-v3").map((k) => caches.delete(k))))
      .catch(() => {});
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}
