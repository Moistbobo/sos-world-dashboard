import { useTranslation } from 'react-i18next';
import * as stylex from '@stylexjs/stylex';
import { shared } from '../../styles/shared';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
    try {
      localStorage.setItem('i18nextLng', code);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <select
      id="language"
      value={i18n.language}
      onChange={(e) => handleChange(e.target.value)}
      className={stylex.props(shared.input, styles.cic22wr).className}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

const styles = stylex.create({
  cic22wr: {
    "width": "100%",
  },
});
