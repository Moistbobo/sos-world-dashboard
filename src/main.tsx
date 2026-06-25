import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './i18n';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorldsPreferencesProvider } from './contexts/WorldsPreferencesContext';
import { AnalyticsConsentProvider } from './contexts/AnalyticsConsentContext';
import { AnalyticsWithConsent } from './components/analytics-with-consent';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WorldsPreferencesProvider>
          <AnalyticsConsentProvider>
            <App />
            <AnalyticsWithConsent />
          </AnalyticsConsentProvider>
        </WorldsPreferencesProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
