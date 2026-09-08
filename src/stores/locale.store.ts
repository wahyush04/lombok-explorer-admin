import { create } from 'zustand';
import { DEFAULT_LOCALE, isSupportedLocale, SupportedLocale } from '@/lib/constants/locales';

const STORAGE_KEY_UI_LOCALE = 'lombok_admin_ui_locale';
const STORAGE_KEY_CONTENT_LOCALE = 'lombok_admin_content_locale';

interface LocaleState {
  uiLocale: SupportedLocale;
  contentLocale: SupportedLocale;
  setUiLocale: (locale: SupportedLocale) => void;
  setContentLocale: (locale: SupportedLocale) => void;
}

function getInitialUiLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_UI_LOCALE);
    if (isSupportedLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

function getInitialContentLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONTENT_LOCALE);
    if (isSupportedLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  uiLocale: getInitialUiLocale(),
  contentLocale: getInitialContentLocale(),

  setUiLocale: (locale: SupportedLocale) => {
    try {
      localStorage.setItem(STORAGE_KEY_UI_LOCALE, locale);
    } catch {
      // ignore
    }
    set({ uiLocale: locale });
  },

  setContentLocale: (locale: SupportedLocale) => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT_LOCALE, locale);
    } catch {
      // ignore
    }
    set({ contentLocale: locale });
  },
}));
