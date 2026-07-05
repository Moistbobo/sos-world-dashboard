import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './i18n';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorldsPreferencesProvider } from './contexts/WorldsPreferencesContext';
import { ListsPreferencesProvider } from './contexts/ListsPreferencesContext';
import { ListsProvider } from './contexts/ListsContext';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from './components/toaster';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
