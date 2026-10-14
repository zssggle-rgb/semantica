import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import english from './en-US.json';
import chinese from './zh-CN.json';

export type UiLanguage = 'zh-CN' | 'en-US';
const preferenceKey = 'semantica.explorer.language';

function initialLanguage(): UiLanguage {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'zh-CN' || requested === 'en-US') return requested;
  try {
    const saved = localStorage.getItem(preferenceKey);
    if (saved === 'zh-CN' || saved === 'en-US') return saved;
  } catch {
    // The UI remains available when browser preference storage is unavailable.
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

export const uiLanguage = initialLanguage();
document.documentElement.lang = uiLanguage;

void i18next.use(initReactI18next).init({
  lng: uiLanguage,
  fallbackLng: 'en-US',
  supportedLngs: ['zh-CN', 'en-US'],
  resources: {
    'en-US': { translation: english },
    'zh-CN': { translation: chinese },
  },
  keySeparator: false,
  nsSeparator: false,
  initAsync: false,
  interpolation: { escapeValue: false }, // Callers render text, not HTML.
});

/** Translate owned UI copy only. Graph values, identifiers and queries stay raw. */
export function uiText(message: string, values?: Record<string, unknown>): string {
  return String(i18next.t(message, { ...values, defaultValue: message }));
}

export function selectUiLanguage(language: UiLanguage): void {
  try {
    localStorage.setItem(preferenceKey, language);
  } catch {
    // The URL still preserves the choice without localStorage.
  }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  // Reload also applies embedded editor language resources. Unsaved-edit retention
  // is explicitly outside this localization task's agreed requirements.
  window.location.assign(url.href);
}
