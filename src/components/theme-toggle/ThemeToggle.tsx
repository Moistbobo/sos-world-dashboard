import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import * as stylex from '@stylexjs/stylex';
import { shared } from '../../styles/shared';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={stylex.props(shared.btnGhost, styles.ckwqlec).className}
      title={theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className={stylex.props(styles.c1kypdu7).className} />
      ) : (
        <Moon className={stylex.props(styles.c1kypdu7).className} />
      )}
    </button>
  );
}

const styles = stylex.create({
  ckwqlec: {
    "padding": "0.75rem",
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
});
