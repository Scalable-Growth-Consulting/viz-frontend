import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0', // TODO: Replace with your real Sentry DSN
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0, // Adjust in production
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
