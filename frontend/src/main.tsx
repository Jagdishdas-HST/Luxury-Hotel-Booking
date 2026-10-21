import { createRoot } from 'react-dom/client';
import { Router as WouterRouter } from 'wouter';

import App from './App';
import { Providers } from '@/components/Providers';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <Providers>
      <WouterRouter base={base}>
        <App />
      </WouterRouter>
    </Providers>
  </ErrorBoundary>,
);