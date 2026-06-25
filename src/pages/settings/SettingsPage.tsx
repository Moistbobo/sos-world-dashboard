import { useTranslation } from 'react-i18next';
import { Languages, LayoutGrid, MousePointerClick, BarChart3 } from 'lucide-react';
import { LanguageSwitcher } from '../../components/language-switcher';
import { useWorldsPreferences } from '../../hooks/useWorldsPreferences';
import { useAnalyticsConsent } from '../../hooks/useAnalyticsConsent';
import { getAppVersion } from '../../config/version';

export function SettingsPage() {
  const { t } = useTranslation();
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useWorldsPreferences();
  const { consent, grantConsent, denyConsent, hasDecided, isDefaultDenied } = useAnalyticsConsent();

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

        <div className="border-t border-slate-200 pt-5 dark:border-slate-700/50">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {t('settings.analytics')}
          </label>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            {t('settings.analyticsDescription')}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={grantConsent}
              className={`btn inline-flex items-center gap-2 ${consent === 'granted' ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={consent === 'granted'}
            >
              {consent === 'granted' && <span className="h-2 w-2 rounded-full bg-white" />}
              {t('settings.analyticsEnabled')}
            </button>
            <button
              type="button"
              onClick={denyConsent}
              className={`btn inline-flex items-center gap-2 ${consent === 'denied' ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={consent === 'denied'}
            >
              {consent === 'denied' && <span className="h-2 w-2 rounded-full bg-white" />}
              {t('settings.analyticsDisabled')}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {hasDecided
              ? t('settings.analyticsStatus', { status: t(consent === 'granted' ? 'settings.analyticsEnabled' : 'settings.analyticsDisabled') })
              : isDefaultDenied
                ? t('settings.analyticsStatus', { status: t('settings.analyticsDisabled') })
                : t('settings.analyticsNotSet')}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500" data-testid="app-version">
        {t('settings.appVersion')} {getAppVersion()}
      </p>
    </div>
  );
}
