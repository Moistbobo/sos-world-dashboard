import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

const savedLang = (() => {
  try {
    return localStorage.getItem('i18nextLng');
  } catch {
    return null;
  }
})();

i18next.use(initReactI18next).init({
  lng: savedLang || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: en },
  },
});

export default i18next;
