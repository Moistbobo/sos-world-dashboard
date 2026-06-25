import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalyticsConsent } from '../../hooks/useAnalyticsConsent';
import { LanguageSwitcher } from '../language-switcher';
import { wPoint } from '../../assets';

export function AnalyticsConsentBanner({ onDismiss }: { onDismiss?: () => void }) {
  const { t } = useTranslation();
  const { grantConsent, denyConsent, hasDecided } = useAnalyticsConsent();

  const [visible, setVisible] = useState(true);

  if (hasDecided || !visible) return null;

  const handleDeny = () => {
    denyConsent();
    setVisible(false);
    onDismiss?.();
  };

  const handleGrant = () => {
    grantConsent();
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-consent-title"
      onClick={handleDeny}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg animate-fadeIn rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <img src={wPoint} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="w-40">
            <LanguageSwitcher />
          </div>
        </div>

        <h2
          id="analytics-consent-title"
          className="text-lg font-semibold text-slate-900 dark:text-white"
        >
          {t('analyticsConsent.title')}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t('analyticsConsent.description')}
        </p>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {t('analyticsConsent.disclaimer')}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleDeny}
            className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <X className="h-4 w-4" />
            {t('analyticsConsent.deny')}
          </button>
          <button
            type="button"
            onClick={handleGrant}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <Check className="h-4 w-4" />
            {t('analyticsConsent.accept')}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          {t('analyticsConsent.hint')}
        </p>
      </div>
    </div>
  );
}
