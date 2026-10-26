import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { ClientOnly } from '@/components/ClientOnly';
import HomeContent from '@/pages/Home';
import AboutContent from '@/pages/About';
import LoginPage from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/auth/callback/:provider">
          {(params) => <AuthCallback provider={params.provider} />}
        </Route>
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

function AboutPage() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#f5efe5]" />}>
      <AboutContent />
    </ClientOnly>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  // useLocation is only safe inside a WouterRouter with a server-compatible hook.
  // We guard it so SSR never calls it outside a router context.
  let location = '/';
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    [location] = useLocation();
  } catch {
    // During SSR with memoryLocation the hook may not be available yet; fall back to '/'.
  }
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