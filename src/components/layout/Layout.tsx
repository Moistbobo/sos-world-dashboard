import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Tags,
  List,
  Settings,
  Activity,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Shuffle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApiDownToast } from '../../hooks/useApiToasts';
import { useFeelLucky } from '../../hooks/useFeelLucky';
import { ThemeToggle } from '../theme-toggle';

import { getAppVersion } from '../../config/version';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useApiDownToast();
  const { loading: feelLuckyLoading, feelLucky } = useFeelLucky();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sos-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [showCollapsedVersion, setShowCollapsedVersion] = useState(false);
  const appVersion = getAppVersion();

  useEffect(() => {
    try {
      localStorage.setItem('sos-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/worlds', label: t('nav.worlds'), icon: Globe },
    { to: '/tags', label: t('nav.tags'), icon: Tags },
    { to: '/lists', label: t('nav.lists'), icon: List },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className={stylex.props(styles.c7hoeab).className}>
      <a
        href="#main"
         className={stylex.props(styles.c1em8zxy).className}
      >
        {t('layout.skipToContent')}
      </a>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={stylex.props(styles.cgzc3jr).className}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={stylex.props(
          styles.sidebar,
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed,
          collapsed ? styles.sidebarCollapsedLg : styles.sidebarExpandedLg,
        ).className}
      >
        <div className={stylex.props(styles.headerRow, collapsed ? styles.headerRowCenter : undefined).className}>
          <div className={stylex.props(styles.headerBrand, collapsed ? styles.hiddenOnLg : undefined).className}>
            <div className={stylex.props(styles.c2ca09w).className}>
              <div className={stylex.props(styles.c1mzr72a).className}>
                <Activity className={stylex.props(styles.cpflmm4).className} />
              </div>
              <span className={stylex.props(styles.c12lfgfp).className}>{t('layout.appName')}</span>
            </div>
            <span className={stylex.props(styles.cs7fl1v).className}>
              {t('layout.version')}: {appVersion}
            </span>
          </div>
          <div
            className={stylex.props(
              styles.collapsedBadge,
              collapsed ? styles.flexOnLg : undefined,
            ).className}
            onMouseEnter={() => setShowCollapsedVersion(true)}
            onMouseLeave={() => setShowCollapsedVersion(false)}
            onClick={() => setShowCollapsedVersion((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={t('layout.appName')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowCollapsedVersion((prev) => !prev);
              }
            }}
          >
            <div className={stylex.props(styles.c1mzr72a).className}>
              <Activity className={stylex.props(styles.cpflmm4).className} />
            </div>
            <span
              className={stylex.props(
                styles.tooltip,
                showCollapsedVersion ? styles.tooltipVisible : undefined,
              ).className}
            >
              {t('layout.appName')} {appVersion}
            </span>
          </div>
          <button
            className={stylex.props(styles.c1q2bfpm).className}
            onClick={() => setSidebarOpen(false)}
            aria-label={t('layout.closeSidebar')}
          >
            <X className={stylex.props(styles.cvonys6).className} />
          </button>
        </div>

        <nav className={stylex.props(styles.c993o5f).className}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group ${stylex.props(
                  styles.navItem,
                  collapsed ? styles.navItemCollapsed : undefined,
                  isActive ? styles.navItemActive : styles.navItemInactive,
                ).className}`
              }
            >
              <item.icon className={stylex.props(styles.iconNav, collapsed ? styles.iconNavLg : undefined).className} />
              <span className={collapsed ? stylex.props(styles.hiddenOnLg).className : undefined}>{item.label}</span>
              {collapsed && (
                <span className={stylex.props(styles.ca36ztp).className}>
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              void feelLucky();
            }}
            disabled={feelLuckyLoading}
            aria-label={t('nav.feelLucky')}
            title={t('nav.feelLucky')}
            className={`${stylex.props(
              styles.feelLucky,
              collapsed ? styles.navItemCollapsed : undefined,
            ).className} group`}
          >
            <Shuffle className={stylex.props(styles.iconNav, collapsed ? styles.iconNavLg : undefined).className} />
            <span className={collapsed ? stylex.props(styles.hiddenOnLg).className : undefined}>{t('nav.feelLucky')}</span>
            {collapsed && (
              <span className={stylex.props(styles.ca36ztp).className}>
                {t('nav.feelLucky')}
              </span>
            )}
          </button>
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={stylex.props(styles.ck8ry5f).className}
          aria-label={collapsed ? t('layout.expandSidebar') : t('layout.collapseSidebar')}
        >
          {collapsed ? (
            <ChevronsRight className={stylex.props(styles.c1aafl3s).className} />
          ) : (
            <ChevronsLeft className={stylex.props(styles.c1aafl3s).className} />
          )}
        </button>
      </aside>

      {/* Main */}
      <div className={stylex.props(styles.cpqt06f).className}>
        <header className={stylex.props(styles.cxnt7op).className}>
          <button
            className={stylex.props(styles.c1q2bfpm).className}
            onClick={() => setSidebarOpen(true)}
            aria-label={t('layout.openSidebar')}
          >
            <Menu className={stylex.props(styles.cvonys6).className} />
          </button>
          <div className={stylex.props(styles.c155dof5).className}>
            <ThemeToggle />
          </div>
        </header>

        <main id="main" className={stylex.props(styles.c1sm53hh).className}>{children}</main>
      </div>
    </div>
  );
}

const styles = stylex.create({
  c7hoeab: {
    "display": "flex",
    "minHeight": "100vh",
  },
  c1em8zxy: {
    "position": "absolute",
    "width": 1,
    "height": 1,
    "padding": 0,
    "margin": "-1px",
    "overflow": "hidden",
    "clip": "rect(0, 0, 0, 0)",
    "whiteSpace": "nowrap",
    "borderWidth": 0,
    ":focus": {
      "position": "fixed",
      "top": "0.5rem",
      "left": "0.5rem",
      "zIndex": 60,
      "width": "auto",
      "height": "auto",
      "paddingLeft": "1rem",
      "paddingRight": "1rem",
      "paddingTop": "0.5rem",
      "paddingBottom": "0.5rem",
      "margin": 0,
      "overflow": "visible",
      "clip": "auto",
      "whiteSpace": "normal",
      "borderRadius": "0.5rem",
      "backgroundColor": "#4f46e5",
      "fontSize": "0.875rem",
      "lineHeight": "1.25rem",
      "fontWeight": 500,
      "color": "#ffffff",
    },
  },
  cgzc3jr: {
    "position": "fixed",
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0,
    "zIndex": 40,
    "backgroundColor": "#00000080",
    "@media (min-width: 1024px)": {
      "display": "none",
    },
  },
  c2ca09w: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  c1mzr72a: {
    "display": "flex",
    "height": "1.75rem",
    "width": "1.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.5rem",
    "backgroundColor": "#4f46e5",
  },
  cpflmm4: {
    "height": "1rem",
    "width": "1rem",
    "color": "#ffffff",
  },
  c12lfgfp: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  cs7fl1v: {
    "marginTop": "0.125rem",
    "paddingLeft": "2.25rem",
    "fontSize": "10px",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1q2bfpm: {
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.5rem",
    "@media (min-width: 1024px)": {
      "display": "none",
    },
  },
  cvonys6: {
    "height": "1.25rem",
    "width": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c993o5f: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "0.25rem",
    "padding": "0.75rem",
  },
  ca36ztp: {
    "pointerEvents": "none",
    "position": "absolute",
    "left": "100%",
    "marginLeft": "0.5rem",
    "whiteSpace": "nowrap",
    "borderRadius": "0.375rem",
    "backgroundColor": colors["--sos-bg-slate-900-white"],
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "paddingTop": "0.25rem",
    "paddingBottom": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-white-slate-900"],
    "opacity": 0,
    "transitionProperty": "opacity",
    ":is(.group:hover *)": {
      "opacity": 1,
    },
  },
  ck8ry5f: {
    "position": "absolute",
    "right": "0",
    "top": "0.75rem",
    "zIndex": 10,
    "display": "none",
    "height": "2.75rem",
    "width": "2.75rem",
    "transform": "translateX(50%)",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700"],
    "backgroundColor": colors["--sos-bg-white-slate-800"],
    "padding": "0.25rem",
    "boxShadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": colors["--sos-bg-slate-50-slate-700"],
    },
    "@media (min-width: 1024px)": {
      "display": "flex",
    },
  },
  c1aafl3s: {
    "height": "1rem",
    "width": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  cpqt06f: {
    "display": "flex",
    "minWidth": "0",
    "flex": 1,
    "flexDirection": "column",
  },
  cxnt7op: {
    "position": "sticky",
    "top": "0",
    "zIndex": 40,
    "display": "flex",
    "height": "3.5rem",
    "alignItems": "center",
    "justifyContent": "space-between",
    "borderBottomWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-800"],
    "backgroundColor": colors["--sos-bg-white_80-slate-950_80"],
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "backdropFilter": "blur(8px)",
  },
  c155dof5: {
    "marginLeft": "auto",
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  c1sm53hh: {
    "minWidth": "0",
    "flex": 1,
    "padding": "1rem",
    "@media (min-width: 1024px)": {
      "padding": "1.5rem",
    },
  },
  sidebar: {
    "position": "fixed",
    "top": 0,
    "bottom": 0,
    "left": 0,
    "zIndex": 50,
    "display": "flex",
    "flexDirection": "column",
    "borderRightColor": colors["--sos-border-slate-200-slate-800"],
    "borderRightWidth": 1,
    "borderStyle": "solid",
    "backgroundColor": colors["--sos-bg-white-slate-900"],
    "width": "15rem",
    "transitionProperty": "all",
    "transitionDuration": "0.3s",
    "@media (min-width: 1024px)": {
      "position": "relative",
      "transform": "none",
    },
  },
  sidebarOpen: {
    "transform": "translateX(0)",
  },
  sidebarClosed: {
    "transform": "translateX(-100%)",
    "@media (min-width: 1024px)": {
      "transform": "translateX(0)",
    },
  },
  sidebarCollapsedLg: {
    "@media (min-width: 1024px)": {
      "width": "4rem",
    },
  },
  sidebarExpandedLg: {
    "@media (min-width: 1024px)": {
      "width": "15rem",
    },
  },
  headerRow: {
    "display": "flex",
    "height": "3.5rem",
    "alignItems": "center",
    "borderBottomColor": colors["--sos-border-slate-200-slate-800"],
    "borderBottomWidth": 1,
    "borderStyle": "solid",
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "justifyContent": "space-between",
  },
  headerRowCenter: {
    "@media (min-width: 1024px)": {
      "justifyContent": "center",
    },
  },
  headerBrand: {
    "display": "flex",
    "flexDirection": "column",
  },
  hiddenOnLg: {
    "@media (min-width: 1024px)": {
      "display": "none",
    },
  },
  collapsedBadge: {
    "position": "relative",
    "zIndex": 20,
    "display": "none",
  },
  flexOnLg: {
    "@media (min-width: 1024px)": {
      "display": "flex",
    },
  },
  tooltip: {
    "pointerEvents": "none",
    "position": "absolute",
    "left": "100%",
    "top": "50%",
    "zIndex": 30,
    "transform": "translateY(-50%)",
    "marginLeft": "0.5rem",
    "whiteSpace": "nowrap",
    "borderRadius": "0.375rem",
    "backgroundColor": colors["--sos-bg-slate-900-white"],
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "paddingTop": "0.25rem",
    "paddingBottom": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-white-slate-900"],
    "opacity": 0,
    "transitionProperty": "opacity",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  tooltipVisible: {
    "opacity": 1,
  },
  navItem: {
    "position": "relative",
    "display": "flex",
    "minHeight": "2.75rem",
    "alignItems": "center",
    "gap": "0.75rem",
    "borderRadius": "0.5rem",
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.625rem",
    "paddingBottom": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
    "borderStyle": "solid",
    "borderWidth": 1,
    "borderColor": "transparent",
  },
  navItemCollapsed: {
    "@media (min-width: 1024px)": {
      "justifyContent": "center",
      "gap": 0,
      "paddingLeft": "0.5rem",
      "paddingRight": "0.5rem",
    },
  },
  navItemActive: {
    "backgroundColor": "rgb(99 102 241 / 0.1)",
    "color": colors["--sos-text-indigo-600-indigo-300"],
  },
  navItemInactive: {
    "color": colors["--sos-text-slate-500-slate-400"],
    ":hover": {
      "backgroundColor": colors["--sos-bg-slate-100-slate-800"],
      "color": colors["--sos-text-slate-800-slate-200"],
    },
  },
  feelLucky: {
    "position": "relative",
    "marginTop": "0.5rem",
    "display": "flex",
    "minHeight": "2.75rem",
    "alignItems": "center",
    "gap": "0.75rem",
    "borderRadius": "0.5rem",
    "borderStyle": "solid",
    "borderWidth": 1,
    "borderColor": "#c7d2fe",
    "backgroundColor": "#eef2ff",
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.625rem",
    "paddingBottom": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-indigo-700-indigo-300"],
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
    ":hover": {
      "backgroundColor": "#e0e7ff",
    },
    ":disabled": {
      "cursor": "not-allowed",
      "opacity": 0.6,
    },
  },
  iconNav: {
    "height": "1rem",
    "width": "1rem",
  },
  iconNavLg: {
    "@media (min-width: 1024px)": {
      "height": "1.25rem",
      "width": "1.25rem",
    },
  },
});
