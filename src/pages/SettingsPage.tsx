import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function SettingsPage() {
  const { t } = useTranslation();

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
      </div>
    </div>
  );
}
