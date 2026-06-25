import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/dashboard';
import { WorldsPage } from './pages/worlds';
import { TagsPage } from './pages/tags';
import { ListsPage } from './pages/lists';
import { SettingsPage } from './pages/settings';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/worlds" element={<WorldsPage />} />
          <Route path="/worlds/:worldId" element={<WorldsPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:listId" element={<ListsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
