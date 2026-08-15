import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/dashboard';

const WorldsPage = lazy(() =>
  import('./pages/worlds').then((m) => ({ default: m.WorldsPage })),
);
const TagsPage = lazy(() => import('./pages/tags').then((m) => ({ default: m.TagsPage })));
const ListsPage = lazy(() => import('./pages/lists').then((m) => ({ default: m.ListsPage })));
const ListDetailPage = lazy(() =>
  import('./pages/list-detail').then((m) => ({ default: m.ListDetailPage })),
);
const WorldDetailPage = lazy(() =>
  import('./pages/world-detail').then((m) => ({ default: m.WorldDetailPage })),
);
const SettingsPage = lazy(() =>
  import('./pages/settings').then((m) => ({ default: m.SettingsPage })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense
          fallback={
            <div className="p-4">
              <div className="h-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/worlds" element={<WorldsPage />} />
            <Route path="/worlds/:worldId" element={<WorldDetailPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/lists/:listId" element={<ListDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
