import React, { Profiler, type ProfilerOnRenderCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorldsPreferencesProvider } from './contexts/WorldsPreferencesContext';
import { ListsPreferencesProvider } from './contexts/ListsPreferencesContext';
import { ListsProvider } from './contexts/ListsContext';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from './components/toaster';
import { QueryDevtools } from './components/query-devtools';

const queryClient = new QueryClient();

const BENCHMARK_PROFILER = import.meta.env.VITE_BENCHMARK_PROFILER === 'true';

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  window.__benchmarkProfiles.push({ id, phase, actualDuration, baseDuration, startTime, commitTime });
};

const app = (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <WorldsPreferencesProvider>
        <ListsPreferencesProvider>
          <ListsProvider>
            <App />
            <Analytics />
          </ListsProvider>
        </ListsPreferencesProvider>
      </WorldsPreferencesProvider>
      <Toaster />
    </ThemeProvider>
    {import.meta.env.DEV ? <QueryDevtools /> : null}
  </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {BENCHMARK_PROFILER ? (
      <Profiler id="app" onRender={onRender}>
        {app}
      </Profiler>
    ) : (
      app
    )}
  </React.StrictMode>
);
