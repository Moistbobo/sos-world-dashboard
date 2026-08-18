import { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { BellOff, Eye, EyeOff, KeyRound, Languages, LayoutGrid, MousePointerClick } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { LanguageSwitcher } from '../../components/language-switcher';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useWorldsPreferences } from '../../hooks/useWorldsPreferences';
import { useListsPreferences } from '../../hooks/useListsPreferences';
import { useMe } from '../../hooks/useApi';
import { clearStoredApiToken, getStoredApiToken, setStoredApiToken } from '../../utils/tokenStorage';
import { getAppVersion } from '../../config/version';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

export function SettingsPage() {
  const { t } = useTranslation();
  usePageTitle(t('settings.title'));
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useWorldsPreferences();
  const { skipRemoveWorldConfirmation, setSkipRemoveWorldConfirmation } = useListsPreferences();
  const queryClient = useQueryClient();
  const { data: me, isError: meError, isPending: mePending } = useMe();
  const [token, setToken] = useState(getStoredApiToken);
  const [savedToken, setSavedToken] = useState(getStoredApiToken);
  const [showToken, setShowToken] = useState(false);

  function handleTokenChange(e: ChangeEvent<HTMLInputElement>) {
    setToken(e.target.value);
  }

  function applyToken(next: string) {
    const trimmed = next.trim();
    setToken(trimmed);
    setSavedToken(trimmed);
    if (trimmed) {
      setStoredApiToken(trimmed);
    } else {
      clearStoredApiToken();
    }
    queryClient.removeQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }

  function handleApply() {
    applyToken(token);
  }

  let statusText: string;
  if (savedToken && me) {
    statusText = t('settings.apiTokenConnected', { name: me.name, role: me.role });
  } else if (savedToken && meError) {
    statusText = t('settings.apiTokenInvalid');
  } else if (savedToken && mePending) {
    statusText = t('settings.apiTokenCustom');
  } else {
    statusText = t('settings.apiTokenDefault');
  }

  return (
    <div className={stylex.props(styles.c1aue76g).className}>
      <div className={stylex.props(styles.c1zncu).className}>
        <h1 className={stylex.props(styles.c1ygyk63).className}>{t('settings.title')}</h1>
        <p className={stylex.props(styles.cd9ueps).className}>
          {t('settings.subtitle')}
        </p>
      </div>

      <div className={stylex.props(shared.card, styles.ceimlqa).className}>
        <div>
          <label
            htmlFor="language"
            className={stylex.props(styles.c1gme9wv).className}
          >
            <Languages className={stylex.props(styles.c1aafl3s).className} />
            {t('settings.language')}
          </label>
          <LanguageSwitcher />
          <p className={stylex.props(styles.ce0zen).className}>{t('settings.languageHint')}</p>
        </div>

        <div>
          <label htmlFor="view-mode" className={stylex.props(styles.c1gme9wv).className}>
            <LayoutGrid className={stylex.props(styles.c1aafl3s).className} />
            {t('settings.viewMode')}
          </label>
          <select
            id="view-mode"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
            className={stylex.props(shared.input, styles.cic22wr).className}
          >
            <option value="grid">{t('settings.viewModeGrid')}</option>
            <option value="list">{t('settings.viewModeList')}</option>
          </select>
          <p className={stylex.props(styles.ce0zen).className}>{t('settings.viewModeHint')}</p>
        </div>

        <div>
          <label htmlFor="scroll-mode" className={stylex.props(styles.c1gme9wv).className}>
            <MousePointerClick className={stylex.props(styles.c1aafl3s).className} />
            {t('settings.scrollMode')}
          </label>
          <select
            id="scroll-mode"
            value={scrollMode}
            onChange={(e) => setScrollMode(e.target.value as 'infinite' | 'pagination')}
            className={stylex.props(shared.input, styles.cic22wr).className}
          >
            <option value="infinite">{t('settings.scrollModeInfinite')}</option>
            <option value="pagination">{t('settings.scrollModePagination')}</option>
          </select>
          <p className={stylex.props(styles.ce0zen).className}>{t('settings.scrollModeHint')}</p>
        </div>
        <div className={stylex.props(styles.c1sthhai).className}>
          <BellOff className={stylex.props(styles.c1pcuybr).className} />
          <div className={stylex.props(styles.c1dzu82l).className}>
            <label htmlFor="skip-remove-confirm" className={stylex.props(styles.cxvwqll).className}>
              <input
                id="skip-remove-confirm"
                type="checkbox"
                checked={skipRemoveWorldConfirmation}
                onChange={(e) => setSkipRemoveWorldConfirmation(e.target.checked)}
                className={stylex.props(styles.c11z2qc5).className}
              />
              {t('settings.skipRemoveWorldConfirmation')}
            </label>
            <p className={stylex.props(styles.ce0zen).className}>{t('settings.skipRemoveWorldConfirmationHint')}</p>
          </div>
        </div>
      </div>

      <h2 className={stylex.props(styles.c1f6ecev).className}>
        {t('settings.advanced')}
      </h2>
      <div className={stylex.props(shared.card, styles.c1tq0yhg).className}>
        <div>
          <label htmlFor="api-token" className={stylex.props(styles.c1gme9wv).className}>
            <KeyRound className={stylex.props(styles.c1aafl3s).className} />
            {t('settings.apiToken')}
          </label>
          <div className={stylex.props(styles.c1rwv5zo).className}>
            <div className={stylex.props(styles.c1ws6kvl).className}>
              <input
                id="api-token"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={handleTokenChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className={stylex.props(shared.input, styles.cu0x605).className}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? t('settings.apiTokenHide') : t('settings.apiTokenShow')}
                className={stylex.props(styles.c9fbrjs).className}
              >
                {showToken ? <EyeOff className={stylex.props(styles.c1ky5l8t).className} /> : <Eye className={stylex.props(styles.c1ky5l8t).className} />}
              </button>
            </div>
            <button type="button" onClick={handleApply} className={stylex.props(shared.btnPrimary, styles.ckdudlg).className}>
              {t('settings.apiTokenApply')}
            </button>
            <button
              type="button"
              onClick={() => applyToken('')}
              className={stylex.props(shared.btnGhost, styles.c1mmmbc7).className}
            >
              {t('settings.apiTokenClear')}
            </button>
          </div>
          <p className={stylex.props(styles.ce0zen).className}>{t('settings.apiTokenHint')}</p>
          <p className={stylex.props(styles.ce0zen).className}>{statusText}</p>
        </div>
      </div>

      <p className={stylex.props(styles.c10t8sbr).className} data-testid="app-version">
        {t('settings.appVersion')} {getAppVersion()}
      </p>
    </div>
  );
}

const styles = stylex.create({
  c1aue76g: {
    "marginLeft": "auto",
    "marginRight": "auto",
  },
  c1zncu: {
    "marginBottom": "1.5rem",
  },
  c1ygyk63: {
    "fontSize": "1.25rem",
    "lineHeight": "1.75rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  cd9ueps: {
    "marginTop": "0.25rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  ceimlqa: {
    "padding": "1.25rem",
  },
  c1gme9wv: {
    "marginBottom": "0.375rem",
    "display": "flex",
    "alignItems": "center",
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-800-slate-200"],
  },
  c1aafl3s: {
    "height": "1rem",
    "width": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  ce0zen: {
    "marginTop": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  cic22wr: {
    "width": "100%",
  },
  c1sthhai: {
    "display": "flex",
    "alignItems": "flex-start",
    "gap": "0.75rem",
  },
  c1pcuybr: {
    "marginTop": "0.125rem",
    "height": "1rem",
    "width": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1dzu82l: {
    "flex": 1,
  },
  cxvwqll: {
    "display": "flex",
    "cursor": "pointer",
    "alignItems": "center",
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-800-slate-200"],
  },
  c11z2qc5: {
    "height": "1.5rem",
    "width": "1.5rem",
    "borderRadius": "0.25rem",
    "borderColor": colors["--sos-border-slate-300-slate-600"],
    "color": "#4f46e5",
    ":focus": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 1px #6366f1",
    },
  },
  c1f6ecev: {
    "marginTop": "1.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1tq0yhg: {
    "marginTop": "0.5rem",
    "padding": "1.25rem",
  },
  c1rwv5zo: {
    "display": "flex",
    "gap": "0.5rem",
  },
  c1ws6kvl: {
    "position": "relative",
    "flex": 1,
  },
  cu0x605: {
    "width": "100%",
    "paddingRight": "2.5rem",
  },
  c9fbrjs: {
    "position": "absolute",
    "right": "0.5rem",
    "top": "50%",
    "transform": "translateY(-50%)",
    "padding": "0.25rem",
    "color": "#94a3b8",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "color": colors["--sos-text-slate-600-slate-300"],
    },
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  ckdudlg: {
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c1mmmbc7: {
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c10t8sbr: {
    "marginTop": "1rem",
    "textAlign": "center",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
});
