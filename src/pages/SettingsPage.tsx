import { useTranslation } from 'react-i18next';
import { Languages, LayoutGrid, MousePointerClick, Info } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useWorldsPreferences } from '../hooks/useWorldsPreferences';
import { getAppVersion } from '../config/version';

export function SettingsPage() {
  const { t } = useTranslation();
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useWorldsPreferences();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="card p-5 space-y-5">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <Languages className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {t('settings.language')}
          </label>
          <LanguageSwitcher />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t('settings.languageHint')}</p>
        </div>

        <div>
          <label htmlFor="view-mode" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <LayoutGrid className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {t('settings.viewMode')}
          </label>
          <select
            id="view-mode"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
            className="input w-full"
          >
            <option value="grid">{t('settings.viewModeGrid')}</option>
            <option value="list">{t('settings.viewModeList')}</option>
          </select>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t('settings.viewModeHint')}</p>
        </div>

        <div>
          <label htmlFor="scroll-mode" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <MousePointerClick className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {t('settings.scrollMode')}
          </label>
          <select
            id="scroll-mode"
            value={scrollMode}
            onChange={(e) => setScrollMode(e.target.value as 'infinite' | 'pagination')}
            className="input w-full"
          >
            <option value="infinite">{t('settings.scrollModeInfinite')}</option>
            <option value="pagination">{t('settings.scrollModePagination')}</option>
          </select>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t('settings.scrollModeHint')}</p>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {t('settings.appVersion')}
          </label>
          <p
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            data-testid="app-version"
          >
            {getAppVersion()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t('settings.appVersionHint')}</p>
        </div>
      </div>
    </div>
  );
}
