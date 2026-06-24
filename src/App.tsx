import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { WorldsPage } from './pages/WorldsPage';
import { TagsPage } from './pages/TagsPage';
import { SettingsPage } from './pages/SettingsPage';

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
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
