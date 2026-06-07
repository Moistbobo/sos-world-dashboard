import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Tags,
  Settings,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { fetchHealth } from '../api/client';
import { useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/worlds', label: 'Worlds', icon: Globe },
  { to: '/tags', label: 'Tags', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiOk(null);
    fetchHealth()
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 transform border-r border-slate-200 bg-white
          transition-transform lg:static lg:transform-none dark:border-slate-800 dark:bg-slate-900
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">SOS Dashboard</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500">API status:</span>
            {apiOk === null && (
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
            )}
            {apiOk === true && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
            )}
            {apiOk === false && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-600 dark:text-red-400">Offline / Unauthorized</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
