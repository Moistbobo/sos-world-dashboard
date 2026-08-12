import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/dashboard';
import { WorldsPage } from './pages/worlds';
import { TagsPage } from './pages/tags';
import { ListsPage } from './pages/lists';
import { ListDetailPage } from './pages/list-detail';
import { WorldDetailPage } from './pages/world-detail';
import { SettingsPage } from './pages/settings';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/worlds" element={<WorldsPage />} />
          <Route path="/worlds/:worldId" element={<WorldDetailPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:listId" element={<ListDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 bg-red-500" />
    </BrowserRouter>
  );
}
