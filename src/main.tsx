import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

import GlobalErrorBoundary from './components/GlobalErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </BrowserRouter>
);
