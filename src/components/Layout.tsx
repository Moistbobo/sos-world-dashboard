import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Tags,
  Settings,
  Activity,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHealth } from '../hooks/useApi';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/worlds', label: 'Worlds', icon: Globe },
  { to: '/tags', label: 'Tags', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isPending, isError } = useHealth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sos-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sos-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

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
          fixed inset-y-0 left-0 z-50 flex flex-col transform border-r border-slate-200 bg-white
          transition-all duration-300 lg:relative lg:transform-none dark:border-slate-800 dark:bg-slate-900
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-60
          ${collapsed ? 'lg:w-16' : 'lg:w-60'}
        `}
      >
        <div className={`flex h-14 items-center border-b border-slate-200 px-4 dark:border-slate-800 ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 ${collapsed ? 'lg:hidden' : ''}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">SOS Dashboard</span>
          </div>
          <div className={`hidden h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 ${collapsed ? 'lg:flex' : ''}`}>
            <Activity className="h-4 w-4 text-white" />
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
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
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? 'lg:justify-center lg:gap-0 lg:px-2' : ''
                } ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon className={`h-4 w-4 ${collapsed ? 'lg:h-5 lg:w-5' : ''}`} />
              <span className={`${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-3 z-10 hidden translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronsLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          )}
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500">API status:</span>
            {isPending && (
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
            )}
            {!isPending && !isError && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
            )}
            {!isPending && isError && (
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
