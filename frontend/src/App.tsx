import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { ClientOnly } from '@/components/ClientOnly';
import HomeContent from '@/pages/Home';

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function HomePage() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#143e35]" />}>
      <HomeContent />
    </ClientOnly>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

interface AppProps {
  ssrUrl?: string;
}

function App({ ssrUrl }: AppProps) {
  if (ssrUrl !== undefined) {
    const { hook } = memoryLocation({ path: ssrUrl, static: true });
    return (
      <WouterRouter hook={hook}>
        <Router />
      </WouterRouter>
    );
  }

  const base = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''
    : '';

  return (
    <WouterRouter base={base}>
      <Router />
    </WouterRouter>
  );
}

export default App;