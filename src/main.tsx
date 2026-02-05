import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { Toaster } from 'sonner';
import * as Sentry from "@sentry/react";

// Initialize Sentry for error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions in dev, reduce in production (e.g., 0.1)
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  });
}

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </>
);